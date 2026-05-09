"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type AvatarConfig, parseAvatarConfig } from "@/types/avatar";

export async function updateAvatarConfig(config: AvatarConfig): Promise<{ ok: boolean; error?: string }> {
  const validated = parseAvatarConfig(config);
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: { avatar_config: validated },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/avatar");
  return { ok: true };
}
