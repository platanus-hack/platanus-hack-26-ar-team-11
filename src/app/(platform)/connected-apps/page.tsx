import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { ConnectionCard } from "@/components/connected-apps/connection-card";
import { requireUser } from "@/lib/auth/server";
import {
  listConnectionsForUser,
  listRecentLogsForConnection,
} from "@/lib/db/connections";
import type { QueryLog } from "@/types";

export default async function ConnectedAppsPage() {
  const user = await requireUser();
  const connections = await listConnectionsForUser(user.id);

  const logsByConnection = await Promise.all(
    connections.map(async (c) => [c.id, await listRecentLogsForConnection(c.id, 5)] as const),
  );
  const logsMap = new Map<string, QueryLog[]>(logsByConnection);

  const activeCount = connections.filter((c) => !c.revoked_at).length;

  return (
    <PageShell>
      <header className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="block text-sm uppercase tracking-[0.2em] text-secondary">
            Aplicaciones
          </span>
          <h1 className="mt-3 text-balance text-3xl font-black sm:text-4xl">
            Las apps que pueden consultar a tu Twin.
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Vos elegís qué pueden preguntar y cuándo revocar el acceso. Tu Twin
            sigue siendo tuyo.
          </p>
        </div>
        <div className="flex shrink-0 gap-3 self-center text-center sm:self-auto">
          <Stat label="Conectadas" value={connections.length.toString()} />
          <Stat label="Activas" value={activeCount.toString()} />
        </div>
      </header>

      {connections.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Aún no conectaste tu Twin a ninguna app.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              logs={logsMap.get(connection.id) ?? []}
            />
          ))}
        </div>
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
