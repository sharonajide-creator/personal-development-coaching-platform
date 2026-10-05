import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  action: z.enum(["cancel", "reschedule"]),
  slotId: z.string().min(1).optional(),
});

// Phase 3 — Simple reschedule / cancel. Cancelling or moving releases the old
// slot; rescheduling holds the new one. Paid bookings stay confirmed.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.userId !== user.id) return NextResponse.json({ error: "Access denied." }, { status: 403 });
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return NextResponse.json({ error: `Booking is already ${booking.status.toLowerCase()}.` }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.action === "cancel") {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
      include: { service: true, slot: true },
    });
    await prisma.availabilitySlot.update({ where: { id: booking.slotId }, data: { isBooked: false } });
    return NextResponse.json({ booking: updated });
  }

  // Reschedule.
  if (!parsed.data.slotId) return NextResponse.json({ error: "slotId is required to reschedule." }, { status: 400 });
  const held = await prisma.availabilitySlot.updateMany({
    where: { id: parsed.data.slotId, isBooked: false, startAt: { gt: new Date() } },
    data: { isBooked: true },
  });
  if (held.count === 0) {
    return NextResponse.json({ error: "That time was just taken — please pick another slot." }, { status: 409 });
  }
  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: { slotId: parsed.data.slotId },
    include: { service: true, slot: true },
  });
  await prisma.availabilitySlot.update({ where: { id: booking.slotId }, data: { isBooked: false } });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "session",
      title: "Session rescheduled",
      body: `Your ${updated.service.title} moved to ${updated.slot.startAt.toLocaleString()}.`,
    },
  });
  return NextResponse.json({ booking: updated });
}
