import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Phase 4 — Users: searchable list with growth snapshot per user.
export default async function AdminUsersPage({ searchParams }: { searchParams?: { q?: string } }) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "COACH_ADMIN") redirect("/dashboard");

  const q = searchParams?.q?.trim() ?? "";
  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, name: true, email: true, ageRange: true, isMinor: true, createdAt: true,
      _count: { select: { goals: true, questions: true, bookings: true, journal: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <a href="/admin" className="text-sm text-brand underline">← Admin</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">Users</h1>
      </div>
      <form method="get" className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search name or email" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
        <button className="rounded-xl border px-4 py-2 text-sm">Search</button>
      </form>
      <div className="space-y-2">
        {users.map((u) => (
          <a key={u.id} href={`/admin/users/${u.id}`} className="block rounded-xl border p-3 text-sm transition hover:border-brand">
            <span className="font-medium">{u.name}</span> <span className="text-slate-400">{u.email}</span>
            {u.isMinor && <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs">16–17</span>}
            <span className="block text-xs text-slate-500">
              {u._count.goals} goals · {u._count.questions} questions · {u._count.bookings} bookings · {u._count.journal} journal entries
            </span>
          </a>
        ))}
        {users.length === 0 && <p className="text-sm text-slate-500">No users found.</p>}
      </div>
    </div>
  );
}
