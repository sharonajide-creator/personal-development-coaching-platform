import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const serviceSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional().default(""),
  price: z.number().int().min(0).max(10000000),
  durationMin: z.number().int().min(15).max(480).optional().default(60),
});

// Phase 4 — Coaching services CRUD (1:1 offers sold in Phase 3 booking flow).
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const services = await prisma.coachingService.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = serviceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid service.", details: parsed.error.flatten() }, { status: 400 });
  }
  const service = await prisma.coachingService.create({ data: parsed.data });
  return NextResponse.json({ service }, { status: 201 });
}
