import type { BlockedDomain } from "@/types/permissions";
import { ALL_BLOCKED_DOMAINS } from "@/types/permissions";

export const BLOCKED_KEYWORDS: Record<BlockedDomain, string[]> = {
  politics: [
    "voto",
    "votar",
    "partido",
    "elecciones",
    "elección",
    "político",
    "política",
    "vote",
    "voted",
    "voting",
    "election",
    "elections",
    "party",
    "ballot",
    "candidate",
    "candidato",
  ],
  health: [
    "salud",
    "enfermedad",
    "enfermo",
    "medicación",
    "medicacion",
    "medicamento",
    "diagnóstico",
    "diagnostico",
    "doctor",
    "médico",
    "medico",
    "hospital",
    "health",
    "illness",
    "disease",
    "medication",
    "diagnosis",
    "doctor",
    "medicine",
  ],
  relationships: [
    "pareja",
    "novio",
    "novia",
    "esposo",
    "esposa",
    "marido",
    "matrimonio",
    "ex ",
    "mi ex",
    "partner",
    "spouse",
    "marriage",
    "girlfriend",
    "boyfriend",
    "wife",
    "husband",
    "dating",
    "divorce",
    "divorcio",
  ],
  financial_status: [
    "ingreso",
    "ingresos",
    "sueldo",
    "salario",
    "deuda",
    "deudas",
    "patrimonio",
    "ahorros",
    "income",
    "salary",
    "debt",
    "savings",
    "net worth",
    "credit score",
    "bankruptcy",
    "bancarrota",
  ],
  private_memories: [
    "recuerdo íntimo",
    "recuerdo privado",
    "memoria privada",
    "secreto",
    "private memory",
    "intimate memory",
    "personal secret",
  ],
  sensitive_topics: [],
  raw_sources: [],
};

export function isBlockedDomain(name: string): name is BlockedDomain {
  return (ALL_BLOCKED_DOMAINS as readonly string[]).includes(name);
}

const WORD_BOUNDARY = /[\s.,;:!?¿¡()'"`-]/;

function containsKeyword(haystack: string, keyword: string): boolean {
  if (!keyword) return false;
  const idx = haystack.indexOf(keyword);
  if (idx === -1) return false;
  // Phrase-like keywords (have spaces) or short tokens — accept substring match.
  if (keyword.includes(" ")) return true;
  // Word-boundary check on single tokens to avoid "voto" matching "devoto" etc.
  const before = idx === 0 ? " " : haystack[idx - 1];
  const afterIdx = idx + keyword.length;
  const after = afterIdx >= haystack.length ? " " : haystack[afterIdx];
  return WORD_BOUNDARY.test(before) && WORD_BOUNDARY.test(after);
}

export function detectBlockedTopic(question: string | null | undefined): BlockedDomain | null {
  if (!question) return null;
  const q = ` ${question.toLowerCase().trim()} `;
  for (const domain of ALL_BLOCKED_DOMAINS) {
    const keywords = BLOCKED_KEYWORDS[domain];
    if (!keywords || keywords.length === 0) continue;
    for (const kw of keywords) {
      if (containsKeyword(q, kw.toLowerCase())) {
        return domain;
      }
    }
  }
  return null;
}
