import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-10 p-10 text-center sm:p-14">
        <TwinAvatarPlaceholder size="lg" completion={twin.completion_score} className="h-56 w-56" />

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{twinName}</h1>
          {twin.summary && (
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              {twin.summary}
            </p>
          )}
        </div>

        <CompletionWidget
          completion={twin.completion_score}
          sessionIndex={twin.next_session_index}
          className="justify-center"
        />

        <NextSessionCTA nextSessionIndex={twin.next_session_index} />
      </CardContent>
    </Card>
  );
}

export function EmptyTwinState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 p-10 text-center">
        <TwinAvatarPlaceholder size="lg" />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Tu Twin está esperando.</h1>
          <p className="text-sm text-muted-foreground">
            Inicia la primera sesión para que aprenda quién eres.
          </p>
        </div>
        <NextSessionCTA nextSessionIndex={0} />
      </CardContent>
    </Card>
  );
}
