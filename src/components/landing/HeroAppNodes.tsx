"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface AppItem {
  id: string;
  src: string;
  label: string;
}

const APP_POOL: AppItem[] = [
  { id: "spotify", src: "/integrations/spotify.png", label: "Spotify" },
  { id: "netflix", src: "/integrations/netflix.png", label: "Netflix" },
  { id: "airbnb", src: "/integrations/airbnb.png", label: "Airbnb" },
  { id: "amazon", src: "/integrations/amazon.png", label: "Amazon" },
  { id: "rappi", src: "/integrations/rappi.png", label: "Rappi" },
  { id: "mercadolibre", src: "/integrations/mercadolibre.png", label: "Mercado Libre" },
  { id: "linkedin", src: "/integrations/linkedin.png", label: "LinkedIn" },
  { id: "youtube-music", src: "/integrations/youtube-music.png", label: "YouTube Music" },
  { id: "disney-plus", src: "/integrations/disney-plus.png", label: "Disney+" },
  { id: "pedidosya", src: "/integrations/pedidosya.png", label: "PedidosYa" },
  { id: "duolingo", src: "/integrations/duolingo.png", label: "Duolingo" },
  { id: "coursera", src: "/integrations/coursera.png", label: "Coursera" },
  { id: "perplexity", src: "/integrations/perplexity.png", label: "Perplexity" },
  { id: "booking", src: "/integrations/booking.png", label: "Booking" },
  { id: "despegar", src: "/integrations/despegar.png", label: "Despegar" },
  { id: "kayak", src: "/integrations/kayak.png", label: "Kayak" },
  { id: "shein", src: "/integrations/shein.png", label: "Shein" },
  { id: "zara", src: "/integrations/zara.png", label: "Zara" },
  { id: "thefork", src: "/integrations/thefork.png", label: "TheFork" },
  { id: "zonaprop", src: "/integrations/zonaprop.png", label: "Zonaprop" },
];

const SLOT_CLASSES = [
  "hero-app-node hero-app-node--a",
  "hero-app-node hero-app-node--b",
  "hero-app-node hero-app-node--c",
  "hero-app-node hero-app-node--d",
];

const CYCLE_INTERVAL_MS = 2200;
const EXIT_DURATION_MS = 350;

interface SlotState {
  app: AppItem;
  pending: AppItem | null;
  exiting: boolean;
  cycleKey: number;
}

export function HeroAppNodes() {
  const [slots, setSlots] = useState<SlotState[]>(() =>
    APP_POOL.slice(0, SLOT_CLASSES.length).map((app) => ({
      app,
      pending: null,
      exiting: false,
      cycleKey: 0,
    })),
  );

  useEffect(() => {
    let cycle = 0;
    const interval = window.setInterval(() => {
      const slotIdx = cycle % SLOT_CLASSES.length;
      cycle += 1;

      setSlots((prev) => {
        const visibleIds = new Set(prev.map((s) => s.app.id));
        const candidates = APP_POOL.filter((a) => !visibleIds.has(a.id));
        if (candidates.length === 0) return prev;
        const next = candidates[Math.floor(Math.random() * candidates.length)]!;
        return prev.map((slot, i) =>
          i === slotIdx ? { ...slot, exiting: true, pending: next } : slot,
        );
      });

      window.setTimeout(() => {
        setSlots((prev) =>
          prev.map((slot, i) => {
            if (i !== slotIdx || !slot.pending) return slot;
            return {
              app: slot.pending,
              pending: null,
              exiting: false,
              cycleKey: slot.cycleKey + 1,
            };
          }),
        );
      }, EXIT_DURATION_MS);
    }, CYCLE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      {slots.map((slot, i) => {
        const { src, label } = slot.app;
        const iconClass = `hero-app-node-icon${slot.exiting ? " is-exiting" : ""}`;
        return (
          <span key={i} className={SLOT_CLASSES[i]} aria-label={label} role="img">
            <span className="hero-app-node-floater">
              <span key={slot.cycleKey} className={iconClass}>
                <Image
                  src={src}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              </span>
            </span>
          </span>
        );
      })}
    </>
  );
}
