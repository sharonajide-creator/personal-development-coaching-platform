// Phase 2 — Shared journey aggregation (single source of truth).
// Used by GET /api/journey and the server-rendered journey page.

import { prisma } from "./prisma";

export type JourneyItem = {
  date: string;
  type: "goal" | "lesson" | "journal" | "session" | "feedback" | "milestone" | "assessment";
  title: string;
  detail?: string;
};

export async function getJourneyItems(userId: string, limit = 60): Promise<JourneyItem[]> {
  const [goals, progress, journal, bookings, feedback, milestones, assessments] = await Promise.all([
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { lesson: { select: { title: true, path: { select: { title: true } } } } },
      orderBy: { completedAt: "desc" },
      take: 30,
    }),
    prisma.journalEntry.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.booking.findMany({
      where: { userId },
      include: { service: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.coachFeedback.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.milestone.findMany({ where: { userId }, orderBy: { awardedAt: "desc" }, take: 10 }),
    prisma.assessmentResponse.findMany({ where: { userId }, orderBy: { completedAt: "desc" }, take: 5 }),
  ]);

  const items: JourneyItem[] = [
    ...goals.map((g): JourneyItem => ({
      date: g.createdAt.toISOString(),
      type: "goal",
      title: `Goal: ${g.title}`,
      detail: g.status === "COMPLETED" ? "Completed ✓" : `${g.progress}% · ${g.status.toLowerCase()}`,
    })),
    ...progress.map((p): JourneyItem => ({
      date: (p.completedAt ?? new Date()).toISOString(),
      type: "lesson",
      title: `Lesson: ${p.lesson.title}`,
      detail: p.lesson.path.title,
    })),
    ...journal.map((j): JourneyItem => ({
      date: j.createdAt.toISOString(),
      type: "journal",
      title: "Journal reflection",
      detail: (j.insights || j.learnings || j.progressNote || "").slice(0, 120),
    })),
    ...bookings.map((b): JourneyItem => ({
      date: b.createdAt.toISOString(),
      type: "session",
      title: `Session: ${b.service.title}`,
      detail: b.status.toLowerCase(),
    })),
    ...feedback.map((f): JourneyItem => ({
      date: f.createdAt.toISOString(),
      type: "feedback",
      title: "Coach feedback",
      detail: (f.encouragement || f.nextSteps || "").slice(0, 120),
    })),
    ...milestones.map((m): JourneyItem => ({
      date: m.awardedAt.toISOString(),
      type: "milestone",
      title: `🏆 ${m.title}`,
    })),
    ...assessments.map((a): JourneyItem => ({
      date: a.completedAt.toISOString(),
      type: "assessment",
      title: "Discovery assessment completed",
    })),
  ];

  items.sort((a, b) => (a.date < b.date ? 1 : -1));
  return items.slice(0, limit);
}
