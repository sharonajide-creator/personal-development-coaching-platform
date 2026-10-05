import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server";
import { getJourneyItems } from "@/lib/journey";

export const dynamic = "force-dynamic";

// Phase 2 — Personal Growth Journey: one holistic timeline (goals, lessons,
// reflections, sessions, feedback, milestones) — NOT just % complete.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await getJourneyItems(user.id) });
}
