import { PageShell } from "@/components/layout/page-shell";
import { DomainCard } from "@/components/skills/domain-card";
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
            Aún no tenés un Twin. Empezá una sesión desde el dashboard.
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell size="wide">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Skills aprendidas</h1>
        <p className="text-sm text-muted-foreground">
          Lo que tu Twin sabe sobre vos, dominio por dominio.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {ALL_DOMAINS.map((domain) => {
          const skill = skillByDomain(data.skills, domain);
          return (
            <DomainCard
              key={domain}
              domain={domain}
              facts={skill?.facts ?? []}
              confidence={skill?.confidence}
            />
          );
        })}
      </div>
    </PageShell>
  );
}
