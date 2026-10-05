import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const slot = await prisma.availabilitySlot.findUnique({ where: { id: params.id } });
  if (!slot) return NextResponse.json({ error: "Slot not found." }, { status: 404 });
  if (slot.isBooked) return NextResponse.json({ error: "Slot is booked — cancel the booking first." }, { status: 400 });
  await prisma.availabilitySlot.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
