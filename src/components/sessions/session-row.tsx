import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DOMAIN_LABELS, type Session } from "@/types";

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function truncateSummary(text: string | null, max = 80): string {
  if (!text) return "Sin resumen.";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function SessionRow({ session }: { session: Session }) {
  const slot = session.session_index !== null ? `Slot ${session.session_index + 1}` : "Chat";
  const domainLabel = session.domain ? DOMAIN_LABELS[session.domain] : "Síntesis";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-4 rounded-lg border border-border/60 bg-card/40 p-4 transition hover:border-primary/40 hover:bg-card"
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{slot}</span>
          <span className="text-muted-foreground">·</span>
          <span>{domainLabel}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formatDate(session.started_at)}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formatDuration(session.duration_seconds)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{truncateSummary(session.summary)}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
