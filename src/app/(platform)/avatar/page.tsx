import { AvatarCustomizer } from "@/components/avatar/AvatarCustomizer";
import { requireUser } from "@/lib/auth/server";
import { parseAvatarConfig } from "@/types/avatar";

export default async function AvatarPage() {
  const user = await requireUser();
  const initial = parseAvatarConfig(user.user_metadata?.avatar_config);
  const initialName = (user.user_metadata?.name as string | undefined) ?? "";

  return (
    <AvatarCustomizer
      initialConfig={initial}
      seed={user.id}
      initialName={initialName}
    />
  );
}
