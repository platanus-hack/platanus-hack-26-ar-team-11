import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildAllAccessAppSeed } from "./seed-data/allaccess-app";
import {
  DEMO_USERS,
  getDemoPassword,
  type DemoSessionSeed,
  type DemoSkillSeed,
  type DemoUserSeed,
} from "./seed-data/demo-users";

interface Counters {
  users: { created: number; updated: number };
  twins: { updated: number };
  skills: { upserted: number };
  sessions: { created: number; skipped: number };
  apps: { created: number; updated: number };
}

function newCounters(): Counters {
  return {
    users: { created: 0, updated: 0 },
    twins: { updated: 0 },
    skills: { upserted: 0 },
    sessions: { created: 0, skipped: 0 },
    apps: { created: 0, updated: 0 },
  };
}

async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<string | null> {
  const perPage = 200;
  let page = 1;
  // Iterates pages until finding the user; ok for small demo dataset.
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function ensureAuthUser(
  admin: ReturnType<typeof createAdminClient>,
  user: DemoUserSeed,
  password: string,
  counters: Counters,
): Promise<string> {
  const existingId = await findAuthUserByEmail(admin, user.email);
  if (existingId) {
    const { error } = await admin.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
      user_metadata: { name: user.name },
    });
    if (error) throw new Error(`updateUserById ${user.email}: ${error.message}`);
    counters.users.updated += 1;
    return existingId;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: { name: user.name },
  });
  if (error || !data.user) throw new Error(`createUser ${user.email}: ${error?.message}`);
  counters.users.created += 1;
  return data.user.id;
}

async function ensureTwin(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  user: DemoUserSeed,
  counters: Counters,
): Promise<string> {
  const profileJson = {
    version: 1 as const,
    summary: user.twin_summary,
    summary_generated_at: new Date().toISOString(),
    summary_after_session_id: null as string | null,
  };

  const { data: existing, error: selectErr } = await admin
    .from("twins")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (selectErr) throw new Error(`select twin: ${selectErr.message}`);

  if (existing?.id) {
    const { error } = await admin
      .from("twins")
      .update({
        name: user.twin_name,
        completion_score: user.completion_score,
        summary: user.twin_summary,
        profile_json: profileJson,
        next_session_index: user.next_session_index,
      })
      .eq("id", existing.id);
    if (error) throw new Error(`update twin: ${error.message}`);
    counters.twins.updated += 1;
    return existing.id;
  }

  const { data: inserted, error: insertErr } = await admin
    .from("twins")
    .insert({
      user_id: userId,
      name: user.twin_name,
      completion_score: user.completion_score,
      summary: user.twin_summary,
      profile_json: profileJson,
      next_session_index: user.next_session_index,
    })
    .select("id")
    .single();
  if (insertErr || !inserted) throw new Error(`insert twin: ${insertErr?.message}`);
  counters.twins.updated += 1;
  return inserted.id;
}

function meanConfidence(facts: { confidence: number }[]): number {
  if (!facts.length) return 0;
  const sum = facts.reduce((acc, f) => acc + f.confidence, 0);
  return Math.round((sum / facts.length) * 100) / 100;
}

async function upsertSkill(
  admin: ReturnType<typeof createAdminClient>,
  twinId: string,
  skill: DemoSkillSeed,
  counters: Counters,
): Promise<void> {
  const factsJson = skill.facts.map((f) => {
    const now = new Date().toISOString();
    return {
      id: randomUUID(),
      text: f.text,
      confidence: f.confidence,
      source_session_id: null,
      created_at: now,
      updated_at: now,
    };
  });

  const { error } = await admin.from("twin_skills").upsert(
    {
      twin_id: twinId,
      domain: skill.domain,
      confidence: meanConfidence(skill.facts),
      facts_json: factsJson,
    },
    { onConflict: "twin_id,domain" },
  );
  if (error) throw new Error(`upsert skill ${skill.domain}: ${error.message}`);
  counters.skills.upserted += 1;
}

