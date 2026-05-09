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

  return (
    <PageShell>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Aplicaciones conectadas</h1>
        <p className="text-sm text-muted-foreground">
          Apps que pueden consultar a tu Twin. Vos elegís qué acceden y cuándo desconectar.
        </p>
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
