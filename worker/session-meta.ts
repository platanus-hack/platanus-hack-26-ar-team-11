import type { Domain } from "../src/types/index.js";

// Set by /api/livekit/token (B10) on the LiveKit room metadata. The worker
// reads it at the start of `entry` to know which session/twin/slot it's
// servicing — no DB roundtrip needed inside the agent's hot path.
export interface RoomSessionMetadata {
  session_id: string;
  twin_id: string;
  session_index: number;
  target_domain: Domain | null;
  target_domains: Domain[];
  avatar_enabled: boolean;
}

export function parseRoomMetadata(raw: string | null | undefined): RoomSessionMetadata | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RoomSessionMetadata>;
    if (
      typeof parsed.session_id !== "string" ||
      typeof parsed.twin_id !== "string" ||
      typeof parsed.session_index !== "number"
    ) {
      return null;
    }
    return {
      session_id: parsed.session_id,
      twin_id: parsed.twin_id,
      session_index: parsed.session_index,
      target_domain: (parsed.target_domain as Domain | null | undefined) ?? null,
      target_domains: Array.isArray(parsed.target_domains)
        ? (parsed.target_domains as Domain[])
        : [],
      // Default true preserves the original behavior for any room metadata
      // created before the avatar toggle existed.
      avatar_enabled:
        typeof parsed.avatar_enabled === "boolean" ? parsed.avatar_enabled : true,
    };
  } catch {
    return null;
  }
}
