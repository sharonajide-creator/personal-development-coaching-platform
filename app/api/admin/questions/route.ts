import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Q&A inbox: open questions first, then answered.
export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const only = new URL(req.url).searchParams.get("status");
  const questions = await prisma.coachQuestion.findMany({
    where: only === "OPEN" ? { status: "OPEN" } : undefined,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ questions });
}
