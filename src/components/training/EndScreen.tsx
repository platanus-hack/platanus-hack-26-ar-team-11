"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Domain, ExtractedFact, Session } from "@/types";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30_000;

const DOMAIN_LABELS: Record<Domain, string> = {
  music_taste: "Música",
  event_preferences: "Eventos",
  vibes: "Vibes",
  communication_style: "Comunicación",
};

interface SessionResponse {
  session: Session;
  twin: {
    id: string;
    completion_score: number;
    summary: string | null;
    next_session_index: number;
  };
  skills: Array<{ domain: Domain; confidence: number }>;
}

type PollState =
  | { tag: "loading" }
  | { tag: "ready"; data: SessionResponse }
  | { tag: "timeout" }
  | { tag: "error"; message: string };

export function EndScreen({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<PollState>({ tag: "loading" });

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) {
            setState({
              tag: "error",
              message: `Error ${res.status}`,
            });
          }
          return;
        }
        const data = (await res.json()) as SessionResponse;
        if (cancelled) return;

        const facts = (data.session.extracted_facts_json ?? []) as ExtractedFact[];
        const done = facts.length > 0 || data.session.summary !== null;

        if (done) {
          setState({ tag: "ready", data });
          return;
        }

        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setState({ tag: "timeout" });
          return;
        }

        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (!cancelled) {
          setState({ tag: "error", message: (err as Error).message });
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (state.tag === "loading") {
    return <Loading />;
  }

  if (state.tag === "timeout") {
    return (
      <FallbackMessage
        title="Procesando todavía"
        body="La sesión cerró bien pero los facts están tardando. Revisá tu dashboard en un minuto."
      />
    );
  }

  if (state.tag === "error") {
    return (
      <FallbackMessage
        title="Algo no salió bien"
        body={state.message}
      />
    );
  }

  return <ReadyView data={state.data} />;
}

function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Sparkles className="h-8 w-8 animate-pulse text-amber-500" />
      <h1 className="text-xl font-semibold">Procesando lo que charlaron…</h1>
      <p className="text-sm text-neutral-600">
        Tu Twin está aprendiendo de la sesión. Esto suele tardar unos
        segundos.
      </p>
    </div>
  );
}

function FallbackMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-neutral-600">{body}</p>
      <Button asChild>
        <Link href="/dashboard">Volver al dashboard</Link>
      </Button>
    </div>
  );
}

function ReadyView({ data }: { data: SessionResponse }) {
  const facts = (data.session.extracted_facts_json ?? []) as ExtractedFact[];
  const completion = Math.round(data.twin.completion_score * 100);
  const slotIndex = data.session.session_index ?? 0;
  const nextIndex = data.twin.next_session_index;
  const hasMoreSessions = nextIndex < 8;

  const factsByDomain = new Map<Domain, ExtractedFact[]>();
  for (const fact of facts) {
    const list = factsByDomain.get(fact.domain) ?? [];
    list.push(fact);
    factsByDomain.set(fact.domain, list);
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sesión {slotIndex + 1} de 8 completada
          </h1>
          {facts.length > 0 && (
            <p className="text-sm text-neutral-600">
              Tu Twin aprendió {facts.length} {facts.length === 1 ? "hecho" : "hechos"} nuevos.
            </p>
          )}
        </div>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Progreso del Twin
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={completion} className="h-2" />
          <span className="text-sm font-medium text-neutral-800">
            {completion}%
          </span>
        </div>
      </section>

      {factsByDomain.size > 0 && (
        <section className="space-y-4">
          {Array.from(factsByDomain.entries()).map(([domain, items]) => {
            const skill = data.skills.find((s) => s.domain === domain);
            return (
              <article
                key={domain}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <header className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {DOMAIN_LABELS[domain]}
                  </h2>
                  {skill && (
                    <span className="text-xs text-neutral-500">
                      confidence {(skill.confidence ?? 0).toFixed(2)}
                    </span>
                  )}
                </header>
                <ul className="space-y-1.5 text-sm text-neutral-700">
                  {items.map((fact, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                      <span>{fact.text}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      )}

      {data.twin.summary && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Resumen actualizado
          </p>
          <p className="mt-2 text-sm text-neutral-800">{data.twin.summary}</p>
        </section>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al dashboard</Link>
        </Button>
        {hasMoreSessions && (
          <Button asChild>
            <Link href="/api/training/start" prefetch={false}>
              Seguir entrenando
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
