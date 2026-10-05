import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";
import LessonActions from "@/components/LessonActions";

export const dynamic = "force-dynamic";

const TYPE_HINT: Record<string, string> = {
  VIDEO: "Watch",
  AUDIO: "Listen",
  ARTICLE: "Read",
  EXERCISE: "Practice",
  WORKSHEET: "Work through",
  REFLECTION: "Reflect",
  GUIDE: "Follow",
};

// Phase 2 — Lesson viewer: video/audio/article/worksheet/reflection + actions.
export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { path: { include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true } } } } },
  });
  if (!lesson) notFound();

  const user = await getSessionUser();
  const mine = user
    ? await prisma.userProgress.findUnique({
        where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      })
    : null;

  const idx = lesson.path.lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? lesson.path.lessons[idx - 1] : null;
  const next = idx < lesson.path.lessons.length - 1 ? lesson.path.lessons[idx + 1] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href={`/paths/${lesson.path.slug}`} className="text-sm text-brand underline">← {lesson.path.title}</a>
        <p className="mt-1 text-xs text-slate-400">{TYPE_HINT[lesson.type] ?? "Learn"} · {lesson.type}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">{lesson.title}</h1>
      </div>

      {lesson.mediaUrl && (
        <a href={lesson.mediaUrl} target="_blank" rel="noreferrer" className="block rounded-xl border border-brand bg-purple-50 p-4 text-sm font-medium text-brand-dark">
          ▶ Open attached media (video/audio) →
        </a>
      )}

      {lesson.body && (
        <article className="whitespace-pre-wrap rounded-xl border p-4 text-sm leading-relaxed">{lesson.body}</article>
      )}

      {lesson.resourceUrls.length > 0 && (
        <div className="rounded-xl border p-4">
          <p className="text-sm font-semibold">Resources</p>
          <ul className="mt-1 space-y-1 text-sm">
            {lesson.resourceUrls.map((u) => (
              <li key={u}><a href={u} target="_blank" rel="noreferrer" className="text-brand underline">{u}</a></li>
            ))}
          </ul>
        </div>
      )}

      <LessonActions lessonId={lesson.id} initialStatus={mine?.status ?? null} initialSaved={mine?.saved ?? false} />

      <div className="flex justify-between text-sm">
        {prev ? <a href={`/learn/${prev.id}`} className="text-brand underline">← {prev.title}</a> : <span />}
        {next ? <a href={`/learn/${next.id}`} className="text-brand underline">{next.title} →</a> : <span />}
      </div>
    </div>
  );
}
