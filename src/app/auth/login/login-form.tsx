"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type SignInResult } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="h-12 w-full text-base bg-accent text-accent-foreground hover:bg-accent/90"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Iniciando…
        </>
      ) : (
        "Iniciar sesión"
      )}
    </Button>
  );
}

export function LoginForm({ returnTo }: { returnTo?: string }) {
  const [state, formAction] = useActionState<SignInResult | undefined, FormData>(
    signInAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="return_to" value={returnTo ?? ""} />

      <div className="space-y-2">
        <Label htmlFor="email" className="text-base">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          className="h-12 text-base md:text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-base">
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="h-12 text-base md:text-base"
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Creá tu Twin
        </Link>
      </p>
    </form>
  );
}
