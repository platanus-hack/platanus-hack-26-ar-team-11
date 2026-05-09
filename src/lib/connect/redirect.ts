/**
 * Append query params to a redirect_uri preserving existing query string.
 * Returns absolute URL string. If the input is a malformed URL, throws.
 */
export function buildRedirectUrl(
  redirectUri: string,
  params: Record<string, string | undefined>,
): string {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildDenyUrl(redirectUri: string, state?: string): string {
  return buildRedirectUrl(redirectUri, {
    error: "user_denied",
    state,
  });
}

export function buildApprovedUrl(
  redirectUri: string,
  connection_id: string,
  access_token: string,
  state?: string,
): string {
  return buildRedirectUrl(redirectUri, {
    connection_id,
    access_token,
    state,
  });
}
