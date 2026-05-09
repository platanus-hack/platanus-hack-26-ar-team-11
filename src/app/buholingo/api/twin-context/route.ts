import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { fetchTwinContext } from "@/lib/buholingo/twin-query";
import { buildPreviews, type TwinPreview } from "@/lib/buholingo/format";

const BodySchema = z.object({
  connection_id: z.string().min(1),
  access_token: z.string().min(1),
});

export interface TwinContextResponse {
  previews: TwinPreview[];
  context: { general: unknown; music: unknown; vibes: unknown };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  let context: { general: unknown; music: unknown; vibes: unknown };
  try {
    context = await fetchTwinContext(request.url, parsed.data);
  } catch (err) {
    console.error("[twin-context] twin/query failed", err);
    return NextResponse.json(
      {
        error: "twin_query_failed",
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 502 },
    );
  }

  const previews = buildPreviews(context);
  const response: TwinContextResponse = { previews, context };
  return NextResponse.json(response);
}
