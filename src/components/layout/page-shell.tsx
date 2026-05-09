import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8",
        size === "wide" && "max-w-7xl",
        size === "default" && "max-w-5xl",
        size === "narrow" && "max-w-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
