import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { DomainCard } from "@/components/skills/domain-card";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser, skillByDomain } from "@/lib/db/twins";
import { ALL_DOMAINS, type Domain } from "@/types";

function isDomain(value: string): value is Domain {
  return (ALL_DOMAINS as readonly string[]).includes(value);
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  if (!isDomain(domain)) notFound();

  const user = await requireUser();
  const data = await getTwinForUser(user.id);
  if (!data) notFound();

  const skill = skillByDomain(data.skills, domain);

  return (
    <PageShell>
      <Link
        href="/skills"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a skills
      </Link>

      <DomainCard
        domain={domain}
        facts={skill?.facts ?? []}
        confidence={skill?.confidence}
      />
    </PageShell>
  );
}
