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
        "mx-auto w-full px-4 pb-12 pt-16 md:px-8 md:pt-20",
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
