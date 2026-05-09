import { createHash } from "node:crypto";
import type { Scope } from "@/types";

export interface AllAccessAppSeed {
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

export function buildAllAccessAppSeed(): AllAccessAppSeed {
  const secret = process.env.ALLACCESS_CLIENT_SECRET ?? "demo_secret";
  const prodUrl = process.env.ALLACCESS_PROD_URL ?? "https://allaccess.example.com";

  return {
    client_id: "allaccess_demo",
    name: "AllAccess",
    description: "Tickets para conciertos y eventos en vivo",
    client_secret_hash: sha256(secret),
    redirect_uris_json: [
      "http://localhost:5173/twin/callback",
      `${prodUrl.replace(/\/$/, "")}/twin/callback`,
    ],
    allowed_scopes_json: [
      "persona.read.music",
      "persona.read.events",
      "persona.read.vibes",
      "persona.ask.recommendation",
    ],
  };
}
