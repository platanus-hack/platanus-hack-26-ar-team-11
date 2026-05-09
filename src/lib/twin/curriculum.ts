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
    target_domain: "communication_style",
    target_depth: "broad",
    focus_areas: [
      "Tono que prefiere: directo vs envolvente, formal vs casual",
      "Verbosidad: respuestas cortas o largas",
      "Nivel técnico que le resulta cómodo",
      "Cómo le gusta que le hablen las apps o asistentes",
    ],
    intro_hint:
      "Hoy quiero entender cómo te gusta que se comuniquen con vos. Pensá en una app o un asistente: ¿qué tono te cae mejor?",
  },
  {
    index: 3,
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
    index: 4,
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
    index: 5,
    target_domain: "event_preferences",
    target_depth: "broad",
    focus_areas: [
      "Festival al aire libre vs club íntimo",
      "Indoor vs outdoor",
      "Frecuencia con la que va a eventos",
      "Qué eventos le quedaron grabados",
      "Con quién suele ir y deal-breakers (cosas que no soporta en un evento)",
    ],
    intro_hint:
      "Cambiando un poco — hoy quiero entender cómo viviste eventos en vivo.",
  },
  {
    index: 6,
    target_domain: "spending_profile",
    target_depth: "broad",
    focus_areas: [
      "Sensibilidad al precio: cazador de ofertas vs price-blind",
      "Categorías donde no le importa pagar más (splurge)",
      "Categorías donde busca ahorrar siempre",
      "Mentalidad: experiencias vs cosas, status vs value",
      "Cómo paga: efectivo, tarjeta, cuotas, suscripciones",
    ],
    intro_hint:
      "Hoy quiero entender un poco cómo te llevás con la plata — no los números, sino la actitud.",
  },
  {
    index: 7,
    target_domain: "fashion_taste",
    target_depth: "broad",
    focus_areas: [
      "Estilo personal (minimal, streetwear, clásico, formal, etc.)",
      "Paleta de colores que usa y la que evita",
      "Fits preferidos (oversized, fitted, suelto)",
      "Brands queridas u odiadas, y por qué",
      "Ocasiones de uso (laburo, casual, salidas, deporte)",
    ],
    intro_hint:
      "Hoy hablemos de cómo te gusta vestirte. ¿Cómo describirías tu estilo?",
  },
  {
    index: 8,
    target_domain: "food_taste",
    target_depth: "broad",
    focus_areas: [
      "Cocinas favoritas y cocinas que evita",
      "Restricciones (vegetariano, sin gluten, alergias, etc.)",
      "Paladar (picante, dulce, umami, ácido)",
      "Hábito: delivery, cocina en casa, sale a comer",
      "Restaurantes o platos que ama",
    ],
    intro_hint:
      "Hoy hablemos de comida. Contame qué te gusta cocinar o pedir cuando tenés ganas de algo bueno.",
  },
  {
    index: 9,
    target_domain: "travel_style",
    target_depth: "broad",
    focus_areas: [
      "Vibe viajero (mochilero, confort, lujo)",
      "Tipo de destino (ciudad, playa, montaña, cultura, naturaleza)",
      "Presupuesto típico y duración usual",
      "Con quién viaja (solo, pareja, amigos, familia)",
      "Destinos que ama y cosas que evita en un viaje",
    ],
    intro_hint:
      "Hoy quiero conocer al vos viajero. Contame del último viaje que te marcó.",
  },
  {
    index: 10,
    target_domain: null,
    target_depth: "synthesis",
    focus_areas: [
      "Recapitular lo aprendido de los slots previos",
      "Validar 4-6 facts importantes con el usuario",
      "Pedir correcciones explícitas",
      "Confirmar las áreas que se sienten mejor entendidas",
    ],
    intro_hint:
      "Hoy quiero recapitular un poco lo que entendí de vos hasta ahora, y que me corrijas si me equivoqué en algo.",
  },
  {
    index: 11,
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
