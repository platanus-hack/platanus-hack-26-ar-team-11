import type { Metadata } from "next";
import { LessonScreen } from "@/components/buholingo/lesson-screen";

export const metadata: Metadata = {
  title: "Buholingo — Aprende como te gusta",
  description:
    "Lecciones de inglés armadas alrededor de tus gustos, conectando tu Twin.",
};

export default function BuholingoPage() {
  return <LessonScreen />;
}
