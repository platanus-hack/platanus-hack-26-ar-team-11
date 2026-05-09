import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { PrimaryNav } from "./primary-nav";

export type HeaderVariant = "default" | "minimal" | "auth";

export async function Header({ variant = "default" }: { variant?: HeaderVariant }) {
  const user = variant === "minimal" ? null : await getCurrentUser();
  const name = (user?.user_metadata?.name as string | undefined) ?? null;
  const email = user?.email ?? null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="flex h-20 w-full items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href={user ? "/dashboard" : "/"}
            aria-label="Twin"
            className="flex items-center"
          >
            <Image src="/logo.png" alt="Twin" width={48} height={48} priority />
          </Link>

          {variant === "default" && user && <PrimaryNav />}
        </div>

        {variant === "default" && (
          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <UserMenu email={email} name={name} />
            ) : (
              <>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                </Link>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Crea tu Twin</Link>
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
