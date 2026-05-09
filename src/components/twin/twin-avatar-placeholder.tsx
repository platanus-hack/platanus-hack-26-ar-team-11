import { cn } from "@/lib/utils";
import { TwinAvatarSvg } from "./twin-avatar-svg";

const SIZE_CLASSES = {
  sm: "h-16 w-16",
  md: "h-32 w-32",
  lg: "h-48 w-48",
} as const;

export function TwinAvatarPlaceholder({
  size = "md",
  glow,
  completion,
  className,
  label = "Twin avatar",
}: {
  size?: keyof typeof SIZE_CLASSES;
  glow?: boolean;
  completion?: number; // 0..1
  className?: string;
  label?: string;
}) {
  const showGlow = glow ?? (typeof completion === "number" && completion > 0.8);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        SIZE_CLASSES[size],
        className,
      )}
      role="img"
      aria-label={label}
    >
      <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite]">
        <TwinAvatarSvg glow={showGlow} />
      </div>
    </div>
  );
}
