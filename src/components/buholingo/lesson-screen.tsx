"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { LinkIcon, Unplug } from "lucide-react";
import { BuholingoHeader } from "./buholingo-header";
import { ExerciseCard } from "./exercise-card";
import { SpokenExerciseCard } from "./spoken-exercise-card";
import { QueryOverlay } from "./query-overlay";
import { GENERIC_EXERCISES } from "@/lib/buholingo/exercises";
import {
  buildConnectUrl,
  clearStoredConnection,
  readStoredConnection,
} from "@/lib/buholingo/connect";
import type { BuholingoExercise, PersonalizedLesson } from "@/lib/buholingo/types";
import type { TwinPreview } from "@/lib/buholingo/format";

type Phase = "generic" | "loading" | "personalized";

interface TwinContextResponse {
  previews: TwinPreview[];
  context: { general: unknown; music: unknown; vibes: unknown };
}

export function LessonScreen() {
  const [phase, setPhase] = useState<Phase>("generic");
  const [personalized, setPersonalized] = useState<PersonalizedLesson | null>(null);
  const [previews, setPreviews] = useState<TwinPreview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const conn = readStoredConnection();
    if (!conn) return;
    setPhase("loading");
    setPreviews(null);
    const startedAt = Date.now();
    const MIN_OVERLAY_MS = 6500;

    let cancelled = false;

    (async () => {
      try {
        // Step 1: fetch real Twin context (~1s).
        const ctxRes = await fetch("/buholingo/api/twin-context", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(conn),
        });
        if (!ctxRes.ok) throw new Error(`twin-context HTTP ${ctxRes.status}`);
        const ctx = (await ctxRes.json()) as TwinContextResponse;
        if (cancelled) return;
        setPreviews(ctx.previews);

        // Step 2: generate the lesson with the already-fetched context.
        const lessonRes = await fetch("/buholingo/api/personalize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...conn, context: ctx.context }),
        });
        if (!lessonRes.ok) throw new Error(`personalize HTTP ${lessonRes.status}`);
        const data = (await lessonRes.json()) as PersonalizedLesson;
        if (cancelled) return;

        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_OVERLAY_MS - elapsed);
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
        if (cancelled) return;

        setPersonalized(data);
        setPhase("personalized");
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "unknown";
        setError(`No pudimos personalizar la lección (${message})`);
        setPhase("generic");
        setPreviews(null);
        clearStoredConnection();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleConnect = () => {
    window.location.href = buildConnectUrl();
  };

  const handleDisconnect = () => {
    clearStoredConnection();
    setPersonalized(null);
    setPreviews(null);
    setPhase("generic");
  };

  const exercises: BuholingoExercise[] =
    phase === "personalized" && personalized
      ? personalized.exercises
      : GENERIC_EXERCISES;

  const variant: "generic" | "personalized" =
    phase === "personalized" ? "personalized" : "generic";

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <QueryOverlay open={phase === "loading"} previews={previews} />
      <BuholingoHeader
        rightSlot={
          phase === "personalized" ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/25"
            >
              <Unplug className="h-4 w-4" />
              Desconectar Twin
            </button>
          ) : null
        }
      />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
        {/* Connect banner — only in generic phase */}
        <AnimatePresence>
          {phase !== "personalized" ? (
            <motion.div
              key="banner-generic"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-8 rounded-2xl bg-[#FFC800] px-7 py-8 shadow-[0_3px_0_#D9A900]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-extrabold leading-tight text-[#3C2A04]">
                    ¿Aburrido aprendiendo lo de siempre?
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#5A3F0A]">
                    Conectá tu Twin y aprendé inglés a través de las cosas que
                    realmente te interesan: tu música, tus planes, tu vibe.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnect}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#58CC02] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#46a302] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_#46a302]"
                >
                  <LinkIcon className="h-4 w-4" />
                  Conectar Twin
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Lesson topic header (only when personalized) */}
        <AnimatePresence>
          {phase === "personalized" && personalized?.topic ? (
            <motion.div
              key="topic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#46a302]">
                Lección de hoy
              </p>
              <h2 className="text-2xl font-extrabold leading-tight text-neutral-900">
                {personalized.topic}
              </h2>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Format-adaptation note (only when personalized) */}
        <AnimatePresence>
          {phase === "personalized" ? (
            <motion.div
              key="adaptation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mb-5 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-5"
            >
              <p className="text-xl leading-snug text-neutral-700">
                <span className="font-semibold text-neutral-900">
                  Cambiamos a formato escrito.
                </span>{" "}
                Sabemos que preferís leer y escribir antes que hablar, así que
                adaptamos el ejercicio.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Exercises */}
        <motion.div layout className="space-y-4">
          <AnimatePresence mode="popLayout">
            {exercises.map((ex, idx) => (
              <motion.div
                key={`${variant}-${ex.id}`}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{
                  duration: 0.45,
                  delay:
                    variant === "personalized" ? 0.3 + idx * 0.08 : idx * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {variant === "personalized" ? (
                  <ExerciseCard exercise={ex} index={idx} variant={variant} />
                ) : (
                  <SpokenExerciseCard exercise={ex} index={idx} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
