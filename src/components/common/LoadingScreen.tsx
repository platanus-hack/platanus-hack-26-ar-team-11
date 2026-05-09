import { Loader2 } from "lucide-react";

export function LoadingScreen({
  title = "Procesando lo que charlaron…",
  body = "Tu Twin está aprendiendo de la sesión. Esto suele tardar unos segundos.",
}: {
  title?: string;
  body?: string;
} = {}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-neutral-600">{body}</p>
    </div>
  );
}
