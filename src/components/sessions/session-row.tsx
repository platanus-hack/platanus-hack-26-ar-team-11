import Link from "next/link";
import { Calendar, ChevronRight, Clock, Heart, Layers, MapPin, MessageCircle, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_LABELS, type Domain, type Session } from "@/types";

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

export function truncateSummary(text: string | null, max = 120): string {
  if (!text) return "Sin resumen disponible.";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

const DOMAIN_VISUALS: Record<Domain, { icon: typeof Music; tone: string }> = {
  music_taste: {
    icon: Music,
    tone: "bg-primary/10 text-primary",
  },
  event_preferences: {
    icon: MapPin,
    tone: "bg-secondary/15 text-secondary",
  },
  vibes: {
    icon: Heart,
    tone: "bg-accent/20 text-accent-foreground",
  },
  communication_style: {
    icon: MessageCircle,
    tone: "bg-muted text-foreground",
  },
};

const SYNTHESIS_VISUAL = {
  icon: Layers,
  tone: "bg-muted text-foreground",
};

export function SessionRow({ session }: { session: Session }) {
  const visual = session.domain ? DOMAIN_VISUALS[session.domain] : SYNTHESIS_VISUAL;
  const Icon = visual.icon;
  const domainLabel = session.domain ? DOMAIN_LABELS[session.domain] : "Síntesis";
  const slotLabel =
    session.session_index !== null ? `Sesión ${session.session_index + 1}` : "Chat";

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group flex items-stretch gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-px hover:border-primary/40 hover:shadow-md"
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
          visual.tone,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold">{domainLabel}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {slotLabel}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {truncateSummary(session.summary)}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(session.started_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(session.duration_seconds)}
          </span>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
