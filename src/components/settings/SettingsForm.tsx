"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { updateTrainingSettings } from "@/lib/auth/settings-actions";
import type { TrainingSettings } from "@/types/settings";

export function SettingsForm({ initial }: { initial: TrainingSettings }) {
  const [settings, setSettings] = useState<TrainingSettings>(initial);
  const [isPending, startTransition] = useTransition();

  const setAvatarEnabled = (avatar_enabled: boolean) => {
    const next = { ...settings, avatar_enabled };
    setSettings(next);
    startTransition(async () => {
      const res = await updateTrainingSettings(next);
      if (res.ok) {
        toast.success(
          avatar_enabled
            ? "Avatar activado para entrenamiento"
            : "Modo audio activado",
        );
      } else {
        setSettings(settings);
        toast.error(res.error ?? "No se pudo guardar la configuración");
      }
    });
  };

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-6 p-5">
        <div className="space-y-1">
          <Label htmlFor="avatar-toggle" className="text-base font-medium">
            Avatar en entrenamiento
          </Label>
          <p className="text-sm text-muted-foreground">
            Cuando está activo, Clara aparece como un avatar en video durante la
            sesión. Apagalo para entrenar en modo audio (más rápido y sin
            consumir créditos del avatar).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Switch
            id="avatar-toggle"
            checked={settings.avatar_enabled}
            onCheckedChange={setAvatarEnabled}
            disabled={isPending}
            aria-label="Avatar en entrenamiento"
          />
        </div>
      </CardContent>
    </Card>
  );
}
