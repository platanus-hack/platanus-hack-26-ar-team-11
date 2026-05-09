import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SessionDetail } from "@/components/sessions/session-detail";
import { requireUser } from "@/lib/auth/server";
import { getTwinForUser } from "@/lib/db/twins";
import { getSessionById } from "@/lib/db/sessions";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const data = await getTwinForUser(user.id);
  if (!data) notFound();

  const session = await getSessionById(id, data.twin.id);
  if (!session) notFound();

  return (
    <PageShell>
      <Link
        href="/sessions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Volver a sesiones
      </Link>
      <SessionDetail session={session} />
    </PageShell>
  );
}
