import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

async function ownerCheck(entryId: string, userId: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId } });
  if (!entry) return { error: "Entry not found.", status: 404 } as const;
  if (entry.userId !== userId) return { error: "Access denied: journal is private.", status: 403 } as const;
  return { entry } as const;
}

const patchSchema = z.object({
  learnings: z.string().max(2000).optional(),
  selfDiscovery: z.string().max(2000).optional(),
  challenges: z.string().max(2000).optional(),
  insights: z.string().max(2000).optional(),
  progressNote: z.string().max(2000).optional(),
  coachQuestion: z.string().max(2000).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await ownerCheck(params.id, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry.", details: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await prisma.journalEntry.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ entry });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const check = await ownerCheck(params.id, user.id);
  if ("error" in check) return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.journalEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
