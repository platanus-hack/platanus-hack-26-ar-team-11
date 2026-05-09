import { cn } from "@/lib/utils";

function colorFor(confidence: number): { dot: string; label: string } {
  if (confidence < 0.5) return { dot: "bg-lilac", label: "Bajo" };
  if (confidence < 0.8) return { dot: "bg-dusty", label: "Medio" };
  return { dot: "bg-primary", label: "Alto" };
}

export function FactItem({
  text,
  confidence,
  className,
}: {
  text: string;
  confidence: number;
  className?: string;
}) {
  const { dot, label } = colorFor(confidence);
  const percent = Math.round(Math.max(0, Math.min(1, confidence)) * 100);

  return (
    <li className={cn("flex items-start gap-3 rounded-md border border-border/60 bg-card/40 p-3", className)}>
      <span
        className={cn("mt-1.5 inline-block h-2.5 w-2.5 rounded-full", dot)}
        aria-label={`Confianza ${label}`}
      />
      <div className="flex-1 space-y-0.5">
        <p className="text-sm">{text}</p>
        <p className="text-xs text-muted-foreground">{percent}% · {label}</p>
      </div>
    </li>
  );
}
