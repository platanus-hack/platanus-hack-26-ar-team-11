import { fileURLToPath } from "node:url";
import {
  WorkerOptions,
  cli,
  defineAgent,
  voice,
  llm as llmTypes,
  type JobContext,
} from "@livekit/agents";
import * as silero from "@livekit/agents-plugin-silero";
import * as bey from "@livekit/agents-plugin-bey";
import { turnDetector } from "@livekit/agents-plugin-livekit";
import { CURRICULUM, getCurriculumSlot } from "../src/lib/twin/curriculum.js";
import { buildSystemPrompt } from "../src/lib/twin/prompt.js";
import type { TranscriptEntry } from "../src/types/session.js";
import { AnthropicLLM } from "./llm/anthropic.js";
import { buildStt } from "./stt.js";
import { buildTts } from "./tts.js";
import type {
  AgentStateLabel,
  DataTrackEvent,
  SessionEndReason,
} from "./types.js";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

export default defineAgent({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load();
    console.log(`[worker] prewarmed (silero vad loaded)`);
  },

  entry: async (ctx: JobContext) => {
    console.log(`[worker] job started — room: ${ctx.room.name}`);

    await ctx.connect();
    console.log(`[worker] connected to room ${ctx.room.name}`);

    const slotIndex = resolveSlotIndex(ctx.room.name ?? "");
    const slot = getCurriculumSlot(slotIndex);
    console.log(
      `[worker] using curriculum slot ${slot.index} (${slot.target_domain ?? slot.target_depth})`
    );

    const transcript: TranscriptEntry[] = [];
    let endedReason: SessionEndReason = "user_disconnected";

    const publishData = async (event: DataTrackEvent) => {
      try {
        const payload = new TextEncoder().encode(JSON.stringify(event));
        await ctx.room.localParticipant?.publishData(payload, {
          reliable: true,
        });
      } catch (err) {
        console.warn("[worker] publishData failed:", err);
      }
    };

    const session = new voice.AgentSession({
      vad: ctx.proc.userData.vad as silero.VAD,
      // Semantic end-of-utterance model (LiveKit's open-weights, multilingual).
      // Way more accurate than VAD-silence alone for telling "user paused
      // mid-sentence" from "user finished".
      turnDetection: new turnDetector.MultilingualModel(),
      stt: buildStt(),
      llm: new AnthropicLLM({
        model: ANTHROPIC_MODEL,
        temperature: 0.7,
        maxTokens: 256,
      }),
      tts: buildTts(),
    });

    const agent = new voice.Agent({
      instructions: buildSystemPrompt({
        slot,
        twin: { name: null, summary: null, skills: [] },
      }),
      turnHandling: {
        endpointing: {
          // "dynamic" adapts the delay using the MultilingualModel's EOU
          // probability — cuts pauses short when the user clearly finished,
          // tolerates long pauses when the user is mid-thought.
          mode: "dynamic",
          // Snappy floor for short confident answers without clipping breath
          // pauses (the EOU model gates this anyway).
          minDelay: 120,
          // Hard cap so even when the EOU model is uncertain we cut at 1.5s,
          // avoiding the "I said it once but the bot stayed silent" feel that
          // led users to repeat themselves.
          maxDelay: 1500,
        },
        interruption: {
          enabled: true,
          // Sustained user speech (in ms) before the agent stops talking.
          // Note: 0.8 here would be 0.8 *ms* — instantaneous, hence constant
          // accidental cut-offs. 800ms is the right unit.
          minDuration: 800,
          minWords: 2,
        },
        preemptiveGeneration: {
          // Start LLM/TTS the moment STT emits a final transcript, before
          // the EOU detector confirms end of turn. Worst case: discard the
          // in-flight generation. Best case (most turns): bot replies
          // near-instantly when the user truly finishes.
          enabled: true,
        },
      } as voice.AgentOptions<unknown>["turnHandling"],
    });

    session.on(
      voice.AgentSessionEventTypes.ConversationItemAdded,
      (ev: voice.ConversationItemAddedEvent) => {
        const item = ev.item;
        if (!(item instanceof llmTypes.ChatMessage)) return;
        const text = chatMessageText(item);
        if (!text) return;
        const at = new Date().toISOString();

        if (item.role === "user") {
          transcript.push({ role: "user", at, text });
          void publishData({ type: "transcript_user", at, text });
        } else if (item.role === "assistant") {
          transcript.push({ role: "assistant", at, text });
          void publishData({ type: "transcript_assistant", at, text });
        }
      }
    );

    session.on(
      voice.AgentSessionEventTypes.AgentStateChanged,
      (ev: voice.AgentStateChangedEvent) => {
        const state = ev.newState as AgentStateLabel;
        if (state === "initializing") return;
        void publishData({ type: "agent_state", state });
      }
    );

    session.on(voice.AgentSessionEventTypes.Error, (ev: voice.ErrorEvent) => {
      console.error("[worker] session error:", ev);
      endedReason = "error";
    });

    await session.start({ agent, room: ctx.room });
    console.log(`[worker] session started`);

    // CRITICAL: avatar.start must run AFTER session.start. The plugin's start()
    // sets `agentSession.output.audio = new DataStreamAudioOutput(...)` so the
    // TTS audio is routed *into* the avatar (which renders lipsync video) rather
    // than published as a regular audio track. If we call avatar.start first,
    // session.start sees an already-set output.audio and ignores ours, leaving
    // the avatar muted. See bey-dev/bey-examples/livekit-agent/main.js.
    const beyApiKey = process.env.BEY_API_KEY;
    const beyAvatarId = process.env.NEXT_PUBLIC_BEY_AVATAR_ID;
    if (!beyApiKey || !beyAvatarId) {
      throw new Error(
        "BEY_API_KEY and NEXT_PUBLIC_BEY_AVATAR_ID are required in .env.local"
      );
    }
    console.log(`[worker] starting bey avatar (avatarId=${beyAvatarId})`);
    const avatar = new bey.AvatarSession({
      avatarId: beyAvatarId,
      apiKey: beyApiKey,
    });
    await avatar.start(session, ctx.room);
    console.log(`[worker] bey avatar session started`);

    await session.generateReply({});

    await new Promise<void>((resolve) => {
      session.on(voice.AgentSessionEventTypes.Close, () => resolve());
    });

    console.log(`[worker] session closed, reason=${endedReason}`);

    void publishData({ type: "session_end", reason: endedReason });
    void transcript;
  },
});

function chatMessageText(msg: llmTypes.ChatMessage): string {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .map((c) => (typeof c === "string" ? c : ""))
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return "";
}

// Room names follow `ses_<sessionId>__slot_<idx>` when launched from
// /api/livekit/token (B10). Anything else falls back to slot 0 so smoke tests
// against ad-hoc room names don't crash. B09/B10 replace the encoded slot with
// proper room metadata once /api/sessions/[id] is live.
function resolveSlotIndex(roomName: string): number {
  const match = /__slot_(\d+)/.exec(roomName);
  if (!match) return 0;
  const idx = Number.parseInt(match[1], 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= CURRICULUM.length) return 0;
  return idx;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
    })
  );
}
