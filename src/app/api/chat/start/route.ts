import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { RoomServiceClient } from "livekit-server-sdk";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

const ROOM_EMPTY_TIMEOUT_S = 5 * 60;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("unauthorized", 401, "Login required");
  }

  const supabase = await createClient();

  const { data: twin, error: twinErr } = await supabase
    .from("twins")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (twinErr) return apiError("internal", 500, twinErr.message);
  if (!twin) return apiError("not_found", 404, "Twin not found for user");

  const sessionId = randomUUID();
  const startedAt = new Date().toISOString();

  const { error: insertErr } = await supabase.from("sessions").insert({
    id: sessionId,
    twin_id: twin.id,
    type: "chat",
    domain: null,
    transcript_json: [],
    summary: null,
    extracted_facts_json: [],
    session_index: null,
    target_domains_json: [],
    duration_seconds: null,
    started_at: startedAt,
    ended_at: null,
  });
  if (insertErr) {
    return apiError("internal", 500, insertErr.message);
  }

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
          session_index: null,
          target_domain: null,
          target_domains: [],
          user_id: user.id,
        }),
      });
    } catch (err) {
      console.warn("[chat/start] createRoom failed:", err);
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
