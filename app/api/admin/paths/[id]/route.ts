import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  category: z.enum([
    "SELF_DISCOVERY", "PURPOSE_VISION", "CONFIDENCE", "COMMUNICATION",
    "CAREER_BUSINESS", "LEADERSHIP", "PRODUCTIVITY",
  ]).optional(),
  description: z.string().max(2000).optional(),
  recommendedFor: z.string().max(200).optional(),
  order: z.number().int().min(0).max(100).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid path.", details: parsed.error.flatten() }, { status: 400 });
  }
  const path = await prisma.learningPath.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ path });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  await prisma.learningPath.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
