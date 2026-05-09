import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { ContinueTrainingButton } from "@/components/training/ContinueTrainingButton";
import { DOMAIN_VISUALS } from "@/lib/domains/visuals";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser, skillByDomain } from "@/lib/db/twins";
import { ALL_DOMAINS, DOMAIN_LABELS, type Domain, type Fact } from "@/types";
import { cn } from "@/lib/utils";

const DOMAIN_TAGLINES: Record<Domain, string> = {
  vibes: "Cómo te sentís y qué energía manejás.",
  communication_style: "Cómo te gusta hablar y cómo querés que te respondan.",
  spending_profile: "En qué gastás y cómo decidís comprar.",
  music_taste: "Lo que escuchás y a quién seguís.",
  event_preferences: "Qué planes te copan y cuáles evitás.",
  fashion_taste: "Tu estilo y cómo te vestís.",
  food_taste: "Qué comidas te gustan y dónde comés.",
  travel_style: "Cómo viajás y a dónde te gusta ir.",
};

function isDomain(value: string): value is Domain {
  return (ALL_DOMAINS as readonly string[]).includes(value);
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  if (!isDomain(domain)) notFound();

  const user = await requireUser();
  const data = await getTwinForUser(user.id);
  if (!data) notFound();

  const skill = skillByDomain(data.skills, domain);
  const facts = skill?.facts ?? [];
  const sorted = [...facts].sort((a, b) => b.confidence - a.confidence);
  const confidence = skill?.confidence ?? 0;
  const percent = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  const visual = DOMAIN_VISUALS[domain];
  const Icon = visual.icon;
  const empty = facts.length === 0;

  return (
    <PageShell>
      <Link
        href="/skills"
        className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" />
        Volver a skills
      </Link>

      <header className="mt-8 grid grid-cols-[auto_1fr_auto] items-start gap-x-3 sm:flex sm:flex-row sm:items-center sm:gap-8">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-1 sm:h-24 sm:w-24 sm:rounded-3xl",
            visual.tone,
            visual.ring,
          )}
        >
          <Icon className="h-7 w-7 sm:h-10 sm:w-10" />
        </div>

        <div className="space-y-2 sm:flex-1 sm:space-y-3">
          <span className="block text-xs uppercase tracking-[0.2em] text-secondary sm:text-sm">
            Skill
          </span>
          <h1 className="text-balance text-3xl font-black leading-tight sm:text-5xl">
            {DOMAIN_LABELS[domain]}
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            {DOMAIN_TAGLINES[domain]}
          </p>
        </div>

        {!empty && <BigDial percent={percent} />}
      </header>

      <section className="mt-12">
        <div className="mb-6 flex items-baseline justify-between gap-3">
          <h2 className="text-sm uppercase tracking-[0.2em] text-secondary">
            Datos aprendidos
          </h2>
          <span className="text-sm text-muted-foreground">
            {empty ? "Sin datos" : `${facts.length} dato${facts.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {empty ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {sorted.map((fact, i) => (
              <FactCard key={fact.id} fact={fact} index={i + 1} />
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}

function BigDial({ percent }: { percent: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative h-16 w-16 shrink-0 sm:h-40 sm:w-40">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="8"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          className="stroke-primary"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black tabular-nums sm:text-3xl">{percent}%</span>
        <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:block">
          Confianza
        </span>
      </div>
    </div>
  );
}

function FactCard({ fact, index }: { fact: Fact; index: number }) {
  const percent = Math.round(Math.max(0, Math.min(1, fact.confidence)) * 100);
  const level =
    percent < 50 ? "Bajo" : percent < 80 ? "Medio" : "Alto";
  const fillColor =
    percent < 50 ? "bg-lilac" : percent < 80 ? "bg-dusty" : "bg-primary";

  return (
    <li>
      <Card className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            #{index.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="text-base font-medium leading-relaxed text-foreground">
          {fact.text}
        </p>
        <div className="mt-auto space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", fillColor)}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="uppercase tracking-wider text-muted-foreground">
              Confianza {level.toLowerCase()}
            </span>
            <span className="font-semibold tabular-nums">{percent}%</span>
          </div>
        </div>
      </Card>
    </li>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-5 border-dashed bg-card/60 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-foreground">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-bold">Aún no entrenamos este dominio.</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Iniciá una sesión de voz con tu Twin y vamos a empezar a llenar este
          espacio con lo que aprenda de vos.
        </p>
      </div>
      <ContinueTrainingButton size="lg" className="gap-2">
        Entrenar mi Twin
        <ArrowRight className="h-4 w-4" />
      </ContinueTrainingButton>
    </Card>
  );
}
