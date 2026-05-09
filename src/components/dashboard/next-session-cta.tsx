import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NextSessionCTA({
  nextSessionIndex,
  totalSessions = 8,
}: {
  nextSessionIndex: number;
  totalSessions?: number;
}) {
  const isStart = nextSessionIndex === 0;
  const isComplete = nextSessionIndex >= totalSessions;

  if (isComplete) {
    return (
      <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
        <Link href="/training/start">
          <Sparkles className="mr-2 h-4 w-4" />
          Sesión extra
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild size="lg" className="w-full sm:w-auto">
      <Link href="/training/start">
        <Sparkles className="mr-2 h-4 w-4" />
        {isStart ? "Empezar entrenamiento" : "Continuar entrenamiento"}
      </Link>
    </Button>
  );
}
