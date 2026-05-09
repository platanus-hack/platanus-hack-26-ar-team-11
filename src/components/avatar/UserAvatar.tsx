import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import { cn } from "@/lib/utils";
import {
  type AvatarConfig,
  configToOptions,
  DEFAULT_AVATAR_CONFIG,
} from "@/types/avatar";

export function renderAvatarSvg(config: AvatarConfig, seed = "twin"): string {
  return createAvatar(avataaars, {
    seed,
    ...configToOptions(config),
  }).toString();
}

export function UserAvatar({
  config,
  seed,
  className,
  ariaLabel = "Avatar",
}: {
  config?: AvatarConfig | null;
  seed?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const finalConfig = config ?? DEFAULT_AVATAR_CONFIG;
  const svg = renderAvatarSvg(finalConfig, seed ?? "twin");

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden [&>svg]:h-full [&>svg]:w-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
