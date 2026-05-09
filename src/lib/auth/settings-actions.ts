"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  type TrainingSettings,
  parseTrainingSettings,
} from "@/types/settings";

export async function updateTrainingSettings(
  settings: TrainingSettings,
): Promise<{ ok: boolean; error?: string }> {
  const validated = parseTrainingSettings(settings);
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: { training_settings: validated },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/settings");
  return { ok: true };
}
