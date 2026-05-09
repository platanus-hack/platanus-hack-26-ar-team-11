import { Check, Circle, X } from "lucide-react";
import type { Scope } from "@/types/permissions";
import type { BlockedDomain } from "@/types/permissions";
import { scopeDescription, scopeLabel } from "@/lib/connect/scope-labels";
import { cn } from "@/lib/utils";

const BLOCKED_DOMAIN_LABELS: Record<BlockedDomain, string> = {
  private_memories: "Private memories",
  sensitive_topics: "Sensitive topics",
  politics: "Political views",
  health: "Health & medical info",
  relationships: "Relationships",
  financial_status: "Financial status",
  raw_sources: "Raw conversation transcripts",
};

export function ScopesList({
  granted,
  notRequested,
  blocked,
}: {
  granted: Scope[];
  notRequested: Scope[];
  blocked: BlockedDomain[];
}) {
  return (
    <div className="space-y-5">
      {granted.length > 0 && (
        <Section title="What this app will be able to read">
          <ul className="space-y-2">
            {granted.map((scope) => (
              <li key={scope} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber/15 text-amber"
                >
                  <Check className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{scopeLabel(scope)}</p>
                  <p className="text-xs text-muted-foreground">{scopeDescription(scope)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {notRequested.length > 0 && (
        <Section title="Available but not requested">
          <ul className="space-y-2">
            {notRequested.map((scope) => (
              <li
                key={scope}
                className={cn("flex items-start gap-3 text-muted-foreground")}
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-border"
                >
                  <Circle className="h-2.5 w-2.5" />
                </span>
                <div>
                  <p className="text-sm">{scopeLabel(scope)}</p>
                  <p className="text-xs">(not requested)</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {blocked.length > 0 && (
        <Section title="Never exposed by your Twin">
          <ul className="space-y-2">
            {blocked.map((domain) => (
              <li key={domain} className="flex items-start gap-3 text-muted-foreground">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </span>
                <p className="text-sm">{BLOCKED_DOMAIN_LABELS[domain]}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}
