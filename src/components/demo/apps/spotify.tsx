"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { TwinBadge } from "../twin-badge";

interface AppProps {
  connected: boolean;
}

const generic = {
  hero: { title: "Today's Top Hits", subtitle: "Las canciones más escuchadas hoy", n: "50 canciones · 2.7M oyentes" },
  playlists: [
    { name: "Top 50 Argentina", desc: "Lo más viral del país", color: "from-pink-500 to-orange-500" },
    { name: "Pop Latino", desc: "Bad Bunny, Karol G, Feid", color: "from-purple-500 to-pink-500" },
    { name: "Top 100 Global", desc: "Las más escuchadas del mundo", color: "from-blue-500 to-cyan-500" },
    { name: "Reggaetón Hits", desc: "Lo nuevo del género", color: "from-red-500 to-yellow-500" },
    { name: "Rock Clásico", desc: "Los clásicos de siempre", color: "from-zinc-700 to-zinc-900" },
  ],
};

const personalized = {
  hero: {
    title: "Esto es Porter Robinson",
    subtitle: "Tu artista favorito · 312 canciones escuchadas este mes",
    n: "47 esenciales · 3h 12min",
  },
  playlists: [
    { name: "Porter Robinson · SMILE! :D", desc: "Su último álbum, 2024", color: "from-pink-400 to-rose-600" },
    { name: "Nurture · Era completa", desc: "Lo más slow de Porter", color: "from-emerald-400 to-teal-600" },
    { name: "Madeon · Adventure", desc: "Su collab eterno", color: "from-blue-500 to-violet-600" },
    { name: "Shelter & anime OSTs", desc: "El track con A-1 Pictures", color: "from-amber-500 to-orange-600" },
    { name: "Cooking Time", desc: "Lo-fi para la cocina del sábado", color: "from-violet-500 to-fuchsia-600" },
  ],
};

export function SpotifyMock({ connected }: AppProps) {
  const data = connected ? personalized : generic;
  return (
    <div className="flex h-full flex-col bg-[#121212] text-white">
      {/* Top */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <Image src="/integrations/spotify.png" alt="Spotify" width={24} height={24} />
          <span className="text-base font-black">Spotify</span>
        </div>
        <div className="flex items-center gap-2">
          {connected && <TwinBadge text="Porter Robinson · tu favorito" />}
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700" />
        </div>
      </div>

      {/* Hero */}
      <AnimatePresence mode="wait">
        <motion.div
          key={connected ? "sp-c" : "sp-g"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className={`flex items-end gap-4 px-5 py-4 ${
            connected
              ? "bg-gradient-to-b from-fuchsia-700/50 to-transparent"
              : "bg-gradient-to-b from-pink-800/40 to-transparent"
          }`}
        >
          <div
            className={`h-24 w-24 shrink-0 rounded-md bg-gradient-to-br shadow-2xl ${
              connected ? "from-pink-400 via-fuchsia-500 to-rose-600" : "from-pink-400 to-orange-500"
            } flex items-center justify-center text-4xl font-black text-white`}
          >
            {connected ? ":D" : "🔥"}
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">Playlist</p>
            <h2 className="text-2xl font-black leading-tight">{data.hero.title}</h2>
            <p className="mt-1 text-[11px] text-white/70">{data.hero.subtitle}</p>
            <p className="mt-1 text-[10px] text-white/50">Spotify · {data.hero.n}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action row */}
      <div className="flex items-center gap-3 px-5 py-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] text-black">
          ▶
        </button>
        <span className="text-[10px] text-white/60">♡ + ⋯</span>
      </div>

      {/* Playlists row */}
      <div className="px-5 pb-3">
        <p className="mb-2 text-[11px] font-bold">
          {connected ? "Porque te gusta Porter Robinson" : "Recomendadas hoy"}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {data.playlists.map((p, i) => (
            <motion.div
              key={`${connected}-${p.name}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-md bg-white/5 p-2"
            >
              <div className={`mb-1.5 aspect-square w-full rounded bg-gradient-to-br ${p.color}`} />
              <p className="line-clamp-1 text-[10px] font-bold text-white">{p.name}</p>
              <p className="line-clamp-2 text-[8px] text-white/50">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recently played row — fills remaining */}
      <div className="flex-1 px-5 pb-5">
        <p className="mb-2 text-[11px] font-bold">
          {connected ? "Escuchaste recientemente" : "Top escuchados"}
        </p>
        <div className="space-y-1.5">
          {(connected
            ? [
                { t: "Sad Machine", a: "Porter Robinson", n: "Worlds" },
                { t: "Mirror", a: "Porter Robinson", n: "Nurture" },
                { t: "Cheerleader", a: "Porter Robinson", n: "SMILE! :D" },
                { t: "Shelter", a: "Madeon, Porter Robinson", n: "Single" },
              ]
            : [
                { t: "Cruel Summer", a: "Taylor Swift", n: "Lover" },
                { t: "Flowers", a: "Miley Cyrus", n: "Endless Summer" },
                { t: "As It Was", a: "Harry Styles", n: "Harry's House" },
                { t: "Anti-Hero", a: "Taylor Swift", n: "Midnights" },
              ]
          ).map((s, i) => (
            <div
              key={`${connected}-${s.t}`}
              className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-[9px] text-white/50">{i + 1}</span>
                <div
                  className={`h-7 w-7 rounded ${
                    connected
                      ? "bg-gradient-to-br from-pink-400 via-fuchsia-500 to-rose-600"
                      : "bg-gradient-to-br from-pink-400 to-orange-500"
                  }`}
                />
                <div>
                  <p className="text-[10px] font-bold text-white">{s.t}</p>
                  <p className="text-[8px] text-white/50">{s.a}</p>
                </div>
              </div>
              <span className="text-[8px] text-white/40">{s.n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
