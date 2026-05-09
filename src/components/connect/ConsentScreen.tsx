import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Scope, BlockedDomain } from "@/types/permissions";
import { ALL_SCOPES, ALL_BLOCKED_DOMAINS } from "@/types/permissions";
import type { DeveloperApp } from "@/types/apps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScopesList } from "./ScopesList";

export interface ConsentScreenProps {
  app: Pick<DeveloperApp, "id" | "name" | "description" | "client_id" | "allowed_scopes_json">;
  requestedScopes: Scope[];
  redirectUri: string;
  state?: string;
  denyUrl: string;
}

export function ConsentScreen({
  app,
  requestedScopes,
  redirectUri,
  state,
  denyUrl,
}: ConsentScreenProps) {
  const granted = ALL_SCOPES.filter((s) => requestedScopes.includes(s));
  const notRequested = (app.allowed_scopes_json ?? []).filter(
    (s) => !requestedScopes.includes(s),
  );
  const blocked: BlockedDomain[] = [...ALL_BLOCKED_DOMAINS];

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">{app.name} wants to access your Twin</CardTitle>
        {app.description && (
          <p className="text-sm text-muted-foreground">{app.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <ScopesList
          granted={granted}
          notRequested={notRequested}
          blocked={blocked}
        />

        <p className="text-xs text-muted-foreground">
          You can revoke this connection at any time from your{" "}
          <Link href="/connected-apps" className="underline underline-offset-2 hover:text-foreground">
            connected apps
          </Link>{" "}
          dashboard. Your raw conversation transcripts are never shared.
        </p>

        <form
          method="post"
          action="/api/connect/approve"
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="app_id" value={app.client_id} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="hidden" name="scopes" value={requestedScopes.join(",")} />
          {state ? <input type="hidden" name="state" value={state} /> : null}

          <Button type="submit" className="w-full bg-amber text-indigo hover:bg-amber/90">
            Approve and connect
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={denyUrl}>Deny</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
