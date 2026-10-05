import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server";
import { isMinorAgeRange, validateGuardianConsent } from "@/lib/safeguarding";

export const dynamic = "force-dynamic";

const AgeRange = z.enum(["R16_17", "R18_24", "R25_32", "R33_40"]);

// Phase 1 — Profile CRUD: editable growth profile (extends Better Auth user).
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, name: true, email: true, role: true, ageRange: true, isMinor: true,
      guardianConsent: true, interests: true, devGoals: true, improveAreas: true,
      careerInterests: true, coachingInterests: true, createdAt: true,
    },
  });
  return NextResponse.json({ profile });
}

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  ageRange: AgeRange.optional(),
  guardianConsent: z.boolean().optional(),
  interests: z.array(z.string().max(60)).max(20).optional(),
  devGoals: z.array(z.string().max(80)).max(20).optional(),
  improveAreas: z.array(z.string().max(80)).max(20).optional(),
  careerInterests: z.array(z.string().max(80)).max(20).optional(),
  coachingInterests: z.array(z.string().max(80)).max(20).optional(),
});

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { ageRange: true, guardianConsent: true },
  });
  const nextAge = parsed.data.ageRange ?? current?.ageRange ?? null;
  const nextConsent = parsed.data.guardianConsent ?? current?.guardianConsent ?? false;

  // Phase 5 safeguarding: 16–17 always requires guardian consent + minor flag.
  const consentError = validateGuardianConsent(nextAge, nextConsent);
  if (consentError) return NextResponse.json({ error: consentError }, { status: 400 });

  const profile = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...parsed.data,
      isMinor: isMinorAgeRange(nextAge),
      guardianConsent: nextConsent,
    },
    select: {
      id: true, name: true, email: true, role: true, ageRange: true, isMinor: true,
      guardianConsent: true, interests: true, devGoals: true, improveAreas: true,
      careerInterests: true, coachingInterests: true,
    },
  });
  return NextResponse.json({ profile });
}
