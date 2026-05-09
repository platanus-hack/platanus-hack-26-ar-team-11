import {
  UserPlus,
  MessagesSquare,
  Plug2,
  Compass,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Creá tu Twin.",
    body: "Empezás con una cuenta gratuita y un Twin vacío esperando a aprender de vos.",
    Icon: UserPlus,
  },
  {
    n: "02",
    title: "Entrenalo con conversaciones.",
    body: "Sesiones de voz cortas: música, eventos, vibe, estilo de comunicación. El Twin va llenando su perfil.",
    Icon: MessagesSquare,
  },
  {
    n: "03",
    title: "Conectalo a tus apps favoritas.",
    body: "Apps como AllAccess piden permiso por scopes. Vos decidís qué pueden consultar.",
    Icon: Plug2,
  },
  {
    n: "04",
    title: "Recibí experiencias personalizadas.",
    body: "Desde el primer momento las apps entienden tu estilo, sin pedirte datos otra vez.",
    Icon: Compass,
  },
  {
    n: "05",
    title: "Controlá qué sabe y qué consulta cada app.",
    body: "Audit log, revoke en un click, scopes granulares. Tu Twin es tuyo.",
    Icon: ShieldCheck,
  },
];

export function StepStack() {
  return (
    <section
      id="como-funciona"
      className="mx-auto max-w-6xl px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-secondary">
          Cómo funciona
        </span>
        <h2 className="mt-3 text-balance text-3xl font-black sm:text-4xl">
          Cinco pasos para que tu Twin viva en todas tus apps.
        </h2>
      </div>

      <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ n, title, body, Icon }) => (
          <li
            key={n}
            className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-accent/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Paso {n}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <h3 className="text-xl font-bold leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
