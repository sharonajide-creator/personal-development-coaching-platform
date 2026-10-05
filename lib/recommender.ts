// Phase 1 — Rules-based recommender (no ML in MVP).
// Maps assessment + profile → 2–3 suggested LearningPaths with reasons,
// plus the suggested next step (dashboard "What should I focus on next?").

export type RecommendedPath = { slug: string; reason: string };

type AssessmentInput = {
  strengths?: string | null;
  interests?: string | null;
  skills?: string | null;
  challenges?: string | null;
  aspirations?: string | null;
  confidenceScore?: number | null;
  goals?: string | null;
  purposeUnderstanding?: string | null;
  coachingNeeds?: string | null;
};

type ProfileInput = {
  interests?: string[];
  devGoals?: string[];
  improveAreas?: string[];
  careerInterests?: string[];
  coachingInterests?: string[];
};

const KEYWORDS: Record<string, string[]> = {
  "self-discovery": ["identity", "strength", "values", "personality", "who am i", "confused", "lost", "know myself"],
  "purpose-vision": ["purpose", "vision", "direction", "calling", "meaning", "future", "clarity", "goal"],
  confidence: ["confidence", "fear", "shy", "mindset", "discipline", "esteem", "doubt", "believe in myself"],
  communication: ["communicat", "relationship", "boundar", "speak", "conflict", "friend", "marriage", "talk"],
  "career-business": ["career", "business", "job", "entrepreneur", "brand", "work", "promotion", "income", "startup"],
  leadership: ["leader", "influence", "team", "decision", "lead", "responsib"],
  productivity: ["productiv", "habit", "time", "planning", "procrastinat", "focus", "organiz", "discipline"],
};

const REASONS: Record<string, string> = {
  "self-discovery": "Your answers point to identity and strengths questions — start with who you are.",
  "purpose-vision": "You asked about purpose and direction — turn self-knowledge into a clear vision.",
  confidence: "Your confidence score and challenges suggest building belief through small wins first.",
  communication: "Relationships and communication came up — learn to speak up with healthy boundaries.",
  "career-business": "Your career and work interests map directly to this path.",
  leadership: "Influence and responsibility themes — grow as someone others follow.",
  productivity: "Habits, focus and follow-through — turn intentions into a system.",
};

function blob(a: AssessmentInput, p: ProfileInput): string {
  return [
    a.strengths, a.interests, a.skills, a.challenges, a.aspirations,
    a.goals, a.purposeUnderstanding, a.coachingNeeds,
    ...(p.interests ?? []), ...(p.devGoals ?? []), ...(p.improveAreas ?? []),
    ...(p.careerInterests ?? []), ...(p.coachingInterests ?? []),
  ]
    .filter(Boolean)
    .join(" \n ")
    .toLowerCase();
}

export function recommendPaths(
  assessment: AssessmentInput,
  profile: ProfileInput,
  availableSlugs: string[],
  count = 3
): RecommendedPath[] {
  const text = blob(assessment, profile);
  const scores: Record<string, number> = {};

  for (const slug of availableSlugs) {
    let score = 0;
    for (const kw of KEYWORDS[slug] ?? []) {
      if (text.includes(kw)) score += 1;
    }
    scores[slug] = score;
  }

  // Heuristic boosts (transparent, explainable).
  if ((assessment.confidenceScore ?? 10) <= 4) {
    scores.confidence = (scores.confidence ?? 0) + 3;
  }
  if (!assessment.purposeUnderstanding || assessment.purposeUnderstanding.trim().length < 20) {
    scores["purpose-vision"] = (scores["purpose-vision"] ?? 0) + 2;
  }
  if ((profile.careerInterests ?? []).length > 0) {
    scores["career-business"] = (scores["career-business"] ?? 0) + 2;
  }
  // Everyone starts with self-discovery as a floor so new users always get a base.
  scores["self-discovery"] = (scores["self-discovery"] ?? 0) + 1;

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([slug]) => ({ slug, reason: REASONS[slug] ?? "Recommended for you." }));
}

export function buildRecommendationText(recs: RecommendedPath[], hasGoal: boolean): string {
  const lines = recs.map((r, i) => `${i + 1}. ${r.slug}: ${r.reason}`);
  lines.push(
    hasGoal
      ? "Next step: continue your current goal — complete one action this week."
      : "Next step: create your first goal from your assessment insights."
  );
  return lines.join("\n");
}
