import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Toaster />
    </>
  );
}
