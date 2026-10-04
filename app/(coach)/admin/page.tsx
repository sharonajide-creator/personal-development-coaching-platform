import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "COACH_ADMIN") redirect("/dashboard");

  const [users, questions, bookings, purchases] = await Promise.all([
    prisma.user.count(),
    prisma.coachQuestion.count({ where: { status: "OPEN" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.purchase.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Coach / Admin Dashboard</h1>
        <p className="text-slate-500">Users, content, coaching, payments, feedback, comms — Phase 4 builds the full CRUD.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{users}</p><p className="text-sm text-slate-500">Users</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{questions}</p><p className="text-sm text-slate-500">Open questions</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{bookings}</p><p className="text-sm text-slate-500">Confirmed bookings</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{purchases}</p><p className="text-sm text-slate-500">Purchases</p></div>
      </div>
    </div>
  );
}
