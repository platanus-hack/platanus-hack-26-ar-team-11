import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Props {
  isAuthenticated: boolean;
}

export function CallToAction({ isAuthenticated }: Props) {
  const cta = isAuthenticated
    ? { href: "/training/start", label: "Continuar entrenamiento" }
    : { href: "/auth/signup", label: "Crear cuenta gratis" };

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground md:px-14 md:py-20">
        <h2 className="text-balance text-3xl font-black sm:text-4xl">
          Tu Twin te espera.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-cream/85">
          Cinco minutos de conversación y tus apps empiezan a entenderte. Sin
          formularios, sin ceder tus datos a cada plataforma.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
