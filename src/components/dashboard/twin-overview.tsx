import Link from "next/link";
import { HeroAvatar } from "@/components/landing/HeroAvatar";
import { Button } from "@/components/ui/button";
import { type AvatarConfig, DEFAULT_AVATAR_CONFIG } from "@/types/avatar";
import { CompletionWidget } from "./completion-widget";
import { NextSessionCTA } from "./next-session-cta";
import type { Twin } from "@/types";

export function TwinOverview({
  twin,
  ownerName,
  avatarConfig,
  avatarSeed,
}: {
  twin: Twin;
  ownerName?: string | null;
  avatarConfig?: AvatarConfig | null;
  avatarSeed?: string;
}) {
  const twinName = twin.name ?? (ownerName ? `Twin de ${ownerName}` : "Tu Twin");

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <HeroAvatar
        config={avatarConfig ?? DEFAULT_AVATAR_CONFIG}
        seed={avatarSeed ?? twin.id}
        className="!w-56 md:!w-64"
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">{twinName}</h1>
        {twin.summary && (
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
            {twin.summary}
          </p>
        )}
      </div>

      <CompletionWidget
        completion={twin.completion_score}
        sessionIndex={twin.next_session_index}
      />

      <NextSessionCTA nextSessionIndex={twin.next_session_index} />
    </div>
  );
}

export function EmptyTwinState({
  avatarConfig,
  avatarSeed,
}: {
  avatarConfig?: AvatarConfig | null;
  avatarSeed?: string;
}) {
  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <HeroAvatar
        config={avatarConfig ?? DEFAULT_AVATAR_CONFIG}
        seed={avatarSeed ?? "twin"}
        className="!w-56 md:!w-64"
      />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold md:text-4xl">Tu Twin está esperando.</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Inicia la primera sesión para que aprenda quién eres.
        </p>
      </div>
      <NextSessionCTA nextSessionIndex={0} />
      <Button asChild variant="ghost" size="sm">
        <Link href="/avatar">Personalizar avatar</Link>
      </Button>
    </div>
  );
}
