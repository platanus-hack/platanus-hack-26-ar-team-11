"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Agente" },
  { href: "/skills", label: "Skills" },
  { href: "/sessions", label: "Sesiones" },
  { href: "/connected-apps", label: "Aplicaciones" },
] as const;

export function PrimaryNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="hidden items-center gap-1 text-base md:flex">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "min-w-32 rounded-md px-4 py-2.5 text-center transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
