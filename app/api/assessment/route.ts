import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";
import { buildRecommendationText, recommendPaths } from "@/lib/recommender";

export const dynamic = "force-dynamic";

// Phase 1 — Discovery Assessment: guided onboarding (multi-step wizard on /assessment).
// GET returns the latest response + history. POST saves a new response and
// returns the rules-based personalized starting point (≥2 paths + goal prompt).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const responses = await prisma.assessmentResponse.findMany({
    where: { userId: user.id },
    orderBy: { completedAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ latest: responses[0] ?? null, history: responses });
}

const assessmentSchema = z.object({
  strengths: z.string().max(2000).optional().default(""),
  interests: z.string().max(2000).optional().default(""),
  skills: z.string().max(2000).optional().default(""),
  challenges: z.string().max(2000).optional().default(""),
  aspirations: z.string().max(2000).optional().default(""),
  confidenceScore: z.number().int().min(1).max(10),
  goals: z.string().max(2000).optional().default(""),
  purposeUnderstanding: z.string().max(2000).optional().default(""),
  coachingNeeds: z.string().max(2000).optional().default(""),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = assessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assessment.", details: parsed.error.flatten() }, { status: 400 });
  }

  const [me, goalCount, pathRows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { interests: true, devGoals: true, improveAreas: true, careerInterests: true, coachingInterests: true },
    }),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.learningPath.findMany({ orderBy: { order: "asc" }, select: { id: true, slug: true, title: true } }),
  ]);

  const recs = recommendPaths(
    parsed.data,
    {
      interests: me?.interests ?? [],
      devGoals: me?.devGoals ?? [],
      improveAreas: me?.improveAreas ?? [],
      careerInterests: me?.careerInterests ?? [],
      coachingInterests: me?.coachingInterests ?? [],
    },
    pathRows.map((p) => p.slug),
    3
  );
  const recommendation = buildRecommendationText(recs, goalCount > 0);
  const assessment = await prisma.assessmentResponse.create({
    data: { userId: user.id, ...parsed.data, recommendation },
  });

  const recommendedPaths = recs.map((r) => ({
    ...r,
    ...(pathRows.find((p) => p.slug === r.slug) ?? {}),
  }));

  return NextResponse.json({ assessment, recommendedPaths, hasGoal: goalCount > 0 }, { status: 201 });
}
