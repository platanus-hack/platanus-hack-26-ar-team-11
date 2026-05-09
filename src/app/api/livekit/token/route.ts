import { NextResponse } from "next/server";
import { z } from "zod";
import { AccessToken } from "livekit-server-sdk";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { CURRICULUM } from "@/lib/twin/curriculum";
import type { Domain } from "@/types";

const BodySchema = z.object({
  session_id: z.string().min(1),
  twin_id: z.string().uuid(),
  session_index: z.number().int().min(0).max(CURRICULUM.length - 1),
});

const TOKEN_TTL = "1h";

export async function POST(req: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return apiError(
      "internal",
      500,
      "LiveKit env vars missing (LIVEKIT_API_KEY/LIVEKIT_API_SECRET/NEXT_PUBLIC_LIVEKIT_URL)"
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return apiError("unauthorized", 401, "Login required");
  }

  let body: z.infer<typeof BodySchema>;
  try {
    const json = await req.json();
    body = BodySchema.parse(json);
  } catch (err) {
    return apiError(
      "bad_request",
      400,
      err instanceof Error ? err.message : "Invalid body"
    );
  }

  const supabase = await createClient();

  const { data: twin, error: twinErr } = await supabase
    .from("twins")
    .select("id, user_id")
    .eq("id", body.twin_id)
    .maybeSingle();
  if (twinErr) {
    return apiError("internal", 500, twinErr.message);
  }
  if (!twin || twin.user_id !== user.id) {
    return apiError("forbidden", 403, "Twin does not belong to current user");
  }

  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .select("id, twin_id, session_index, target_domains_json")
    .eq("id", body.session_id)
    .maybeSingle();
  if (sessionErr) {
    return apiError("internal", 500, sessionErr.message);
  }
  if (!session || session.twin_id !== body.twin_id) {
    return apiError("not_found", 404, "Session not found");
  }

  const slot = CURRICULUM[body.session_index];

  const metadata = JSON.stringify({
    session_id: body.session_id,
    twin_id: body.twin_id,
    session_index: body.session_index,
    target_domain: slot.target_domain,
    target_domains: (session.target_domains_json ?? []) as Domain[],
    user_id: user.id,
  });

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: user.email ?? user.id,
    ttl: TOKEN_TTL,
    metadata,
  });
  at.addGrant({
    room: body.session_id,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token, url, room: body.session_id });
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
