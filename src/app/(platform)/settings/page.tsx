import { PageShell } from "@/components/layout/page-shell";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireUser } from "@/lib/auth/server";
import { parseTrainingSettings } from "@/types/settings";

export default async function SettingsPage() {
  const user = await requireUser();
  const initial = parseTrainingSettings(user.user_metadata?.training_settings);

  return (
    <PageShell size="narrow">
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Ajustes que afectan cómo entrena tu Twin.
        </p>
      </header>

      <SettingsForm initial={initial} />
    </PageShell>
  );
}
