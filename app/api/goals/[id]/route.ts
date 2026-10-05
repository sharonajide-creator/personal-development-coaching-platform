import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertGoalOwner, getSessionUser, recalcGoalProgress } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  timeframe: z.string().max(100).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED"]).optional(),
  reflections: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertGoalOwner(params.id, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid goal update.", details: parsed.error.flatten() }, { status: 400 });
  }

  const goal = await prisma.goal.update({
    where: { id: params.id },
    data: parsed.data,
    include: { actions: true },
  });
  return NextResponse.json({ goal });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertGoalOwner(params.id, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

// Keep progress honest when actions change elsewhere: recompute on read.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertGoalOwner(params.id, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  await recalcGoalProgress(params.id);
  const goal = await prisma.goal.findUnique({
    where: { id: params.id },
    include: { actions: { orderBy: { title: "asc" } } },
  });
  return NextResponse.json({ goal });
}
