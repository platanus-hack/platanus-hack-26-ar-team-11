import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, type Session } from "@/types";
import { formatDate, formatDuration } from "./session-row";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function SessionDetail({ session }: { session: Session }) {
  const slot = session.session_index !== null ? `Slot ${session.session_index + 1}` : "Chat";
  const domainLabel = session.domain ? DOMAIN_LABELS[session.domain] : "Síntesis";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-baseline gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{slot}</span>
            <span>·</span>
            <span>{domainLabel}</span>
            <span>·</span>
            <span>{formatDate(session.started_at)}</span>
            <span>·</span>
            <span>{formatDuration(session.duration_seconds)}</span>
          </div>
          {session.summary && <CardTitle className="text-lg">{session.summary}</CardTitle>}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transcripción</CardTitle>
        </CardHeader>
        <CardContent>
          {session.transcript_json.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin transcripción disponible.</p>
          ) : (
            <ul className="space-y-3">
              {session.transcript_json.map((entry, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex flex-col gap-1 rounded-lg border border-border/40 p-3",
                    entry.role === "assistant" ? "bg-primary/5" : "bg-muted/40",
                  )}
                >
                  <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
                    <span className="font-medium uppercase">
                      {entry.role === "assistant" ? "Twin" : "Vos"}
                    </span>
                    <span>{formatTime(entry.at)}</span>
                  </div>
                  <p className="text-sm">{entry.text}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {session.extracted_facts_json.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Facts extraídos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {session.extracted_facts_json.map((fact, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {DOMAIN_LABELS[fact.domain]}
                    </span>
                    <span className="ml-2">{fact.text}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(fact.confidence * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
