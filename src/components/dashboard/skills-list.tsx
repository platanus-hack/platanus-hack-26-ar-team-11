import Link from "next/link";
import { Circle } from "lucide-react";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { DOMAIN_LABELS, type Domain, type TwinSkill } from "@/types";

export function SkillsList({
  skills,
  pending,
}: {
  skills: TwinSkill[];
  pending: Domain[];
}) {
  const learned = [...skills]
    .filter((s) => s.facts.length > 0)
    .sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Atributos aprendidos
        </h3>
        {learned.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no entrenamos nada.</p>
        ) : (
          <ul className="space-y-3">
            {learned.map((skill) => (
              <li key={skill.id} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <Link
                    href="/skills"
                    className="font-medium hover:underline"
                  >
                    {DOMAIN_LABELS[skill.domain]}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {skill.facts.length} fact{skill.facts.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ConfidenceBar value={skill.confidence} showValue />
              </li>
            ))}
          </ul>
        )}
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Pendientes
          </h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {pending.map((domain) => (
              <li key={domain} className="flex items-center gap-2">
                <Circle className="h-3 w-3" />
                {DOMAIN_LABELS[domain]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
