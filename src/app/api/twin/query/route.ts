// STUB — replaced by Stream C (C09–C13).
// See tasks/stream-c/C09-query-scaffolding.md.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: { code: "internal", message: "Not implemented yet — see C09." } },
    { status: 501 },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
