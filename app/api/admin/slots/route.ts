import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const slotSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

// Phase 4 — Availability slots: coach publishes open times for booking.
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const slots = await prisma.availabilitySlot.findMany({
    where: { startAt: { gt: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
    orderBy: { startAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ slots });
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = slotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid slot.", details: parsed.error.flatten() }, { status: 400 });
  }
  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (endAt <= startAt) return NextResponse.json({ error: "End must be after start." }, { status: 400 });
  if (startAt <= new Date()) return NextResponse.json({ error: "Slot must be in the future." }, { status: 400 });

  const slot = await prisma.availabilitySlot.create({ data: { startAt, endAt } });
  return NextResponse.json({ slot }, { status: 201 });
}
