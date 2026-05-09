import { TwinAvatarPlaceholder } from "@/components/twin/twin-avatar-placeholder";
import { CompletionWidget } from "./completion-widget";
import { NextSessionCTA } from "./next-session-cta";
import type { Twin } from "@/types";

export function TwinOverview({
  twin,
  ownerName,
}: {
  twin: Twin;
  ownerName?: string | null;
}) {
  const twinName = twin.name ?? (ownerName ? `Twin de ${ownerName}` : "Tu Twin");

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <TwinAvatarPlaceholder size="lg" completion={twin.completion_score} className="h-40 w-40 md:h-48 md:w-48" />

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

export function EmptyTwinState() {
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <TwinAvatarPlaceholder size="lg" />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold md:text-4xl">Tu Twin está esperando.</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Inicia la primera sesión para que aprenda quién eres.
        </p>
      </div>
      <NextSessionCTA nextSessionIndex={0} />
    </div>
  );
}
