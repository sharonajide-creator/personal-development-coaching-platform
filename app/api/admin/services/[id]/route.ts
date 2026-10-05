import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().int().min(0).max(10000000).optional(),
  durationMin: z.number().int().min(15).max(480).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid service.", details: parsed.error.flatten() }, { status: 400 });
  }
  const service = await prisma.coachingService.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ service });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const used = await prisma.booking.count({ where: { serviceId: params.id } });
  if (used > 0) return NextResponse.json({ error: "Service has bookings — edit it instead of deleting." }, { status: 400 });
  await prisma.coachingService.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
