"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname() ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Menu className="h-6 w-6" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-56 border-border bg-card text-card-foreground shadow-xl"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <DropdownMenuItem key={item.href} asChild className="cursor-pointer">
              <Link
                href={item.href}
                className={cn(active && "bg-primary/10 font-medium text-primary")}
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
