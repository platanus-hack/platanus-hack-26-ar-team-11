"use client";

import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";

function initialsOf(value: string | null): string {
  if (!value) return "T";
  const parts = value.trim().split(/[@\s.]+/).filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

export function UserMenu({ email, name }: { email: string | null; name?: string | null }) {
  const display = name ?? email ?? "Tu cuenta";
  const initials = initialsOf(name ?? email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Abrir menú de ${display}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary outline-none transition-colors hover:bg-primary/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 border-border bg-card text-card-foreground shadow-xl"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{name ?? email ?? "Tu cuenta"}</span>
          {email && name && (
            <span className="text-xs text-muted-foreground">{email}</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex w-full cursor-pointer items-center">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
