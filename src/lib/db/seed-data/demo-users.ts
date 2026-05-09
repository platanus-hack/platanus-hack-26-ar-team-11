import type { Domain, ExtractedFact, TranscriptEntry } from "@/types";

export interface DemoFactSeed {
  text: string;
  confidence: number; // 0..1
}

export interface DemoSkillSeed {
  domain: Domain;
  facts: DemoFactSeed[];
}

export interface DemoSessionSeed {
  session_index: number; // 0..7
  domain: Domain | null;
  target_domains: Domain[];
  duration_seconds: number;
  days_ago: number;
  summary: string;
  transcript: TranscriptEntry[];
  extracted_facts: ExtractedFact[];
}

export interface DemoUserSeed {
  email: string;
  name: string;
  twin_name: string;
  next_session_index: number;
  completion_score: number;
  twin_summary: string;
  skills: DemoSkillSeed[];
  sessions: DemoSessionSeed[];
}

const DEMO_PASSWORD_FALLBACK = "twin_demo_2026!";

export function getDemoPassword(): string {
  return process.env.DEMO_USER_PASSWORD ?? DEMO_PASSWORD_FALLBACK;
}

const t = (role: "user" | "assistant", text: string, minutesOffset = 0): TranscriptEntry => ({
  role,
  at: new Date(Date.now() - minutesOffset * 60_000).toISOString(),
  text,
});

