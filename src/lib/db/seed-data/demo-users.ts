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
  session_index: number; // 0..11
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
  twin_name: "Twin de Manuel",
  next_session_index: 9,
  completion_score: 0.71,
  twin_summary:
    "Manuel disfruta del rock indie y alternativo en venues íntimos. Es introvertido, value-driven con la plata, viste minimal en tonos neutros, le gusta cocinar comida mediterránea y viaja en pareja a ciudades chicas con buena gastronomía.",
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
    {
      domain: "spending_profile",
      facts: [
        { text: "Value-driven: prioriza experiencias sobre status.", confidence: 0.84 },
        { text: "Splurgea en libros, vinilos y comida; ahorra en ropa y tech.", confidence: 0.79 },
        { text: "Evita pagar en cuotas, prefiere efectivo o débito.", confidence: 0.71 },
      ],
    },
    {
      domain: "fashion_taste",
      facts: [
        { text: "Estilo minimal, paleta de neutros (negro, gris, beige).", confidence: 0.83 },
        { text: "Fits relajados, no oversized; prefiere prendas atemporales.", confidence: 0.76 },
        { text: "Brands queridas: Uniqlo, COS y diseñadores locales.", confidence: 0.72 },
      ],
    },
    {
      domain: "food_taste",
      facts: [
        { text: "Cocina mediterránea y de autor son sus favoritas.", confidence: 0.85 },
        { text: "Vegetariano flexible, come pescado pero evita carne roja.", confidence: 0.82 },
        { text: "Prefiere cocinar en casa o salir; rara vez pide delivery.", confidence: 0.74 },
      ],
    },
    {
      domain: "travel_style",
      facts: [
        { text: "Viajero confort: ciudades chicas con onda y buena gastronomía.", confidence: 0.81 },
        { text: "Viaja en pareja, presupuesto medio (10–15 días, planificado).", confidence: 0.77 },
        { text: "Evita destinos turísticos masivos; prefiere barrios y ferias locales.", confidence: 0.74 },
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
      domain: "communication_style",
      target_domains: ["communication_style"],
      duration_seconds: 10 * 60,
      days_ago: 8,
      summary: "Estilo de comunicación: reflexivo, resúmenes cortos.",
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
    {
      session_index: 5,
      domain: "spending_profile",
      target_domains: ["spending_profile"],
      duration_seconds: 9 * 60,
      days_ago: 7,
      summary: "Mentalidad value-driven, prioriza experiencias sobre status.",
      transcript: [
        t("assistant", "¿En qué cosas no te jode pagar más?", 9),
        t("user", "Libros, vinilos y una buena cena. Ahí no escatimo.", 8),
        t("assistant", "¿Y dónde sí buscás siempre el mejor precio?", 7),
        t("user", "Ropa y tech. Espero descuentos o compro usado.", 6),
      ],
      extracted_facts: [
        { domain: "spending_profile", text: "Value-driven: prioriza experiencias sobre status.", confidence: 0.84 },
        { domain: "spending_profile", text: "Splurgea en libros, vinilos y comida; ahorra en ropa y tech.", confidence: 0.79 },
      ],
    },
    {
      session_index: 6,
      domain: "fashion_taste",
      target_domains: ["fashion_taste"],
      duration_seconds: 8 * 60,
      days_ago: 5,
      summary: "Estilo minimal, paleta neutra, prendas atemporales.",
      transcript: [
        t("assistant", "Si tuvieras que describir tu estilo en 3 palabras, ¿cuáles?", 8),
        t("user", "Minimal, neutro, atemporal.", 7),
        t("assistant", "¿Hay marcas que te tiren?", 6),
        t("user", "Uniqlo y COS. También algún diseñador local cuando encuentro algo bueno.", 5),
      ],
      extracted_facts: [
        { domain: "fashion_taste", text: "Estilo minimal, paleta de neutros.", confidence: 0.83 },
        { domain: "fashion_taste", text: "Brands queridas: Uniqlo, COS y diseñadores locales.", confidence: 0.72 },
      ],
    },
    {
      session_index: 7,
      domain: "food_taste",
      target_domains: ["food_taste"],
      duration_seconds: 11 * 60,
      days_ago: 3,
      summary: "Mediterránea y de autor, vegetariano flexible.",
      transcript: [
        t("assistant", "¿Qué cocina te gusta más cuando salís a comer?", 11),
        t("user", "Mediterránea, sobre todo. Y siempre vuelvo a un par de bodegones de autor.", 10),
        t("assistant", "¿Tenés alguna restricción?", 9),
        t("user", "No como carne roja, pero pescado sí. Vegetariano más o menos flexible.", 8),
      ],
      extracted_facts: [
        { domain: "food_taste", text: "Cocina mediterránea y de autor son sus favoritas.", confidence: 0.85 },
        { domain: "food_taste", text: "Vegetariano flexible, come pescado pero evita carne roja.", confidence: 0.82 },
      ],
    },
    {
      session_index: 8,
      domain: "travel_style",
      target_domains: ["travel_style"],
      duration_seconds: 10 * 60,
      days_ago: 1,
      summary: "Viajero confort, ciudades chicas con buena gastronomía.",
      transcript: [
        t("assistant", "¿Qué viaje te marcó en el último tiempo?", 10),
        t("user", "Estuvimos 12 días por Portugal, ciudades chicas. Comer bien y caminar mucho.", 9),
        t("assistant", "¿Vas más por destinos populares o evitás las multitudes?", 8),
        t("user", "Las multitudes me agotan. Prefiero barrios, ferias, lugares que no salen en la guía.", 7),
      ],
      extracted_facts: [
        { domain: "travel_style", text: "Viajero confort: ciudades chicas con onda y buena gastronomía.", confidence: 0.81 },
        { domain: "travel_style", text: "Evita destinos turísticos masivos.", confidence: 0.74 },
      ],
    },
  ],
};

