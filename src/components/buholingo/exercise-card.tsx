"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "motion/react";
import { isCorrect } from "@/lib/buholingo/match";
import type { BuholingoExercise } from "@/lib/buholingo/types";

interface ExerciseCardProps {
  exercise: BuholingoExercise;
  index: number;
  variant: "generic" | "personalized";
}

type Status = "idle" | "correct" | "incorrect";

export function ExerciseCard({ exercise, index, variant }: ExerciseCardProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleCheck = () => {
    if (!value.trim()) return;
    setStatus(isCorrect(value, exercise.answer_en) ? "correct" : "incorrect");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCheck();
    }
  };

  const reset = () => {
    setValue("");
    setStatus("idle");
  };

  const borderColor =
    status === "correct"
      ? "border-[#58CC02]"
      : status === "incorrect"
        ? "border-[#E5495D]"
        : variant === "personalized"
          ? "border-[#FFD700]/40"
          : "border-neutral-200";

  return (
    <motion.div
      layout
      className={`relative rounded-2xl border-2 ${borderColor} bg-white p-5 shadow-[0_2px_0_rgba(0,0,0,0.06)] transition-colors`}
    >
      <div className="mb-3 flex items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Ejercicio {index + 1}
        </span>
      </div>

      <p className="mb-1 text-sm font-medium text-neutral-500">Traducí al inglés</p>
      <p className="mb-4 text-2xl font-extrabold leading-snug text-neutral-900">
        {exercise.prompt_es}
      </p>

      <div className="flex items-stretch gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type the translation in English..."
          className="flex-1 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3 text-base outline-none focus:border-[#1CB0F6] focus:bg-white"
        />
        {status === "idle" ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!value.trim()}
            className="rounded-xl bg-[#58CC02] px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#46a302] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_#46a302] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-100 disabled:shadow-[0_3px_0_#bdbdbd]"
          >
            Check
          </button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-300"
          >
            Otra vez
          </button>
        )}
      </div>

      {status === "correct" ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#58CC02]/10 px-3 py-2 text-sm font-semibold text-[#46a302]">
          <Check className="h-4 w-4" />
          ¡Excelente! · {exercise.answer_en}
        </div>
      ) : null}
      {status === "incorrect" ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#E5495D]/10 px-3 py-2 text-sm font-semibold text-[#E5495D]">
          <X className="h-4 w-4" />
          La respuesta correcta es: {exercise.answer_en}
        </div>
      ) : null}

      {exercise.hint && status === "idle" ? (
        <p className="mt-2 text-xs italic text-neutral-400">💡 {exercise.hint}</p>
      ) : null}
    </motion.div>
  );
}
