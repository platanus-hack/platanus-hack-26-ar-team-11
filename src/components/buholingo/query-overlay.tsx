"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { TwinPreview } from "@/lib/buholingo/format";

interface QueryOverlayProps {
  open: boolean;
  /** Real previews fetched from Twin. Null = still querying. */
  previews: TwinPreview[] | null;
}

const QUERIES_END = 4.8;
const TOTAL_DURATION = 6.5;

export function QueryOverlay({ open, previews }: QueryOverlayProps) {
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
          <div className="relative flex w-full max-w-3xl flex-col items-center gap-10 px-6">
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

            <div className="relative h-72 w-full max-w-2xl">
              <AnimatePresence mode="wait">
                {previews ? (
                  <motion.div
                    key="beats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {previews.map((p, i) => (
                      <BeatRow key={i} preview={p} index={i} />
                    ))}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: QUERIES_END }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white shadow-lg backdrop-blur">
                        <Loader2 className="h-5 w-5 animate-spin text-[#FFD700]" />
                        <span className="text-base font-semibold">
                          Generando contenido personalizado…
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="querying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80"
                  >
                    <Loader2 className="h-7 w-7 animate-spin text-[#FFD700]" />
                    <span className="text-base font-semibold">
                      Consultando tu Twin…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
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
        className="relative flex items-center justify-center overflow-hidden rounded-2xl border-4 border-[#A39DB3] bg-[#FAF5EA] shadow-2xl"
        style={{ width: 168, height: 88 }}
      >
        <Image
          src="/logo.svg"
          alt="Twin Protocol"
          width={2444}
          height={1112}
          unoptimized
          className="h-12 w-auto"
        />
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

function BeatRow({ preview, index }: { preview: TwinPreview; index: number }) {
  const baseY = index * 88;
  const beatDelay = 0.2 + index * 1.4;
  return (
    <>
      {/* Question — flies from left to right */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: baseY }}
        animate={{ opacity: [0, 1, 1, 0], x: [-30, 0, 240, 320], y: baseY }}
        transition={{
          duration: 1.0,
          delay: beatDelay,
          times: [0, 0.2, 0.85, 1],
          ease: "easeOut",
        }}
        className="absolute left-0 max-w-[55%] rounded-2xl rounded-bl-sm bg-[#58CC02] px-4 py-2 text-sm font-semibold text-white shadow-lg"
        style={{ top: 0 }}
      >
        {preview.question}
      </motion.div>

      {/* Answer — flies from right to left */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: baseY + 38 }}
        animate={{ opacity: [0, 1, 1, 0], x: [30, 0, -240, -320], y: baseY + 38 }}
        transition={{
          duration: 1.0,
          delay: beatDelay + 0.7,
          times: [0, 0.2, 0.85, 1],
          ease: "easeOut",
        }}
        className="absolute right-0 max-w-[55%] rounded-2xl rounded-br-sm bg-white/95 px-4 py-2 text-right text-sm font-semibold text-[#212842] shadow-lg"
        style={{ top: 0 }}
      >
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#A39DB3]">
          {preview.title}
        </span>
        <span>{preview.answer}</span>
      </motion.div>
    </>
  );
}
