// STUB — replaced by Stream B (B16).
// See tasks/stream-b/B16-continue-training.md.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "internal", message: "Not implemented yet — see B16." } },
    { status: 501 },
  );
}
