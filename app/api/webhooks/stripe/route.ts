import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Phase 3 — Stripe webhook: provisions access on payment.
// completed → Booking CONFIRMED + meeting flow + email + in-app notification.
// expired → release the held slot, cancel the booking.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhooks not configured." }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    console.error("[stripe:webhook] bad signature", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: Record<string, string> };
    const purchase = await prisma.purchase.findUnique({
      where: { stripeSessionId: session.id },
      include: {
        booking: { include: { service: true, slot: true } },
        product: true,
        user: true,
      },
    });
    if (!purchase) return NextResponse.json({ error: "Purchase not found." }, { status: 404 });
    if (purchase.status === "PAID") return NextResponse.json({ received: true });

    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "PAID" } });

    // Phase 4 — store fulfillment: provision access + decrement stock.
    if (purchase.product) {
      if (purchase.product.stock !== null && purchase.product.stock > 0) {
        await prisma.product.update({
          where: { id: purchase.product.id },
          data: { stock: purchase.product.stock - 1 },
        });
      }
      await prisma.notification.create({
        data: {
          userId: purchase.userId,
          type: "coach-response",
          title: "Your purchase is ready ✓",
          body: `"${purchase.product.title}" is now yours — open the store to access it.`,
        },
      });
      if (purchase.user?.email) {
        await sendEmail(
          purchase.user.email,
          "Your purchase is ready ✓",
          `<p>Hi ${purchase.user.name ?? "friend"},</p><p><strong>${purchase.product.title}</strong> is now yours. Open the store to access it.</p>`
        );
      }
      return NextResponse.json({ received: true });
    }

    if (purchase.booking) {
      await prisma.booking.update({
        where: { id: purchase.booking.id },
        data: { status: "CONFIRMED", paymentStatus: "PAID" },
      });
    }
    await prisma.notification.create({
      data: {
        userId: purchase.userId,
        type: "session",
        title: "Booking confirmed ✓",
        body: purchase.booking
          ? `Your ${purchase.booking.service.title} on ${purchase.booking.slot.startAt.toLocaleString()} is confirmed. The meeting link will appear here before your session.`
          : "Your payment succeeded — your booking is confirmed.",
      },
    });
    if (purchase.user?.email) {
      await sendEmail(
        purchase.user.email,
        "Your coaching session is confirmed ✓",
        `<p>Hi ${purchase.user.name ?? "friend"},</p><p>Your <strong>${purchase.booking?.service.title ?? "coaching session"}</strong> is confirmed${
          purchase.booking ? ` for <strong>${purchase.booking.slot.startAt.toLocaleString()}</strong>` : ""
        }. Your meeting link will appear on your bookings page before the session.</p>`
      );
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as { id: string };
    const purchase = await prisma.purchase.findUnique({
      where: { stripeSessionId: session.id },
      include: { booking: true },
    });
    if (purchase && purchase.status === "PENDING") {
      await prisma.purchase.update({ where: { id: purchase.id }, data: { status: "FAILED" } });
      if (purchase.booking) {
        await prisma.booking.update({
          where: { id: purchase.booking.id },
          data: { status: "CANCELLED", paymentStatus: "FAILED" },
        });
        await prisma.availabilitySlot.update({
          where: { id: purchase.booking.slotId },
          data: { isBooked: false },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
