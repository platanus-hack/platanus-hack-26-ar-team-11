"use client";

import {
  UserPlus,
  MessagesSquare,
  Plug2,
  Compass,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useScrollProgress } from "@/lib/hooks/useScrollProgress";

interface Step {
  n: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  orbit: string;
}

const steps: Step[] = [
  {
    n: "01",
    title: "Creá tu Twin.",
    body:
      "Empezás con una cuenta gratuita y un Twin vacío esperando a aprender de vos.",
    Icon: UserPlus,
    orbit: "top-2 right-6",
  },
  {
    n: "02",
    title: "Entrenalo con conversaciones.",
    body:
      "Sesiones de voz cortas: música, eventos, vibe, estilo de comunicación. El Twin va llenando su perfil.",
    Icon: MessagesSquare,
    orbit: "top-1/3 -right-2",
  },
  {
    n: "03",
    title: "Conectalo a tus apps favoritas.",
    body:
      "Apps como AllAccess piden permiso por scopes. Vos decidís qué pueden consultar.",
    Icon: Plug2,
    orbit: "bottom-6 right-1/4",
  },
  {
    n: "04",
    title: "Recibí experiencias personalizadas.",
    body:
      "Desde el primer momento las apps entienden tu estilo, sin pedirte datos otra vez.",
    Icon: Compass,
    orbit: "bottom-1/3 -left-2",
  },
  {
    n: "05",
    title: "Controlá qué sabe y qué consulta cada app.",
    body:
      "Audit log, revoke en un click, scopes granulares. Tu Twin es tuyo.",
    Icon: ShieldCheck,
    orbit: "top-1/4 -left-2",
  },
];

export function StepStack() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const activeIndex = Math.min(
    steps.length - 1,
    Math.floor(progress * steps.length * 0.999),
  );

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="relative bg-background"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div className="relative">
            <span className="text-xs uppercase tracking-[0.2em] text-secondary">
              Cómo funciona
            </span>
            <h2 className="mt-3 text-balance text-3xl font-black sm:text-4xl">
              Cinco pasos para que tu Twin viva en todas tus apps.
            </h2>

            <div className="relative mt-10 h-72 sm:h-64">
              {steps.map((step, i) => {
                const state =
                  i === activeIndex ? "active" : i < activeIndex ? "past" : "next";
                return (
                  <article
                    key={step.n}
                    aria-hidden={state !== "active"}
                    className={[
                      "absolute inset-0 flex flex-col gap-4 transition-all duration-500",
                      state === "active" && "translate-y-0 opacity-100",
                      state === "past" && "-translate-y-8 opacity-0",
                      state === "next" && "translate-y-8 opacity-0",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                        <step.Icon className="h-5 w-5" />
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Paso {step.n}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="max-w-md text-base text-muted-foreground sm:text-lg">
                      {step.body}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 flex items-center gap-2" aria-hidden>
              {steps.map((step, i) => (
                <span
                  key={step.n}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i === activeIndex
                      ? "w-12 bg-accent"
                      : i < activeIndex
                        ? "w-4 bg-primary/40"
                        : "w-4 bg-muted-foreground/25",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="relative mx-auto aspect-square w-[28rem]">
              <span
                className="step-stack-orb"
                style={{
                  transform: `scale(${1 + progress * 0.06}) rotate(${progress * 30}deg)`,
                }}
                aria-hidden
              />
              <span className="step-stack-ring step-stack-ring--outer" aria-hidden />
              <span className="step-stack-ring step-stack-ring--inner" aria-hidden />

              {steps.map((step, i) => {
                const isActive = i === activeIndex;
                return (
                  <span
                    key={step.n}
                    aria-hidden
                    className={[
                      "absolute flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-primary shadow-xl ring-1 ring-border transition-all duration-500",
                      step.orbit,
                      isActive
                        ? "scale-100 opacity-100"
                        : "scale-90 opacity-0",
                    ].join(" ")}
                  >
                    <step.Icon className="h-7 w-7" />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
