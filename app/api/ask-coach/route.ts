import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 3 — Ask the Coach: submit questions, list history, view responses
// + resource referrals. (Coach replies land in Phase 4 admin.)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const questions = await prisma.coachQuestion.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ questions });
}

const askSchema = z.object({
  question: z.string().min(10, "Please give a little detail (min 10 characters).").max(2000),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = askSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid question.", details: parsed.error.flatten() }, { status: 400 });
  }

  const question = await prisma.coachQuestion.create({
    data: { userId: user.id, question: parsed.data.question.trim() },
  });

  // Notify admins in-app? MVP: coach sees open count on admin dashboard. Also
  // create a confirmation notification for the asker.
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "coach-response",
      title: "Question received",
      body: "Your coach will respond soon — watch this space and your email.",
    },
  });

  return NextResponse.json({ question }, { status: 201 });
}
