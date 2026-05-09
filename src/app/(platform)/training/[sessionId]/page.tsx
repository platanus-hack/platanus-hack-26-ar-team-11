import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { InterviewRoom } from "./InterviewRoom";

export default async function TrainingSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, twin_id, session_index, ended_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) notFound();

  const { data: twin } = await supabase
    .from("twins")
    .select("id, user_id")
    .eq("id", session.twin_id)
    .maybeSingle();

  if (!twin || twin.user_id !== user.id) notFound();

  return (
    <InterviewRoom
      sessionId={session.id}
      twinId={session.twin_id}
      sessionIndex={session.session_index ?? 0}
      alreadyEnded={Boolean(session.ended_at)}
    />
  );
}
