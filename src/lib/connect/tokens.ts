import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export interface ConnectionTokens {
  connection_id: string;
  access_token: string;
  access_token_hash: string;
}

export function generateConnectionTokens(): ConnectionTokens {
  const connection_id = randomUUID();
  const access_token = randomBytes(32).toString("hex");
  const access_token_hash = hashAccessToken(access_token);
  return { connection_id, access_token, access_token_hash };
}

export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyAccessToken(token: string, hash: string): boolean {
  if (!token || !hash) return false;
  let computed: Buffer;
  let expected: Buffer;
  try {
    computed = Buffer.from(hashAccessToken(token), "hex");
    expected = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}
