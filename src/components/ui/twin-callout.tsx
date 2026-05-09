import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function TwinCallout({
  title,
  description,
  icon,
  className,
  children,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 text-foreground",
        className,
      )}
    >
      <div className="text-accent">{icon ?? <Sparkles className="h-5 w-5" />}</div>
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
