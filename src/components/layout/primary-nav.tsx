"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Agente" },
  { href: "/skills", label: "Skills" },
  { href: "/sessions", label: "Sesiones" },
  { href: "/connected-apps", label: "Aplicaciones conectadas" },
] as const;

export function PrimaryNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="hidden items-center gap-1 text-sm md:flex">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 transition-colors",
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
