import { TARGET_TRAINING_SESSIONS } from "@/lib/twin/recompute";
import { cn } from "@/lib/utils";

export function CompletionWidget({
  completion,
  sessionIndex,
  totalSessions = TARGET_TRAINING_SESSIONS,
  className,
}: {
  completion: number; // 0..1
  sessionIndex: number; // 0..TARGET_TRAINING_SESSIONS
  totalSessions?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(1, completion));
  const percent = Math.round(clamped * 100);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div className={cn("flex items-center gap-5", className)}>
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" className="stroke-muted" strokeWidth="10" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            className="stroke-primary"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">{percent}%</span>
          <span className="text-xs text-muted-foreground">completo</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-wider text-muted-foreground">Progreso</p>
        <p className="text-lg font-medium">
          Sesión {Math.min(sessionIndex + 1, totalSessions)} de {totalSessions}
        </p>
        <p className="text-sm text-muted-foreground">
          {sessionIndex >= totalSessions
            ? "Twin completo. Puedes seguir afinándolo con sesiones extra."
            : "Tu Twin está aprendiendo de ti."}
        </p>
      </div>
    </div>
  );
}
