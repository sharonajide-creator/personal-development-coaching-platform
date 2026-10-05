import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FeedbackForm from "../FeedbackForm";

export const dynamic = "force-dynamic";

// Phase 4 — User detail: profile, assessments, goals, Q&A, bookings,
// purchases, feedback history + write-new-feedback form.
export default async function AdminUserDetail({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "COACH_ADMIN") redirect("/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      assessments: { orderBy: { completedAt: "desc" }, take: 3 },
      goals: { include: { actions: true }, orderBy: { createdAt: "desc" }, take: 10 },
      questions: { orderBy: { createdAt: "desc" }, take: 10 },
      bookings: { include: { service: true, slot: true }, orderBy: { createdAt: "desc" }, take: 10 },
      purchases: { include: { product: true }, orderBy: { createdAt: "desc" }, take: 10 },
      feedback: { orderBy: { createdAt: "desc" }, take: 10 },
      milestones: { orderBy: { awardedAt: "desc" }, take: 10 },
    },
  });
  if (!user) redirect("/admin/users");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <a href="/admin/users" className="text-sm text-brand underline">← Users</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">{user.name}</h1>
        <p className="text-sm text-slate-500">
          {user.email} · {user.ageRange?.replace("R", "").replace("_", "–") ?? "no age range"}
          {user.isMinor ? " · 16–17 (minor)" : ""}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Interests: {user.interests.join(", ") || "—"} · Goals: {user.devGoals.join(", ") || "—"} ·
          Improve: {user.improveAreas.join(", ") || "—"} · Career: {user.careerInterests.join(", ") || "—"} ·
          Coaching: {user.coachingInterests.join(", ") || "—"}
        </p>
      </div>

      <FeedbackForm userId={user.id} />

      <section className="space-y-2">
        <h2 className="font-semibold">🎯 Goals ({user.goals.length})</h2>
        {user.goals.map((g) => (
          <div key={g.id} className="rounded-xl border p-3 text-sm">
            <p className="font-medium">{g.title} <span className="text-slate-400">({g.progress}% · {g.status})</span></p>
            {g.reflections && <p className="text-slate-500">Reflection: {g.reflections}</p>}
          </div>
        ))}
        {user.goals.length === 0 && <p className="text-sm text-slate-500">No goals yet.</p>}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">✨ Assessments ({user.assessments.length})</h2>
        {user.assessments.map((a) => (
          <div key={a.id} className="rounded-xl border p-3 text-sm">
            <p className="text-xs text-slate-400">{a.completedAt.toLocaleDateString()} · confidence {a.confidenceScore ?? "—"}/10</p>
            {a.recommendation && <p className="whitespace-pre-wrap text-slate-600">{a.recommendation}</p>}
          </div>
        ))}
        {user.assessments.length === 0 && <p className="text-sm text-slate-500">No assessments yet.</p>}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">💬 Q&A ({user.questions.length})</h2>
        {user.questions.map((q) => (
          <div key={q.id} className="rounded-xl border p-3 text-sm">
            <p><span className="font-medium">Q:</span> {q.question}</p>
            {q.response ? <p className="text-slate-600"><span className="font-medium">A:</span> {q.response}</p> : <p className="text-xs text-yellow-700">Open — reply on the Coaching page.</p>}
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">📅 Bookings ({user.bookings.length})</h2>
        {user.bookings.map((b) => (
          <div key={b.id} className="rounded-xl border p-3 text-sm">
            <p className="font-medium">{b.service.title} <span className="text-slate-400">· {b.status.toLowerCase()} · {b.paymentStatus.toLowerCase()}</span></p>
            <p className="text-slate-500">{b.slot.startAt.toLocaleString()}</p>
            {b.needsDescription && <p className="text-slate-500">Needs: {b.needsDescription}</p>}
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">🛒 Purchases ({user.purchases.length}) · 🏆 Milestones ({user.milestones.length})</h2>
        {user.purchases.map((p) => (
          <p key={p.id} className="rounded-xl border p-3 text-sm">{p.product?.title ?? `Booking ${p.bookingId}`} · {p.status} · ${(p.amount / 100).toFixed(2)}</p>
        ))}
        {user.milestones.map((m) => (
          <p key={m.id} className="rounded-xl border p-3 text-sm">🏆 {m.title}</p>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">📝 Feedback given ({user.feedback.length})</h2>
        {user.feedback.map((f) => (
          <div key={f.id} className="rounded-xl border p-3 text-sm">
            <p className="text-xs text-slate-400">{f.createdAt.toLocaleDateString()} · {f.contextType.toLowerCase()}</p>
            {f.encouragement && <p>{f.encouragement}</p>}
            {f.nextSteps && <p className="text-slate-500">Next: {f.nextSteps}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}
