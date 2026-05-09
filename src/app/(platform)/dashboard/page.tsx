import { TwinOverview, EmptyTwinState } from "@/components/dashboard/twin-overview";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser } from "@/lib/db/twins";
import { parseAvatarConfig } from "@/types/avatar";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getTwinForUser(user.id);
  const avatarConfig = parseAvatarConfig(user.user_metadata?.avatar_config);

  if (!data) {
    return <EmptyTwinState avatarConfig={avatarConfig} avatarSeed={user.id} />;
  }

  const ownerName = (user.user_metadata?.name as string | undefined) ?? user.email ?? null;

  return (
    <TwinOverview
      twin={data.twin}
      ownerName={ownerName}
      avatarConfig={avatarConfig}
      avatarSeed={user.id}
    />
  );
}
