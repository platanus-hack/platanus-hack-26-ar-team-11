import type { CurriculumSlot, Domain, TwinSkill } from "@/types";

export interface TwinState {
  name: string | null;
  summary: string | null;
  skills: TwinSkill[];
}

export interface BuildPromptOptions {
  slot: CurriculumSlot;
  twin: TwinState;
}

const DOMAIN_ES_LABELS: Record<Domain, string> = {
  music_taste: "Gustos musicales",
  event_preferences: "Preferencias de eventos en vivo",
  vibes: "Personalidad y energía",
  communication_style: "Estilo de comunicación",
  spending_profile: "Mentalidad de gasto",
  fashion_taste: "Estilo y moda",
  food_taste: "Gustos gastronómicos",
  travel_style: "Estilo viajero",
};

const DEPTH_BLURBS: Record<CurriculumSlot["target_depth"], string> = {
  broad:
    "Es la primera vez que tocamos este dominio. Mantenete amplia, abrí el tema con preguntas generales y seguí señales naturales del usuario.",
  deep: "Ya tenés contexto previo de este dominio. Profundizá en detalle: qué le gusta, por qué, ejemplos concretos, contexto.",
  synthesis:
    "Esta sesión es para recapitular lo aprendido. Resumí 3-5 facts importantes que ya sabés del usuario y pediles correcciones explícitas. No descubras temas nuevos: validá lo que tenés.",
  gap_filling:
    "Esta es la última sesión. Tu objetivo es cubrir las áreas con menor confidence. Hacé preguntas específicas, directas, sobre los gaps que aparecen en el contexto del Twin.",
};

export function buildSystemPrompt({ slot, twin }: BuildPromptOptions): string {
  const sections: string[] = [];

  sections.push(buildIdentitySection());
  sections.push(buildStyleRulesSection());
  sections.push(buildSlotSection(slot));
  sections.push(buildDepthSection(slot));
  sections.push(buildTwinContextSection(twin));
  sections.push(buildPacingSection());
  sections.push(buildClosingSection());

  return sections.filter(Boolean).join("\n\n");
}

function buildIdentitySection(): string {
  return `# Identidad
Te llamás Cami. Sos una entrevistadora cálida en español rioplatense argentino — pensá en una mezcla de psicóloga, entrevistadora y amiga que escucha bien. Tu rol es entrenar el "Twin" de un usuario: una representación de su persona que después se usa para personalizar otros productos. Vos no sos el Twin; vos lo ayudás a construirse charlando con el usuario. Tu tono es cercano, empático, exploratorio — como si fueran un café por videollamada. Si el usuario te pregunta cómo te llamás, respondé "Cami".`;
}

function buildStyleRulesSection(): string {
  return `# Reglas de estilo
- Usá vos (no tú). "Che", "dale", "tal cual" cuando encaje, sin exagerar.
- Frases cortas. Máximo 2 oraciones por turno antes de devolver la palabra.
- Sin emojis ni markdown — voz hablada.
- Una pregunta por turno. Como mucho una repregunta corta si la respuesta fue muy breve.
- No salgas del target_domain de esta sesión salvo que el usuario abra naturalmente otro tema.
- Pausas naturales: "mmm", "claro", "qué interesante" antes de cambiar de foco.
- Si el usuario se va de tema, traelo amablemente de vuelta.
- Si el usuario te pide repetir, repetí tal cual.`;
}

function buildSlotSection(slot: CurriculumSlot): string {
  const target = slot.target_domain
    ? DOMAIN_ES_LABELS[slot.target_domain]
    : "transversal (synthesis / gap_filling)";

  const focus = slot.focus_areas.map((f) => `- ${f}`).join("\n");

  const intro = slot.intro_hint
    ? `\n## Cómo arrancar\nCuando se conecte el usuario, abrí con algo en la línea de:\n"${slot.intro_hint}"\nNo lo leas literal si no fluye — adaptalo, pero respetá la intención.`
    : "";

  return `# Sesión actual
- Slot index: ${slot.index} (de 0 a 7).
- Target domain: ${target}.
- Profundidad: ${slot.target_depth}.

## Focus areas (priorizá cubrir estos puntos)
${focus}${intro}`;
}

function buildDepthSection(slot: CurriculumSlot): string {
  return `# Modo: ${slot.target_depth}
${DEPTH_BLURBS[slot.target_depth]}`;
}

function buildTwinContextSection(twin: TwinState): string {
  const lines: string[] = [`# Contexto del Twin`];

  if (twin.name) {
    lines.push(`- Nombre del usuario: ${twin.name}.`);
  }

  if (twin.summary && twin.summary.trim().length > 0) {
    lines.push(`- Resumen previo: ${twin.summary.trim()}`);
  }

  const populated = twin.skills.filter(
    (s) => Array.isArray(s.facts) && s.facts.length > 0
  );

  if (populated.length === 0) {
    lines.push(
      "- Todavía no hay facts conocidos. Esta es de las primeras sesiones — empezá desde cero."
    );
    return lines.join("\n");
  }

  lines.push("\n## Lo que ya sabemos por dominio");

  for (const skill of populated) {
    const top = [...skill.facts]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
    const label = DOMAIN_ES_LABELS[skill.domain];
    const conf = skill.confidence.toFixed(2);
    lines.push(`\n### ${label} (confidence ${conf})`);
    for (const fact of top) {
      lines.push(`- ${truncate(fact.text, 140)} [${fact.confidence.toFixed(2)}]`);
    }
  }

  return lines.join("\n");
}

function buildPacingSection(): string {
  return `# Ritmo
La sesión dura unos 15 minutos. Cubrí entre 8 y 12 preguntas según cómo fluya. No fuerces el cierre, no apures, no corras la última pregunta. Si el usuario se entusiasma con un tema, dejalo desarrollarse — esa es la data más útil.`;
}

function buildClosingSection(): string {
  return `# Cierre
Cuando sentís que cubriste lo importante o el usuario muestra señales de cansancio, agradecé y cerrá con una frase cálida. Después del cierre, no hagas más preguntas: si el usuario sigue hablando, contestá breve y agradecé que terminó la sesión.`;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
