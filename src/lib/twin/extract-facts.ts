import Anthropic from "@anthropic-ai/sdk";
import { ALL_DOMAINS } from "@/types/twin";
import type {
  Domain,
  ExtractedFact,
  TranscriptEntry,
  TwinSkill,
} from "@/types";

export interface ExtractFactsInput {
  transcript: TranscriptEntry[];
  twinSkills: TwinSkill[];
  targetDomain: Domain | null;
  apiKey?: string;
  model?: string;
  client?: Anthropic;
}

export interface FactExtractionPayload {
  facts: ExtractedFact[];
  summary_update: string | null;
}

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_FACT_TEXT_CHARS = 140;

export async function extractFacts(
  input: ExtractFactsInput
): Promise<FactExtractionPayload> {
  if (input.transcript.length === 0) {
    return { facts: [], summary_update: null };
  }

  const client =
    input.client ??
    new Anthropic({
      apiKey: input.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  const model = input.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  const system = buildExtractionSystemPrompt(input.targetDomain);
  const userMessage = buildExtractionUserMessage(input);

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    temperature: 0.2,
    system,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = collectText(response);
  return parseExtractionPayload(text);
}

export function buildExtractionSystemPrompt(
  targetDomain: Domain | null
): string {
  return `Sos un sistema de extracción de facts para el "Twin" de un usuario. Recibís el transcript de una sesión + el estado actual del Twin y devolvés un JSON con los facts más relevantes que aprendiste sobre el usuario.

# Output schema (estricto)
Devolvé EXCLUSIVAMENTE un JSON con esta forma, sin texto antes ni después, sin markdown:
{
  "facts": [
    { "domain": "music_taste" | "event_preferences" | "vibes" | "communication_style", "text": "string corto declarativo", "confidence": 0..1 }
  ],
  "summary_update": null | "string corto que reemplaza el summary previo"
}

# Reglas
- "domain" debe ser uno de los 4 valores listados.
- "text" en español, ≤ ${MAX_FACT_TEXT_CHARS} caracteres, declarativo (ej: "Top genres: indie, rock, alternative").
- "confidence" entre 0 y 1 según qué tan fuerte fue la señal en el transcript.
- Si no hay nada útil que extraer, devolvé {"facts":[],"summary_update":null}.
- Aunque el target_domain de la sesión sea ${targetDomain ?? "transversal"}, podés sumar facts de otros dominios si aparecen señales claras (especialmente communication_style se infiere transversalmente).
- No inventes. Si una afirmación no está en el transcript, no la incluyas.
- "summary_update" solo si tenés una versión clara y compacta (≤ 240 chars) que mejore el resumen previo. Sino null.`;
}

export function buildExtractionUserMessage(input: ExtractFactsInput): string {
  const transcriptBlock = input.transcript
    .map((t) => `[${t.role}] ${t.text}`)
    .join("\n");

  const knownBlock =
    input.twinSkills.length === 0
      ? "(sin facts previos)"
      : input.twinSkills
          .map((sk) => {
            const facts = sk.facts
              .slice(0, 5)
              .map((f) => `  - [${f.confidence.toFixed(2)}] ${f.text}`)
              .join("\n");
            return `${sk.domain} (conf ${sk.confidence.toFixed(2)}):\n${facts || "  (sin facts)"}`;
          })
          .join("\n\n");

  return `# Target domain de esta sesión
${input.targetDomain ?? "transversal (synthesis o gap_filling)"}

# Twin actual
${knownBlock}

# Transcript de la sesión
${transcriptBlock}`;
}

export function parseExtractionPayload(raw: string): FactExtractionPayload {
  const json = stripJsonFences(raw).trim();
  if (!json) return { facts: [], summary_update: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error(`extractFacts: LLM returned invalid JSON: ${raw.slice(0, 200)}`);
  }

  if (!parsed || typeof parsed !== "object") {
    return { facts: [], summary_update: null };
  }

  const obj = parsed as { facts?: unknown; summary_update?: unknown };
  const facts = Array.isArray(obj.facts) ? obj.facts.flatMap(toFact) : [];

  const summaryUpdate =
    typeof obj.summary_update === "string" && obj.summary_update.trim().length > 0
      ? obj.summary_update.trim().slice(0, 240)
      : null;

  return { facts, summary_update: summaryUpdate };
}

function toFact(item: unknown): ExtractedFact[] {
  if (!item || typeof item !== "object") return [];
  const o = item as { domain?: unknown; text?: unknown; confidence?: unknown };
  if (typeof o.domain !== "string" || typeof o.text !== "string") return [];
  if (!ALL_DOMAINS.includes(o.domain as Domain)) return [];
  const confidence =
    typeof o.confidence === "number" && Number.isFinite(o.confidence)
      ? clamp01(o.confidence)
      : 0.5;
  const text = o.text.trim().slice(0, MAX_FACT_TEXT_CHARS);
  if (text.length === 0) return [];
  return [{ domain: o.domain as Domain, text, confidence }];
}

function collectText(response: Anthropic.Messages.Message): string {
  if (!Array.isArray(response.content)) return "";
  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\n?/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }
  return trimmed;
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
