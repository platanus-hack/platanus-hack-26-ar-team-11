import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twin Protocol",
  description: "Your AI self, connected to every app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
