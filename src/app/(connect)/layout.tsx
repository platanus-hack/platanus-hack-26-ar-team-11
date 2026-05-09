import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="minimal" />
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">{children}</div>
      </main>
      <Toaster />
    </>
  );
}
