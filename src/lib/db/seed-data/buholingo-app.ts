import { createHash } from "node:crypto";
import type { Scope } from "@/types";

export interface BuholingoAppSeed {
  client_id: string;
  name: string;
  description: string;
  client_secret_hash: string;
  redirect_uris_json: string[];
  allowed_scopes_json: Scope[];
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function buildBuholingoAppSeed(): BuholingoAppSeed {
  const secret = process.env.BUHOLINGO_CLIENT_SECRET ?? "demo_secret";
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  const explicitRedirects = [
    "http://localhost:3000/buholingo/callback",
    "https://twin-protocol-one.vercel.app/buholingo/callback",
  ];
  if (envBase) explicitRedirects.push(`${envBase}/buholingo/callback`);
  const redirect_uris_json = Array.from(new Set(explicitRedirects));

  return {
    client_id: "buholingo_demo",
    name: "Buholingo",
    description: "Aprende idiomas con lecciones armadas alrededor de tus gustos",
    client_secret_hash: sha256(secret),
    redirect_uris_json,
    allowed_scopes_json: [
      "persona.read.summary",
      "persona.read.music",
      "persona.read.vibes",
    ],
  };
}
