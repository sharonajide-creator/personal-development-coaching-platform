import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 2 — Reflection Journal (private: owner-only, always private in MVP).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ entries });
}

const entrySchema = z.object({
  learnings: z.string().max(2000).optional().default(""),
  selfDiscovery: z.string().max(2000).optional().default(""),
  challenges: z.string().max(2000).optional().default(""),
  insights: z.string().max(2000).optional().default(""),
  progressNote: z.string().max(2000).optional().default(""),
  coachQuestion: z.string().max(2000).optional().default(""),
}).refine((d) => Object.values(d).some((v) => v.trim().length > 0), {
  message: "Write at least one field before saving.",
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry.", details: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.journalEntry.create({ data: { userId: user.id, ...parsed.data } });
  return NextResponse.json({ entry }, { status: 201 });
}
