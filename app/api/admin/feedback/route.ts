import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  userId: z.string().min(1),
  contextType: z.enum(["ASSESSMENT", "EXERCISE", "CONSULTATION"]),
  observations: z.string().max(2000).optional().default(""),
  improvements: z.string().max(2000).optional().default(""),
  resources: z.string().max(2000).optional().default(""),
  nextSteps: z.string().max(2000).optional().default(""),
  encouragement: z.string().max(2000).optional().default(""),
});

// Phase 4 — Coach feedback: personalized notes after assessments, exercises,
// consultations. Users read them on their journey page; coach notifies here.
export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const userId = new URL(req.url).searchParams.get("userId");
  const feedback = await prisma.coachFeedback.findMany({
    where: userId ? { userId } : undefined,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ feedback });
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = feedbackSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback.", details: parsed.error.flatten() }, { status: 400 });
  }
  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const feedback = await prisma.coachFeedback.create({ data: parsed.data });
  await prisma.notification.create({
    data: {
      userId: parsed.data.userId,
      type: "coach-response",
      title: "New coach feedback ✓",
      body: (parsed.data.encouragement || parsed.data.nextSteps || "Your coach left you feedback.").slice(0, 140),
    },
  });
  return NextResponse.json({ feedback }, { status: 201 });
}
