// STUB — replaced by Stream B (B13).
// See tasks/stream-b/B13-session-ui.md.

export default async function TrainingSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-2 text-xl font-semibold">Training session</h1>
        <p className="text-sm text-muted-foreground">
          TODO: B13 — LiveKit Room + Beyond Presence avatar.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">session: {sessionId}</p>
      </div>
    </main>
  );
}
