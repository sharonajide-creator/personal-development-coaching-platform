import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const Category = z.enum([
  "SELF_DISCOVERY", "PURPOSE_VISION", "CONFIDENCE", "COMMUNICATION",
  "CAREER_BUSINESS", "LEADERSHIP", "PRODUCTIVITY",
]);

const pathSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(120),
  category: Category,
  description: z.string().max(2000).optional().default(""),
  recommendedFor: z.string().max(200).optional().default(""),
  order: z.number().int().min(0).max(100).optional().default(0),
});

// Phase 4 — Content CRUD: learning paths (lessons managed separately below).
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const paths = await prisma.learningPath.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { lessons: true } } },
  });
  return NextResponse.json({ paths });
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = pathSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid path.", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const path = await prisma.learningPath.create({ data: parsed.data });
    return NextResponse.json({ path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists." }, { status: 409 });
  }
}
