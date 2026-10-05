import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";

export const dynamic = "force-dynamic";

// Phase 2 — Path detail: lessons in order + this user's progress/saved flags.
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const path = await prisma.learningPath.findUnique({
    where: { slug: params.slug },
    include: { lessons: { orderBy: { order: "asc" } } },
  });
  if (!path) return NextResponse.json({ error: "Path not found." }, { status: 404 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ path, progress: [] });

  const progress = await prisma.userProgress.findMany({
    where: { userId: user.id, lessonId: { in: path.lessons.map((l) => l.id) } },
  });
  return NextResponse.json({ path, progress });
}
