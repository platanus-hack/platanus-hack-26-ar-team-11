/**
 * Server-side helper to call the Twin Query API from a Buholingo route.
 * Treats Twin Protocol exactly as a third-party would.
 */

export interface TwinConn {
  connection_id: string;
  access_token: string;
}

export async function callTwinQuery(
  baseUrl: string | URL,
  conn: TwinConn,
  intent: string,
  context: Record<string, unknown> | undefined,
): Promise<unknown> {
  const url = new URL("/api/twin/query", baseUrl);
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

export async function fetchTwinContext(
  baseUrl: string | URL,
  conn: TwinConn,
): Promise<{ general: unknown; music: unknown; vibes: unknown }> {
  const [general, music, vibes] = await Promise.all([
    callTwinQuery(baseUrl, conn, "general_summary", undefined),
    callTwinQuery(baseUrl, conn, "domain_summary", { domain: "music_taste" }),
    callTwinQuery(baseUrl, conn, "domain_summary", { domain: "vibes" }),
  ]);
  return { general, music, vibes };
}
