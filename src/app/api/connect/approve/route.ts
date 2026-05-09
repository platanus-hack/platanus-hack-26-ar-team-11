import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ALL_SCOPES, type Scope } from "@/types/permissions";
import type { DeveloperApp } from "@/types/apps";
import { getCurrentUser } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildApprovedUrl, generateConnectionTokens } from "@/lib/connect";
import { badRequest, internal, notFound, unauthorized } from "@/lib/api/errors";

const ApproveSchema = z.object({
  app_id: z.string().min(1),
  redirect_uri: z.string().min(1),
  scopes: z.union([z.string(), z.array(z.string())]).optional(),
  state: z.string().optional(),
});

function normalizeScopes(input: string | string[] | undefined): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.map((s) => s.trim()).filter(Boolean);
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return (await request.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  const form = await request.formData();
  const obj: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    const v = typeof value === "string" ? value : value.name;
    const existing = obj[key];
    if (existing === undefined) {
      obj[key] = v;
    } else if (Array.isArray(existing)) {
      existing.push(v);
    } else {
      obj[key] = [existing, v];
    }
  }
  return obj;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const raw = await readBody(request);
  const parsed = ApproveSchema.safeParse(raw);
  if (!parsed.success) {
    return badRequest("Invalid approve payload", { issues: parsed.error.issues });
  }
  const { app_id, redirect_uri, state } = parsed.data;
  const requestedScopes = normalizeScopes(parsed.data.scopes);

  const admin = createAdminClient();

  const { data: appRow, error: appError } = await admin
    .from("developer_apps")
    .select("*")
    .eq("client_id", app_id)
    .maybeSingle();
  if (appError) {
    console.error("[approve] developer_apps lookup failed", appError);
    return internal("Could not load app");
  }
  if (!appRow) return notFound("App");
  const app = appRow as DeveloperApp;

  const allowedRedirects = (app.redirect_uris_json ?? []) as string[];
  if (!allowedRedirects.includes(redirect_uri)) {
    return badRequest("redirect_uri not authorized for this app", {
      redirect_uri,
    });
  }

  const allowedScopes = (app.allowed_scopes_json ?? []) as Scope[];
  const knownScopes = new Set<string>(ALL_SCOPES);
  const finalScopes: Scope[] = [];
  for (const scope of requestedScopes) {
    if (!knownScopes.has(scope)) {
      return badRequest(`Unknown scope: ${scope}`, { scope });
    }
    if (!(allowedScopes as string[]).includes(scope)) {
      return badRequest(`Scope ${scope} is not allowed for this app`, {
        scope,
      });
    }
    if (!finalScopes.includes(scope as Scope)) {
      finalScopes.push(scope as Scope);
    }
  }
  if (finalScopes.length === 0) {
    finalScopes.push(...allowedScopes);
  }
  if (finalScopes.length === 0) {
    return badRequest("No scopes selected and app has no allowed scopes");
  }

  const { data: twinRow, error: twinError } = await admin
    .from("twins")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (twinError) {
    console.error("[approve] twin lookup failed", twinError);
    return internal("Could not load twin");
  }
  if (!twinRow) {
    return internal("Twin not found for user — signup trigger may have failed");
  }

  const tokens = generateConnectionTokens();

  const { error: insertError } = await admin.from("app_connections").insert({
    id: tokens.connection_id,
    user_id: user.id,
    twin_id: twinRow.id,
    app_id: app.id,
    scopes_json: finalScopes,
    status: "active",
    access_token_hash: tokens.access_token_hash,
  });
  if (insertError) {
    console.error("[approve] insert connection failed", insertError);
    return internal("Could not create connection");
  }

  const target = buildApprovedUrl(
    redirect_uri,
    tokens.connection_id,
    tokens.access_token,
    state,
  );
  return NextResponse.redirect(target, 302);
}
