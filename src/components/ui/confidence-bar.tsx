import { cn } from "@/lib/utils";

export function ConfidenceBar({
  value,
  label,
  className,
  showValue = true,
}: {
  value: number; // 0..1
  label?: string;
  className?: string;
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const percent = Math.round(clamped * 100);

  // Threshold-based color: low → lilac, mid → dusty, high → indigo
  const fillColor =
    clamped < 0.5
      ? "bg-lilac"
      : clamped < 0.8
        ? "bg-dusty"
        : "bg-primary";

  return (
    <div className={cn("flex w-full flex-col", label ? "gap-2.5" : "gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          {showValue && <span>{percent}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", fillColor)}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={label ?? "confidence"}
        />
      </div>
    </div>
  );
}
