"use server";

import { redirect } from "next/navigation";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth/server";

export interface SignUpResult {
  error?: string;
}

// MVP: signup está cerrado, las cuentas se crean manualmente con Supabase CLI.
// La UI ya no expone el form (ver signup/page.tsx) pero blindamos la acción
// también para que un POST directo no abra un agujero de creación de usuarios.
const SIGNUP_DISABLED = true;
const SIGNUP_DISABLED_MESSAGE =
  "El registro está cerrado durante el MVP. Pedile credenciales a los administradores.";

export async function signUpAction(
  _prev: SignUpResult | undefined,
  formData: FormData,
): Promise<SignUpResult> {
  if (SIGNUP_DISABLED) {
    return { error: SIGNUP_DISABLED_MESSAGE };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!email || !password) {
    return { error: "Completa el correo y la contraseña." };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  const { error } = await signUpWithPassword(email, password);
  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("registered") || msg.includes("exists") || msg.includes("already")) {
      return { error: "Ya existe una cuenta con ese correo." };
    }
    return { error: "No pudimos crear tu cuenta. Inténtalo de nuevo." };
  }

  // El trigger handle_new_user crea public.users + twins. Auto sign-in:
  const { error: signInError } = await signInWithPassword(email, password);
  if (signInError) {
    redirect("/auth/login");
  }

  redirect("/dashboard");
}
