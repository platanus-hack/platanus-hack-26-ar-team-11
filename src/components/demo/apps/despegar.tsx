"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { TwinBadge } from "../twin-badge";

interface AppProps {
  connected: boolean;
}

const generic = [
  { city: "Bariloche", country: "Argentina", price: "USD 280", nights: "5 noches", img: "🏔️" },
  { city: "Cancún", country: "México", price: "USD 920", nights: "7 noches · all incl.", img: "🏖️" },
  { city: "Madrid", country: "España", price: "USD 1.150", nights: "8 noches", img: "🏛️" },
  { city: "Río de Janeiro", country: "Brasil", price: "USD 480", nights: "5 noches", img: "🌴" },
];

const personalized = [
  {
    city: "Tokio",
    country: "Japón",
    price: "USD 2.140",
    nights: "10 noches · vuelo + hotel",
    img: "🗼",
    extra: "Curso de sushi en Tsukiji incluido",
  },
  {
    city: "Kioto",
    country: "Japón",
    price: "USD 1.890",
    nights: "7 noches · ryokan tradicional",
    img: "⛩️",
    extra: "Tour del té matcha en Uji",
  },
  {
    city: "Bangkok",
    country: "Tailandia",
    price: "USD 1.420",
    nights: "8 noches · vuelo + hotel",
    img: "🛕",
    extra: "Cooking class · Pad Thai auténtico",
  },
  {
    city: "Seúl",
    country: "Corea del Sur",
    price: "USD 1.680",
    nights: "7 noches · barrio Hongdae",
    img: "🏙️",
    extra: "Festival de música indie en Mapo",
  },
];

export function DespegarMock({ connected }: AppProps) {
  const trips = connected ? personalized : generic;
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top nav */}
      <div className="flex items-center justify-between bg-[#FFCC02] px-5 py-2.5">
        <div className="flex items-center gap-2">
          <Image src="/integrations/despegar.png" alt="Despegar" width={26} height={26} className="rounded-md" />
          <span className="text-base font-black text-[#00264B]">Despegar</span>
        </div>
        <nav className="flex gap-4 text-[11px] font-semibold text-[#00264B]">
          <span>Vuelos</span>
          <span>Hoteles</span>
          <span>Paquetes</span>
          <span>Autos</span>
        </nav>
      </div>

      {/* Search bar */}
      <div className="border-b border-black/5 bg-[#FFE57F] px-5 py-3">
        <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-[11px] text-zinc-500 ring-1 ring-black/5">
          <span>🛫</span>
          <span className="text-zinc-700">Buenos Aires</span>
          <span>→</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={connected ? "to-asia" : "to-default"}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.3 }}
              className="font-semibold text-[#00264B]"
            >
              {connected ? "Tokio, Japón" : "Elegí destino"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={connected ? "d-hero" : "d-generic"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <h2 className="text-lg font-extrabold text-[#00264B]">
              {connected ? "Tu próximo viaje a Asia" : "Destinos populares"}
            </h2>
            <p className="text-xs text-zinc-500">
              {connected ? "Salidas Sept · Oct · Nov · Diciembre" : "Lo más buscado esta semana"}
            </p>
          </motion.div>
        </AnimatePresence>
        {connected && <TwinBadge text="Asia + gastronomía + música" />}
      </div>

      {/* Trip cards */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        {trips.map((trip, i) => (
          <motion.div
            key={`${connected}-${trip.city}`}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
          >
            <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[#FFCC02]/30 to-[#00264B]/10 text-5xl">
              {trip.img}
            </div>
            <div className="space-y-1 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-[#00264B]">{trip.city}</p>
                <p className="text-[10px] text-zinc-500">{trip.country}</p>
              </div>
              <p className="text-[10px] text-zinc-500">{trip.nights}</p>
              {connected && "extra" in trip && (
                <p className="text-[10px] font-semibold text-[#E2231A]">
                  ✦ {(trip as { extra: string }).extra}
                </p>
              )}
              <p className="pt-1 text-base font-black text-[#00264B]">{trip.price}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom inspiration strip — fills remaining */}
      <div className="flex-1 border-t border-black/5 px-5 py-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#00264B]">
          {connected ? "Inspiración para tu próximo viaje" : "Más destinos"}
        </p>
        <div className="flex h-full gap-2 pb-3">
          {(connected
            ? [
                { c: "Osaka", e: "🏯" },
                { c: "Hanói", e: "🍜" },
                { c: "Singapur", e: "🌆" },
                { c: "Hong Kong", e: "🥟" },
                { c: "Taipei", e: "🥡" },
              ]
            : [
                { c: "Mendoza", e: "🍷" },
                { c: "Punta del Este", e: "🏖️" },
                { c: "Salvador", e: "🌴" },
                { c: "Lima", e: "🌶️" },
                { c: "Santiago", e: "⛰️" },
              ]
          ).map((d) => (
            <div
              key={d.c}
              className="flex-1 rounded-lg bg-gradient-to-br from-[#FFCC02]/30 to-[#00264B]/10 p-2"
            >
              <div className="text-2xl">{d.e}</div>
              <p className="mt-0.5 text-[10px] font-bold text-[#00264B]">{d.c}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
