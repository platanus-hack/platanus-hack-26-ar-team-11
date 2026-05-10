"use client";

import { motion } from "motion/react";
import Image from "next/image";

interface TwinBadgeProps {
  text?: string;
  className?: string;
}

export function TwinBadge({ text = "Curado por tu Twin", className }: TwinBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-sm ring-1 ring-amber-500/40 ${className ?? ""}`}
    >
      <Image src="/logo.svg" alt="" width={12} height={12} className="h-3 w-3" />
      {text}
    </motion.div>
  );
}
