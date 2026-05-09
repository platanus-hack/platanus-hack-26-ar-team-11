import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  badRequest,
  internal,
  notFound,
  unauthorized,
} from "@/lib/api/errors";
import { isUuid } from "@/lib/connect/validate";

const RevokeSchema = z.object({
  connection_id: z.string().min(1),
});

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  const parsed = RevokeSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("connection_id is required");
  }
  const { connection_id } = parsed.data;
  if (!isUuid(connection_id)) {
    return notFound("Connection");
  }

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("app_connections")
    .select("id, user_id, status")
    .eq("id", connection_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[revoke] lookup failed", error);
    return internal("Could not load connection");
  }
  if (!row) {
    // Either does not exist or belongs to another user — do not leak.
    return notFound("Connection");
  }

  if (row.status === "revoked") {
    return NextResponse.json({ ok: true, already_revoked: true });
  }

  const { error: updateError } = await admin
    .from("app_connections")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", connection_id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[revoke] update failed", updateError);
    return internal("Could not revoke connection");
  }

  return NextResponse.json({ ok: true });
}
