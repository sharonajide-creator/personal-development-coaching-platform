import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const LessonType = z.enum(["VIDEO", "AUDIO", "ARTICLE", "EXERCISE", "WORKSHEET", "REFLECTION", "GUIDE"]);

const lessonSchema = z.object({
  pathId: z.string().min(1),
  type: LessonType,
  title: z.string().min(2).max(200),
  body: z.string().max(20000).optional().default(""),
  mediaUrl: z.string().max(500).optional().default(""),
  resourceUrls: z.array(z.string().max(500)).max(10).optional().default([]),
  order: z.number().int().min(0).max(500).optional().default(0),
});

// Phase 4 — Content CRUD: lessons (articles, exercises, worksheets, media).
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = lessonSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lesson.", details: parsed.error.flatten() }, { status: 400 });
  }
  const path = await prisma.learningPath.findUnique({ where: { id: parsed.data.pathId } });
  if (!path) return NextResponse.json({ error: "Path not found." }, { status: 404 });

  const lesson = await prisma.lesson.create({
    data: { ...parsed.data, mediaUrl: parsed.data.mediaUrl || null },
  });
  return NextResponse.json({ lesson }, { status: 201 });
}
