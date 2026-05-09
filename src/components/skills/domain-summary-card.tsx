import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DOMAIN_VISUALS } from "@/lib/domains/visuals";
import { DOMAIN_LABELS, type Domain, type Fact } from "@/types";

export function DomainSummaryCard({
  domain,
  facts,
  confidence,
}: {
  domain: Domain;
  facts: Fact[];
  confidence: number;
}) {
  const visual = DOMAIN_VISUALS[domain];
  const Icon = visual.icon;
  const empty = facts.length === 0;
  const percent = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  const topFacts = [...facts]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 2);

  return (
    <Link
      href={`/skills/${domain}`}
      className="group block focus:outline-none"
      aria-label={`Ver detalle de ${DOMAIN_LABELS[domain]}`}
    >
      <Card
        className={cn(
          "relative flex h-full flex-col gap-0 overflow-hidden p-5 transition-all",
          "group-hover:-translate-y-0.5 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring",
          empty && "border-dashed bg-card/60",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1",
              visual.tone,
              visual.ring,
              empty && "opacity-60",
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          {!empty && <ConfidenceDial percent={percent} />}
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <h3 className="text-lg font-bold leading-tight">
            {DOMAIN_LABELS[domain]}
          </h3>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {empty
              ? "Sin entrenar"
              : `${facts.length} dato${facts.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {empty ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aún no entrenamos este dominio. Iniciá una sesión para enseñarle a tu Twin.
          </p>
        ) : (
          <ul className="mt-4 space-y-1.5 text-sm text-foreground/90">
            {topFacts.map((f) => (
              <li key={f.id} className="line-clamp-2 leading-snug">
                {f.text}
              </li>
            ))}
            {facts.length > topFacts.length && (
              <li className="text-xs text-muted-foreground">
                +{facts.length - topFacts.length} más
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-end pt-5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Ver detalle
          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}

function ConfidenceDial({ percent }: { percent: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
        {percent}%
      </div>
    </div>
  );
}
