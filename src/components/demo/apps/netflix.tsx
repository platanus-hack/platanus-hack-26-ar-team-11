"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { TwinBadge } from "../twin-badge";

interface AppProps {
  connected: boolean;
}

const generic = {
  hero: {
    title: "Stranger Things 5",
    tag: "Tendencia · #1 Argentina",
    desc: "El último capítulo de la serie más vista del año. Hawkins enfrenta su batalla final.",
    bg: "from-purple-900 via-zinc-900 to-black",
  },
  rows: [
    {
      label: "Tendencias en Argentina",
      items: ["Wednesday", "La Casa de Papel", "Squid Game", "El Eternauta", "Lupin"],
    },
    {
      label: "Series populares",
      items: ["Bridgerton", "Emily in Paris", "Ozark", "The Crown", "You"],
    },
  ],
};

const personalized = {
  hero: {
    title: "Midnight Diner: Tokyo Stories",
    tag: "Para Manuel · Cocina + Asia",
    desc: "En un pequeño restaurante de Shinjuku, el chef escucha la historia detrás de cada plato. Slow, contemplativo, exquisito.",
    bg: "from-amber-900 via-zinc-900 to-black",
  },
  rows: [
    {
      label: "Porque amás la comida asiática",
      items: ["Street Food: Asia", "Chef's Table: BBQ", "Samurai Gourmet", "Ugly Delicious", "The Birth of Saké"],
    },
    {
      label: "Cine japonés y coreano que te puede gustar",
      items: ["Drive My Car", "Bloodhounds", "Past Lives", "Decision to Leave", "Burning"],
    },
  ],
};

export function NetflixMock({ connected }: AppProps) {
  const data = connected ? personalized : generic;
  return (
    <div className="flex h-full flex-col bg-black text-white">
      {/* Top nav */}
      <div className="flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-5 py-3">
        <div className="flex items-center gap-4">
          <Image src="/integrations/netflix.png" alt="Netflix" width={70} height={20} className="h-5 w-auto" />
          <nav className="flex gap-3 text-[11px] text-white/80">
            <span>Inicio</span>
            <span>Series</span>
            <span>Películas</span>
            <span>Mi lista</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {connected && <TwinBadge text="Tu Twin curó esto" />}
          <div className="h-6 w-6 rounded bg-gradient-to-br from-amber-400 to-red-500" />
        </div>
      </div>

      {/* Hero */}
      <AnimatePresence mode="wait">
        <motion.div
          key={connected ? "nf-c" : "nf-g"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative h-32 bg-gradient-to-br ${data.hero.bg} px-5 py-4`}
        >
          <div className="relative z-10 max-w-md">
            <p className="text-[9px] font-bold uppercase tracking-widest text-red-500">
              {data.hero.tag}
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight">{data.hero.title}</h2>
            <p className="mt-2 line-clamp-2 text-[11px] text-white/80">{data.hero.desc}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded bg-white px-3 py-1 text-[10px] font-bold text-black">
                ▶ Reproducir
              </button>
              <button className="rounded bg-white/20 px-3 py-1 text-[10px] font-bold text-white backdrop-blur">
                + Mi lista
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Rows */}
      <div className="flex flex-1 flex-col justify-start gap-3 px-5 pb-5 pt-6">
        {data.rows.map((row, ri) => (
          <div key={`${connected}-${row.label}`}>
            <p className="mb-1.5 text-[11px] font-bold text-white">{row.label}</p>
            <div className="grid grid-cols-5 gap-2">
              {row.items.map((title, i) => (
                <motion.div
                  key={`${connected}-${title}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: ri * 0.1 + i * 0.04, duration: 0.3 }}
                  className="flex aspect-[16/10] items-end overflow-hidden rounded-md bg-gradient-to-br from-zinc-700 to-zinc-900 p-1.5 text-[8px] font-bold leading-tight text-white"
                  style={{
                    background:
                      ri === 0
                        ? `linear-gradient(135deg, hsl(${(i * 47) % 360} 50% 30%), hsl(${(i * 47 + 60) % 360} 60% 15%))`
                        : `linear-gradient(135deg, hsl(${(i * 73 + 200) % 360} 40% 25%), hsl(${(i * 73 + 260) % 360} 50% 12%))`,
                  }}
                >
                  {title}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
