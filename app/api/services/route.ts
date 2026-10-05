import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Phase 3 — Public catalog of 1:1 coaching services (prices in minor units).
export async function GET() {
  const services = await prisma.coachingService.findMany({ orderBy: { price: "asc" } });
  return NextResponse.json({ services });
}
