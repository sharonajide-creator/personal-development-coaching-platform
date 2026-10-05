import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Bookings management: upcoming + history with user/service/slot.
export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const status = new URL(req.url).searchParams.get("status");
  const bookings = await prisma.booking.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      service: { select: { title: true, price: true } },
      slot: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ bookings });
}
