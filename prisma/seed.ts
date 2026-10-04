// Seed — Phase 0 paths + Phase 5 real starter content (min 3 paths × 5 lessons).
// Idempotent: safe to re-run. Other 4 paths keep 1 intro lesson until coach adds more.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const paths = [
  { slug: "self-discovery", title: "Self-Discovery", category: "SELF_DISCOVERY", description: "Personality, strengths, values, identity — answer: Who am I?", recommendedFor: "Everyone starting out", order: 1 },
  { slug: "purpose-vision", title: "Purpose & Vision", category: "PURPOSE_VISION", description: "Purpose discovery, vision, direction, goal setting.", recommendedFor: "Seekers of clarity", order: 2 },
  { slug: "confidence", title: "Confidence & Self-Development", category: "CONFIDENCE", description: "Confidence, mindset, discipline, emotional growth.", recommendedFor: "Low confidence scores", order: 3 },
  { slug: "communication", title: "Communication & Relationships", category: "COMMUNICATION", description: "Communication, boundaries, relationships.", recommendedFor: "Relationship builders", order: 4 },
  { slug: "career-business", title: "Career & Business", category: "CAREER_BUSINESS", description: "Career, entrepreneurship, branding, workplace growth.", recommendedFor: "Career-focused", order: 5 },
  { slug: "leadership", title: "Leadership", category: "LEADERSHIP", description: "Influence, decision-making, responsibility.", recommendedFor: "Emerging leaders", order: 6 },
  { slug: "productivity", title: "Productivity & Goal Achievement", category: "PRODUCTIVITY", description: "Planning, habits, time management.", recommendedFor: "Goal setters", order: 7 },
] as const;

type SeedLesson = { type: "GUIDE" | "ARTICLE" | "EXERCISE" | "WORKSHEET" | "REFLECTION"; title: string; body: string; order: number };

// Phase 5 launch content: real starter lessons the coach can edit in Admin later.
const launchLessons: Record<string, SeedLesson[]> = {
  "self-discovery": [
    { type: "GUIDE", order: 1, title: "Welcome to Self-Discovery", body: "Who am I? In this path you map personality, strengths, values and identity. Finish all 5 lessons, then record one insight in your journal." },
    { type: "ARTICLE", order: 2, title: "Your Strengths Map", body: "List 3 moments you felt alive and capable. Circle the strength each moment required (e.g. listening, organizing, encouraging). Your top repeats are your core strengths." },
    { type: "EXERCISE", order: 3, title: "Values Sort", body: "From: honesty, growth, faith, family, service, creativity, excellence — pick your top 3. For each, write one recent choice that honored it and one that did not." },
    { type: "WORKSHEET", order: 4, title: "Identity Statements", body: "Complete: I am someone who ___. I am becoming ___. I refuse to be defined by ___. Keep answers short and honest — you will revisit them in Purpose & Vision." },
    { type: "REFLECTION", order: 5, title: "Reflect: What Did You Learn About You?", body: "What surprised you? Which strength will you use this week, and where? Write it in your journal and share one question with your coach." },
  ],
  "purpose-vision": [
    { type: "GUIDE", order: 1, title: "Welcome to Purpose & Vision", body: "What is my purpose? You turn self-knowledge into direction: burden + strengths + people you serve = purpose draft, then a 12-month vision." },
    { type: "ARTICLE", order: 2, title: "Purpose Draft Formula", body: "Draft one sentence: I help [who] do [what] so that [change]. Example: I help teenage girls build confidence so they choose purpose over pressure. Imperfect is fine." },
    { type: "EXERCISE", order: 3, title: "Burden & Joy Inventory", body: "What problem makes you sad or angry? What work makes you lose track of time? Where they overlap is your assignment zone — write 3 bullets." },
    { type: "WORKSHEET", order: 4, title: "12-Month Vision Page", body: "Describe life 12 months from now across faith, growth, relationships, work. One paragraph each. Then pick ONE goal that pulls everything forward." },
    { type: "REFLECTION", order: 5, title: "Reflect: Your Next Obedient Step", body: "What is the smallest faithful step this week? Who benefits if you take it? Log it as a goal action and book a clarity call if stuck." },
  ],
  confidence: [
    { type: "GUIDE", order: 1, title: "Welcome to Confidence", body: "Confidence is built, not wished for. Mindset + discipline + emotional growth + small wins. Rate your confidence 1–10 today; re-rate after lesson 5." },
    { type: "ARTICLE", order: 2, title: "The Confidence Loop", body: "Try → evidence → belief → bigger try. Shrink the first try until it feels easy (5 minutes, one message, one ask). Record every win — evidence beats feelings." },
    { type: "EXERCISE", order: 3, title: "Reframe the Inner Critic", body: "Catch one critic thought. Write: trigger, thought, truer reframe, one action. Example: I always fail → I failed once; I learn fast; I will try again today." },
    { type: "WORKSHEET", order: 4, title: "7-Day Courage Plan", body: "Pick one daily 10-minute courage rep: speak up, ask, share, start, finish. Check off each day. Miss a day? Restart the streak, never the shame." },
    { type: "REFLECTION", order: 5, title: "Reflect: Confidence Gained", body: "Re-rate 1–10. What worked? What will you keep? Write encouragement to your future self and ask your coach for one stretch challenge." },
  ],
};

async function ensureLessons(pathId: string, slug: string, fallbackTitle: string) {
  const wanted = launchLessons[slug];
  // Non-launch paths: keep 1 intro lesson so UI never renders empty.
  if (!wanted) {
    const count = await prisma.lesson.count({ where: { pathId } });
    if (count === 0) {
      await prisma.lesson.create({
        data: { pathId, type: "GUIDE", title: `Welcome to ${fallbackTitle}`, body: "Intro lesson. Coach adds full content in Admin.", order: 1 },
      });
    }
    return;
  }
  for (const l of wanted) {
    const existing = await prisma.lesson.findFirst({ where: { pathId, order: l.order } });
    if (!existing) {
      await prisma.lesson.create({ data: { pathId, ...l } });
    } else if (existing.title.startsWith("Welcome to") && l.order === 1 && existing.body?.includes("placeholder")) {
      // Upgrade Phase 0 placeholder to real Phase 5 content.
      await prisma.lesson.update({ where: { id: existing.id }, data: { title: l.title, body: l.body, type: l.type } });
    }
  }
}

async function main() {
  for (const p of paths) {
    const path = await prisma.learningPath.upsert({
      where: { slug: p.slug },
      update: { title: p.title, description: p.description },
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category as never,
        description: p.description,
        recommendedFor: p.recommendedFor,
        order: p.order,
      },
    });
    await ensureLessons(path.id, p.slug, p.title);
  }

  const services = await prisma.coachingService.findMany();
  if (services.length === 0) {
    await prisma.coachingService.create({
      data: {
        title: "One-on-One Clarity Session",
        description: "60-minute personal coaching session over video call.",
        price: 5000,
        durationMin: 60,
      },
    });
  }

  const products = await prisma.product.findMany();
  if (products.length === 0) {
    await prisma.product.createMany({
      data: [
        { type: "BOOK", title: "Demo eBook: Discover Your Purpose", price: 1500, category: "Purpose" },
        { type: "RESOURCE", title: "Demo Worksheet Pack: Confidence Builders", price: 900, category: "Confidence" },
      ],
    });
  }

  console.log("Seed complete: 7 paths (3 x 5 lessons) + service + 2 products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
