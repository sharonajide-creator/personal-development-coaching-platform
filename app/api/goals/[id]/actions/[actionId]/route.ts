import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertGoalOwner, getSessionUser, recalcGoalProgress } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  done: z.boolean().optional(),
  dueDate: z.string().max(30).nullable().optional(),
});

async function checkAction(goalId: string, actionId: string, userId: string) {
  const owner = await assertGoalOwner(goalId, userId);
  if ("error" in owner) return owner;
  const action = await prisma.goalAction.findUnique({ where: { id: actionId } });
  if (!action || action.goalId !== goalId) return { error: "Action not found.", status: 404 } as const;
  return { action } as const;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; actionId: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await checkAction(params.id, params.actionId, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action update.", details: parsed.error.flatten() }, { status: 400 });
  }

  const action = await prisma.goalAction.update({
    where: { id: params.actionId },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.done !== undefined ? { done: parsed.data.done } : {}),
      ...(parsed.data.dueDate !== undefined
        ? { dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null }
        : {}),
    },
  });
  const progress = await recalcGoalProgress(params.id);
  return NextResponse.json({ action, progress });
}

export async function DELETE(_req: Request, { params }: { params: { id: string; actionId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await checkAction(params.id, params.actionId, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.goalAction.delete({ where: { id: params.actionId } });
  const progress = await recalcGoalProgress(params.id);
  return NextResponse.json({ ok: true, progress });
}
