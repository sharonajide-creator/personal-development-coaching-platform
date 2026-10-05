import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ status: z.enum(["STARTED", "COMPLETED"]) });

// Phase 2 — Mark a lesson started/completed (upsert UserProgress).
// First-ever completion awards a "First lesson completed" milestone.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status.", details: parsed.error.flatten() }, { status: 400 });
  }

  const completedBefore = await prisma.userProgress.count({
    where: { userId: user.id, status: "COMPLETED" },
  });

  const progress = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: params.id } },
    update: {
      status: parsed.data.status,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
    },
    create: {
      userId: user.id,
      lessonId: params.id,
      status: parsed.data.status,
      completedAt: parsed.data.status === "COMPLETED" ? new Date() : null,
    },
  });

  let milestone: { id: string; title: string } | null = null;
  if (parsed.data.status === "COMPLETED" && completedBefore === 0) {
    milestone = await prisma.milestone.create({
      data: { userId: user.id, title: "Completed first lesson", triggeredBy: "lesson:complete" },
      select: { id: true, title: true },
    });
  }

  return NextResponse.json({ progress, milestone });
}
