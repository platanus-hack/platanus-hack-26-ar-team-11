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
import { HeroAvatar, HERO_AVATAR_CONFIG } from "./HeroAvatar";
import type { AvatarConfig } from "@/types/avatar";

type Expression = Pick<AvatarConfig, "eyes" | "eyebrows" | "mouth">;

const expressions: Expression[] = [
  { eyes: "default", eyebrows: "default", mouth: "smile" },
  { eyes: "side", eyebrows: "defaultNatural", mouth: "smile" },
  { eyes: "default", eyebrows: "raisedExcited", mouth: "smile" },
  { eyes: "happy", eyebrows: "defaultNatural", mouth: "smile" },
  { eyes: "wink", eyebrows: "default", mouth: "smile" },
];

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
      "Registrate de forma gratuita y obtené tu Twin listo para aprender de vos.",
    Icon: UserPlus,
    orbit: "top-2 right-6",
  },
  {
    n: "02",
    title: "Entrenalo con conversaciones.",
    body:
      "Conversá con tu Twin en sesiones cortas de voz para que conozca tus gustos, intereses y forma de comunicarte.",
    Icon: MessagesSquare,
    orbit: "top-1/3 -right-2",
  },
  {
    n: "03",
    title: "Conectalo a tus apps favoritas.",
    body:
      "Autorizá a las apps que elijas para que puedan consultar a tu Twin. Vos decidís qué información compartir en cada caso.",
    Icon: Plug2,
    orbit: "bottom-6 right-1/4",
  },
  {
    n: "04",
    title: "Recibí experiencias personalizadas.",
    body:
      "Las apps que conectes te entienden desde el primer uso, sin pedirte llenar formularios ni repetir tus preferencias.",
    Icon: Compass,
    orbit: "bottom-1/3 -left-2",
  },
  {
    n: "05",
    title: "Controlá qué sabe y qué consulta cada app.",
    body:
      "Revisá en cualquier momento qué información comparte tu Twin con cada app y revocá los accesos cuando quieras.",
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
  const stepConfig: AvatarConfig = {
    ...HERO_AVATAR_CONFIG,
    ...expressions[activeIndex],
  };

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="step-stack-section relative bg-background"
    >
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden pt-12">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12 lg:gap-20">
          <div className="relative order-2 md:order-1">
            <span className="text-sm uppercase tracking-[0.2em] text-secondary md:text-sm">
              Cómo funciona
            </span>
            <h2 className="mt-4 text-balance text-4xl font-black sm:text-5xl md:mt-3">
              Cinco pasos para que tu Twin viva en todas tus apps.
            </h2>

            <div className="relative mt-12 h-72 sm:mt-16 sm:h-80 md:mt-10 md:h-64">
              {steps.map((step, i) => {
                const state =
                  i === activeIndex ? "active" : i < activeIndex ? "past" : "next";
                return (
                  <article
                    key={step.n}
                    aria-hidden={state !== "active"}
                    className={[
                      "absolute inset-0 flex flex-col justify-center gap-4 transition-all duration-500",
                      state === "active" && "translate-y-0 opacity-100",
                      state === "past" && "-translate-y-8 opacity-0",
                      state === "next" && "translate-y-8 opacity-0",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm md:h-11 md:w-11">
                        <step.Icon className="h-6 w-6 md:h-5 md:w-5" />
                      </span>
                      <span className="text-sm uppercase tracking-[0.2em] text-secondary">
                        Paso {step.n}
                      </span>
                    </div>
                    <h3 className="text-4xl font-bold leading-tight md:text-4xl">
                      {step.title}
                    </h3>
                    <p className="max-w-md text-xl text-muted-foreground md:text-xl">
                      {step.body}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-16 flex items-center gap-2 md:mt-10" aria-hidden>
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

          <div className="hidden md:order-2 md:block">
            <div
              className="relative mx-auto aspect-square w-[28rem]"
              style={{
                transform: `scale(${1 + progress * 0.04})`,
                transition: "transform 600ms ease",
              }}
            >
              <HeroAvatar config={stepConfig} swapKey={activeIndex} />

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
