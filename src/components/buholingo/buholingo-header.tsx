"use client";

import Image from "next/image";

interface BuholingoHeaderProps {
  rightSlot?: React.ReactNode;
}

export function BuholingoHeader({ rightSlot }: BuholingoHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-[#46a302]/30 bg-[#58CC02] text-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/integrations/buholingo.png"
            alt="Buholingo"
            width={44}
            height={44}
            className="rounded-xl"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-extrabold tracking-tight">Buholingo</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/80">
              Aprende como te gusta
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
