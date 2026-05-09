// STUB — replaced by Stream C (C08).
// See tasks/stream-c/C08-connect-revoke.md.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "internal", message: "Not implemented yet — see C08." } },
    { status: 501 },
  );
}
