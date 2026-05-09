import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { FactItem } from "./fact-item";
import { DOMAIN_LABELS, type Domain, type Fact } from "@/types";

export function meanConfidence(facts: Fact[]): number {
  if (facts.length === 0) return 0;
  const sum = facts.reduce((acc, f) => acc + f.confidence, 0);
  return sum / facts.length;
}

export function DomainCard({
  domain,
  facts,
  confidence,
}: {
  domain: Domain;
  facts: Fact[];
  confidence?: number;
}) {
  const sorted = [...facts].sort((a, b) => b.confidence - a.confidence);
  const aggregate = confidence ?? meanConfidence(facts);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle>{DOMAIN_LABELS[domain]}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {facts.length} fact{facts.length === 1 ? "" : "s"}
          </span>
        </div>
        <ConfidenceBar value={aggregate} label="Confianza agregada" />
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no entrenamos este dominio.{" "}
            <Link href="/training/start" className="text-primary hover:underline">
              Próxima sesión
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((f) => (
              <FactItem key={f.id} text={f.text} confidence={f.confidence} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
