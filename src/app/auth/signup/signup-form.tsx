"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction, type SignUpResult } from "./actions";

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
          Creando…
        </>
      ) : (
        "Crear mi Twin"
      )}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState<SignUpResult | undefined, FormData>(
    signUpAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
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
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="h-12 text-base md:text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password" className="text-base">
          Repetí la contraseña
        </Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
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
        ¿Ya tenés cuenta?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
