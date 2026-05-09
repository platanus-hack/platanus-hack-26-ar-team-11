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
import type { TranscriptEntry } from "../src/types/session.js";
import type {
  AgentStateLabel,
  DataTrackEvent,
  SessionEndReason,
} from "./types.js";

export default defineAgent({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load();
    console.log(`[worker] prewarmed (silero vad loaded)`);
  },

  entry: async (ctx: JobContext) => {
    console.log(`[worker] job started — room: ${ctx.room.name}`);

    await ctx.connect();
    console.log(`[worker] connected to room ${ctx.room.name}`);

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
      // stt/llm/tts wired in B05–B07.
    });

    const agent = new voice.Agent({
      instructions: "placeholder — B04 replaces this with the dynamic prompt.",
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

    console.log(`[worker] session skeleton ready (stt/llm/tts pending)`);

    // Note: session.start is intentionally NOT called here. Without real
    // stt/llm/tts plugins it would fail at first turn. B05–B07 wire those up
    // and call session.start({ agent, room: ctx.room }) at the end of entry.
    void agent;
    void session;
    void transcript;
    void endedReason;
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cli.runApp(
    new WorkerOptions({
      agent: fileURLToPath(import.meta.url),
    })
  );
}
