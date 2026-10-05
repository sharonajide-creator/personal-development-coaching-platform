import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

// Phase 1 — Personalized Growth Dashboard aggregation.
// Answers: "What should I focus on next in my personal-growth journey?"
export async function GET() {
  const sessionUser = await getSessionUser();
  // Phase 5: unauthenticated API callers get 401 (middleware is the first gate).
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getDashboardData(sessionUser.id));
}
