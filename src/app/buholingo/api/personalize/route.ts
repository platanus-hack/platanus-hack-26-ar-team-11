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
    "Tu trabajo es armar UNA LECCIÓN COHERENTE de 5 ejercicios de traducción Español → Inglés (nivel A2/B1) sobre UN MISMO TEMA ESPECÍFICO que le interese a este usuario en particular.",
    "",
    "PROCESO MENTAL (no lo escribas, solo pensalo internamente):",
    "1) Mirá el contexto del Twin y elegí UNA situación / escenario concreto y específico — no algo genérico.",
    "   ✅ Bien: 'Yendo a un recital de Tormenta Negra en La Trastienda', 'Recomendándole música indie a un amigo', 'Volviendo a la madrugada de un show chico', 'Discutiendo por qué preferís venues íntimos'.",
    "   ❌ Mal: 'Música', 'Eventos', 'Cosas que le gustan' — son demasiado vagos.",
    "2) Escribí 5 oraciones que armen una mini-narrativa o discusión coherente DENTRO de ese tema. Las 5 oraciones tienen que tener continuidad — leídas en orden son una mini-historia o diálogo, no 5 frases sueltas.",
    "   - Ejercicio 1: setup / contexto (introduce la situación)",
    "   - Ejercicio 2: desarrollo (qué pasa, qué se hace)",
    "   - Ejercicio 3: detalle específico (con nombres, lugares, géneros que vengan del Twin)",
    "   - Ejercicio 4: una emoción, opinión o reacción del usuario",
    "   - Ejercicio 5: cierre / conclusión / implicancia",
    "3) Asegurate que TODAS las oraciones tengan onda de ESTE usuario, no de cualquiera. Si el Twin habla rioplatense, usá registro rioplatense en el español.",
    "",
    "EJEMPLO DE LO QUE QUIERO (no copies, es solo orientación):",
    "Tema: 'Yendo a un recital chico en La Trastienda'",
    "1. 'Esta noche tengo entradas para ver a Tormenta Negra.'",
    "2. 'El recital es en La Trastienda, un lugar bien chico.'",
    "3. 'Me gustan los venues íntimos más que los festivales gigantes.'",
    "4. 'Espero que toquen las canciones del último disco.'",
    "5. 'Después del show vamos a volver caminando con los pibes.'",
    "Notá: las 5 oraciones cuentan una mini-historia sobre la misma noche. No son 5 datos sueltos.",
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
  "topic": "<título corto en español del tema/escenario elegido — máx 8 palabras, ej: 'Yendo a un recital chico'>",
  "summary": "<una oración corta en español que explique por qué esta lección le va a este usuario>",
  "twin_facts_used": ["<3 a 5 bullets cortos de qué facts del Twin usaste para el tema, en español>"],
  "exercises": [
    {
      "id": "p1",
      "prompt_es": "<oración 1 — setup del escenario>",
      "answer_en": "<traducción natural>",
      "interest_used": "<tag corto: 'Indie rock', 'Recitales íntimos', etc.>"
    },
    {
      "id": "p2",
      "prompt_es": "<oración 2 — desarrollo>",
      "answer_en": "<traducción>",
      "interest_used": "<tag>"
    },
    {
      "id": "p3",
      "prompt_es": "<oración 3 — detalle específico con nombres del Twin>",
      "answer_en": "<traducción>",
      "interest_used": "<tag>"
    },
    {
      "id": "p4",
      "prompt_es": "<oración 4 — emoción/opinión>",
      "answer_en": "<traducción>",
      "interest_used": "<tag>"
    },
    {
      "id": "p5",
      "prompt_es": "<oración 5 — cierre>",
      "answer_en": "<traducción>",
      "interest_used": "<tag>"
    }
  ]
}`,
    "",
    "Reglas duras:",
    "- Las 5 oraciones deben pertenecer al MISMO escenario (continuidad temática y narrativa).",
    "- Cada oración en español: 6 a 14 palabras, gramática simple.",
    "- Cada traducción al inglés: una sola oración natural y correcta.",
    "- Mencioná al menos 1-2 nombres propios concretos del Twin (artista, venue, lugar) en el conjunto de los 5 ejercicios.",
    "- No metas comillas raras dentro del JSON.",
    "- Exactamente 5 ejercicios, ids p1..p5, en orden narrativo.",
  ].join("\n");
}

const ExerciseSchema = z.object({
  id: z.string(),
  prompt_es: z.string().min(1),
  answer_en: z.string().min(1),
  interest_used: z.string().optional(),
});

const LessonSchema = z.object({
  topic: z.string().min(1),
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
