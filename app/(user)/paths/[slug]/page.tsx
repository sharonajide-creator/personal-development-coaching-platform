import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";
import LessonActions from "@/components/LessonActions";

export const dynamic = "force-dynamic";

// Phase 2 — Path detail: lessons in order with progress + save actions.
export default async function PathDetailPage({ params }: { params: { slug: string } }) {
  const path = await prisma.learningPath.findUnique({
    where: { slug: params.slug },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!path) notFound();

  const user = await getSessionUser();
  const progressMap = new Map<string, { status: string; saved: boolean }>();
  if (user) {
    const rows = await prisma.userProgress.findMany({
      where: { userId: user.id, lessonId: { in: path.lessons.map((l) => l.id) } },
    });
    for (const r of rows) progressMap.set(r.lessonId, { status: r.status, saved: r.saved });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/paths" className="text-sm text-brand underline">← All paths</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">{path.title}</h1>
        <p className="text-sm text-slate-500">{path.description}</p>
        {path.recommendedFor && <p className="mt-1 text-xs text-slate-400">Recommended for: {path.recommendedFor}</p>}
      </div>
      <ol className="space-y-3">
        {path.lessons.map((l, i) => {
          const p = progressMap.get(l.id);
          return (
            <li key={l.id} className="space-y-2 rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-400">Lesson {i + 1} · {l.type}</p>
                  <a href={`/learn/${l.id}`} className="font-semibold hover:underline">
                    {p?.status === "COMPLETED" ? "✓ " : ""}{l.title}
                  </a>
                </div>
              </div>
              <LessonActions lessonId={l.id} initialStatus={p?.status ?? null} initialSaved={p?.saved ?? false} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
