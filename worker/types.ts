// Worker-local event types published over the LiveKit data track.
// The browser side mirrors these to drive the UI (transcript, agent state,
// session lifecycle).

export type AgentStateLabel =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "initializing";

export type SessionEndReason = "completed" | "user_disconnected" | "error";

export type DataTrackEvent =
  | { type: "transcript_user"; at: string; text: string }
  | { type: "transcript_assistant"; at: string; text: string }
  | { type: "agent_state"; state: AgentStateLabel }
  | { type: "session_end"; reason: SessionEndReason };
