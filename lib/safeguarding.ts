// Phase 5 — Safeguarding helpers (MVP v0.1.0).
// Rules: 16–17 flagged as minor, guardian consent required, no public
// community in MVP, journal + feedback are always private (owner + COACH_ADMIN only).

export const MINOR_AGE_RANGE = "R16_17" as const;

export type AgeRange = "R16_17" | "R18_24" | "R25_32" | "R33_40";

export function isMinorAgeRange(ageRange: string | null | undefined): boolean {
  return ageRange === MINOR_AGE_RANGE;
}

export function validateGuardianConsent(
  ageRange: string | null | undefined,
  guardianConsent: boolean | null | undefined
): string | null {
  if (isMinorAgeRange(ageRange) && !guardianConsent) {
    return "Guardian consent is required for ages 16–17 (safeguarding).";
  }
  return null;
}

/** Community / DMs are explicitly post-MVP — always deny in v0.1.0. */
export function assertNoCommunityFeature(): never {
  throw new Error(
    "Community features are disabled in MVP v0.1.0 (safeguarding for 16–17). See README Post-MVP."
  );
}

/** Owner-only: journal entries and coach feedback are always private in MVP. */
export function canAccessPrivateRecord(
  viewerId: string,
  ownerId: string,
  viewerRole?: string | null
): boolean {
  if (viewerId === ownerId) return true;
  if (viewerRole === "COACH_ADMIN") return true;
  return false;
}

export function assertOwnerAccess(
  viewerId: string,
  ownerId: string,
  viewerRole?: string | null,
  label = "record"
): void {
  if (!canAccessPrivateRecord(viewerId, ownerId, viewerRole)) {
    throw new Error(`Access denied: ${label} is private (owner + coach only).`);
  }
}

/**
 * PII minimization for logs / error tracking: strip name, email, free-text
 * fields before logging. Keep only ids + role + ageRange bucket.
 */
export function sanitizeUserForLogging(
  user: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
  if (!user) return null;
  return {
    id: user.id ?? null,
    role: user.role ?? null,
    ageRange: user.ageRange ?? null,
    isMinor: user.isMinor ?? null,
  };
}
