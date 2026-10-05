import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertGoalOwner, getSessionUser, recalcGoalProgress } from "@/lib/server";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  dueDate: z.string().max(30).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await assertGoalOwner(params.id, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action.", details: parsed.error.flatten() }, { status: 400 });
  }

  const action = await prisma.goalAction.create({
    data: {
      goalId: params.id,
      title: parsed.data.title,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
  });
  await recalcGoalProgress(params.id);
  return NextResponse.json({ action }, { status: 201 });
}
