import { ArrowRight } from "lucide-react";
import { ContinueTrainingButton } from "@/components/training/ContinueTrainingButton";

export function NextSessionCTA({
  nextSessionIndex,
  totalSessions = 8,
}: {
  nextSessionIndex: number;
  totalSessions?: number;
}) {
  const isStart = nextSessionIndex === 0;
  const isComplete = nextSessionIndex >= totalSessions;

  const label = isComplete
    ? "Sesión extra"
    : isStart
      ? "Iniciar entrenamiento"
      : "Continuar entrenamiento";

  return (
    <ContinueTrainingButton
      size="lg"
      variant={isComplete ? "secondary" : "default"}
      className="w-full sm:w-auto"
    >
      {label}
      <ArrowRight className="ml-2 h-4 w-4" />
    </ContinueTrainingButton>
  );
}
