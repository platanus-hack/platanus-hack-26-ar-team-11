import { PageShell } from "@/components/layout/page-shell";
import { TwinOverview, EmptyTwinState } from "@/components/dashboard/twin-overview";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser, pendingDomains } from "@/lib/db/twins";
import { listSessionsForTwin } from "@/lib/db/sessions";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getTwinForUser(user.id);

  if (!data) {
    return (
      <PageShell>
        <EmptyTwinState />
      </PageShell>
    );
  }

  const { twin, skills } = data;
  const pending = pendingDomains(skills);
  const recent = await listSessionsForTwin(twin.id, 3);
  const ownerName = (user.user_metadata?.name as string | undefined) ?? user.email ?? null;

  return (
    <PageShell size="wide">
      <TwinOverview
        twin={twin}
        skills={skills}
        pending={pending}
        recentSessions={recent}
        ownerName={ownerName}
      />
    </PageShell>
  );
}
