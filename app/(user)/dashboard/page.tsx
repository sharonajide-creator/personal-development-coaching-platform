import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMinorAgeRange } from "@/lib/safeguarding";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");

  // Phase 5 backstop: keep isMinor in sync with ageRange (OAuth / legacy rows).
  const flag = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ageRange: true, isMinor: true },
  });
  if (flag && isMinorAgeRange(flag.ageRange) && !flag.isMinor) {
    await prisma.user.update({ where: { id: session.user.id }, data: { isMinor: true } });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { goals: { include: { actions: true }, orderBy: { createdAt: "desc" }, take: 5 } },
  });
  const paths = await prisma.learningPath.findMany({ orderBy: { order: "asc" }, take: 3 });
  const upcoming = await prisma.booking.findMany({
    where: { userId: session.user.id, status: "CONFIRMED" },
    include: { service: true, slot: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const messages = await prisma.coachQuestion.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Good to see you, {user?.name?.split(" ")[0] ?? "friend"} 🌸</h1>
        <p className="text-slate-500">Here&apos;s what to focus on next in your growth journey.</p>
      </div>
      {!user?.ageRange && (
        <div className="rounded-xl border border-accent-gold bg-yellow-50 p-4 text-sm">
          🎯 Next step: complete your <a href="/assessment" className="font-semibold underline">discovery assessment</a> to get a personalized starting point.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">🎯 My Goals</h2>
          {user && user.goals.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {user.goals.map((g) => <li key={g.id}>• {g.title}</li>)}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No goals yet. <a href="/goals" className="underline">Set your first goal →</a></p>
          )}
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">🗺 Recommended Paths</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {paths.map((p) => <li key={p.id}>• {p.title}</li>)}
          </ul>
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">📅 Upcoming Sessions</h2>
          {upcoming.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">{upcoming.map((b) => <li key={b.id}>• {b.service.title}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Nothing booked. <a href="/bookings" className="underline">Book 1:1 →</a></p>
          )}
        </div>
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold">💬 Coach Messages</h2>
          {messages.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">{messages.map((m) => <li key={m.id}>• {m.question.slice(0, 80)}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No messages. <a href="/ask-coach" className="underline">Ask the coach →</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