export const DEMO_USER_2: DemoUserSeed = {
  email: "demo2@twin-protocol.example",
  name: "Sofía",
  twin_name: "Twin de Sofía",
  next_session_index: 11,
  completion_score: 0.88,
  twin_summary:
    "Sofía es extrovertida, vive la música en festivales grandes y energía pop/electrónica. Splurgea en experiencias y viajes, viste streetwear colorido, ama el sushi en delivery y viaja en grupo a destinos con vida nocturna.",
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
    {
      domain: "spending_profile",
      facts: [
        { text: "Experience-first: splurgea en viajes, festivales y salidas.", confidence: 0.91 },
        { text: "Ahorra en groceries y básicos del día a día.", confidence: 0.78 },
        { text: "Cómoda con cuotas para experiencias top.", confidence: 0.74 },
      ],
    },
    {
      domain: "fashion_taste",
      facts: [
        { text: "Estilo streetwear, paleta vibrante con statement pieces.", confidence: 0.88 },
        { text: "Fits oversized, le encantan los estampados llamativos.", confidence: 0.81 },
        { text: "Brands queridas: Nike, Carhartt y locales con onda.", confidence: 0.77 },
      ],
    },
    {
      domain: "food_taste",
      facts: [
        { text: "Cocina internacional: sushi, ramen, pizza son fijos.", confidence: 0.89 },
        { text: "Pide delivery 4-5 veces por semana, casi nunca cocina.", confidence: 0.85 },
        { text: "Sin restricciones, le gusta probar cosas nuevas.", confidence: 0.79 },
      ],
    },
    {
      domain: "travel_style",
      facts: [
        { text: "Viajera de confort/lujo: destinos con vida nocturna fuerte.", confidence: 0.86 },
        { text: "Viaja en grupos de amigas, fines de semana largos o 5-7 días.", confidence: 0.82 },
        { text: "Destinos que ama: Cancún, Madrid, NYC, Río.", confidence: 0.79 },
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
      domain: "communication_style",
      target_domains: ["communication_style"],
      duration_seconds: 7 * 60,
      days_ago: 9,
      summary: "Estilo de comunicación: directo, conciso, con onda.",
      transcript: [
        t("assistant", "Si te recomiendo algo, ¿preferís lista o párrafo?", 7),
        t("user", "Lista corta y al grano.", 6),
      ],
      extracted_facts: [
        { domain: "communication_style", text: "Directa, prefiere respuestas concisas y entusiastas.", confidence: 0.82 },
      ],
    },
    {
      session_index: 7,
      domain: "spending_profile",
      target_domains: ["spending_profile"],
      duration_seconds: 9 * 60,
      days_ago: 7,
      summary: "Mentalidad experience-first, splurgea en viajes y festivales.",
      transcript: [
        t("assistant", "¿Dónde decís 'pago lo que sea con tal de ir'?", 9),
        t("user", "Festival que se viene una vez. Y viajes con las chicas.", 8),
        t("assistant", "¿Dónde sí cuidás la plata?", 7),
        t("user", "El súper, los gastos del día. Pero la salida del finde no se toca.", 6),
      ],
      extracted_facts: [
        { domain: "spending_profile", text: "Experience-first: splurgea en viajes y festivales.", confidence: 0.91 },
        { domain: "spending_profile", text: "Ahorra en groceries y básicos del día a día.", confidence: 0.78 },
      ],
    },
    {
      session_index: 8,
      domain: "fashion_taste",
      target_domains: ["fashion_taste"],
      duration_seconds: 8 * 60,
      days_ago: 5,
      summary: "Estilo streetwear vibrante con statement pieces.",
      transcript: [
        t("assistant", "Si tuvieras que elegir 3 palabras para tu estilo, ¿cuáles?", 8),
        t("user", "Streetwear, color, y un toque oversize.", 7),
        t("assistant", "¿Marcas que vivís usando?", 6),
        t("user", "Nike, Carhartt y un par de marcas locales con onda.", 5),
      ],
      extracted_facts: [
        { domain: "fashion_taste", text: "Estilo streetwear, paleta vibrante.", confidence: 0.88 },
        { domain: "fashion_taste", text: "Brands queridas: Nike, Carhartt y locales con onda.", confidence: 0.77 },
      ],
    },
    {
      session_index: 9,
      domain: "food_taste",
      target_domains: ["food_taste"],
      duration_seconds: 9 * 60,
      days_ago: 3,
      summary: "Cocina internacional, delivery frecuente.",
      transcript: [
        t("assistant", "¿Qué pedís cuando llegás cansada y no tenés ganas de pensar?", 9),
        t("user", "Sushi o ramen. A veces pizza si vamos en grupo.", 8),
        t("assistant", "¿Cocinás seguido?", 7),
        t("user", "Casi nunca. Delivery cuatro o cinco veces por semana.", 6),
      ],
      extracted_facts: [
        { domain: "food_taste", text: "Cocina internacional: sushi, ramen, pizza son fijos.", confidence: 0.89 },
        { domain: "food_taste", text: "Pide delivery 4-5 veces por semana.", confidence: 0.85 },
      ],
    },
    {
      session_index: 10,
      domain: "travel_style",
      target_domains: ["travel_style"],
      duration_seconds: 10 * 60,
      days_ago: 1,
      summary: "Viajera de confort/lujo, destinos con vida nocturna fuerte.",
      transcript: [
        t("assistant", "¿Cuál fue tu mejor viaje del último año?", 10),
        t("user", "Cancún con las chicas. Una semana, all inclusive, salimos todas las noches.", 9),
        t("assistant", "¿Solés viajar con las mismas o variás?", 8),
        t("user", "Casi siempre con el mismo grupo de amigas. Madrid, NYC, Río — vamos a destinos con movida.", 7),
      ],
      extracted_facts: [
        { domain: "travel_style", text: "Viajera de confort/lujo: destinos con vida nocturna fuerte.", confidence: 0.86 },
        { domain: "travel_style", text: "Viaja en grupos de amigas a destinos con movida.", confidence: 0.82 },
      ],
    },
  ],
};

export const DEMO_USERS: DemoUserSeed[] = [DEMO_USER_1, DEMO_USER_2];
