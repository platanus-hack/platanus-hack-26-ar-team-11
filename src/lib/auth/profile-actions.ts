"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME_LENGTH = 60;

export async function updateProfileName(
  name: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
  if (trimmed.length === 0) {
    return { ok: false, error: "El nombre no puede estar vacío" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { name: trimmed },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/avatar");
  return { ok: true };
}
