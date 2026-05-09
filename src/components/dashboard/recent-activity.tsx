import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOMAIN_LABELS } from "@/types";
import type { Session } from "@/types";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days < 1) return "hoy";
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}

export function RecentActivity({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/sessions/${session.id}`}
            className="flex items-baseline justify-between text-sm hover:underline"
          >
            <div className="space-y-0.5">
              <p className="font-medium">
                {session.domain ? DOMAIN_LABELS[session.domain] : "Síntesis"}
              </p>
              <p className="text-xs text-muted-foreground">
                {relativeDate(session.started_at)} · {formatDuration(session.duration_seconds)}
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
