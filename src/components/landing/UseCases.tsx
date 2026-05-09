import { Music, Calendar, Boxes } from "lucide-react";

const cards = [
  {
    Icon: Music,
    title: "Apps de música y entradas",
    body:
      "Tu Twin entiende tus gustos, géneros y artistas favoritos. Las apps recomiendan shows que te van a encantar sin sacarte un cuestionario.",
  },
  {
    Icon: Calendar,
    title: "Asistentes y planners",
    body:
      "El Twin contesta cómo te gusta organizar tu semana, qué ritmo querés y qué tono usar. Tus apps no empiezan de cero.",
  },
  {
    Icon: Boxes,
    title: "Productos nuevos",
    body:
      "Cualquier dev puede integrarse con scopes mínimos. Onboarding cero: el usuario llega ya conocido.",
  },
];

export function UseCases() {
  return (
    <section className="relative bg-muted/40 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center reveal-up">
          <span className="text-sm uppercase tracking-[0.2em] text-secondary">
            Para qué sirve
          </span>
          <h2 className="mt-3 text-balance text-4xl font-black sm:text-5xl">
            Apps que se vuelven tuyas desde el primer click.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Desarrolladores integran Twin Protocol como un OAuth chiquito con
            scopes específicos. Vos no llenás formularios; tu Twin contesta por vos.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map(({ Icon, title, body }, i) => (
            <article
              key={title}
              style={{ "--reveal-delay": `${i * 0.12}s` } as React.CSSProperties}
              className="reveal-up rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-base text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
