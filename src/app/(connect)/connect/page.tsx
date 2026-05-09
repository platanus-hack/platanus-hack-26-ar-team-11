import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsentScreen } from "@/components/connect/ConsentScreen";
import { getCurrentUser } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildDenyUrl } from "@/lib/connect/redirect";
import type { Scope } from "@/types/permissions";
import type { DeveloperApp } from "@/types/apps";

type SearchParams = Record<string, string | string[] | undefined>;

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function parseScopesParam(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidRedirectUri(uri: string, allowed: string[]): boolean {
  if (!uri) return false;
  try {
    new URL(uri);
  } catch {
    return false;
  }
  return allowed.includes(uri);
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const appIdParam = pickString(params.app_id);
  const redirectUri = pickString(params.redirect_uri);
  const scopesParam = pickString(params.scopes);
  const state = pickString(params.state);

  if (!appIdParam) {
    return <ErrorCard title="Missing app_id" message="The connect URL is missing the app_id parameter." />;
  }
  if (!redirectUri) {
    return (
      <ErrorCard
        title="Missing redirect_uri"
        message="The connect URL is missing the redirect_uri parameter."
      />
    );
  }

  const supabase = createAdminClient();
  const { data: appRow, error: appError } = await supabase
    .from("developer_apps")
    .select("*")
    .eq("client_id", appIdParam)
    .maybeSingle();

  if (appError || !appRow) {
    return <ErrorCard title="App not found" message={`No registered app with client_id "${appIdParam}".`} />;
  }
  const app = appRow as DeveloperApp;

  const allowedRedirectUris = (app.redirect_uris_json ?? []) as string[];
  if (!isValidRedirectUri(redirectUri, allowedRedirectUris)) {
    return (
      <ErrorCard
        title="Redirect URI not authorized"
        message={`The URI "${redirectUri}" is not registered for ${app.name}.`}
      />
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    const search = new URLSearchParams();
    search.set("app_id", appIdParam);
    search.set("redirect_uri", redirectUri);
    if (scopesParam) search.set("scopes", scopesParam);
    if (state) search.set("state", state);
    const returnTo = `/connect?${search.toString()}`;
    redirect(`/auth/login?return_to=${encodeURIComponent(returnTo)}`);
  }

  const allowedScopes = (app.allowed_scopes_json ?? []) as Scope[];
  const requestedRaw = parseScopesParam(scopesParam);
  const requestedFiltered = requestedRaw.filter((s): s is Scope =>
    (allowedScopes as string[]).includes(s),
  );
  const requestedScopes: Scope[] =
    requestedFiltered.length > 0 ? requestedFiltered : allowedScopes;

  if (requestedScopes.length === 0) {
    return (
      <ErrorCard
        title="No scopes available"
        message={`${app.name} has no allowed scopes configured. Contact the developer.`}
      />
    );
  }

  const denyUrl = buildDenyUrl(redirectUri, state);

  return (
    <ConsentScreen
      app={app}
      requestedScopes={requestedScopes}
      redirectUri={redirectUri}
      state={state}
      denyUrl={denyUrl}
    />
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild variant="ghost">
          <Link href="/">Back to Twin Protocol</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
