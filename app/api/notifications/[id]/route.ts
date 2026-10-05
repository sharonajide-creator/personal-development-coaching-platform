import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ read: z.boolean() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (note.userId !== user.id) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await prisma.notification.update({ where: { id: params.id }, data: { read: parsed.data.read } });
  return NextResponse.json({ notification: updated });
}
