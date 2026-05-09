import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ALL_DOMAINS, type Domain } from "@/types/twin";
import {
  ALL_INTENTS,
  type Intent,
  type PolicyResult,
  type Scope,
} from "@/types/permissions";
import type { AppConnection } from "@/types/apps";
import { evaluatePolicy } from "@/lib/permissions";
import {
  badRequest,
  internal,
  invalidIntent,
  unauthorized,
} from "@/lib/api/errors";
import { corsHeaders } from "@/lib/api/cors";
import { validateConnection } from "@/lib/connect";
import { logQuery, summarizeResponse } from "@/lib/query/log";
import { handleGeneralSummary } from "@/lib/query/intents/general-summary";
import { handleDomainSummary } from "@/lib/query/intents/domain-summary";
import { handleEventRecommendation } from "@/lib/query/intents/event-recommendation";
import {
  MAX_EVENTS,
  handleEventRanking,
} from "@/lib/query/intents/event-ranking";

const VenueSizeEnum = z.enum([
  "intimate",
  "club",
  "theatre",
  "arena",
  "festival",
]);

const EventDescriptorSchema = z.object({
  id: z.string().optional(),
  artist: z.string().optional(),
  venue: z.string().optional(),
  city: z.string().optional(),
  date: z.string().optional(),
  genres: z.array(z.string()).optional(),
  venue_size: VenueSizeEnum.optional(),
  price: z.number().optional(),
});

const QuerySchema = z.object({
  connection_id: z.string().min(1),
  intent: z.string().min(1),
  context: z
    .object({
      domain: z.string().optional(),
      question: z.string().optional(),
      event: EventDescriptorSchema.optional(),
      events: z.array(EventDescriptorSchema).optional(),
    })
    .passthrough()
    .optional(),
});

type ParsedQuery = z.infer<typeof QuerySchema>;

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return match[1].trim();
}

function jsonWithCors(
  body: unknown,
  init: ResponseInit,
  origin: string | null,
): Response {
  const headers = new Headers(init.headers);
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    headers.set(k, v);
  }
  return NextResponse.json(body, { ...init, headers });
}

function withCors(res: NextResponse, origin: string | null): NextResponse {
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    res.headers.set(k, v);
  }
  return res;
}

function questionFromBody(body: ParsedQuery): string | null {
  const ctx = body.context ?? {};
  if (typeof ctx.question === "string" && ctx.question) return ctx.question;
  if (body.intent === "domain_summary" && typeof ctx.domain === "string") {
    return `domain_summary:${ctx.domain}`;
  }
  if (body.intent === "event_recommendation" && ctx.event) {
    return `event_recommendation:${ctx.event.artist ?? "?"}@${ctx.event.venue ?? "?"}`;
  }
  if (body.intent === "event_ranking" && Array.isArray(ctx.events)) {
    return `event_ranking:${ctx.events.length} events`;
  }
  return null;
}

function isKnownIntent(intent: string): intent is Intent {
  return (ALL_INTENTS as readonly string[]).includes(intent);
}

function isKnownDomain(domain: string): domain is Domain {
  return (ALL_DOMAINS as readonly string[]).includes(domain);
}

