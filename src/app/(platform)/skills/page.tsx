import { PageShell } from "@/components/layout/page-shell";
import { DomainSummaryCard } from "@/components/skills/domain-summary-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser, skillByDomain } from "@/lib/db/twins";
import { ALL_DOMAINS } from "@/types";

export default async function SkillsPage() {
  const user = await requireUser();
  const data = await getTwinForUser(user.id);

  if (!data) {
    return (
      <PageShell>
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Aún no tenés un Twin. Iniciá una sesión desde el panel.
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const trained = ALL_DOMAINS.filter((d) => {
    const skill = skillByDomain(data.skills, d);
    return (skill?.facts.length ?? 0) > 0;
  });
  const totalFacts = data.skills.reduce((acc, s) => acc + s.facts.length, 0);

  return (
    <PageShell>
      <header className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="block text-sm uppercase tracking-[0.2em] text-secondary">
            Skills
          </span>
          <h1 className="mt-3 text-balance text-3xl font-black sm:text-4xl">
            Lo que tu Twin aprendió de vos.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Cada dominio se entrena con sesiones de voz. Tocá una skill para ver el
            detalle de los datos y su nivel de confianza.
          </p>
        </div>
        <div className="flex shrink-0 gap-3 text-center">
          <Stat label="Dominios" value={`${trained.length}/${ALL_DOMAINS.length}`} />
          <Stat label="Datos" value={totalFacts.toString()} />
        </div>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ALL_DOMAINS.map((domain) => {
          const skill = skillByDomain(data.skills, domain);
          return (
            <DomainSummaryCard
              key={domain}
              domain={domain}
              facts={skill?.facts ?? []}
              confidence={skill?.confidence ?? 0}
            />
          );
        })}
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[8rem] rounded-2xl border border-border bg-card px-5 py-3 text-center shadow-sm">
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
