import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTENT_LABELS } from "@/lib/db/connections";
import type { QueryLog } from "@/types";

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export function QueryLogList({ logs }: { logs: QueryLog[] }) {
  if (logs.length === 0) {
    return <p className="text-xs text-muted-foreground">Aún no hubo consultas.</p>;
  }

  return (
    <ul className="space-y-2">
      {logs.map((log) => {
        const Icon = log.allowed ? Check : X;
        return (
          <li
            key={log.id}
            className={cn(
              "flex items-start gap-3 rounded-md border border-border/50 p-2.5 text-xs",
              log.allowed ? "bg-card/30" : "bg-destructive/5",
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-3.5 w-3.5 shrink-0",
                log.allowed ? "text-primary" : "text-destructive",
              )}
            />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{INTENT_LABELS[log.intent] ?? log.intent}</span>
                <span className="text-muted-foreground">{formatRelative(log.created_at)}</span>
              </div>
              {log.question && (
                <p className="line-clamp-2 text-muted-foreground">{log.question}</p>
              )}
              {!log.allowed && log.blocked_reason && (
                <p className="text-destructive">Bloqueada: {log.blocked_reason}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
