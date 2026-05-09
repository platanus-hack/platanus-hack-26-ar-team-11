import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroAvatar } from "./HeroAvatar";
import { ArrowRight, ArrowDown, Music, Calendar, Boxes } from "lucide-react";

interface HeroProps {
  isAuthenticated: boolean;
}

const chips = [
  { Icon: Music, label: "Música", className: "hero-chip hero-chip--a" },
  { Icon: Calendar, label: "Agenda", className: "hero-chip hero-chip--b" },
  { Icon: Boxes, label: "Apps nuevas", className: "hero-chip hero-chip--c" },
];

export function Hero({ isAuthenticated }: HeroProps) {
  const primary = isAuthenticated
    ? { href: "/dashboard", label: "Ir al dashboard" }
    : { href: "/auth/signup", label: "Crear mi Twin" };
  const secondary = isAuthenticated
    ? { href: "/connected-apps", label: "Ver apps conectadas" }
    : { href: "/auth/login", label: "Ya tengo cuenta" };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_15%,rgba(212,160,23,0.18),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 hero-grain" aria-hidden />
      <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:py-32 lg:gap-20">
        <div className="flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cream/80">
            Twin Protocol
          </span>
          <h1 className="mt-6 text-balance text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
            Your AI self, connected to every app.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-cream/85 sm:text-xl">
            Creá tu Twin una vez. Usalo en todas tus apps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href={primary.href}>
                {primary.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-cream hover:bg-cream/10 hover:text-cream"
            >
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-cream/60">
            Demo público. Tus datos quedan bajo tu control en todo momento.
          </p>
        </div>

        <div className="relative flex justify-center">
          <HeroAvatar />
          {chips.map(({ Icon, label, className }) => (
            <span key={label} className={className} aria-hidden>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>

      <a
        href="#como-funciona"
        className="hero-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-cream/70 hover:text-cream"
      >
        <span>Scroll</span>
        <ArrowDown className="mx-auto mt-2 h-4 w-4" aria-hidden />
      </a>
    </section>
  );
}
