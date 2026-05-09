import { cn } from "@/lib/utils";

export function CompletionWidget({
  completion,
  sessionIndex,
  totalSessions = 8,
  className,
}: {
  completion: number; // 0..1
  sessionIndex: number; // 0..8
  totalSessions?: number;
  className?: string;
}) {
  const isComplete = sessionIndex >= totalSessions;
  const clamped = isComplete ? 1 : Math.max(0, Math.min(1, completion));
  const percent = Math.round(clamped * 100);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative h-32 w-32 shrink-0">
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
    </div>
  );
}
