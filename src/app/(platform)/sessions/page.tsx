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

  return (
    <PageShell>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Sesiones</h1>
        <p className="text-sm text-muted-foreground">
          Cada conversación con tu Twin queda guardada aquí.
        </p>
      </header>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">Aún no tienes sesiones.</p>
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
