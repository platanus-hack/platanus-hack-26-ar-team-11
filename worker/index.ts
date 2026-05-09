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
import { saveSession, shouldDedupUserTurn } from "./persistence.js";
import { runPostSession } from "./post-session.js";
import { parseRoomMetadata } from "./session-meta.js";
import { buildStt } from "./stt.js";
import { buildTts } from "./tts.js";
import { loadTwinState } from "./twin-loader.js";
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
    const startedAtMs = Date.now();
    const startedAt = new Date(startedAtMs).toISOString();

    console.log(`[worker] job started — room: ${ctx.room.name}`);

    await ctx.connect();
    console.log(`[worker] connected to room ${ctx.room.name}`);

    const meta = parseRoomMetadata(ctx.room.metadata);
    if (meta) {
      console.log(
        `[worker] session metadata: session=${meta.session_id} twin=${meta.twin_id} slot=${meta.session_index}`
      );
    } else {
      console.warn(
        `[worker] no session metadata on room — running in smoke mode (no persistence)`
      );
    }

    const slotIndex = meta?.session_index ?? resolveSlotIndex(ctx.room.name ?? "");
    const slot = getCurriculumSlot(slotIndex);
    console.log(
      `[worker] using curriculum slot ${slot.index} (${slot.target_domain ?? slot.target_depth})`
    );

    // Load twin state up-front so the system prompt has real context. If the
    // load fails (smoke mode / DB hiccup) we still proceed with an empty twin
    // — the prompt builder handles that gracefully.
    const twin = meta
      ? await loadTwinState(meta.twin_id).catch((err) => {
          console.warn("[worker] loadTwinState failed:", err);
          return { name: null, summary: null, skills: [] };
        })
      : { name: null, summary: null, skills: [] };
    if (meta) {
      console.log(
        `[worker] twin loaded: skills=${twin.skills.length} summary=${twin.summary ? "yes" : "no"}`
      );
    }

    // Avatar enabled by default; the user can disable it from /settings to
    // train in audio-only mode (saves Bey credits, lets us fall back if Bey
    // is misbehaving). When the avatar is enabled we still need its env vars.
    const avatarEnabled = meta?.avatar_enabled ?? true;
    const beyApiKey = process.env.BEY_API_KEY;
    const beyAvatarId = process.env.NEXT_PUBLIC_BEY_AVATAR_ID;
    if (avatarEnabled && (!beyApiKey || !beyAvatarId)) {
      throw new Error(
        "BEY_API_KEY and NEXT_PUBLIC_BEY_AVATAR_ID are required when avatar is enabled (toggle in /settings)"
      );
    }

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
      instructions: buildSystemPrompt({ slot, twin }),
      turnHandling: {
        endpointing: {
          mode: "dynamic",
          minDelay: 120,
          maxDelay: 1500,
        },
        interruption: {
          enabled: true,
          minDuration: 800,
          minWords: 2,
        },
        preemptiveGeneration: {
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
          const prev = transcript[transcript.length - 1];
          if (shouldDedupUserTurn(prev, text)) {
            console.log(
              `[worker] dedup user turn: "${text.slice(0, 40)}..."`
            );
            return;
          }
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
    if (avatarEnabled) {
      console.log(`[worker] starting bey avatar (avatarId=${beyAvatarId})`);
      const avatar = new bey.AvatarSession({
        avatarId: beyAvatarId!,
        apiKey: beyApiKey!,
      });
      await avatar.start(session, ctx.room);
      console.log(`[worker] bey avatar session started`);
    } else {
      console.log(`[worker] avatar disabled — running in audio-only mode`);
    }

    await session.generateReply({});

    await new Promise<void>((resolve) => {
      session.on(voice.AgentSessionEventTypes.Close, () => resolve());
    });

    const endedAtMs = Date.now();
    const endedAt = new Date(endedAtMs).toISOString();
    const durationSeconds = Math.round((endedAtMs - startedAtMs) / 1000);

    console.log(
      `[worker] session closed, reason=${endedReason}, duration=${durationSeconds}s, turns=${transcript.length}`
    );

    void publishData({ type: "session_end", reason: endedReason });

    if (meta) {
      try {
        await saveSession({
          id: meta.session_id,
          twin_id: meta.twin_id,
          type: "training",
          domain: slot.target_domain,
          session_index: meta.session_index,
          target_domains: meta.target_domains,
          transcript,
          summary: null,
          extracted_facts: [],
          started_at: startedAt,
          ended_at: endedAt,
          duration_seconds: durationSeconds,
        });
        console.log(`[worker] session ${meta.session_id} persisted`);
      } catch (err) {
        console.error("[worker] saveSession failed:", err);
      }

      try {
        const result = await runPostSession({
          sessionId: meta.session_id,
          twinId: meta.twin_id,
          targetDomain: slot.target_domain,
          transcript,
        });
        console.log(
          `[worker] post-session: facts=${result.facts.length} completion=${result.completion ?? "—"} next_slot=${result.nextSessionIndex ?? "—"} summary=${result.summary ? "regenerated" : "skipped"}`
        );
      } catch (err) {
        console.error("[worker] post-session pipeline failed:", err);
      }
    } else {
      console.log("[worker] skipping persistence (no metadata)");
    }
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

// Smoke-mode fallback: when the room has no session metadata (e.g. ad-hoc
// rooms), pull the slot index from the room name (`ses_<id>__slot_<n>`).
// Production rooms always carry metadata via /api/livekit/token (B10).
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
