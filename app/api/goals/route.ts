import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 1 — Goals & Action Plans: define goals, break into actions, track, reflect.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: { actions: { orderBy: { title: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ goals });
}

const createSchema = z.object({
  title: z.string().min(3).max(200),
  timeframe: z.string().max(100).optional().default(""),
  reflections: z.string().max(2000).optional().default(""),
  actions: z.array(z.object({ title: z.string().min(1).max(200) })).max(20).optional().default([]),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid goal.", details: parsed.error.flatten() }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      timeframe: parsed.data.timeframe,
      reflections: parsed.data.reflections,
      actions: { create: parsed.data.actions.map((a) => ({ title: a.title })) },
    },
    include: { actions: true },
  });
  return NextResponse.json({ goal }, { status: 201 });
}
