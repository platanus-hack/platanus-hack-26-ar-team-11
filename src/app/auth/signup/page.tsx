import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

// MVP: el signup está cerrado a propósito mientras dure el período de evaluación.
// Las credenciales se entregan a los evaluadores; los usuarios se crean a mano
// con la Supabase CLI. Para reactivar, restaurá <SignupForm /> en este archivo
// y quitá el guard de signUpAction.
export default function SignupPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-balance text-3xl font-black leading-tight sm:text-4xl">
          Registro cerrado durante el MVP
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Por ahora estamos validando la plataforma con un grupo acotado de usuarios.
        </p>
      </div>

      <section
        aria-live="polite"
        className="rounded-xl border border-neutral-200 bg-neutral-50 p-5"
      >
        <div className="flex gap-3">
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent"
          >
            <Lock className="h-4 w-4" />
          </span>
          <div className="space-y-2 text-sm text-neutral-800">
            <p>
              No estamos permitiendo la creación de cuentas desde la web.
            </p>
            <p className="text-muted-foreground">
              Si sos evaluador del MVP, los administradores te van a entregar un
              usuario y contraseña para ingresar.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-3">
        <Button asChild size="lg" className="h-12 w-full text-base">
          <Link href="/auth/login">Ya tengo credenciales</Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          ¿Dudas? Escribinos y te damos acceso.
        </p>
      </div>
    </div>
  );
}
