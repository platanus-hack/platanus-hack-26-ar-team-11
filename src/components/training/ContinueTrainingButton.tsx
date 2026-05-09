"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ContinueTrainingButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  className?: string;
}

export function ContinueTrainingButton({
  children = "Seguir entrenando",
  variant = "default",
  size = "default",
  className,
}: ContinueTrainingButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/training/start", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? `Error ${res.status}`);
      }
      const data = (await res.json()) as { session_id: string };
      router.push(`/training/${data.session_id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={start}
        disabled={busy}
      >
        {busy ? "Creando sesión…" : children}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
