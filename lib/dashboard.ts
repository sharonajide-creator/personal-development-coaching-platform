// Phase 1 — Shared dashboard aggregation (single source of truth).
// Used by GET /api/dashboard and the server-rendered dashboard page.

import { prisma } from "./prisma";
import { recommendPaths } from "./recommender";
import { isMinorAgeRange } from "./safeguarding";

export async function getDashboardData(userId: string) {
  // Phase 5 backstop: keep isMinor in sync (OAuth / legacy rows).
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, ageRange: true, isMinor: true,
      interests: true, devGoals: true, improveAreas: true,
      careerInterests: true, coachingInterests: true,
    },
  });
  if (me && isMinorAgeRange(me.ageRange) && !me.isMinor) {
    await prisma.user.update({ where: { id: me.id }, data: { isMinor: true } });
  }

  const [goals, latestAssessment, goalCount, pathRows, upcoming, messages, notifications, milestones, counts] =
    await Promise.all([
      prisma.goal.findMany({
        where: { userId },
        include: { actions: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.assessmentResponse.findFirst({
        where: { userId },
        orderBy: { completedAt: "desc" },
      }),
      prisma.goal.count({ where: { userId } }),
      prisma.learningPath.findMany({ orderBy: { order: "asc" } }),
      prisma.booking.findMany({
        where: { userId, status: "CONFIRMED" },
        include: { service: true, slot: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.coachQuestion.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.milestone.findMany({
        where: { userId },
        orderBy: { awardedAt: "desc" },
        take: 5,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { _count: { select: { progress: true, journal: true, milestones: true } } },
      }),
    ]);

  const recs = latestAssessment
    ? recommendPaths(
        {
          strengths: latestAssessment.strengths,
          interests: latestAssessment.interests,
          skills: latestAssessment.skills,
          challenges: latestAssessment.challenges,
          aspirations: latestAssessment.aspirations,
          confidenceScore: latestAssessment.confidenceScore,
          goals: latestAssessment.goals,
          purposeUnderstanding: latestAssessment.purposeUnderstanding,
          coachingNeeds: latestAssessment.coachingNeeds,
        },
        {
          interests: me?.interests ?? [],
          devGoals: me?.devGoals ?? [],
          improveAreas: me?.improveAreas ?? [],
          careerInterests: me?.careerInterests ?? [],
          coachingInterests: me?.coachingInterests ?? [],
        },
        pathRows.map((p) => p.slug),
        3
      )
    : pathRows.slice(0, 3).map((p) => ({ slug: p.slug, reason: "Start here — complete your assessment for tailored picks." }));

  const recommendedPaths = recs.map((r) => ({
    ...r,
    ...(pathRows.find((p) => p.slug === r.slug) ?? {}),
  }));

  const nextSteps: string[] = [];
  if (!latestAssessment) nextSteps.push("Complete your discovery assessment to get a personalized starting point.");
  else if (goalCount === 0) nextSteps.push("Create your first goal from your assessment insights.");
  else {
    const openAction = goals.flatMap((g) => g.actions.map((a) => ({ goal: g, action: a }))).find((x) => !x.action.done);
    if (openAction) nextSteps.push(`Next action: "${openAction.action.title}" for goal "${openAction.goal.title}".`);
    else nextSteps.push("All actions done — reflect on a goal or ask your coach for a stretch challenge.");
  }
  if (upcoming.length === 0 && goalCount > 0) nextSteps.push("Consider booking a 1:1 clarity session with your coach.");

  return {
    user: me,
    goals,
    hasAssessment: !!latestAssessment,
    recommendedPaths,
    upcoming,
    messages,
    notifications,
    milestones,
    counts: counts?._count ?? { progress: 0, journal: 0, milestones: 0 },
    nextSteps,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
