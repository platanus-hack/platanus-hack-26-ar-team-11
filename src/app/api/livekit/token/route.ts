// STUB — replaced by Stream B (B10).
// See tasks/stream-b/B10-livekit-token.md.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "internal", message: "Not implemented yet — see B10." } },
    { status: 501 },
  );
}
