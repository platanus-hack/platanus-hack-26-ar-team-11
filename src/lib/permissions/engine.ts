import type { Domain } from "@/types/twin";
import type { Intent, PolicyResult, Scope } from "@/types/permissions";
import { detectBlockedTopic, isBlockedDomain } from "./blocked-domains";
import { hasAllScopes, requiredScopesForIntent } from "./scopes";

export interface EvaluatePolicyParams {
  intent: Intent;
  context?: { domain?: Domain | string; question?: string } & Record<string, unknown>;
  granted_scopes: Scope[];
  question?: string | null;
}

export function evaluatePolicy({
  intent,
  context,
  granted_scopes,
  question,
}: EvaluatePolicyParams): PolicyResult {
  const required = requiredScopesForIntent(intent, context);

  if (required.length === 0 && intent === "domain_summary") {
    return {
      allowed: false,
      scopes_used: [],
      blocked_reason: `bad_request: domain missing or unknown`,
    };
  }

  const missing = hasAllScopes(granted_scopes, required);
  if (missing) {
    return {
      allowed: false,
      scopes_used: [],
      blocked_reason: `missing_scope: ${missing}`,
    };
  }

  if (context?.domain && typeof context.domain === "string" && isBlockedDomain(context.domain)) {
    return {
      allowed: false,
      scopes_used: [],
      blocked_reason: `blocked_domain: ${context.domain}`,
    };
  }

  const probe = question ?? context?.question ?? null;
  const detected = detectBlockedTopic(probe ?? null);
  if (detected) {
    return {
      allowed: false,
      scopes_used: [],
      blocked_reason: `blocked_domain: ${detected}`,
    };
  }

  return { allowed: true, scopes_used: required, blocked_reason: null };
}
