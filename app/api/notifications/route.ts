import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 4 — Notifications: useful, not overwhelming. Users can mute types;
// muted types are filtered here (and skipped at creation for announcements).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [notifications, muted] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notificationPreference.findMany({ where: { userId: user.id }, select: { type: true } }),
  ]);
  const mutedTypes = muted.map((m) => m.type);
  return NextResponse.json({
    notifications: notifications.filter((n) => !mutedTypes.includes(n.type)),
    mutedTypes,
    unread: notifications.filter((n) => !n.read && !mutedTypes.includes(n.type)).length,
  });
}

const muteSchema = z.object({
  type: z.string().min(1),
  muted: z.boolean(),
});

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  // Mark-all-read form: { markAllRead: true }
  if (body && typeof body === "object" && (body as Record<string, unknown>).markAllRead === true) {
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    return NextResponse.json({ ok: true });
  }

  const parsed = muteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.muted) {
    await prisma.notificationPreference.upsert({
      where: { userId_type: { userId: user.id, type: parsed.data.type } },
      update: {},
      create: { userId: user.id, type: parsed.data.type },
    });
  } else {
    await prisma.notificationPreference.deleteMany({
      where: { userId: user.id, type: parsed.data.type },
    });
  }
  return NextResponse.json({ ok: true, muted: parsed.data.muted });
}