export const DEMO_USER_1: DemoUserSeed = {
  email: "demo1@twin-protocol.example",
  name: "Manuel",
  twin_name: "Manuel's Twin",
  next_session_index: 5,
  completion_score: 0.62,
  twin_summary:
    "Manuel disfruta del rock indie y alternativo en venues íntimos. Prefiere descubrir música por su cuenta, valora la curaduría y se siente más cómodo en eventos chicos entre semana.",
  skills: [
    {
      domain: "vibes",
      facts: [
        { text: "Introvertido, recarga energía en espacios tranquilos.", confidence: 0.92 },
        { text: "Estética minimalista, le molestan los ambientes saturados.", confidence: 0.85 },
        { text: "Disfruta del descubrimiento intencional, no algorítmico.", confidence: 0.81 },
        { text: "Valora momentos compartidos en grupos chicos (≤4 personas).", confidence: 0.78 },
      ],
    },
    {
      domain: "music_taste",
      facts: [
        { text: "Indie rock y alternativo argentino son el core.", confidence: 0.92 },
        { text: "Sigue de cerca a Los Solitarios, Tormenta Negra y Aurora Vega.", confidence: 0.88 },
        { text: "Le interesa el shoegaze y el dream pop como crossover.", confidence: 0.84 },
      ],
    },
    {
      domain: "event_preferences",
      facts: [
        { text: "Prefiere venues íntimos (≤300 personas).", confidence: 0.78 },
        { text: "Eventos entre semana, evita fines de semana muy llenos.", confidence: 0.72 },
        { text: "Tope de gasto promedio por entrada: ARS 25k.", confidence: 0.65 },
      ],
    },
    {
      domain: "communication_style",
      facts: [
        { text: "Tono reflexivo, prefiere conversaciones largas y pausadas.", confidence: 0.79 },
        { text: "Le gusta cuando el assistant le devuelve resúmenes en 1–2 oraciones.", confidence: 0.78 },
      ],
    },
  ],
  sessions: [
    {
      session_index: 0,
      domain: "vibes",
      target_domains: ["vibes"],
      duration_seconds: 11 * 60,
      days_ago: 9,
      summary: "Mapa inicial: introvertido, espacios tranquilos, descubrimiento intencional.",
      transcript: [
        t("assistant", "Contame, ¿qué hacés cuando querés cargar pilas un domingo?", 11),
        t("user", "Me gusta quedarme en casa con un disco bueno o caminar solo por el barrio.", 10),
        t("assistant", "¿Cuán seguido salís a algo con mucha gente?", 9),
        t("user", "Una vez al mes, máximo. Más que eso me agota.", 8),
        t("assistant", "¿Y cuando vas, preferís ir solo, en pareja o en grupo chico?", 7),
        t("user", "Grupo chico, hasta 3 o 4 amigos.", 6),
      ],
      extracted_facts: [
        { domain: "vibes", text: "Introvertido, recarga energía en espacios tranquilos.", confidence: 0.9 },
        { domain: "vibes", text: "Valora momentos compartidos en grupos chicos.", confidence: 0.78 },
      ],
    },
    {
      session_index: 1,
      domain: "music_taste",
      target_domains: ["music_taste"],
      duration_seconds: 13 * 60,
      days_ago: 7,
      summary: "Indie rock y alternativo, foco en bandas argentinas.",
      transcript: [
        t("assistant", "¿Qué disco te marcó este último año?", 13),
        t("user", "Uno de Aurora Vega que salió en julio. Lo escuché completo varias veces.", 12),
        t("assistant", "¿Qué te enganchó?", 11),
        t("user", "La textura del sonido, las guitarras llenas pero no agresivas.", 10),
        t("assistant", "¿Cómo solés descubrir música nueva?", 9),
        t("user", "Boca a boca y blogs. Las playlists algorítmicas no me copan.", 8),
      ],
      extracted_facts: [
        { domain: "music_taste", text: "Indie rock y alternativo argentino son el core.", confidence: 0.91 },
        { domain: "music_taste", text: "Disfruta del descubrimiento intencional, no algorítmico.", confidence: 0.82 },
      ],
    },
    {
      session_index: 2,
      domain: "event_preferences",
      target_domains: ["event_preferences"],
      duration_seconds: 12 * 60,
      days_ago: 5,
      summary: "Prefiere venues íntimos y eventos entre semana.",
      transcript: [
        t("assistant", "¿Festival grande o show íntimo?", 12),
        t("user", "Show íntimo. Niceto, La Tangente, esos lugares.", 11),
        t("assistant", "¿Cuánto pagarías por una entrada que te re cope?", 10),
        t("user", "Hasta 25 lucas. Más que eso lo pienso mucho.", 9),
      ],
      extracted_facts: [
        { domain: "event_preferences", text: "Prefiere venues íntimos (≤300 personas).", confidence: 0.78 },
        { domain: "event_preferences", text: "Tope de gasto por entrada: ARS 25k.", confidence: 0.66 },
      ],
    },
    {
      session_index: 3,
      domain: "music_taste",
      target_domains: ["music_taste"],
      duration_seconds: 14 * 60,
      days_ago: 3,
      summary: "Profundización en gustos: shoegaze, dream pop, bandas locales.",
      transcript: [
        t("assistant", "¿Qué pensás del shoegaze?", 14),
        t("user", "Me encanta. Slowdive me partió la cabeza hace años.", 13),
        t("assistant", "¿Hay bandas argentinas que te lleven a ese mood?", 12),
        t("user", "Tormenta Negra, en parte. Y algunas cosas viejas de Los Solitarios.", 11),
      ],
      extracted_facts: [
        { domain: "music_taste", text: "Sigue de cerca a Los Solitarios, Tormenta Negra y Aurora Vega.", confidence: 0.88 },
        { domain: "music_taste", text: "Le interesa el shoegaze y el dream pop como crossover.", confidence: 0.84 },
      ],
    },
    {
      session_index: 4,
      domain: null,
      target_domains: ["vibes", "communication_style"],
      duration_seconds: 10 * 60,
      days_ago: 1,
      summary: "Síntesis: estilo de comunicación reflexivo, vibes consistente.",
      transcript: [
        t("assistant", "Cuando te recomiendo algo, ¿preferís 1 línea o 3 párrafos?", 10),
        t("user", "Una o dos oraciones. Si me copa, profundizamos.", 9),
        t("assistant", "Anotado. ¿Querés que sea más informal o más neutro?", 8),
        t("user", "Informal, pero no forzado.", 7),
      ],
      extracted_facts: [
        { domain: "communication_style", text: "Tono reflexivo, prefiere conversaciones largas y pausadas.", confidence: 0.79 },
        { domain: "communication_style", text: "Resúmenes cortos en 1–2 oraciones.", confidence: 0.78 },
      ],
    },
  ],
};

