"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { writeStoredConnection } from "@/lib/buholingo/connect";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection_id = params.get("connection_id");
    const access_token = params.get("access_token");
    const denied = params.get("error");

    if (denied) {
      setError("Conexión rechazada. Volvé a Buholingo para intentarlo de nuevo.");
      return;
    }
    if (!connection_id || !access_token) {
      setError("Faltan parámetros de conexión.");
      return;
    }
    writeStoredConnection({ connection_id, access_token });
    router.replace("/buholingo");
  }, [params, router]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src="/integrations/buholingo.png"
        alt="Buholingo"
        width={64}
        height={64}
        className="rounded-2xl"
        priority
      />
      {error ? (
        <p className="max-w-xs text-center text-sm text-red-600">{error}</p>
      ) : (
        <>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#58CC02]" />
          </div>
          <p className="text-sm font-semibold text-neutral-700">
            Recibiendo tu Twin…
          </p>
        </>
      )}
    </div>
  );
}

export default function BuholingoCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8E7]">
      <Suspense
        fallback={
          <div className="text-sm text-neutral-500">Cargando…</div>
        }
      >
        <CallbackInner />
      </Suspense>
    </div>
  );
}
