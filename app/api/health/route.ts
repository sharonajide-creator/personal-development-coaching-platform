import { NextResponse } from "next/server";
import { checkEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Phase 5 — Launch health check: env + DB + seed counts for UAT.
// Public by design (no PII); used by scripts/smoke.mjs and deploy checks.
export async function GET() {
  const env = checkEnv();
  let db: string = "unknown";
  let counts: Record<string, number> | null = null;
  try {
    const [paths, lessons, services, products] = await Promise.all([
      prisma.learningPath.count(),
      prisma.lesson.count(),
      prisma.coachingService.count(),
      prisma.product.count(),
    ]);
    counts = { paths, lessons, services, products };
    db = "up";
  } catch (e) {
    db = e instanceof Error ? `down: ${e.message.slice(0, 120)}` : "down";
  }

  const phase5Ready =
    env.ok &&
    db === "up" &&
    (counts?.paths ?? 0) >= 7 &&
    (counts?.lessons ?? 0) >= 15 &&
    (counts?.services ?? 0) >= 1;

  return NextResponse.json(
    { ok: phase5Ready, env, db, counts, launch: "v0.1.0-phase5" },
    { status: phase5Ready ? 200 : 503 }
  );
}
