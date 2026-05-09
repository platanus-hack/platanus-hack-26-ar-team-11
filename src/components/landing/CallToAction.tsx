import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ContinueTrainingButton } from "@/components/training/ContinueTrainingButton";

interface Props {
  isAuthenticated: boolean;
}

export function CallToAction({ isAuthenticated }: Props) {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="cta-glow" aria-hidden />
      <div className="reveal-up relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground shadow-xl md:px-14 md:py-20">
        <div className="cta-shine" aria-hidden />
        <h2 className="text-balance text-3xl font-black sm:text-4xl">
          Tu Twin te espera.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-cream/85">
          Cinco minutos de conversación y tus apps empiezan a entenderte. Sin
          formularios, sin ceder tus datos a cada plataforma.
        </p>
        <div className="mt-8 flex justify-center">
          {isAuthenticated ? (
            <ContinueTrainingButton
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continuar entrenamiento
              <ArrowRight className="h-4 w-4" />
            </ContinueTrainingButton>
          ) : (
            <Button
              asChild
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/auth/signup">
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
