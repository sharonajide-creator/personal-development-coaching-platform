import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getJourneyItems } from "@/lib/journey";

export const dynamic = "force-dynamic";

const ICON: Record<string, string> = {
  goal: "🎯",
  lesson: "📖",
  journal: "📝",
  session: "📅",
  feedback: "💬",
  milestone: "🏆",
  assessment: "✨",
};

// Phase 2 — Personal Growth Journey: holistic timeline + read-only coach feedback.
// (Coach writes feedback in Phase 4; users only read here.)
export default async function JourneyPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");

  const [items, feedback] = await Promise.all([
    getJourneyItems(session.user.id),
    prisma.coachFeedback.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">My Growth Journey</h1>
        <p className="text-sm text-slate-500">Goals, lessons, reflections, sessions, feedback, milestones — one story.</p>
      </div>

      {feedback.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">💬 Coach Feedback</h2>
          {feedback.map((f) => (
            <div key={f.id} className="space-y-1 rounded-xl border border-brand bg-purple-50 p-4 text-sm">
              <p className="text-xs text-slate-500">{new Date(f.createdAt).toLocaleDateString()} · {f.contextType.toLowerCase()}</p>
              {f.observations && <p><span className="font-medium">Observations:</span> {f.observations}</p>}
              {f.improvements && <p><span className="font-medium">To improve:</span> {f.improvements}</p>}
              {f.resources && <p><span className="font-medium">Resources:</span> {f.resources}</p>}
              {f.nextSteps && <p><span className="font-medium">Next steps:</span> {f.nextSteps}</p>}
              {f.encouragement && <p><span className="font-medium">Encouragement:</span> {f.encouragement}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">Timeline</h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            Your story starts here. <a href="/assessment" className="underline">Take the assessment →</a>
          </p>
        ) : (
          <ol className="space-y-2">
            {items.map((it, i) => (
              <li key={`${it.date}-${i}`} className="flex gap-3 rounded-xl border p-3 text-sm">
                <span className="text-lg">{ICON[it.type] ?? "•"}</span>
                <div>
                  <p className="font-medium">{it.title}</p>
                  {it.detail && <p className="text-xs text-slate-500">{it.detail}</p>}
                  <p className="text-xs text-slate-400">{new Date(it.date).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
