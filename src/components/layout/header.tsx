import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { PrimaryNav } from "./primary-nav";
import { MobileNav } from "./mobile-nav";
import type { AvatarConfig } from "@/types/avatar";

export type HeaderVariant = "default" | "minimal" | "auth";

export async function Header({ variant = "default" }: { variant?: HeaderVariant }) {
  const user = variant === "minimal" ? null : await getCurrentUser();
  const name = (user?.user_metadata?.name as string | undefined) ?? null;
  const email = user?.email ?? null;
  const avatarConfig = (user?.user_metadata?.avatar_config as AvatarConfig | undefined) ?? null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="relative flex h-20 w-full items-center gap-2 px-4 sm:gap-4 sm:px-8 md:px-12">
        {variant === "default" && user && <MobileNav className="md:hidden" />}
        <Link
          href={user ? "/dashboard" : "/"}
          aria-label="Twin"
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="Twin"
            width={2444}
            height={1112}
            quality={100}
            priority
            className="h-10 w-auto"
          />
        </Link>

        {variant === "default" && user && (
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <div className="pointer-events-auto">
              <PrimaryNav />
            </div>
          </div>
        )}

        {variant === "default" && (
          <nav className="ml-auto flex items-center gap-7 text-base sm:gap-8">
            {user ? (
              <UserMenu
                email={email}
                name={name}
                avatarConfig={avatarConfig}
                avatarSeed={user?.id}
              />
            ) : (
              <div className="hidden items-center gap-7 sm:flex sm:gap-8">
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                </Link>
                <Button asChild size="lg">
                  <Link href="/auth/signup">Crea tu Twin</Link>
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
