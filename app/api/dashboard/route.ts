import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMinorAgeRange } from "@/lib/safeguarding";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: headers() });
  // Phase 5: unauthenticated API callers get 401 (middleware is the first gate).
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Phase 5 backstop: if ageRange says 16–17 but isMinor flag was missed
  // (e.g. OAuth signup), correct it idempotently — owner-scoped, no PII logged.
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, ageRange: true, isMinor: true },
  });
  if (me && isMinorAgeRange(me.ageRange) && !me.isMinor) {
    await prisma.user.update({ where: { id: me.id }, data: { isMinor: true } });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      goals: { include: { actions: true }, take: 5, orderBy: { createdAt: "desc" } },
      _count: { select: { progress: true, journal: true, milestones: true } },
    },
  });
  const paths = await prisma.learningPath.findMany({ orderBy: { order: "asc" }, take: 3 });
  return NextResponse.json({ user, paths });
}
