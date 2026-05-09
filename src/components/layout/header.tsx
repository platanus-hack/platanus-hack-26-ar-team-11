import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/server";
import { signOutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export async function Header({ variant = "default" }: { variant?: "default" | "minimal" | "auth" }) {
  const user = variant === "minimal" ? null : await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary" />
          <span>Twin Protocol</span>
        </Link>

        {variant === "default" && (
          <nav className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/connected-apps" className="text-muted-foreground hover:text-foreground">
                  Apps
                </Link>
                <form action={signOutAction}>
                  <Button type="submit" variant="ghost" size="sm">
                    Logout
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                  Login
                </Link>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Crear mi Twin</Link>
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
