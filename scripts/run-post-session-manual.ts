// Manually re-run the post-session pipeline against a saved session row.
// Used when the worker died after saveSession but before runPostSession.
//
// Usage:
//   pnpm tsx --env-file=.env.local scripts/run-post-session-manual.ts <session_id>

import { runPostSession } from "../worker/post-session.js";
import { getWorkerSupabase } from "../worker/supabase.js";
import { getCurriculumSlot } from "../src/lib/twin/curriculum.js";
import type { TranscriptEntry } from "../src/types/session.js";

async function main() {
  const sessionId = process.argv[2];
  if (!sessionId) {
    console.error("usage: tsx scripts/run-post-session-manual.ts <session_id>");
    process.exit(1);
  }

  const supabase = getWorkerSupabase();

  const { data, error } = await supabase
    .from("sessions")
    .select("id, twin_id, session_index, transcript_json, domain")
    .eq("id", sessionId)
    .maybeSingle();
  if (error || !data) {
    throw new Error(`session ${sessionId} not found: ${error?.message ?? "no row"}`);
  }

  const transcript = (data.transcript_json ?? []) as TranscriptEntry[];
  if (transcript.length === 0) {
    throw new Error(`session ${sessionId} has empty transcript_json`);
  }

  const slotIndex = data.session_index ?? 0;
  const slot = getCurriculumSlot(slotIndex);

  console.log(
    `[manual] running post-session for ${sessionId} (twin=${data.twin_id} slot=${slotIndex} domain=${slot.target_domain ?? "—"} turns=${transcript.length})`
  );

  const result = await runPostSession({
    sessionId: data.id,
    twinId: data.twin_id,
    targetDomain: slot.target_domain,
    transcript,
    client: supabase,
  });

  console.log("[manual] result:");
  console.log(`  facts: ${result.facts.length}`);
  console.log(`  completion: ${result.completion}`);
  console.log(`  next_session_index: ${result.nextSessionIndex}`);
  console.log(`  summary: ${result.summary ? "regenerated" : "skipped"}`);
  if (result.summary) {
    console.log("---");
    console.log(result.summary);
  }
}

main().catch((err) => {
  console.error("[manual] failed:", err);
  process.exit(1);
});
