import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return apiError("unauthorized", 401, "Login required");
  }

  const supabase = await createClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return apiError("internal", 500, error.message);
  }
  if (!session) {
    return apiError("not_found", 404, "Session not found");
  }

  const { data: twin } = await supabase
    .from("twins")
    .select("id, user_id, completion_score, summary, next_session_index")
    .eq("id", session.twin_id)
    .maybeSingle();

  if (!twin || twin.user_id !== user.id) {
    return apiError("forbidden", 403, "Session does not belong to current user");
  }

  const { data: skills } = await supabase
    .from("twin_skills")
    .select("domain, confidence, facts_json, updated_at")
    .eq("twin_id", session.twin_id);

  return NextResponse.json({
    session,
    twin: {
      id: twin.id,
      completion_score: Number(twin.completion_score ?? 0),
      summary: twin.summary,
      next_session_index: twin.next_session_index,
    },
    skills: skills ?? [],
  });
}

type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "internal";

function apiError(code: ApiErrorCode, status: number, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
