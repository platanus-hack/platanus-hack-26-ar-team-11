import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/types";

const STATUS_CLASSES: Record<ConnectionStatus, string> = {
  active: "bg-primary/10 text-primary border-primary/30",
  revoked: "bg-destructive/10 text-destructive border-destructive/30",
  expired: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  active: "Active",
  revoked: "Revoked",
  expired: "Expired",
};

export function TwinBadge({
  variant,
  className,
  children,
}: {
  variant: ConnectionStatus;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[variant],
        className,
      )}
    >
      {children ?? STATUS_LABELS[variant]}
    </span>
  );
}
