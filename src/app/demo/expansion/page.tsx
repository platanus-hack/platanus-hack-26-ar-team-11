"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { PedidosYaMock } from "@/components/demo/apps/pedidosya";
import { DespegarMock } from "@/components/demo/apps/despegar";
import { NYTimesMock } from "@/components/demo/apps/nytimes";
import { NetflixMock } from "@/components/demo/apps/netflix";

const apps = [
  { id: "pedidosya", name: "PedidosYa", logo: "/integrations/pedidosya.png", accent: "#E2231A", Component: PedidosYaMock, bg: "#ffffff" },
  { id: "despegar", name: "Despegar", logo: "/integrations/despegar.png", accent: "#FFCC02", Component: DespegarMock, bg: "#ffffff" },
  { id: "nytimes", name: "The New York Times", logo: "/integrations/nytimes.png", accent: "#000000", Component: NYTimesMock, bg: "#ffffff" },
  { id: "netflix", name: "Netflix", logo: "/integrations/netflix.png", accent: "#E50914", Component: NetflixMock, bg: "#000000" },
];

const TIMING = {
  default: 1700,
  connecting: 1200,
  connected: 2900,
};

const DESIGN_WIDTH = 768;

type Phase = "default" | "connecting" | "connected";

export default function ExpansionDemoPage() {
  const [appIndex, setAppIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("default");
  const [paused, setPaused] = useState(false);
  const [dim, setDim] = useState({ scale: 2.5, designHeight: 432 });

  // Width-based scaling so the app fills 100vw, with computed design height to fill 100vh
  useEffect(() => {
    const calc = () => {
      const scale = window.innerWidth / DESIGN_WIDTH;
      const designHeight = window.innerHeight / scale;
      setDim({ scale, designHeight });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // Auto-advance: 3s default → 2s connecting → 5s connected → next app (loop forever)
  useEffect(() => {
    if (paused) return;
    const ms =
      phase === "default"
        ? TIMING.default
        : phase === "connecting"
          ? TIMING.connecting
          : TIMING.connected;
    const t = setTimeout(() => {
      if (phase === "default") {
        setPhase("connecting");
      } else if (phase === "connecting") {
        setPhase("connected");
      } else {
        setAppIndex((i) => (i + 1) % apps.length);
        setPhase("default");
      }
    }, ms);
    return () => clearTimeout(t);
  }, [appIndex, phase, paused]);

  // Hidden keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
        return;
      }
      if (e.code === "KeyR") {
        setPaused(true);
        setAppIndex(0);
        setPhase("default");
        return;
      }
      if (e.code === "ArrowRight") {
        if (phase === "default") setPhase("connecting");
        else if (phase === "connecting") setPhase("connected");
        else {
          setAppIndex((i) => (i + 1) % apps.length);
          setPhase("default");
        }
        return;
      }
      if (e.code === "ArrowLeft") {
        if (phase === "connected") setPhase("connecting");
        else if (phase === "connecting") setPhase("default");
        else {
          setAppIndex((i) => (i - 1 + apps.length) % apps.length);
          setPhase("connected");
        }
        return;
      }
      if (e.code >= "Digit1" && e.code <= "Digit5") {
        const i = parseInt(e.code.replace("Digit", ""), 10) - 1;
        if (i < apps.length) {
          setAppIndex(i);
          setPhase("default");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const current = apps[appIndex];
  const connected = phase === "connected";

  return (
    <main
      className="relative h-screen w-screen overflow-hidden"
      style={{ backgroundColor: current.bg }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            height: dim.designHeight,
            transform: `scale(${dim.scale})`,
            backgroundColor: current.bg,
          }}
        >
          <current.Component connected={connected} />
        </motion.div>
      </AnimatePresence>

      {/* Connecting overlay (between default → connected) */}
      <AnimatePresence>
        {phase === "connecting" && (
          <ConnectingOverlay
            key={`connecting-${current.id}`}
            appLogo={current.logo}
            appName={current.name}
            accent={current.accent}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function ConnectingOverlay({
  appLogo,
  appName,
  accent,
}: {
  appLogo: string;
  appName: string;
  accent: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/85 backdrop-blur-md"
    >
      <div className="flex items-center gap-10">
        {/* App logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, x: -16 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 bg-white shadow-2xl"
          style={{ borderColor: accent, boxShadow: `0 0 60px ${accent}55` }}
        >
          <Image src={appLogo} alt={appName} width={96} height={96} className="rounded-2xl" />
        </motion.div>

        {/* Pulse channel */}
        <div className="relative h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
            animate={{ x: ["-50%", "200%"] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Twin badge — brand colors */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, x: 16 }}
          animate={{ scale: [0.5, 1.08, 1], opacity: 1, x: 0 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="flex items-center justify-center overflow-hidden rounded-3xl border-4 border-[#A39DB3] bg-[#FAF5EA] shadow-[0_0_60px_rgba(163,157,179,0.5)]"
          style={{ width: 224, height: 128 }}
        >
          <Image
            src="/logo.svg"
            alt="Twin Protocol"
            width={2444}
            height={1112}
            unoptimized
            className="h-16 w-auto"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
