import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Phase 2 — Continue learning: in-progress and saved lessons.
export default async function LearnPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");

  const rows = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    include: { lesson: { include: { path: { select: { slug: true, title: true } } } } },
    orderBy: { lesson: { order: "asc" } },
  });

  const inProgress = rows.filter((r) => r.status === "STARTED" && !r.saved);
  const saved = rows.filter((r) => r.saved);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Continue Learning</h1>
        <p className="text-sm text-slate-500">Pick up where you left off, or revisit a favorite.</p>
      </div>

      <section className="space-y-2">
        <h2 className="font-semibold">▶ In progress</h2>
        {inProgress.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing started. <a href="/paths" className="underline">Choose a path →</a></p>
        ) : (
          <ul className="space-y-2">
            {inProgress.map((r) => (
              <li key={r.id} className="rounded-xl border p-3 text-sm">
                <a href={`/learn/${r.lessonId}`} className="font-medium hover:underline">{r.lesson.title}</a>
                <span className="block text-xs text-slate-500">{r.lesson.path.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">★ Saved favorites</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-slate-500">No favorites yet — tap ☆ on any lesson to save it here.</p>
        ) : (
          <ul className="space-y-2">
            {saved.map((r) => (
              <li key={r.id} className="rounded-xl border p-3 text-sm">
                <a href={`/learn/${r.lessonId}`} className="font-medium hover:underline">{r.lesson.title}</a>
                <span className="block text-xs text-slate-500">{r.lesson.path.title}{r.status === "COMPLETED" ? " · ✓ completed" : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
