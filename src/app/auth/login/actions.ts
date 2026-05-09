"use server";

import { redirect } from "next/navigation";
import { signInWithPassword } from "@/lib/auth/server";

export interface SignInResult {
  error?: string;
}

function safeReturnTo(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function signInAction(
  _prev: SignInResult | undefined,
  formData: FormData,
): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const returnTo = safeReturnTo(formData.get("return_to"));

  if (!email || !password) {
    return { error: "Credenciales inválidas." };
  }

  const { error } = await signInWithPassword(email, password);

  if (error) {
    return { error: "Credenciales inválidas." };
  }

  redirect(returnTo);
}
