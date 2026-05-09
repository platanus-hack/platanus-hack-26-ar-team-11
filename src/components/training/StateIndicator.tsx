"use client";

import { cn } from "@/lib/utils";

export type AgentState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "initializing";

const LABELS: Record<AgentState, string> = {
  idle: "En reposo",
  listening: "Escuchando",
  thinking: "Pensando",
  speaking: "Hablando",
  initializing: "Iniciando",
};

const COLORS: Record<AgentState, string> = {
  idle: "bg-neutral-400",
  listening: "bg-emerald-500 animate-pulse",
  thinking: "bg-amber-500 animate-pulse",
  speaking: "bg-sky-500 animate-pulse",
  initializing: "bg-neutral-300 animate-pulse",
};

export function StateIndicator({ state }: { state: AgentState }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1 text-xs text-neutral-700 backdrop-blur">
      <span className={cn("h-2 w-2 rounded-full", COLORS[state])} />
      <span>{LABELS[state]}</span>
    </div>
  );
}
