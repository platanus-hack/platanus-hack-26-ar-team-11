import { cn } from "@/lib/utils";

export function TwinAvatarSvg({
  glow = false,
  className,
}: {
  glow?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="twin-orb" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="hsl(258 92% 86%)" />
          <stop offset="55%" stopColor="hsl(248 78% 60%)" />
          <stop offset="100%" stopColor="hsl(248 60% 30%)" />
        </radialGradient>
        <radialGradient id="twin-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(36 94% 70%)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="hsl(36 94% 70%)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="twin-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(258 92% 86%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(248 78% 60%)" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {glow && <circle cx="100" cy="100" r="92" fill="url(#twin-halo)" />}

      <ellipse
        cx="100"
        cy="100"
        rx="86"
        ry="32"
        fill="none"
        stroke="url(#twin-orbit)"
        strokeWidth="1.5"
        transform="rotate(-18 100 100)"
      />

      <circle cx="100" cy="100" r="58" fill="url(#twin-orb)" />

      <circle cx="82" cy="82" r="14" fill="hsl(258 92% 96%)" opacity="0.6" />
      <circle cx="76" cy="78" r="6" fill="hsl(258 92% 99%)" opacity="0.85" />
    </svg>
  );
}
