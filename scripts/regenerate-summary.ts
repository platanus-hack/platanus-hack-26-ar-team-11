// Re-run regenerateSummary against an existing twin so it gets both en + es
// fields populated. Useful when migrating existing twins after the bilingual
// summary change.
//
// Usage:
//   pnpm tsx --env-file=.env.local scripts/regenerate-summary.ts <twin_id>

import { regenerateSummary } from "../src/lib/twin/recompute.js";
import { getWorkerSupabase } from "../worker/supabase.js";

async function main() {
  const twinId = process.argv[2];
  if (!twinId) {
    console.error("usage: tsx scripts/regenerate-summary.ts <twin_id>");
    process.exit(1);
  }
  const supabase = getWorkerSupabase();
  const summary = await regenerateSummary({ client: supabase, twinId });
  if (!summary) {
    console.log("[regenerate] no skills yet — nothing generated");
    return;
  }
  const { data } = await supabase
    .from("twins")
    .select("summary, profile_json")
    .eq("id", twinId)
    .maybeSingle();
  console.log("[regenerate] EN:", data?.summary);
  console.log("[regenerate] ES:", (data?.profile_json as { summary_es?: string } | null)?.summary_es);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
