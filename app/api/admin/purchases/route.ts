import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Payments ledger: all transactions (bookings + store) with user detail.
export async function GET() {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { title: true, type: true } },
      booking: { select: { id: true, status: true, service: { select: { title: true } } } },
    },
  });
  const totals = await prisma.purchase.groupBy({ by: ["status"], _sum: { amount: true }, _count: true });
  return NextResponse.json({ purchases, totals });
}
