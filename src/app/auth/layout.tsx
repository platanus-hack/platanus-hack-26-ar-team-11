import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="auth" />
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <Toaster />
    </>
  );
}
