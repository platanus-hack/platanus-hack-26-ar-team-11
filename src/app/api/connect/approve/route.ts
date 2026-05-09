// STUB — replaced by Stream C (C05).
// See tasks/stream-c/C05-connect-approve.md.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "internal", message: "Not implemented yet — see C05." } },
    { status: 501 },
  );
}
