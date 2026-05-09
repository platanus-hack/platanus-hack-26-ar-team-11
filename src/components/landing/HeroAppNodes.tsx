"use client";

import {
  Music,
  Ticket,
  Plug2,
  ShoppingBag,
  Gamepad2,
  Headphones,
  Camera,
  Pizza,
  Plane,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AppItem {
  id: string;
  Icon: LucideIcon;
  label: string;
}

const APP_POOL: AppItem[] = [
  { id: "allaccess", Icon: Ticket, label: "AllAccess" },
  { id: "music", Icon: Music, label: "App de música" },
  { id: "ecommerce", Icon: ShoppingBag, label: "App de e-commerce" },
  { id: "plug", Icon: Plug2, label: "Otras apps" },
  { id: "games", Icon: Gamepad2, label: "App de gaming" },
  { id: "podcast", Icon: Headphones, label: "App de podcasts" },
  { id: "photos", Icon: Camera, label: "App de fotos" },
  { id: "food", Icon: Pizza, label: "App de delivery" },
  { id: "travel", Icon: Plane, label: "App de viajes" },
  { id: "dating", Icon: Heart, label: "App social" },
];

const SLOT_CLASSES = [
  "hero-app-node hero-app-node--a",
  "hero-app-node hero-app-node--b",
  "hero-app-node hero-app-node--c",
  "hero-app-node hero-app-node--d",
  "hero-app-node hero-app-node--e",
  "hero-app-node hero-app-node--f",
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
        const { Icon, label } = slot.app;
        const iconClass = `hero-app-node-icon${slot.exiting ? " is-exiting" : ""}`;
        return (
          <span key={i} className={SLOT_CLASSES[i]} aria-label={label} role="img">
            <span key={slot.cycleKey} className={iconClass}>
              <Icon className="h-6 w-6" aria-hidden />
            </span>
          </span>
        );
      })}
    </>
  );
}
