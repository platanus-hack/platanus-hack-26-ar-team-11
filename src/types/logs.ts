import type { Domain } from "./twin";
import type { Intent, Scope } from "./permissions";

export interface QueryLog {
  id: string;
  connection_id: string | null;
  user_id: string | null;
  twin_id: string | null;
  app_id: string | null;
  intent: Intent | string;
  question: string | null;
  response_summary: string | null;
  allowed: boolean;
  blocked_reason: string | null;
  scopes_used_json: Scope[];
  created_at: string;
}

export type EditAction = "add" | "remove" | "edit";

export interface TwinSkillEdit {
  id: string;
  user_id: string;
  twin_id: string;
  domain: Domain;
  action: EditAction;
  fact_before: Record<string, unknown> | null;
  fact_after: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}
