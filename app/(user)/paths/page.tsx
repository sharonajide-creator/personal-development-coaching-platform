import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 2 — Learning Paths catalog with per-user progress when logged in.
export default async function PathsPage() {
  const user = await getSessionUser();
  const paths = await prisma.learningPath.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true } } },
  });

  let done = new Set<string>();
  if (user) {
    const progress = await prisma.userProgress.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      select: { lessonId: true },
    });
    done = new Set(progress.map((p) => p.lessonId));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Learning Paths</h1>
        <p className="text-sm text-slate-500">Seven guided areas — open one, follow its lessons, mark them complete.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((p) => {
          const total = p.lessons.length;
          const completed = p.lessons.filter((l) => done.has(l.id)).length;
          return (
            <a key={p.id} href={`/paths/${p.slug}`} className="rounded-xl border p-4 transition hover:border-brand">
              <h2 className="font-semibold">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{p.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                {total} lesson(s){user ? ` · ${completed} completed` : ""}
              </p>
              {user && total > 0 && (
                <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-brand" style={{ width: `${Math.round((completed / total) * 100)}%` }} />
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
