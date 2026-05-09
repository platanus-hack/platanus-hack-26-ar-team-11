"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { motion } from "motion/react";
import type { BuholingoExercise } from "@/lib/buholingo/types";

interface SpokenExerciseCardProps {
  exercise: BuholingoExercise;
  index: number;
}

export function SpokenExerciseCard({ exercise, index }: SpokenExerciseCardProps) {
  const [recording, setRecording] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const startRecording = () => setRecording(true);
  const stopRecording = () =>
    window.setTimeout(() => setRecording(false), 600);

  return (
    <motion.div
      layout
      className="relative rounded-2xl border-2 border-neutral-200 bg-white p-5 shadow-[0_2px_0_rgba(0,0,0,0.06)] transition-colors"
    >
      <div className="mb-3 flex items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Ejercicio {index + 1}
        </span>
      </div>

      <p className="mb-1 text-sm font-medium text-neutral-500">
        Decí esta frase en inglés
      </p>
      <p className="mb-6 text-2xl font-extrabold leading-snug text-neutral-900">
        {exercise.prompt_es}
      </p>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          aria-label="Mantené para hablar"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={() => setRecording(false)}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#1CB0F6] text-white shadow-[0_4px_0_#0a82c0] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_#0a82c0]"
        >
          {recording ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-[#1CB0F6]/40" />
          ) : null}
          <Mic className="relative h-7 w-7" />
        </button>
        <span className="text-xs font-semibold text-neutral-500">
          {recording
            ? "Escuchando…"
            : skipped
              ? "Saltado"
              : "Mantené apretado para hablar"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setSkipped(true)}
        className="mt-4 inline-flex text-xs font-medium text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline"
      >
        No puedo hablar ahora
      </button>
    </motion.div>
  );
}
