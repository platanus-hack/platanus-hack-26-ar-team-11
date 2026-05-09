import Image from "next/image";

const cards = [
  {
    logo: "/integrations/duolingo.png",
    title: "Duolingo",
    body:
      "A través de tu Twin, Duolingo entiende qué te motiva y cómo aprendés mejor, y diseña lecciones que mantengan tu interés y te hagan progresar.",
  },
  {
    logo: "/integrations/mercadolibre.png",
    title: "Mercado Libre",
    body:
      "A través de tu Twin, Mercado Libre conoce tus gustos y tu economía, y te recomienda productos justo cuando los vas a necesitar.",
  },
  {
    logo: "/integrations/despegar.png",
    title: "Despegar",
    body:
      "A través de tu Twin, Despegar conoce cómo viajás, qué presupuesto manejás y cuándo tenés tiempo libre, para sugerirte planes hechos a tu medida.",
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
            Conectá tu Twin a las apps que usás todos los días y disfrutá de
            experiencias personalizadas desde el primer momento, sin completar
            formularios ni repetir tus preferencias.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map(({ logo, title, body }, i) => (
            <article
              key={title}
              style={{ "--reveal-delay": `${i * 0.12}s` } as React.CSSProperties}
              className="reveal-up rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-md"
            >
              <div className="h-12 w-12 overflow-hidden rounded-xl">
                <Image
                  src={logo}
                  alt={`Logo de ${title}`}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
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
