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
            Aún no tienes un Twin. Inicia una sesión desde el panel.
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Skills aprendidas</h1>
        <p className="text-sm text-muted-foreground">
          Lo que tu Twin sabe sobre ti. Toca una skill para ver el detalle.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