async function ensureSession(
  admin: ReturnType<typeof createAdminClient>,
  twinId: string,
  session: DemoSessionSeed,
  counters: Counters,
): Promise<void> {
  // Idempotency check: same twin + session_index already exists?
  if (session.session_index !== null) {
    const { data: existing, error } = await admin
      .from("sessions")
      .select("id")
      .eq("twin_id", twinId)
      .eq("session_index", session.session_index)
      .maybeSingle();
    if (error) throw new Error(`select session: ${error.message}`);
    if (existing?.id) {
      counters.sessions.skipped += 1;
      return;
    }
  }

  const startedAt = new Date(Date.now() - session.days_ago * 24 * 60 * 60 * 1000);
  const endedAt = new Date(startedAt.getTime() + session.duration_seconds * 1000);

  const { error } = await admin.from("sessions").insert({
    twin_id: twinId,
    type: "training",
    domain: session.domain,
    transcript_json: session.transcript,
    summary: session.summary,
    extracted_facts_json: session.extracted_facts,
    session_index: session.session_index,
    target_domains_json: session.target_domains,
    duration_seconds: session.duration_seconds,
    started_at: startedAt.toISOString(),
    ended_at: endedAt.toISOString(),
  });
  if (error) throw new Error(`insert session: ${error.message}`);
  counters.sessions.created += 1;
}

async function ensureAllAccessApp(
  admin: ReturnType<typeof createAdminClient>,
  counters: Counters,
): Promise<void> {
  const seed = buildAllAccessAppSeed();

  const { data: existing, error: selectErr } = await admin
    .from("developer_apps")
    .select("id")
    .eq("client_id", seed.client_id)
    .maybeSingle();
  if (selectErr) throw new Error(`select app: ${selectErr.message}`);

  if (existing?.id) {
    const { error } = await admin
      .from("developer_apps")
      .update({
        name: seed.name,
        description: seed.description,
        client_secret_hash: seed.client_secret_hash,
        redirect_uris_json: seed.redirect_uris_json,
        allowed_scopes_json: seed.allowed_scopes_json,
      })
      .eq("id", existing.id);
    if (error) throw new Error(`update app: ${error.message}`);
    counters.apps.updated += 1;
    return;
  }

  const { error } = await admin.from("developer_apps").insert({
    client_id: seed.client_id,
    name: seed.name,
    description: seed.description,
    client_secret_hash: seed.client_secret_hash,
    redirect_uris_json: seed.redirect_uris_json,
    allowed_scopes_json: seed.allowed_scopes_json,
  });
  if (error) throw new Error(`insert app: ${error.message}`);
  counters.apps.created += 1;
}

export async function runSeed(): Promise<Counters> {
  const admin = createAdminClient();
  const counters = newCounters();
  const password = getDemoPassword();

  for (const user of DEMO_USERS) {
    const userId = await ensureAuthUser(admin, user, password, counters);
    const twinId = await ensureTwin(admin, userId, user, counters);

    for (const skill of user.skills) {
      await upsertSkill(admin, twinId, skill, counters);
    }
    for (const session of user.sessions) {
      await ensureSession(admin, twinId, session, counters);
    }
  }

  await ensureAllAccessApp(admin, counters);

  return counters;
}

function logSummary(c: Counters): void {
  // eslint-disable-next-line no-console
  console.log("Seed completo:");
  console.log(`  users:    ${c.users.created} creados, ${c.users.updated} actualizados`);
  console.log(`  twins:    ${c.twins.updated} upsert`);
  console.log(`  skills:   ${c.skills.upserted} upsert`);
  console.log(`  sessions: ${c.sessions.created} creadas, ${c.sessions.skipped} ya existentes`);
  console.log(`  apps:     ${c.apps.created} creadas, ${c.apps.updated} actualizadas`);
}

const isDirectRun =
  typeof process !== "undefined" && process.argv[1]?.endsWith("/seed.ts");

if (isDirectRun) {
  runSeed()
    .then((counters) => {
      logSummary(counters);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed falló:", err);
      process.exit(1);
    });
}
