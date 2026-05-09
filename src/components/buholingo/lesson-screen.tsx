"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, LinkIcon, Unplug } from "lucide-react";
import { BuholingoHeader } from "./buholingo-header";
import { ExerciseCard } from "./exercise-card";
import { QueryOverlay } from "./query-overlay";
import { GENERIC_EXERCISES } from "@/lib/buholingo/exercises";
import {
  buildConnectUrl,
  clearStoredConnection,
  readStoredConnection,
} from "@/lib/buholingo/connect";
import type { BuholingoExercise, PersonalizedLesson } from "@/lib/buholingo/types";

type Phase = "generic" | "loading" | "personalized";

export function LessonScreen() {
  const [phase, setPhase] = useState<Phase>("generic");
  const [personalized, setPersonalized] = useState<PersonalizedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const conn = readStoredConnection();
    if (!conn) return;
    setPhase("loading");
    const startedAt = Date.now();
    const MIN_OVERLAY_MS = 4600;

    fetch("/buholingo/api/personalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(conn),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as PersonalizedLesson;
      })
      .then(async (data) => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_OVERLAY_MS - elapsed);
        if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
        setPersonalized(data);
        setPhase("personalized");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "unknown";
        setError(`No pudimos personalizar la lección (${message})`);
        setPhase("generic");
        clearStoredConnection();
      });
  }, []);

  const handleConnect = () => {
    window.location.href = buildConnectUrl();
  };

  const handleDisconnect = () => {
    clearStoredConnection();
    setPersonalized(null);
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
      <QueryOverlay open={phase === "loading"} />
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
        {/* Banner */}
        <AnimatePresence mode="wait">
          {phase !== "personalized" ? (
            <motion.div
              key="banner-generic"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 rounded-2xl border-2 border-[#FFD700]/40 bg-gradient-to-r from-[#FFF3C2] to-[#FFE680] p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#3C2A04]">
                    Aburrido, ¿no?
                  </h2>
                  <p className="text-sm text-[#5A3F0A]">
                    Conectá tu Twin y aprendé inglés a través de las cosas que
                    realmente te interesan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnect}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#212842] px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#0e132a] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_#0e132a]"
                >
                  <LinkIcon className="h-4 w-4" />
                  Connect your Twin
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="banner-personalized"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border-2 border-[#58CC02] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#58CC02] text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold text-neutral-900">
                    Personalizado para vos · powered by your Twin
                  </h2>
                  {personalized?.summary ? (
                    <p className="text-sm text-neutral-600">{personalized.summary}</p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Twin facts panel (transparency) */}
        <AnimatePresence>
          {phase === "personalized" && personalized?.twin_facts_used.length ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="rounded-xl border border-[#212842]/15 bg-white p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Tu Twin nos contó
                </p>
                <ul className="space-y-1.5">
                  {personalized.twin_facts_used.map((fact, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4A017]" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                  delay: variant === "personalized" ? idx * 0.08 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ExerciseCard exercise={ex} index={idx} variant={variant} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
