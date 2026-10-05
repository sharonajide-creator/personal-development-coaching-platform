import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function requireCoach() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "COACH_ADMIN") redirect("/dashboard");
}

// Phase 4 — Coach/Admin hub: users, content, coaching, store & payments, comms.
export default async function AdminPage() {
  await requireCoach();

  const [users, openQuestions, confirmedBookings, paidPurchases, paths, lessons] = await Promise.all([
    prisma.user.count(),
    prisma.coachQuestion.count({ where: { status: "OPEN" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.purchase.count({ where: { status: "PAID" } }),
    prisma.learningPath.count(),
    prisma.lesson.count(),
  ]);

  const cards = [
    { href: "/admin/users", title: "Users", body: `${users} registered — profiles, assessments, goals, progress.` },
    { href: "/admin/content", title: "Content", body: `${paths} paths · ${lessons} lessons — publish and edit.` },
    { href: "/admin/coaching", title: "Coaching", body: `${openQuestions} open questions · ${confirmedBookings} confirmed bookings.` },
    { href: "/admin/store", title: "Store & Payments", body: `${paidPurchases} paid purchases — catalog + ledger.` },
    { href: "/admin/comms", title: "Announcements", body: "Notify all users in-app (batched, no spam)." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Coach / Admin Dashboard</h1>
        <p className="text-slate-500">Manage users, content, coaching, payments, feedback and communication.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{users}</p><p className="text-sm text-slate-500">Users</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{openQuestions}</p><p className="text-sm text-slate-500">Open questions</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{confirmedBookings}</p><p className="text-sm text-slate-500">Confirmed bookings</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{paidPurchases}</p><p className="text-sm text-slate-500">Paid purchases</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className="rounded-xl border p-4 transition hover:border-brand">
            <h2 className="font-semibold">{c.title} →</h2>
            <p className="mt-1 text-sm text-slate-500">{c.body}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
