// Phase 1 — Shared server helpers for API routes.

import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: headers() });
  return session?.user ?? null;
}

/** Recompute Goal.progress as % of completed actions (0–100). */
export async function recalcGoalProgress(goalId: string): Promise<number> {
  const actions = await prisma.goalAction.findMany({ where: { goalId }, select: { done: true } });
  const progress =
    actions.length === 0 ? 0 : Math.round((actions.filter((a) => a.done).length / actions.length) * 100);
  await prisma.goal.update({ where: { id: goalId }, data: { progress } });
  return progress;
}

export async function assertGoalOwner(goalId: string, userId: string) {
  const goal = await prisma.goal.findUnique({ where: { id: goalId }, select: { id: true, userId: true } });
  if (!goal) return { error: "Goal not found.", status: 404 } as const;
  if (goal.userId !== userId) return { error: "Access denied.", status: 403 } as const;
  return { goal } as const;
}

/** Phase 4 — Coach/Admin gate. Returns the user or an error descriptor. */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized.", status: 401 } as const;
  const me = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, role: true } });
  if (!me || me.role !== "COACH_ADMIN") return { error: "Admin only.", status: 403 } as const;
  return { admin: me } as const;
}
