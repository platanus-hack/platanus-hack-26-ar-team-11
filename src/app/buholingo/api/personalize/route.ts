import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  ANTHROPIC_RECO_MODEL,
  extractFirstJson,
  extractText,
  getAnthropicClient,
} from "@/lib/query/anthropic";
import type { PersonalizedLesson } from "@/lib/buholingo/types";

const BodySchema = z.object({
  connection_id: z.string().min(1),
  access_token: z.string().min(1),
});

interface QueryConn {
  connection_id: string;
  access_token: string;
}

async function callTwinQuery(
  request: NextRequest,
  conn: QueryConn,
  intent: string,
  context: Record<string, unknown> | undefined,
): Promise<unknown> {
  const url = new URL("/api/twin/query", request.url);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${conn.access_token}`,
    },
    body: JSON.stringify({
      connection_id: conn.connection_id,
      intent,
      context,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`twin/query ${intent} ${res.status}: ${body.slice(0, 160)}`);
  }
  return res.json();
}

function buildPrompt(args: {
  general: unknown;
  music: unknown;
  vibes: unknown;
}): string {
  return [
    "Sos un generador de lecciones de inglés para Buholingo, una app tipo Duolingo.",
    "Tu trabajo es generar 5 ejercicios CORTOS de traducción Español → Inglés para un nivel A2/B1.",
    "",
    "REQUISITO PRINCIPAL: cada ejercicio tiene que estar armado alrededor de los gustos y la personalidad de este usuario en particular. NO frases genéricas. Las oraciones tienen que mencionar artistas reales, géneros, venues, vibes, hábitos del usuario que aparezcan en el contexto. Si su Twin habla de indie rock, los ejercicios giran sobre eso. Si habla de venues íntimos, eso aparece. Si comunica en español rioplatense, podés usar ese registro en el prompt_es.",
    "",
    "Si el contexto es escaso, igual generá 5 ejercicios usando lo poco que haya, pero hacé que se note que son personales (no 'I eat an apple').",
    "",
    "=== CONTEXTO DEL TWIN ===",
    "[General summary]",
    JSON.stringify(args.general, null, 2),
    "",
    "[Music taste]",
    JSON.stringify(args.music, null, 2),
    "",
    "[Vibes]",
    JSON.stringify(args.vibes, null, 2),
    "=== FIN CONTEXTO ===",
    "",
    "Devolvé EXCLUSIVAMENTE un JSON con esta forma exacta (sin texto adicional, sin markdown, sin ```):",
    `{
  "summary": "<una oración corta en español que explique por qué esta lección está hecha para este usuario>",
  "twin_facts_used": ["<3 a 5 bullets cortos de qué facts del Twin usaste, en español>"],
  "exercises": [
    {
      "id": "p1",
      "prompt_es": "<oración en español que use los intereses del usuario>",
      "answer_en": "<traducción al inglés correcta y natural>",
      "interest_used": "<tag corto en español: 'Indie rock', 'Recitales íntimos', 'Vibe introspectiva', etc.>"
    }
    // ... 5 en total, ids p1..p5
  ]
}`,
    "",
    "Reglas duras:",
    "- Las oraciones en español deben ser de 6 a 14 palabras, simples gramaticalmente.",
    "- La traducción al inglés debe ser una sola oración natural.",
    "- No metas comillas raras dentro del JSON.",
    "- Cinco ejercicios, ni más ni menos.",
  ].join("\n");
}

const ExerciseSchema = z.object({
  id: z.string(),
  prompt_es: z.string().min(1),
  answer_en: z.string().min(1),
  interest_used: z.string().optional(),
});

const LessonSchema = z.object({
  summary: z.string(),
  twin_facts_used: z.array(z.string()),
  exercises: z.array(ExerciseSchema).length(5),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const conn = parsed.data;

  let general: unknown;
  let music: unknown;
  let vibes: unknown;
  try {
    [general, music, vibes] = await Promise.all([
      callTwinQuery(request, conn, "general_summary", undefined),
      callTwinQuery(request, conn, "domain_summary", { domain: "music_taste" }),
      callTwinQuery(request, conn, "domain_summary", { domain: "vibes" }),
    ]);
  } catch (err) {
    console.error("[personalize] twin/query failed", err);
    return NextResponse.json(
      { error: "twin_query_failed", message: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  const client = getAnthropicClient();
  let raw = "";
  try {
    const message = await client.messages.create({
      model: ANTHROPIC_RECO_MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: buildPrompt({ general, music, vibes }),
        },
      ],
    });
    raw = extractText(message);
  } catch (err) {
    console.error("[personalize] anthropic failed", err);
    return NextResponse.json(
      { error: "llm_failed", message: err instanceof Error ? err.message : "unknown" },
      { status: 502 },
    );
  }

  const json = extractFirstJson<unknown>(raw);
  if (!json) {
    console.error("[personalize] could not parse JSON from LLM", raw.slice(0, 400));
    return NextResponse.json(
      { error: "parse_failed", raw: raw.slice(0, 400) },
      { status: 502 },
    );
  }

  const lessonParse = LessonSchema.safeParse(json);
  if (!lessonParse.success) {
    console.error("[personalize] lesson schema failed", lessonParse.error.issues);
    return NextResponse.json(
      { error: "lesson_schema_failed", issues: lessonParse.error.issues, raw: json },
      { status: 502 },
    );
  }

  const lesson: PersonalizedLesson = lessonParse.data;
  return NextResponse.json(lesson);
}
