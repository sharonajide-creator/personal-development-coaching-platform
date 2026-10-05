import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";
import { getStripe, isPaymentsEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// Phase 3 — 1:1 booking flow: select service → pick slot → describe needs →
// pay (Stripe Checkout) → webhook confirms. GET lists history.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { service: true, slot: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json({ bookings, paymentsEnabled: isPaymentsEnabled() });
}

const bookSchema = z.object({
  serviceId: z.string().min(1),
  slotId: z.string().min(1),
  needsDescription: z.string().max(2000).optional().default(""),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured yet (Stripe test keys missing). Ask your coach to enable booking payments." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking.", details: parsed.error.flatten() }, { status: 400 });
  }

  const service = await prisma.coachingService.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });

  // Hold the slot atomically — prevents double-booking races.
  const held = await prisma.availabilitySlot.updateMany({
    where: { id: parsed.data.slotId, isBooked: false, startAt: { gt: new Date() } },
    data: { isBooked: true },
  });
  if (held.count === 0) {
    return NextResponse.json({ error: "That time was just taken — please pick another slot." }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      serviceId: service.id,
      slotId: parsed.data.slotId,
      needsDescription: parsed.data.needsDescription,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
    },
    include: { service: true, slot: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: service.price,
          product_data: { name: service.title, description: service.description ?? undefined },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id, userId: user.id },
    success_url: `${appUrl}/bookings?paid=1`,
    cancel_url: `${appUrl}/bookings?cancelled=1`,
  });

  await prisma.purchase.create({
    data: {
      userId: user.id,
      bookingId: booking.id,
      stripeSessionId: session.id,
      amount: service.price,
      status: "PENDING",
    },
  });

  return NextResponse.json({ booking, checkoutUrl: session.url }, { status: 201 });
}
