import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroAvatar } from "./HeroAvatar";
import { HeroAppNodes } from "./HeroAppNodes";
import { ArrowDown } from "lucide-react";

interface HeroProps {
  isAuthenticated: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  const primary = isAuthenticated
    ? { href: "/dashboard", label: "Ir al dashboard" }
    : { href: "/auth/signup", label: "Crear mi Twin" };
  const secondary = isAuthenticated
    ? { href: "/connected-apps", label: "Ver apps conectadas" }
    : { href: "/auth/login", label: "Ya tengo cuenta" };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_10%,rgba(212,160,23,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_30%_at_85%_85%,rgba(163,157,179,0.18),transparent_70%)]" />
      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-start gap-12 px-6 pt-12 pb-28 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:pt-16 md:pb-32 lg:gap-20">
        <div className="flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm uppercase tracking-[0.2em] text-secondary shadow-sm">
            Twin Protocol
          </span>
          <h1 className="mt-6 text-balance text-5xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
            Tu yo digital, conectado a todas tus apps.
          </h1>
          <p className="mt-6 max-w-xl text-xl text-muted-foreground sm:text-2xl">
            Creá tu Twin una vez. Usalo en todas tus apps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href={primary.href}>{primary.label}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-14 px-6 text-lg text-foreground hover:!bg-foreground/10 hover:!text-foreground"
            >
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          </div>
          <p className="mt-6 text-base text-muted-foreground/80 sm:text-lg">
            Tus datos quedan bajo tu control en todo momento.
          </p>
        </div>

        <div className="flex justify-center md:self-center">
          <div className="relative isolate">
            <HeroAvatar />
            <HeroAppNodes />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
        <a
          href="#como-funciona"
          className="hero-scroll-cue pointer-events-auto text-sm uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
        >
          <span>Scroll</span>
          <ArrowDown className="mx-auto mt-2 h-5 w-5" aria-hidden />
        </a>
      </div>
    </section>
  );
}
