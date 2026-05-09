"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/server";
import { revokeConnection } from "@/lib/db/connections";

export interface RevokeActionResult {
  ok: boolean;
  error?: string;
}

export async function revokeConnectionAction(
  connectionId: string,
): Promise<RevokeActionResult> {
  if (!connectionId || typeof connectionId !== "string") {
    return { ok: false, error: "invalid_id" };
  }

  const user = await requireUser();
  const result = await revokeConnection(connectionId, user.id);

  if (result.ok) revalidatePath("/connected-apps");
  return result;
}
