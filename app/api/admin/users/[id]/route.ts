import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — User detail: profile + assessments + goals + progress + Q&A +
// bookings + purchases + feedback (coach sees the whole journey).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, email: true, role: true, ageRange: true, isMinor: true,
      guardianConsent: true, interests: true, devGoals: true, improveAreas: true,
      careerInterests: true, coachingInterests: true, createdAt: true,
      assessments: { orderBy: { completedAt: "desc" }, take: 5 },
      goals: { include: { actions: true }, orderBy: { createdAt: "desc" }, take: 10 },
      questions: { orderBy: { createdAt: "desc" }, take: 10 },
      bookings: { include: { service: true, slot: true }, orderBy: { createdAt: "desc" }, take: 10 },
      purchases: { include: { product: true }, orderBy: { createdAt: "desc" }, take: 10 },
      feedback: { orderBy: { createdAt: "desc" }, take: 10 },
      milestones: { orderBy: { awardedAt: "desc" }, take: 10 },
      _count: { select: { progress: true, journal: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ user });
}
