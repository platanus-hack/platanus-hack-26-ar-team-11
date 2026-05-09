/**
 * Humanized previews of Twin Query API responses for the Buholingo overlay.
 * Keeps the JSON away from the user but stays anchored to the real data.
 */

export interface TwinPreview {
  title: string;
  question: string;
  answer: string;
}

function pickStrings(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .slice(0, max);
}

function pickString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastPeriod = cut.lastIndexOf(".");
  if (lastPeriod > Math.floor(max * 0.55)) return cut.slice(0, lastPeriod + 1).trim();
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

export function formatGeneralPreview(resp: unknown): string {
  if (!resp || typeof resp !== "object") return "Tu Twin todavía no tiene resumen.";
  const r = resp as { summary?: unknown };
  const summary = pickString(r.summary);
  if (!summary) return "Tu Twin todavía no tiene resumen.";
  return shorten(summary, 150);
}

export function formatMusicPreview(resp: unknown): string {
  if (!resp || typeof resp !== "object") return "Aún no aprendido.";
  const data = (resp as { data?: Record<string, unknown> }).data ?? {};
  const genres = pickStrings(data.top_genres, 3);
  const artists = pickStrings(data.favorite_artists, 2);
  const parts: string[] = [];
  if (genres.length) parts.push(`Géneros: ${genres.join(", ")}`);
  if (artists.length) parts.push(`escucha a ${artists.join(", ")}`);
  if (!parts.length) return "Tu Twin no tiene música cargada todavía.";
  return parts.join(" · ");
}

export function formatVibesPreview(resp: unknown): string {
  if (!resp || typeof resp !== "object") return "Aún no aprendido.";
  const data = (resp as { data?: Record<string, unknown> }).data ?? {};
  const tags = pickStrings(data.tags, 4);
  const mood = pickString(data.mood);
  const energy = pickString(data.social_energy);
  const parts: string[] = [];
  if (tags.length) parts.push(tags.join(", "));
  if (mood) parts.push(`mood ${mood}`);
  if (energy) parts.push(`energía ${energy}`);
  if (!parts.length) return "Tu Twin no tiene vibes cargadas todavía.";
  return parts.join(" · ");
}

export function buildPreviews(args: {
  general: unknown;
  music: unknown;
  vibes: unknown;
}): TwinPreview[] {
  return [
    {
      title: "Perfil",
      question: "¿Quién es esta persona?",
      answer: formatGeneralPreview(args.general),
    },
    {
      title: "Música",
      question: "¿Qué música le copa?",
      answer: formatMusicPreview(args.music),
    },
    {
      title: "Vibe",
      question: "¿Cuál es su vibe?",
      answer: formatVibesPreview(args.vibes),
    },
  ];
}
