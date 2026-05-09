"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import type { CurriculumSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DOMAIN_LABELS: Record<string, string> = {
  music_taste: "gustos musicales",
  event_preferences: "preferencias de eventos",
  vibes: "personalidad y energía",
  communication_style: "estilo de comunicación",
};

const DEPTH_LABELS: Record<CurriculumSlot["target_depth"], string> = {
  broad: "exploración amplia",
  deep: "profundización",
  synthesis: "síntesis y validación",
  gap_filling: "completar gaps",
};

type MicState = "checking" | "granted" | "denied" | "unsupported";

export interface LobbyProps {
  slot: CurriculumSlot;
  status: "idle" | "connecting" | "error";
  error: string | null;
  onStart: () => void;
}

export function Lobby({ slot, status, error, onStart }: LobbyProps) {
  const [mic, setMic] = useState<MicState>("checking");

  useEffect(() => {
    let cancelled = false;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMic("unsupported");
      return () => {
        cancelled = true;
      };
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setMic("granted");
        stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => {
        if (!cancelled) setMic("denied");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const busy = status === "connecting";
  const disabled = busy || mic !== "granted";

  const targetLabel = slot.target_domain
    ? DOMAIN_LABELS[slot.target_domain] ?? slot.target_domain
    : DEPTH_LABELS[slot.target_depth];

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Sesión {slot.index + 1} de 8
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Hoy: {targetLabel}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          ({DEPTH_LABELS[slot.target_depth]})
        </p>
      </div>

      {slot.intro_hint && (
        <p className="max-w-md text-center text-sm leading-relaxed text-neutral-700">
          “{slot.intro_hint}”
        </p>
      )}

      <ul className="w-full max-w-md space-y-1.5 rounded-xl border border-neutral-200 bg-white/60 p-4 text-sm text-neutral-700">
        {slot.focus_areas.map((area) => (
          <li key={area} className="flex gap-2">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
            <span>{area}</span>
          </li>
        ))}
      </ul>

      <MicStatus state={mic} />

      <Button
        type="button"
        size="lg"
        onClick={onStart}
        disabled={disabled}
        className="min-w-44"
      >
        {busy ? "Conectando…" : "Empezar sesión"}
      </Button>

      {error && (
        <Alert role="alert" variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function MicStatus({ state }: { state: MicState }) {
  if (state === "checking") {
    return (
      <p className="inline-flex items-center gap-2 text-xs text-neutral-500">
        <Mic className="h-3.5 w-3.5" /> Pidiendo permiso de micrófono…
      </p>
    );
  }
  if (state === "granted") {
    return (
      <p className="inline-flex items-center gap-2 text-xs text-emerald-600">
        <Mic className="h-3.5 w-3.5" /> Micrófono listo
      </p>
    );
  }
  if (state === "unsupported") {
    return (
      <Alert role="alert" variant="destructive" className="max-w-md">
        <AlertDescription>
          Tu navegador no soporta acceso al micrófono. Probá con Chrome o Firefox.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert role="alert" variant="destructive" className="max-w-md">
      <AlertDescription className="flex items-start gap-2">
        <MicOff className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Necesitamos permiso de micrófono. Habilitalo desde el ícono de
          permisos del navegador y refrescá la página.
        </span>
      </AlertDescription>
    </Alert>
  );
}
