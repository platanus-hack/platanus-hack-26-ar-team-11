// STUB — replaced by Stream A (A04) with real Twin overview.
// See tasks/stream-a/A04-dashboard.md.

import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <PageShell>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Stub. A04 builds the Twin overview here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">TODO: A04 — completion %, skills, sessions, CTA.</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
