import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Users: searchable list with growth snapshot per user.
export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, name: true, email: true, role: true, ageRange: true, isMinor: true,
      createdAt: true,
      _count: { select: { goals: true, questions: true, bookings: true, journal: true } },
    },
  });
  return NextResponse.json({ users });
}
