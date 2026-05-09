import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { HeroAvatar } from "@/components/landing/HeroAvatar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="auth" />
      <main className="grid min-h-[calc(100vh-5rem)] grid-cols-1 md:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-muted/40 md:flex md:flex-col md:items-center md:justify-center md:gap-10 md:px-12 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(212,160,23,0.18),transparent_70%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_30%_at_85%_85%,rgba(163,157,179,0.18),transparent_70%)]"
          />
          <div className="relative">
            <HeroAvatar className="!w-72 lg:!w-80" />
          </div>
          <div className="relative max-w-md text-center">
            <h2 className="text-balance text-3xl font-black leading-tight lg:text-4xl">
              Tu yo digital, conectado a todas tus apps.
            </h2>
            <p className="mt-4 text-base text-muted-foreground lg:text-lg">
              Creá tu Twin una vez y dejá que las apps te entiendan desde el primer click.
            </p>
          </div>
        </aside>
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </main>
      <Toaster />
    </>
  );
}
