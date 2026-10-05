import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Admin overview: counts + recent activity for the coach dashboard.
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const [users, openQuestions, confirmedBookings, purchases, paths, lessons, recentUsers, recentBookings] =
    await Promise.all([
      prisma.user.count(),
      prisma.coachQuestion.count({ where: { status: "OPEN" } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.purchase.count({ where: { status: "PAID" } }),
      prisma.learningPath.count(),
      prisma.lesson.count(),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, createdAt: true } }),
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { service: { select: { title: true } }, user: { select: { name: true } }, slot: { select: { startAt: true } } },
      }),
    ]);

  return NextResponse.json({
    counts: { users, openQuestions, confirmedBookings, purchases, paths, lessons },
    recentUsers,
    recentBookings,
  });
}
