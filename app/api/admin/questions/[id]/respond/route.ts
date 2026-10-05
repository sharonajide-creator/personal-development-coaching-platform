import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const respondSchema = z.object({
  response: z.string().min(2).max(5000),
  resourceLinks: z.array(z.string().max(500)).max(10).optional().default([]),
});

// Phase 4 — Answer a question with guidance + resource referrals.
// Marks ANSWERED and notifies the user (in-app always, email best-effort).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const gate = await requireAdmin();
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const parsed = respondSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid response.", details: parsed.error.flatten() }, { status: 400 });
  }

  const question = await prisma.coachQuestion.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!question) return NextResponse.json({ error: "Question not found." }, { status: 404 });

  const updated = await prisma.coachQuestion.update({
    where: { id: params.id },
    data: { response: parsed.data.response.trim(), resourceLinks: parsed.data.resourceLinks, status: "ANSWERED", answeredAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: question.userId,
      type: "coach-response",
      title: "Your coach replied ✓",
      body: parsed.data.response.slice(0, 140),
    },
  });
  if (question.user?.email) {
    await sendEmail(
      question.user.email,
      "Your coach replied to your question ✓",
      `<p>Hi ${question.user.name ?? "friend"},</p><p>Your coach answered your question:</p><blockquote>${parsed.data.response.slice(0, 500)}</blockquote><p>See the full reply and resources on your Ask the Coach page.</p>`
    );
  }

  return NextResponse.json({ question: updated });
}
