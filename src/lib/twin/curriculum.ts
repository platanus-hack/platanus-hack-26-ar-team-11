import type { CurriculumSlot } from "@/types";

export const CURRICULUM: readonly CurriculumSlot[] = [
  {
    index: 0,
    target_domain: "vibes",
    target_depth: "broad",
    focus_areas: [
      "Personalidad general y energía social",
      "Cómo se describe a sí mismo",
      "Qué lo recarga vs qué lo agota",
      "Intereses amplios fuera del trabajo",
    ],
    intro_hint:
      "Hola, qué bueno encontrarte. Hoy quiero conocerte un poco — empecemos por algo simple, ¿cómo te describirías?",
  },
  {
    index: 1,
    target_domain: "vibes",
    target_depth: "deep",
    focus_areas: [
      "Estética personal (qué le gusta visualmente, espacios, ropa, ambientes)",
      "Mood predominante en distintos contextos",
      "Valores que le importan",
      "Rituales o momentos del día que disfruta",
    ],
    intro_hint:
      "La última vez aprendí bastante de tu energía general. Hoy quiero meterme un toque más profundo en quién sos.",
  },
  {
    index: 2,
    target_domain: "music_taste",
    target_depth: "broad",
    focus_areas: [
      "Géneros que escucha más seguido y por qué",
      "Mood: música para concentrarse, social, relajación",
      "Contextos de escucha (auto, gym, trabajo, fiestas)",
      "Cómo evolucionó su gusto en los últimos años",
    ],
    intro_hint: "Hoy hablemos de música. ¿Qué estás escuchando últimamente?",
  },
  {
    index: 3,
    target_domain: "music_taste",
    target_depth: "deep",
    focus_areas: [
      "Artistas favoritos y qué le gusta de cada uno",
      "Cómo descubre música nueva (playlists, amigos, redes, en vivo)",
      'Qué define para él una "buena" canción',
      "Música que asocia a momentos importantes de su vida",
    ],
    intro_hint: "Volvamos a música, pero más en detalle.",
  },
  {
    index: 4,
    target_domain: "event_preferences",
    target_depth: "broad",
    focus_areas: [
      "Festival al aire libre vs club íntimo",
      "Indoor vs outdoor",
      "Frecuencia con la que va a eventos",
      "Qué eventos le quedaron grabados",
    ],
    intro_hint:
      "Cambiando un poco — hoy quiero entender cómo viviste eventos en vivo.",
  },
  {
    index: 5,
    target_domain: "event_preferences",
    target_depth: "deep",
    focus_areas: [
      "Presupuesto que destina a entradas y a viajes para eventos",
      "Horarios preferidos (noche, tarde, fin de semana)",
      "Con quién suele ir (solo, pareja, amigos)",
      "Deal-breakers (cosas que no soporta en un evento)",
    ],
    intro_hint:
      "Vamos un toque más al detalle de cómo te gusta vivir los eventos.",
  },
  {
    index: 6,
    target_domain: null,
    target_depth: "synthesis",
    focus_areas: [
      "Recapitular lo aprendido de los 6 slots previos",
      "Validar 3-5 facts importantes con el usuario",
      "Pedir correcciones explícitas",
      "Confirmar las áreas que se sienten mejor entendidas",
    ],
    intro_hint:
      "Hoy quiero recapitular un poco lo que entendí de vos hasta ahora, y que me corrijas si me equivoqué en algo.",
  },
  {
    index: 7,
    target_domain: null,
    target_depth: "gap_filling",
    focus_areas: [
      "Identificar áreas con menor confidence en el profile actual",
      "Hacer preguntas específicas para llenar gaps",
      "Cubrir ángulos que el LLM evaluó como ambiguos en sesiones previas",
    ],
    intro_hint:
      "Última sesión del entrenamiento. Hay algunas cosas en las que todavía no tengo certeza — quiero cubrirlas hoy.",
  },
] as const;

export function getCurriculumSlot(index: number): CurriculumSlot {
  if (index < 0 || index >= CURRICULUM.length) {
    throw new Error(
      `Curriculum slot ${index} out of range [0..${CURRICULUM.length - 1}]`
    );
  }
  return CURRICULUM[index];
}
