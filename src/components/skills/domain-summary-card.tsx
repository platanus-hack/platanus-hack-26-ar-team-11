import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
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
  const empty = facts.length === 0;

  return (
    <Link
      href={`/skills/${domain}`}
      className="group block focus:outline-none"
      aria-label={`Ver detalle de ${DOMAIN_LABELS[domain]}`}
    >
      <Card className="h-full gap-2 py-3 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/50 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="flex h-full flex-col gap-2 px-5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold">{DOMAIN_LABELS[domain]}</h3>
            <span className="text-xs text-muted-foreground">
              {empty ? "Sin entrenar" : `${facts.length} fact${facts.length === 1 ? "" : "s"}`}
            </span>
          </div>

          {empty ? (
            <p className="text-sm text-muted-foreground">
              Aún no entrenamos este dominio.
            </p>
          ) : (
            <ConfidenceBar value={confidence} showValue />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
