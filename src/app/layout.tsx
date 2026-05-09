import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Twin",
  description: "Tu yo en IA, conectado a todas tus aplicaciones.",
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
