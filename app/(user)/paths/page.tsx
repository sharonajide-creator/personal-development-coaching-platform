import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PathsPage() {
  const paths = await prisma.learningPath.findMany({ orderBy: { order: "asc" }, include: { lessons: true } });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">Learning Paths</h1>
        <p className="text-sm text-slate-500">Seven guided areas (Phase 0 seed). Lessons viewer lands in Phase 2.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((p) => (
          <div key={p.id} className="rounded-xl border p-4">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{p.description}</p>
            <p className="mt-2 text-xs text-slate-400">{p.lessons.length} lesson(s)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
