import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 2 — Learning Paths catalog (public) with per-user progress when logged in.
export async function GET() {
  const user = await getSessionUser();
  const paths = await prisma.learningPath.findMany({
    orderBy: { order: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true, type: true, title: true, order: true } } },
  });

  if (!user) {
    return NextResponse.json({
      paths: paths.map((p) => ({ ...p, completedCount: 0, totalCount: p.lessons.length })),
    });
  }

  const lessonIds = paths.flatMap((p) => p.lessons.map((l) => l.id));
  const progress = await prisma.userProgress.findMany({
    where: { userId: user.id, lessonId: { in: lessonIds }, status: "COMPLETED" },
    select: { lessonId: true },
  });
  const done = new Set(progress.map((p) => p.lessonId));

  return NextResponse.json({
    paths: paths.map((p) => ({
      ...p,
      completedCount: p.lessons.filter((l) => done.has(l.id)).length,
      totalCount: p.lessons.length,
    })),
  });
}
