import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const commsSchema = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(2).max(1000),
});

// Phase 4 — Announcements/reminders: batched in-app notifications to all users.
// In-app only (no bulk email in MVP — keeps notifications useful, not overwhelming).
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = commsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid announcement.", details: parsed.error.flatten() }, { status: 400 });
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  const BATCH = 200;
  let sent = 0;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH).map((u) => ({
      userId: u.id,
      type: "announcement",
      title: parsed.data.title,
      body: parsed.data.body,
    }));
    const r = await prisma.notification.createMany({ data: batch });
    sent += r.count;
  }
  return NextResponse.json({ ok: true, sent }, { status: 201 });
}
