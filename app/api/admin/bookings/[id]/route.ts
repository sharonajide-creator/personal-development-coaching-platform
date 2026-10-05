import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  meetingUrl: z.string().max(500).nullable().optional(),
  feedback: z.string().max(2000).nullable().optional(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

// Phase 4 — Manage a booking: attach meeting link (Zoom/Meet), record follow-up
// feedback, complete or cancel (cancelling releases the slot).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking update.", details: parsed.error.flatten() }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.meetingUrl !== undefined ? { meetingUrl: parsed.data.meetingUrl || null } : {}),
      ...(parsed.data.feedback !== undefined ? { feedback: parsed.data.feedback || null } : {}),
      ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    },
    include: { service: true, slot: true },
  });

  if (parsed.data.status === "CANCELLED") {
    await prisma.availabilitySlot.update({ where: { id: booking.slotId }, data: { isBooked: false } });
  }
  if (parsed.data.meetingUrl || parsed.data.status === "COMPLETED") {
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: "session",
        title: parsed.data.status === "COMPLETED" ? "Session completed ✓" : "Your session link is ready",
        body: parsed.data.status === "COMPLETED"
          ? `Your ${updated.service.title} is marked complete — reflect on it in your journal.`
          : `Your coach added the meeting link for ${updated.service.title}. Check your bookings page.`,
      },
    });
  }

  return NextResponse.json({ booking: updated });
}
