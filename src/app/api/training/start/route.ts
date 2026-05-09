import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { RoomServiceClient } from "livekit-server-sdk";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { CURRICULUM, getCurriculumSlot } from "@/lib/twin/curriculum";

// Idle rooms close themselves once everyone leaves; keep the room alive long
// enough for the worker to dispatch and the user to (re)join.
const ROOM_EMPTY_TIMEOUT_S = 5 * 60;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("unauthorized", 401, "Login required");
  }

  const supabase = await createClient();

  const { data: twin, error: twinErr } = await supabase
    .from("twins")
    .select("id, user_id, next_session_index")
    .eq("user_id", user.id)
    .maybeSingle();
  if (twinErr) return apiError("internal", 500, twinErr.message);
  if (!twin) return apiError("not_found", 404, "Twin not found for user");

  const nextIndex = Number(twin.next_session_index ?? 0);
  if (nextIndex >= CURRICULUM.length) {
    return apiError(
      "bad_request",
      400,
      "Curriculum completo. (En MVP no hay re-cycle.)"
    );
  }

  const slot = getCurriculumSlot(nextIndex);
  const sessionId = randomUUID();
  const startedAt = new Date().toISOString();

  const targetDomains = slot.target_domain ? [slot.target_domain] : [];

  const { error: insertErr } = await supabase.from("sessions").insert({
    id: sessionId,
    twin_id: twin.id,
    type: "training",
    domain: slot.target_domain,
    transcript_json: [],
    summary: null,
    extracted_facts_json: [],
    session_index: nextIndex,
    target_domains_json: targetDomains,
    duration_seconds: null,
    started_at: startedAt,
    ended_at: null,
  });
  if (insertErr) {
    return apiError("internal", 500, insertErr.message);
  }

  // Pre-create the LiveKit room with metadata so the worker reads
  // session_id/twin_id/session_index from `room.metadata`. Without this the
  // worker connects but has no idea which session it's servicing.
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl =
    process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (apiKey && apiSecret && livekitUrl) {
    try {
      const svc = new RoomServiceClient(livekitUrl, apiKey, apiSecret);
      await svc.createRoom({
        name: sessionId,
        emptyTimeout: ROOM_EMPTY_TIMEOUT_S,
        metadata: JSON.stringify({
          session_id: sessionId,
          twin_id: twin.id,
          session_index: nextIndex,
          target_domain: slot.target_domain,
          target_domains: targetDomains,
          user_id: user.id,
        }),
      });
    } catch (err) {
      console.warn("[training/start] createRoom failed:", err);
      // Do not fail the request — the room will be auto-created on first join,
      // but the worker will fall back to smoke mode without metadata.
    }
  }

  return NextResponse.json({ session_id: sessionId });
}

type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "bad_request"
  | "internal";

function apiError(code: ApiErrorCode, status: number, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
