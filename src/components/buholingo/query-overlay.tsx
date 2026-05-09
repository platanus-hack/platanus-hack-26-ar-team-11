"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

interface QueryOverlayProps {
  open: boolean;
}

interface Beat {
  question: string;
  answer: string;
  delay: number;
}

const BEATS: Beat[] = [
  {
    question: "¿Qué le interesa a esta persona?",
    answer: "Música indie, recitales chicos, una vibe introspectiva.",
    delay: 0.2,
  },
  {
    question: "¿Qué artistas escucha?",
    answer: "Tormenta Negra, Los Solitarios, Aurora Vega.",
    delay: 1.6,
  },
  {
    question: "¿Cómo le gusta aprender?",
    answer: "Le copa lo escrito, no le gusta hablar al pedo.",
    delay: 3.0,
  },
];

const TOTAL_DURATION = 4.6;

export function QueryOverlay({ open }: QueryOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e132a]/80 backdrop-blur-sm"
        >
          <div className="relative flex w-full max-w-3xl flex-col items-center gap-8 px-6">
            {/* Logos with channel between them */}
            <div className="flex w-full items-center justify-between">
              <LogoBadge
                src="/integrations/buholingo.png"
                label="Buholingo"
                accent="#58CC02"
              />
              <PulseChannel />
              <TwinBadge />
            </div>

            {/* Beats */}
            <div className="relative h-44 w-full max-w-2xl">
              {BEATS.map((beat, i) => (
                <BeatRow key={i} beat={beat} index={i} total={BEATS.length} />
              ))}
            </div>

            {/* Bottom progress */}
            <div className="flex w-full max-w-md items-center gap-3 text-white/80">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                <motion.div
                  className="h-full bg-[#FFD700]"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: TOTAL_DURATION, ease: "linear" }}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest">
                Personalizando
              </span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LogoBadge({
  src,
  label,
  accent,
}: {
  src: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-2xl border-4 shadow-2xl"
        style={{ borderColor: accent }}
      >
        <Image src={src} alt={label} width={88} height={88} />
      </motion.div>
      <span className="text-xs font-bold uppercase tracking-widest text-white/80">
        {label}
      </span>
    </div>
  );
}

function TwinBadge() {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.05, 1], opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex h-22 w-22 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#A39DB3] bg-[#212842] shadow-2xl"
        style={{ width: 88, height: 88 }}
      >
        <span className="text-3xl font-extrabold lowercase text-white">twin</span>
        <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-[#A39DB3]" />
      </motion.div>
      <span className="text-xs font-bold uppercase tracking-widest text-white/80">
        Twin Protocol
      </span>
    </div>
  );
}

function PulseChannel() {
  return (
    <div className="relative mx-4 h-1 flex-1 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
        animate={{ x: ["-50%", "250%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function BeatRow({ beat, index, total }: { beat: Beat; index: number; total: number }) {
  void total;
  const baseY = index * 56;
  return (
    <>
      {/* Question — flies from left to right */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: baseY }}
        animate={{ opacity: [0, 1, 1, 0.4], x: [-30, 0, 240, 320], y: baseY }}
        transition={{
          duration: 1.0,
          delay: beat.delay,
          times: [0, 0.2, 0.85, 1],
          ease: "easeOut",
        }}
        className="absolute left-0 max-w-[55%] rounded-2xl rounded-bl-sm bg-[#58CC02] px-4 py-2 text-sm font-semibold text-white shadow-lg"
        style={{ top: 0 }}
      >
        {beat.question}
      </motion.div>

      {/* Answer — flies from right to left */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: baseY + 22 }}
        animate={{ opacity: [0, 1, 1, 0.4], x: [30, 0, -240, -320], y: baseY + 22 }}
        transition={{
          duration: 1.0,
          delay: beat.delay + 0.7,
          times: [0, 0.2, 0.85, 1],
          ease: "easeOut",
        }}
        className="absolute right-0 max-w-[55%] rounded-2xl rounded-br-sm bg-white/95 px-4 py-2 text-right text-sm font-semibold text-[#212842] shadow-lg"
        style={{ top: 0 }}
      >
        {beat.answer}
      </motion.div>
    </>
  );
}
