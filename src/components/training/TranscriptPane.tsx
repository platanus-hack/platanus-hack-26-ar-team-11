"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface TranscriptItem {
  role: "user" | "assistant";
  at: string;
  text: string;
}

export function TranscriptPane({ items }: { items: TranscriptItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-xs text-neutral-500">
        El transcript aparece acá apenas empiezan a hablar.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4 text-sm"
    >
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li
            key={`${item.at}-${idx}`}
            className={cn(
              "leading-snug",
              item.role === "assistant"
                ? "text-neutral-900"
                : "text-neutral-600"
            )}
          >
            <span className="mr-2 text-[10px] uppercase tracking-wider text-neutral-400">
              {item.role === "assistant" ? "Cami" : "Vos"}
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
