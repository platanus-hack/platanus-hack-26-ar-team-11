/**
 * Client-side helpers for Buholingo's Twin connection flow.
 */

const STORAGE_KEY = "buholingo.connection.v1";

export const BUHOLINGO_CLIENT_ID = "buholingo_demo";
export const BUHOLINGO_SCOPES = [
  "persona.read.summary",
  "persona.read.music",
  "persona.read.vibes",
] as const;

export interface BuholingoConnection {
  connection_id: string;
  access_token: string;
}

export function buildConnectUrl(): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const redirectUri = `${origin}/buholingo/callback`;
  const params = new URLSearchParams({
    app_id: BUHOLINGO_CLIENT_ID,
    redirect_uri: redirectUri,
    scopes: BUHOLINGO_SCOPES.join(","),
  });
  return `/connect?${params.toString()}`;
}

export function readStoredConnection(): BuholingoConnection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BuholingoConnection;
    if (!parsed.connection_id || !parsed.access_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredConnection(conn: BuholingoConnection): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conn));
}

export function clearStoredConnection(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
