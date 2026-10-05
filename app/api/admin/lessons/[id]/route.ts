import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  type: z.enum(["VIDEO", "AUDIO", "ARTICLE", "EXERCISE", "WORKSHEET", "REFLECTION", "GUIDE"]).optional(),
  title: z.string().min(2).max(200).optional(),
  body: z.string().max(20000).optional(),
  mediaUrl: z.string().max(500).nullable().optional(),
  resourceUrls: z.array(z.string().max(500)).max(10).optional(),
  order: z.number().int().min(0).max(500).optional(),
  pathId: z.string().min(1).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid lesson.", details: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.pathId) {
    const path = await prisma.learningPath.findUnique({ where: { id: parsed.data.pathId } });
    if (!path) return NextResponse.json({ error: "Path not found." }, { status: 404 });
  }
  const lesson = await prisma.lesson.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ lesson });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  await prisma.lesson.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