export const DEMO_USER_2: DemoUserSeed = {
  email: "demo2@twin-protocol.example",
  name: "Sofía",
  twin_name: "Sofía's Twin",
  next_session_index: 7,
  completion_score: 0.78,
  twin_summary:
    "Sofía es extrovertida, vive la música en festivales grandes y energía pop/electrónica. Disfruta los planes con grupos grandes y gasta más en experiencias inolvidables.",
  skills: [
    {
      domain: "vibes",
      facts: [
        { text: "Extrovertida, energía social alta.", confidence: 0.93 },
        { text: "Disfruta planes con 6+ personas.", confidence: 0.86 },
        { text: "Estética colorida, le gustan los ambientes vibrantes.", confidence: 0.82 },
      ],
    },
    {
      domain: "music_taste",
      facts: [
        { text: "Pop internacional y electrónica son el core.", confidence: 0.91 },
        { text: "Sigue artistas como Dua Lipa, Bizarrap, Tini.", confidence: 0.87 },
        { text: "Le interesa el house y el deep house.", confidence: 0.79 },
      ],
    },
    {
      domain: "event_preferences",
      facts: [
        { text: "Prefiere festivales grandes y arenas.", confidence: 0.88 },
        { text: "Fines de semana son su momento ideal.", confidence: 0.83 },
        { text: "Tope de gasto por entrada: ARS 80k para shows top.", confidence: 0.74 },
      ],
    },
    {
      domain: "communication_style",
      facts: [
        { text: "Directa, prefiere respuestas concisas y entusiastas.", confidence: 0.82 },
        { text: "Le gustan los emojis pero con moderación.", confidence: 0.71 },
      ],
    },
  ],
  sessions: [
    {
      session_index: 0,
      domain: "vibes",
      target_domains: ["vibes"],
      duration_seconds: 9 * 60,
      days_ago: 14,
      summary: "Vibe extrovertida, social, alta energía.",
      transcript: [
        t("assistant", "¿Cómo es un fin de semana ideal para vos?", 9),
        t("user", "Salida con amigas el viernes, festival el sábado, brunch el domingo.", 8),
      ],
      extracted_facts: [
        { domain: "vibes", text: "Extrovertida, energía social alta.", confidence: 0.93 },
      ],
    },
    {
      session_index: 1,
      domain: "music_taste",
      target_domains: ["music_taste"],
      duration_seconds: 11 * 60,
      days_ago: 12,
      summary: "Pop internacional, electrónica.",
      transcript: [
        t("assistant", "¿Qué artistas no te perdés en vivo?", 11),
        t("user", "Dua Lipa, Bizarrap, Tini si está en CABA.", 10),
      ],
      extracted_facts: [
        { domain: "music_taste", text: "Pop internacional y electrónica son el core.", confidence: 0.91 },
      ],
    },
    {
      session_index: 2,
      domain: "event_preferences",
      target_domains: ["event_preferences"],
      duration_seconds: 12 * 60,
      days_ago: 10,
      summary: "Festivales grandes, fines de semana.",
      transcript: [
        t("assistant", "¿Festival o show chico?", 12),
        t("user", "Festival siempre. Lollapalooza, Primavera Sound, lo que sea.", 11),
      ],
      extracted_facts: [
        { domain: "event_preferences", text: "Prefiere festivales grandes y arenas.", confidence: 0.88 },
      ],
    },
    {
      session_index: 3,
      domain: "vibes",
      target_domains: ["vibes"],
      duration_seconds: 10 * 60,
      days_ago: 8,
      summary: "Profundización: planes en grupo grande, ambientes vibrantes.",
      transcript: [
        t("assistant", "¿Cuántas personas en un plan ideal?", 10),
        t("user", "6 a 10. Cuanto más, mejor onda.", 9),
      ],
      extracted_facts: [
        { domain: "vibes", text: "Disfruta planes con 6+ personas.", confidence: 0.86 },
        { domain: "vibes", text: "Estética colorida, ambientes vibrantes.", confidence: 0.82 },
      ],
    },
    {
      session_index: 4,
      domain: "music_taste",
      target_domains: ["music_taste"],
      duration_seconds: 13 * 60,
      days_ago: 6,
      summary: "Subgéneros electrónicos: house, deep house.",
      transcript: [
        t("assistant", "¿Qué onda con la electrónica más profunda?", 13),
        t("user", "Me encanta el deep house para after. House clásico también.", 12),
      ],
      extracted_facts: [
        { domain: "music_taste", text: "Le interesa el house y el deep house.", confidence: 0.79 },
      ],
    },
    {
      session_index: 5,
      domain: "event_preferences",
      target_domains: ["event_preferences"],
      duration_seconds: 8 * 60,
      days_ago: 4,
      summary: "Tope de gasto y prioridades.",
      transcript: [
        t("assistant", "¿Cuánto pagarías por ver a tu artista favorito?", 8),
        t("user", "Hasta 80k si es algo que no se repite.", 7),
      ],
      extracted_facts: [
        { domain: "event_preferences", text: "Tope de gasto por entrada: ARS 80k para shows top.", confidence: 0.74 },
      ],
    },
    {
      session_index: 6,
      domain: null,
      target_domains: ["communication_style"],
      duration_seconds: 7 * 60,
      days_ago: 2,
      summary: "Estilo de comunicación: directo, conciso, con onda.",
      transcript: [
        t("assistant", "Si te recomiendo algo, ¿preferís lista o párrafo?", 7),
        t("user", "Lista corta y al grano.", 6),
      ],
      extracted_facts: [
        { domain: "communication_style", text: "Directa, prefiere respuestas concisas y entusiastas.", confidence: 0.82 },
      ],
    },
  ],
};

export const DEMO_USERS: DemoUserSeed[] = [DEMO_USER_1, DEMO_USER_2];