function deniedPolicy(reason: string): PolicyResult {
  return { allowed: false, scopes_used: [], blocked_reason: reason };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  const token = bearerToken(req);
  if (!token) {
    await logQuery({
      connection: null,
      intent: "unknown",
      question: null,
      response_summary: null,
      allowed: false,
      blocked_reason: "unauthorized",
      scopes_used: [],
    });
    return withCors(unauthorized("Missing or malformed Bearer token"), origin);
  }

  let parsed: ParsedQuery;
  try {
    const raw = await req.json();
    const result = QuerySchema.safeParse(raw);
    if (!result.success) {
      return withCors(
        badRequest("Invalid request body", { issues: result.error.issues }),
        origin,
      );
    }
    parsed = result.data;
  } catch {
    return withCors(badRequest("Body must be JSON"), origin);
  }

  if (!isKnownIntent(parsed.intent)) {
    await logQuery({
      connection: null,
      intent: parsed.intent,
      question: questionFromBody(parsed),
      response_summary: null,
      allowed: false,
      blocked_reason: `invalid_intent: ${parsed.intent}`,
      scopes_used: [],
    });
    return withCors(invalidIntent(parsed.intent), origin);
  }
  const intent = parsed.intent as Intent;

  const validation = await validateConnection(parsed.connection_id, token);
  if (!validation.ok) {
    if (validation.reason === "revoked") {
      const policy = deniedPolicy("connection_revoked");
      await logQuery({
        connection: null,
        intent,
        question: questionFromBody(parsed),
        response_summary: "blocked: connection_revoked",
        allowed: false,
        blocked_reason: "connection_revoked",
        scopes_used: [],
      });
      return jsonWithCors({ policy }, { status: 200 }, origin);
    }
    await logQuery({
      connection: null,
      intent,
      question: questionFromBody(parsed),
      response_summary: null,
      allowed: false,
      blocked_reason: `unauthorized:${validation.reason}`,
      scopes_used: [],
    });
    return withCors(unauthorized("Invalid connection or access token"), origin);
  }
  const connection = validation.connection;

  const granted_scopes = (connection.scopes_json ?? []) as Scope[];
  const policy = evaluatePolicy({
    intent,
    context: parsed.context,
    granted_scopes,
    question: questionFromBody(parsed),
  });

  if (!policy.allowed) {
    await logQuery({
      connection,
      intent,
      question: questionFromBody(parsed),
      response_summary: `blocked: ${policy.blocked_reason}`,
      allowed: false,
      blocked_reason: policy.blocked_reason,
      scopes_used: [],
    });
    return jsonWithCors({ policy }, { status: 200 }, origin);
  }

  try {
    const responseData = await dispatchIntent(intent, connection, parsed);
    const finalBody = { ...responseData, policy };
    await logQuery({
      connection,
      intent,
      question: questionFromBody(parsed),
      response_summary: summarizeResponse(
        intent,
        responseData as Record<string, unknown>,
      ),
      allowed: true,
      blocked_reason: null,
      scopes_used: policy.scopes_used,
    });
    return jsonWithCors(finalBody, { status: 200 }, origin);
  } catch (err) {
    console.error("[twin/query] handler failed", err);
    await logQuery({
      connection,
      intent,
      question: questionFromBody(parsed),
      response_summary: "error: internal",
      allowed: false,
      blocked_reason: "internal",
      scopes_used: [],
    });
    if (err instanceof Error && /Too many events/i.test(err.message)) {
      return withCors(badRequest(`Max ${MAX_EVENTS} events per request`), origin);
    }
    return withCors(internal("Handler failed"), origin);
  }
}

async function dispatchIntent(
  intent: Intent,
  connection: AppConnection,
  body: ParsedQuery,
): Promise<Record<string, unknown>> {
  switch (intent) {
    case "general_summary":
      return { ...(await handleGeneralSummary({ twin_id: connection.twin_id })) };

    case "domain_summary": {
      const domainRaw = body.context?.domain;
      if (!domainRaw || !isKnownDomain(domainRaw)) {
        throw new Error("Domain missing or unknown");
      }
      return {
        ...(await handleDomainSummary({
          twin_id: connection.twin_id,
          domain: domainRaw,
        })),
      };
    }

    case "event_recommendation": {
      const event = body.context?.event;
      if (!event) throw new Error("event missing");
      return {
        ...(await handleEventRecommendation({
          twin_id: connection.twin_id,
          event,
        })),
      };
    }

    case "event_ranking": {
      const events = body.context?.events;
      if (!Array.isArray(events) || events.length === 0) {
        throw new Error("events missing");
      }
      return {
        ...(await handleEventRanking({
          twin_id: connection.twin_id,
          events,
        })),
      };
    }
  }
}
