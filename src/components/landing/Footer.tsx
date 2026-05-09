import Link from "next/link";
import { Github } from "lucide-react";

interface Props {
  isAuthenticated: boolean;
}

export function LandingFooter({ isAuthenticated }: Props) {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center">
        <div>
          <p className="font-semibold text-foreground">Twin</p>
          <p className="mt-1 max-w-md">
            Plataforma para crear, entrenar y compartir tu agente gemelo.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="#como-funciona" className="hover:text-foreground">
            Cómo funciona
          </Link>
          <Link
            href={isAuthenticated ? "/dashboard" : "/auth/signup"}
            className="hover:text-foreground"
          >
            {isAuthenticated ? "Dashboard" : "Crear cuenta"}
          </Link>
          <a
            href="https://github.com/platanus-hack/platanus-hack-26-ar-team-11"
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
