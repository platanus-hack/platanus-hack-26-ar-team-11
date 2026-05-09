"use client";

import Link from "next/link";
import { LogOut, Settings, UserCog } from "lucide-react";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import type { AvatarConfig } from "@/types/avatar";

export function UserMenu({
  email,
  name,
  avatarConfig,
  avatarSeed,
}: {
  email: string | null;
  name?: string | null;
  avatarConfig?: AvatarConfig | null;
  avatarSeed?: string;
}) {
  const display = name ?? email ?? "Tu cuenta";
  const triggerAvatarConfig: AvatarConfig | null = avatarConfig
    ? { ...avatarConfig, backgroundColor: "transparent" }
    : null;
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Abrir menú de ${display}`}
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-transparent outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <UserAvatar
            config={triggerAvatarConfig}
            seed={avatarSeed ?? email ?? "twin"}
            ariaLabel={display}
            className="h-full w-full"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 border-border bg-card text-card-foreground shadow-xl"
      >
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/avatar">
            <UserCog className="mr-2 h-4 w-4" />
            Personalizar perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onSelect={(event) => {
            event.preventDefault();
            startTransition(() => {
              signOutAction();
            });
          }}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
