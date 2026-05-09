import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { SessionRow } from "@/components/sessions/session-row";
import { ContinueTrainingButton } from "@/components/training/ContinueTrainingButton";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser } from "@/lib/db/twins";
import { listSessionsForTwin } from "@/lib/db/sessions";

export default async function SessionsPage() {
  const user = await requireUser();
  const data = await getTwinForUser(user.id);

  if (!data) {
    return (
      <PageShell>
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm text-muted-foreground">Aún no tienes un Twin.</p>
            <Button asChild size="sm">
              <Link href="/dashboard">Ir al panel</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const sessions = await listSessionsForTwin(data.twin.id);
  const trainingCount = sessions.filter((s) => s.type === "training").length;

  return (
    <PageShell>
      <header className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="block text-sm uppercase tracking-[0.2em] text-secondary">
            Sesiones
          </span>
          <h1 className="mt-3 text-balance text-3xl font-black sm:text-4xl">
            Cada charla que tuviste con tu Twin.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Tocá una sesión para ver el resumen, los datos extraídos y la
            duración de la conversación.
          </p>
        </div>
        <div className="flex shrink-0 gap-3 text-center">
          <Stat label="Total" value={sessions.length.toString()} />
          <Stat label="Entrenamiento" value={trainingCount.toString()} />
        </div>
      </header>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">Aún no tenés sesiones.</p>
            <ContinueTrainingButton>Iniciar entrenamiento</ContinueTrainingButton>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <SessionRow session={session} />
            </li>
          ))}
        </ul>
      )}
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
