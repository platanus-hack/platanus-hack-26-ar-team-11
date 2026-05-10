"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { TwinBadge } from "../twin-badge";

interface AppProps {
  connected: boolean;
}

const generic = {
  hero: {
    section: "POLITICS",
    title: "Senate Approves Sweeping Tax Bill After Marathon Session",
    blurb: "The 1,200-page measure passed along party lines after twelve hours of debate.",
    author: "By Carl Hulse · 4h ago",
  },
  side: [
    { section: "ECONOMY", title: "Markets Wobble as Fed Hints at Rate Pause" },
    { section: "WORLD", title: "Brussels Pushes Back Against U.S. Tariffs" },
    { section: "SPORTS", title: "Lakers Trade Rumors Heat Up Ahead of Deadline" },
    { section: "U.S.", title: "California Wildfire Containment Reaches 60%" },
  ],
};

const personalized = {
  hero: {
    section: "ASIA · ARTS",
    title: "Why Tokyo's Tiny Jazz Bars Are Quietly Reinventing the Genre",
    blurb:
      "In basements across Shinjuku, a new generation of musicians is fusing bossa, lo-fi, and Japanese folk into something the world is starting to listen to.",
    author: "By Motoko Rich · Reporting from Tokyo · 2h ago",
  },
  side: [
    { section: "FOOD", title: "The Quiet Revolution of Korean Knife-Making" },
    { section: "ASIA", title: "Bangkok's Street Food, Mapped by a Local Chef" },
    { section: "MUSIC", title: "How K-Pop Studios Rewrote Global Pop Production" },
    { section: "T MAGAZINE", title: "Inside Kyoto's Centuries-Old Tea Houses" },
  ],
};

export function NYTimesMock({ connected }: AppProps) {
  const data = connected ? personalized : generic;
  const popular = connected
    ? [
        { section: "OPINION", title: "What Tokyo's Late-Night Cooks Taught Me About Patience" },
        { section: "ASIA", title: "Why Korean Indie Rock Is Suddenly Everywhere" },
        { section: "FOOD", title: "A Chef's Guide to the Best Ramen Bowls in New York" },
        { section: "STYLE", title: "Inside Porter Robinson's Surprise Tokyo Pop-up" },
      ]
    : [
        { section: "OPINION", title: "Why the Tax Bill Won't Solve What It Promises" },
        { section: "BUSINESS", title: "Tech Layoffs Slow but Hiring Stays Cautious" },
        { section: "U.S.", title: "Storm System Threatens Eastern Seaboard This Weekend" },
        { section: "WORLD", title: "European Leaders Meet to Discuss New Trade Deal" },
      ];
  return (
    <div className="flex h-full flex-col bg-white font-serif">
      {/* Masthead */}
      <div className="border-b border-zinc-300 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            {connected ? "Saturday, May 9, 2026 · For Manuel" : "Saturday, May 9, 2026"}
          </span>
          {connected && <TwinBadge text="Asia · Música · Cocina" />}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <Image src="/integrations/nytimes.png" alt="NYT" width={20} height={20} />
          <h1 className="text-center font-serif text-2xl font-black tracking-tight text-black">
            The New York Times
          </h1>
        </div>
      </div>

      {/* Section nav */}
      <div className="flex justify-center gap-4 border-b border-zinc-200 px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
        {(connected
          ? ["Asia", "Food", "Music", "Arts", "T Magazine"]
          : ["U.S.", "World", "Politics", "Business", "Sports", "Arts"]).map((s, i) => (
          <span key={s} className={i === 0 ? "border-b-2 border-black pb-1 text-black" : ""}>
            {s}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-5 gap-4 px-5 py-4">
        <AnimatePresence mode="wait">
          <motion.article
            key={connected ? "nyt-hero-c" : "nyt-hero-g"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="col-span-3"
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#A41E22]">
              {data.hero.section}
            </p>
            <h2 className="mt-1 font-serif text-xl font-black leading-tight text-black">
              {data.hero.title}
            </h2>
            <p className="mt-2 text-[11px] leading-snug text-zinc-700">{data.hero.blurb}</p>
            <p className="mt-2 text-[9px] uppercase tracking-wider text-zinc-500">
              {data.hero.author}
            </p>
            <div className="mt-3 h-28 rounded-sm bg-gradient-to-br from-zinc-200 to-zinc-300" />
          </motion.article>
        </AnimatePresence>

        <div className="col-span-2 space-y-3 border-l border-zinc-200 pl-4">
          {data.side.map((item, i) => (
            <motion.article
              key={`${connected}-${item.title}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="border-b border-zinc-100 pb-2 last:border-0"
            >
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#A41E22]">
                {item.section}
              </p>
              <p className="mt-0.5 font-serif text-[12px] font-bold leading-tight text-black">
                {item.title}
              </p>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Most read strip — fills bottom */}
      <div className="flex-1 border-t-2 border-black px-5 py-3">
        <p className="mb-2 text-center font-serif text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">
          {connected ? "Most read in your topics" : "Most popular"}
        </p>
        <div className="grid grid-cols-4 gap-3">
          {popular.map((p, i) => (
            <motion.div
              key={`${connected}-${p.title}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2, duration: 0.3 }}
            >
              <p className="font-sans text-[8px] font-black tracking-wider text-[#A41E22]">
                {String(i + 1).padStart(2, "0")} · {p.section}
              </p>
              <p className="mt-1 font-serif text-[11px] font-bold leading-tight text-black">
                {p.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
