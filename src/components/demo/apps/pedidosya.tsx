"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { TwinBadge } from "../twin-badge";

interface AppProps {
  connected: boolean;
}

const generic = [
  { name: "Pizza Muzza Grande", place: "Kentucky", price: "$8.900", emoji: "🍕" },
  { name: "Hamburguesa Cheddar", place: "Mostaza", price: "$6.500", emoji: "🍔" },
  { name: "Empanadas x12", place: "La Continental", price: "$7.200", emoji: "🥟" },
  { name: "Helado 1kg", place: "Grido", price: "$4.800", emoji: "🍦" },
  { name: "Milanesa Napolitana", place: "El Club de la Mila", price: "$9.400", emoji: "🥩" },
  { name: "Sushi Combo 30 piezas", place: "Sushi Pop", price: "$12.500", emoji: "🍣" },
];

const personalized = [
  { name: "Ramen Tonkotsu", place: "Niko Sushi & Ramen", price: "$11.200", emoji: "🍜", tag: "Tu favorito" },
  { name: "Omakase 12 piezas", place: "Furusato", price: "$18.900", emoji: "🍣", tag: "Premium asiático" },
  { name: "Dim Sum Selection", place: "Chuko", price: "$9.800", emoji: "🥟", tag: "Cantonés" },
  { name: "Bibimbap + Banchan", place: "Bi Won", price: "$10.500", emoji: "🍲", tag: "Coreano" },
  { name: "Kit Pad Thai (cocinar)", place: "Cocina en Casa", price: "$6.900", emoji: "🥡", tag: "Lo cocinás vos" },
  { name: "Pad See Ew", place: "Green Bamboo", price: "$8.400", emoji: "🍝", tag: "Tailandés" },
];

export function PedidosYaMock({ connected }: AppProps) {
  const items = connected ? personalized : generic;
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <Image src="/integrations/pedidosya.png" alt="PedidosYa" width={28} height={28} className="rounded-md" />
          <span className="text-base font-black text-[#E2231A]">PedidosYa</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span>📍 Palermo, CABA</span>
          <span className="rounded-md bg-[#E2231A] px-2 py-0.5 text-white">Carrito · 0</span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-5 pt-4 pb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={connected ? "p-hero" : "g-hero"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900">
                {connected ? "Tu cena perfecta esta noche" : "Las más pedidas en tu zona"}
              </h2>
              <p className="text-xs text-zinc-500">
                {connected ? "Asia · cocinar en casa · sushi premium" : "Top elegidos por usuarios cerca tuyo"}
              </p>
            </div>
            {connected && <TwinBadge text="Cocina + Asia" />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Categories pills */}
      <div className="flex flex-wrap gap-2 px-5 py-3">
        {(connected
          ? ["Asiático", "Cocinar en casa", "Premium", "Saludable", "Bowls", "Postres"]
          : ["Pizza", "Hamburguesas", "Sushi", "Postres", "Saludable", "Helados"]).map((c, i) => (
          <motion.span
            key={`${connected}-${c}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            className={`inline-flex shrink-0 items-center rounded-full border px-3 py-2 text-[11px] font-medium leading-none ${
              i === 0
                ? "border-[#E2231A] bg-[#FEEAEA] text-[#E2231A]"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            {c}
          </motion.span>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-3 gap-3 px-5 pb-5">
        {items.map((item, i) => (
          <motion.div
            key={`${connected}-${item.name}`}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="overflow-hidden rounded-lg border border-zinc-100 bg-white"
          >
            <div className="flex h-20 items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 text-3xl">
              {item.emoji}
            </div>
            <div className="space-y-0.5 px-2.5 py-2">
              {connected && "tag" in item && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#E2231A]">
                  {(item as { tag: string }).tag}
                </span>
              )}
              <p className="line-clamp-1 text-[11px] font-bold text-zinc-900">{item.name}</p>
              <p className="text-[9px] text-zinc-500">{item.place}</p>
              <p className="text-[11px] font-extrabold text-zinc-900">{item.price}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Banner promo — fills remaining vertical space */}
      <div className="flex-1 px-5 pb-5">
        <div className={`flex h-full items-center justify-between rounded-xl px-5 py-4 ${
          connected
            ? "bg-gradient-to-r from-amber-50 to-rose-50 ring-1 ring-amber-200"
            : "bg-gradient-to-r from-red-50 to-orange-50 ring-1 ring-red-100"
        }`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#E2231A]">
              {connected ? "Recomendación de tu Twin" : "Promo del día"}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-zinc-900">
              {connected
                ? "Cocina coreana en casa · 25% off"
                : "Envío gratis en tu primer pedido"}
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-600">
              {connected
                ? "Bi Won + Ssam · ingredientes para preparar bibimbap"
                : "Hasta $3.000 en compras de $8.000+"}
            </p>
          </div>
          <span className="text-3xl">{connected ? "🥢" : "🚀"}</span>
        </div>
      </div>
    </div>
  );
}
