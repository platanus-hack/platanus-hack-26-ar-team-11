// STUB — replaced by Stream C (C03).
// See tasks/stream-c/C03-connect-page.md.

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect your Twin</CardTitle>
        <CardDescription>Stub. C03 implements the real flow.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">app_id: {String(params.app_id ?? "—")}</p>
      </CardContent>
    </Card>
  );
}
