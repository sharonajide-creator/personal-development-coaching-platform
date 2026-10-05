import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Phase 1 — Personalized Growth Dashboard: goals, recommended paths, current
// activities, progress, sessions, coach messages, resources, achievements, Q&A,
// and the suggested next step. Data via lib/dashboard (same as /api/dashboard).
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");

  const data = await getDashboardData(session.user.id);
  const firstName = data.user?.name?.split(" ")[0] ?? "friend";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Good to see you, {firstName} 🌸</h1>
        <p className="text-slate-500">Here&apos;s what to focus on next in your growth journey.</p>
      </div>

      <div className="rounded-xl border border-brand bg-purple-50 p-4">
        <h2 className="text-sm font-semibold text-brand-dark">✨ Your next steps</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {data.nextSteps.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
        {!data.hasAssessment && (
          <a href="/assessment" className="mt-3 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
            Take the Discovery Assessment →
          </a>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-2xl font-bold">{data.goals.length}</p>
          <p className="text-sm text-slate-500">Active goals</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-2xl font-bold">{data.counts.progress}</p>
          <p className="text-sm text-slate-500">Lessons engaged</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-2xl font-bold">{data.milestones.length}</p>
          <p className="text-sm text-slate-500">Milestones earned</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">🎯 My Goals</h2>
          {data.goals.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {data.goals.map((g) => (
                <li key={g.id}>• {g.title} <span className="text-slate-400">({g.progress}%)</span></li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No goals yet. <a href="/goals" className="underline">Set your first goal →</a></p>
          )}
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">🗺 Recommended Paths</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {data.recommendedPaths.map((p) => (
              <li key={p.slug}>
                <span className="font-medium">{(p as { title?: string }).title ?? p.slug}</span>
                <span className="block text-xs text-slate-500">{p.reason}</span>
              </li>
            ))}
          </ul>
          <a href="/paths" className="mt-2 inline-block text-sm text-brand underline">Explore all paths →</a>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">📅 Upcoming Sessions</h2>
          {data.upcoming.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">{data.upcoming.map((b) => <li key={b.id}>• {b.service.title}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Nothing booked. <a href="/bookings" className="underline">Book 1:1 →</a></p>
          )}
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">💬 Coach Messages</h2>
          {data.messages.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">{data.messages.map((m) => <li key={m.id}>• {m.question.slice(0, 80)}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No messages. <a href="/ask-coach" className="underline">Ask the coach →</a></p>
          )}
        </div>
        {data.notifications.length > 0 && (
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold">🔔 Notifications</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {data.notifications.map((n) => <li key={n.id}>• <span className="font-medium">{n.title}</span> — {n.body?.slice(0, 80)}</li>)}
            </ul>
          </div>
        )}
        {data.milestones.length > 0 && (
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold">🏆 Achievements</h2>
            <ul className="mt-2 space-y-1 text-sm">{data.milestones.map((m) => <li key={m.id}>• {m.title}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
