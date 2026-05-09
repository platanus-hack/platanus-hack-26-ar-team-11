import { TwinOverview, EmptyTwinState } from "@/components/dashboard/twin-overview";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser } from "@/lib/db/twins";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getTwinForUser(user.id);

  if (!data) return <EmptyTwinState />;

  const ownerName = (user.user_metadata?.name as string | undefined) ?? user.email ?? null;

  return <TwinOverview twin={data.twin} ownerName={ownerName} />;
}
