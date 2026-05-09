"use client";

import { Button } from "@/components/ui/button";

export interface LobbyProps {
  status: "idle" | "connecting" | "error";
  error: string | null;
  onStart: () => void;
}

export function Lobby({ status, error, onStart }: LobbyProps) {
  const busy = status === "connecting";
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sesión de entrenamiento
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-600">
          Cuando estés listo, dale a empezar. La sesión dura unos 15 minutos.
          Hablás con tu Twin como si fuera una llamada.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={onStart}
        disabled={busy}
        className="min-w-40"
      >
        {busy ? "Conectando…" : "Empezar"}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
