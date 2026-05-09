import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SCOPE_LABELS, type QueryLog, type Scope } from "@/types";
import type { ConnectionWithApp } from "@/lib/db/connections";
import { DisconnectButton } from "./disconnect-button";
import { QueryLogList } from "./query-log-list";

export function ConnectionCard({
  connection,
  logs,
}: {
  connection: ConnectionWithApp;
  logs: QueryLog[];
}) {
  const granted = new Set(connection.scopes_json);
  const allScopes: Scope[] = connection.app.allowed_scopes_json;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{connection.app.name}</CardTitle>
            {connection.app.description && (
              <p className="mt-1 text-sm text-muted-foreground">{connection.app.description}</p>
            )}
          </div>
          <DisconnectButton connectionId={connection.id} appName={connection.app.name} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Permisos
          </h4>
          <ul className="space-y-1.5 text-sm">
            {allScopes.map((scope) => {
              const isGranted = granted.has(scope);
              const Icon = isGranted ? Check : X;
              return (
                <li
                  key={scope}
                  className={cn(
                    "flex items-center gap-2",
                    isGranted ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isGranted ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span>{SCOPE_LABELS[scope] ?? scope}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Consultas recientes
          </h4>
          <QueryLogList logs={logs} />
        </section>
      </CardContent>
    </Card>
  );
}
