import type { Domain } from "@/types/twin";
import type { Intent, PolicyResult, Scope } from "@/types/permissions";
import { detectBlockedTopic, isBlockedDomain } from "./blocked-domains";
import { ALL_DOMAINS } from "@/types/twin";
import { hasAllScopes, requiredScopesForIntent } from "./scopes";

export interface EvaluatePolicyParams {
  intent: Intent;
  context?: { domain?: Domain | string; question?: string } & Record<string, unknown>;
  granted_scopes: Scope[];
  question?: string | null;
}

function isKnownDomain(value: string): value is Domain {
  return (ALL_DOMAINS as readonly string[]).includes(value);
}

export function evaluatePolicy({
  intent,
  context,
  granted_scopes,
  question,
}: EvaluatePolicyParams): PolicyResult {
  // 1. Blocked domain in context.domain — most specific signal, decides first.
  if (
    context?.domain &&
    typeof context.domain === "string" &&
    isBlockedDomain(context.domain)
  ) {
    return {
      allowed: false,
      scopes_used: [],
      blocked_reason: `blocked_domain: ${context.domain}`,
    };
  }

  // 2. domain_summary with missing or unknown (non-blocked) domain → bad_request.
  if (intent === "domain_summary") {
    const domain = context?.domain;
    if (typeof domain !== "string" || !isKnownDomain(domain)) {
      return {
        allowed: false,
        scopes_used: [],
        blocked_reason: "bad_request: domain missing or unknown",
      };
    }
  }

  // 3. Missing scope.
  const required = requiredScopesForIntent(intent, context);
  const missing = hasAllScopes(granted_scopes, required);
  if (missing) {
    return {
      allowed: false,
      scopes_used: [],
      blocked_reason: `missing_scope: ${missing}`,
    };
  }

  // 4. Blocked topic in question (heuristic).
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
