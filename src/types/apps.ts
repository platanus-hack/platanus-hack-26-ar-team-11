import type { Scope } from "./permissions";

export type ConnectionStatus = "active" | "revoked" | "expired";

export interface DeveloperApp {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  client_secret_hash: string;
  redirect_uris_json: string[];
  allowed_scopes_json: Scope[];
  created_at: string;
  updated_at: string;
}

export interface AppConnection {
  id: string;
  user_id: string;
  twin_id: string;
  app_id: string;
  scopes_json: Scope[];
  status: ConnectionStatus;
  access_token_hash: string;
  created_at: string;
  revoked_at: string | null;
}
