"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Progreso (0..1) del scroll dentro de un contenedor sticky.
 * 0 cuando el top del elemento toca el top del viewport;
 * 1 cuando el bottom del elemento toca el bottom del viewport.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const range = rect.height - vh;
      if (range <= 0) {
        setProgress(rect.top < 0 ? 1 : 0);
        return;
      }
      const scrolled = -rect.top;
      const next = Math.max(0, Math.min(1, scrolled / range));
      setProgress(next);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, progress };
}
