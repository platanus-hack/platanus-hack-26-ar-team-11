import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TwinAvatarPlaceholder } from "@/components/twin/twin-avatar-placeholder";
import { CompletionWidget } from "./completion-widget";
import { SkillsList } from "./skills-list";
import { NextSessionCTA } from "./next-session-cta";
import { RecentActivity } from "./recent-activity";
import type { Domain, Session, Twin, TwinSkill } from "@/types";

export function TwinOverview({
  twin,
  skills,
  pending,
  recentSessions,
  ownerName,
}: {
  twin: Twin;
  skills: TwinSkill[];
  pending: Domain[];
  recentSessions: Session[];
  ownerName?: string | null;
}) {
  const twinName = twin.name ?? (ownerName ? `Twin de ${ownerName}` : "Tu Twin");

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <TwinAvatarPlaceholder size="lg" completion={twin.completion_score} />
            <div className="flex flex-1 flex-col gap-3">
              <div>
                <h1 className="text-2xl font-semibold">{twinName}</h1>
                {twin.summary && (
                  <p className="mt-1 text-sm text-muted-foreground">{twin.summary}</p>
                )}
              </div>
              <CompletionWidget
                completion={twin.completion_score}
                sessionIndex={twin.next_session_index}
              />
              <NextSessionCTA nextSessionIndex={twin.next_session_index} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <SkillsList skills={skills} pending={pending} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-3 p-6">
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Aplicaciones conectadas
            </h3>
            <p className="text-sm text-muted-foreground">
              Conectá tu Twin a apps para que respondan por vos.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/connected-apps">
                Ver apps
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <RecentActivity sessions={recentSessions} />
      </div>
    </div>
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
            Empezá la primera sesión para que aprenda quién sos.
          </p>
        </div>
        <NextSessionCTA nextSessionIndex={0} />
      </CardContent>
    </Card>
  );
}
