import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Phase 3 — Open future availability slots (coach manages them in Phase 4 admin).
export async function GET() {
  const slots = await prisma.availabilitySlot.findMany({
    where: { isBooked: false, startAt: { gt: new Date() } },
    orderBy: { startAt: "asc" },
    take: 50,
  });
  return NextResponse.json({ slots });
}
