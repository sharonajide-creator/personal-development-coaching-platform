import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";
import { getStripe, isPaymentsEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const buySchema = z.object({ productId: z.string().min(1) });

// Phase 4 — Buy a book/course/resource: Stripe Checkout → webhook provisions
// access (purchase → PAID + notification). Free items grant instantly.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = buySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const already = await prisma.purchase.findFirst({
    where: { userId: user.id, productId: product.id, status: "PAID" },
  });
  if (already || product.price === 0) {
    if (!already && product.price === 0) {
      await prisma.purchase.create({ data: { userId: user.id, productId: product.id, amount: 0, status: "PAID" } });
    }
    return NextResponse.json({ owned: true });
  }

  const stripe = getStripe();
  if (!stripe || !isPaymentsEnabled()) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }
  if (product.stock !== null && product.stock <= 0) {
    return NextResponse.json({ error: "Out of stock." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: { name: product.title },
        },
        quantity: 1,
      },
    ],
    metadata: { userId: user.id, productId: product.id },
    success_url: `${appUrl}/store?paid=1`,
    cancel_url: `${appUrl}/store?cancelled=1`,
  });

  await prisma.purchase.create({
    data: { userId: user.id, productId: product.id, stripeSessionId: session.id, amount: product.price, status: "PENDING" },
  });

  return NextResponse.json({ checkoutUrl: session.url }, { status: 201 });
}
