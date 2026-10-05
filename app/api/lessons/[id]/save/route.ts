import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ saved: z.boolean() });

// Phase 2 — Save/unsave a lesson as a favorite.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body.", details: parsed.error.flatten() }, { status: 400 });
  }

  const progress = await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: params.id } },
    update: { saved: parsed.data.saved },
    create: { userId: user.id, lessonId: params.id, saved: parsed.data.saved },
  });
  return NextResponse.json({ progress });
}
