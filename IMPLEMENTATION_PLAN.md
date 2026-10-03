# IMPLEMENTATION_PLAN.md — Personal Development & Purpose Coaching Platform

> Discover Yourself. Develop Your Potential. Fulfill Your Purpose.

This document translates the product spec (`Document PDC/Personal Development Coaching Platform.md` + `README.md`) into a buildable implementation plan for MVP v0.1.0.

Product principle: **Not a library of courses — a personal growth companion guided by a coach.**
Every feature must answer: **Who am I? → What am I capable of? → What is my purpose? → What do I need to develop? → What should I do next? → How am I progressing?**

User journey: **Discover → Assess → Set Goals → Get Personalized Path → Learn → Practice → Connect With Coach → Track Growth → Achieve Milestones → Continue Growing**

---

## 1. MVP Scope (v0.1.0)

From README § MVP Scope — build ONLY these 12 for v0.1.0:

1. User registration / profile
2. Personal discovery assessment
3. Goal setting
4. Personalized dashboard
5. Personalized learning paths
6. Educational content
7. Ask the Coach
8. One-on-one consultation booking
9. Payments
10. Personal growth / progress tracking
11. Coach / Admin dashboard
12. Resource / book marketplace

**Explicitly Post-MVP (do NOT build in v0.1.0):**
- Group coaching
- Structured programs (Discover Your Purpose, Building Confidence, etc.)
- Community / discussions (needs safeguarding for 16–17)
- Advanced journaling (basic reflection journal IS in MVP via §12, keep simple)

---

## 2. Tech Stack (Locked — per user decisions)

- **Frontend + Backend:** Next.js 14+ (App Router, TypeScript) — one repo, monolith. Self-hosted locally (no Vercel).
- **Auth:** Better Auth — email/password + Google OAuth. Roles: `USER`, `COACH_ADMIN`. Uses Prisma adapter (`better-auth` + `@better-auth/prisma-adapter`).
- **DB + ORM:** Local PostgreSQL 16+ on your own Windows device + Prisma. No Supabase, no Neon, no hosted DB.
  - Local options: native PostgreSQL installer for Windows (recommended for now) OR Docker Compose Postgres (when Docker is installed later).
  - GUI: pgAdmin 4 (bundled with installer) or DBeaver, plus Prisma Studio for quick data view.
- **Storage:** Cloudflare R2 (S3-compatible) for videos, audio, worksheets, downloads. Accessed via S3 API (`@aws-sdk/client-s3` + presigned URLs). No Supabase Storage.
- **Payments:** Stripe (Checkout + Webhooks) — consultations, courses, books, resources. Supports confirmation + access provisioning (§15)
- **Email + Notifications:** Resend (transactional) + in-app notifications table. No push/SMS in MVP
- **Scheduling:** Custom availability slots in DB + Stripe hold → confirm (§9). No Calendly dependency in MVP (avoid external lock-in)
- **Video sessions:** External link (Zoom/Google Meet URL stored on booking) — no native video in MVP
- **Hosting / Deployment:** Local device only (Windows) — `next build` + `next start` on `http://localhost:3000`. Optional later: PM2 or Docker Compose for auto-restart + LAN access. No Vercel.

Why: full local control, no vendor lock-in for DB/auth/hosting, R2 only for cheap S3-compatible file storage.

---

## 3. High-Level Architecture

```text
.
├── README.md
├── IMPLEMENTATION_PLAN.md      # this file
├── Document PDC/
│   └── Personal Development Coaching Platform.md
├── app/
│   ├── (marketing)/            # homepage: Hero, What You Can Do, How It Works (§19)
│   ├── (auth)/login/register/
│   ├── (user)/dashboard/       # §6 Personalized Growth Dashboard
│   │   ├── goals/              # §11 Goals & Action Plans
│   │   ├── paths/              # §7 Learning Paths
│   │   ├── learn/              # §8 Learning Content
│   │   ├── journal/            # §12 Reflection & Journaling (basic)
│   │   ├── journey/            # §10 Personal Growth Journey
│   │   ├── ask-coach/          # §9 Ask the Coach
│   │   ├── bookings/           # §9 One-on-One
│   │   ├── store/              # §14 Resource & Book Store
│   │   └── profile/assessment/ # §5.1 + §5.2
│   └── (coach)/admin/          # §18 Coach/Admin Dashboard
├── prisma/schema.prisma
└── (app code coming soon)
```

---

## 4. Data Model (Prisma — MVP minimum)

Core entities needed to satisfy §5–§18:

- `User`: id, name, email, emailVerified, role, ageRange (16-17/18-24/25-32/33-40), interests[], devGoals[], improveAreas[], careerInterests[], coachingInterests[], createdAt — note: Better Auth manages `user/session/account/verification` tables; extend its `user` model with these profile fields (no separate passwordHash — Better Auth handles credentials via `account` table)
- `AssessmentResponse`: id, userId, strengths, interests, skills, challenges, aspirations, confidenceScore, goals, purposeUnderstanding, coachingNeeds, recommendation (personalized starting point), completedAt
- `Goal`: id, userId, title, timeframe, status, actions[] (via `GoalAction`: id, goalId, title, done, dueDate), reflections, progress
- `LearningPath`: id, slug, title, category (Self-Discovery | Purpose&Vision | Confidence | Communication | Career&Business | Leadership | Productivity), description, recommendedFor
- `Lesson`: id, pathId, type (video/audio/article/exercise/worksheet/reflection/guide), title, body, mediaUrl, resourceUrls[], order
- `UserProgress`: userId, lessonId, status (started/completed), saved (favorite), completedAt
- `CoachQuestion`: id, userId, question, response, status (open/answered), resourceLinks[], createdAt, answeredAt
- `CoachingService`: id, title, description, price, durationMin
- `AvailabilitySlot`: id, startAt, endAt, isBooked
- `Booking`: id, userId, serviceId, slotId, needsDescription, paymentStatus, meetingUrl, feedback, status
- `JournalEntry`: id, userId, learnings, selfDiscovery, challenges, insights, progressNote, coachQuestion, private (always true in MVP)
- `CoachFeedback`: id, userId, contextType (assessment/exercise/consultation), observations, improvements, resources, nextSteps, encouragement
- `Product`: id, type (book/course/resource), title, price, fileUrl/category, stock
- `Purchase`: id, userId, productId/bookingId, stripeSessionId, amount, status
- `Notification`: id, userId, type (session/reminder/coach-response/recommendation/goal/milestone), title, body, read, createdAt
- `Milestone/Achievement`: id, userId, title, triggeredBy, awardedAt

Safeguarding note: `ageRange==16-17` → flag `isMinor=true`; exclude from any future community, require guardian consent field at registration (store boolean).

---

## 5. Phased Build Plan

### Phase 0 — Foundation (Week 1) — all local
- [ ] Install Node.js 20 LTS + PostgreSQL 16 (Windows installer) + Git (already have repo)
- [ ] Create local DB: `pdc` database + `pdc_user` role, connection string `postgresql://pdc_user:***@localhost:5432/pdc`
- [ ] Init Next.js + TS + Tailwind + Prisma (local Postgres) + Better Auth (Prisma adapter, email/password + Google)
- [ ] Auth (register/login, roles, session), base layout, marketing homepage (§19)
- [ ] Prisma schema §4 + Better Auth tables (`user`, `session`, `account`, `verification`), migrations, seed: 7 LearningPaths (§7) + 1 CoachingService + 2 demo Products
- [ ] Cloudflare R2 bucket + S3 API keys, Stripe test mode, Resend email
- [ ] Local run: `npm run dev` → `http://localhost:3000`; prod-like: `npm run build; npm run start`
- [ ] Acceptance: user can register, log in, see empty dashboard — all against local Postgres

### Phase 1 — Discover → Goals → Dashboard (Weeks 2–3) — §§5.1, 5.2, 11, 6
- [ ] Profile CRUD (name, age range, interests, goals, improve areas, career/business, coaching interests)
- [ ] Discovery Assessment wizard (multi-step form: strengths, interests, skills, challenges, aspirations, confidence, goals, purpose, coaching needs)
- [ ] Rules-based recommender: map assessment → 2–3 suggested LearningPaths + prompt to create first Goal (no ML in MVP — simple scoring)
- [ ] Goals & Action Plans CRUD + break into actions + track + reflect
- [ ] Personalized Dashboard: goals, recommended paths, current activities, progress, upcoming sessions, coach messages, recommended resources, achievements, Q&A, next steps
- [ ] Acceptance: new user completes assessment → sees personalized starting point + dashboard answers “What should I focus on next?”

### Phase 2 — Learn + Journey (Weeks 3–4) — §§7, 8, 10, 12, 13 (read side)
- [ ] Learning Paths list/detail, Lesson viewer (video/audio/article/worksheet/reflection)
- [ ] Save favorites, mark complete, UserProgress
- [ ] Personal Growth Journey page (goals + paths + lessons + reflections + sessions + feedback + milestones — NOT just % complete)
- [ ] Basic Reflection Journal (private CRUD)
- [ ] Coach Feedback view (read-only for user; coach writes in Phase 4)
- [ ] Acceptance: user can follow a path, complete lessons, journal, see journey timeline

### Phase 3 — Coaching + Booking + Payments (Weeks 4–5) — §§9 (Ask + 1:1 only), 15
- [ ] Ask the Coach: submit question, list history, view response
- [ ] 1:1 flow: select service → pick slot → describe needs → Stripe Checkout → webhook confirms → Booking confirmed + email + in-app Notification + meeting URL
- [ ] Reschedule/cancel (simple), booking history
- [ ] Acceptance: end-to-end paid booking works in Stripe test mode; webhook provisions access

### Phase 4 — Coach/Admin + Store + Notifications (Weeks 5–6) — §§18, 14, 16
- [ ] Admin: Users (view profiles/assessments/goals/progress), Content CRUD (paths/lessons/exercises/articles/books), Coaching (services/slots/bookings/Q&A respond + resource referral), Payments (transactions/purchases), Progress (journey view + give feedback), Comms (announcements/reminders)
- [ ] Store: browse books/courses/resources, Stripe purchase, purchase history, access gating (purchased → unlock file/lesson)
- [ ] Notifications: upcoming sessions, uncompleted activities, new coach responses, recommendations, goals/milestones. In-app + email, batched, user can mute types
- [ ] Acceptance: coach can publish content, answer Q&A, manage bookings, view payments; user can buy and access a resource

### Phase 5 — Hardening + Launch (Week 7)
- [ ] Safeguarding: 16–17 flag, no public community, private journal/feedback enforced, PII minimization
- [ ] SEO homepage (§19: Hero + What You Can Do + How It Works 5 steps), analytics, error tracking
- [ ] E2E smoke: register → assess → goal → path → lesson → ask coach → book+pay → feedback → journey → purchase
- [ ] UAT with coach, seed real content (min 3 paths × 5 lessons each), launch v0.1.0

---

## 6. API Surface (MVP, Next.js Route Handlers)

- `/api/auth/*` — Better Auth handler (`/api/auth/[...all]`), email/password + Google OAuth
- `/api/profile`, `/api/assessment` (GET/POST)
- `/api/goals`, `/api/goals/:id/actions`
- `/api/dashboard` (aggregated: goals, paths, progress, sessions, messages, resources, achievements, nextSteps)
- `/api/paths`, `/api/paths/:slug`, `/api/lessons/:id/complete`, `/api/lessons/:id/save`
- `/api/journal` (CRUD, owner-only)
- `/api/journey` (aggregated timeline)
- `/api/ask-coach` (POST question, GET history)
- `/api/services`, `/api/slots`, `/api/bookings` (create → Stripe session), `/api/webhooks/stripe`
- `/api/store/products`, `/api/store/purchase`, `/api/purchases`
- `/api/notifications`
- `/api/admin/*` (role-gated: users, content, bookings, Q&A, payments, feedback, announcements)

---

## 7. Acceptance Criteria for v0.1.0

1. New user: register → profile → assessment → personalized starting point (≥2 recommended paths + prompt for 1 goal)
2. Dashboard shows: goals, paths, current activities, progress, sessions, coach messages, resources, achievements, Q&A, next step
3. User completes ≥1 path lesson + journal entry → visible in Journey
4. User asks coach → coach replies + resource referral → user notified
5. User books + pays 1:1 → confirmation + meeting link + reminder
6. User purchases store item → access provisioned + history visible
7. Coach: manages users/content/bookings/Q&A/payments/feedback/comms without code
8. No group coaching / programs / community code paths in MVP

---

## 8. What NOT to Do in MVP

- No AI/ML recommender (rules-based only)
- No native video hosting/meetings (link out)
- No community/forums/DMs (safeguarding risk)
- No mobile apps (responsive web only)
- No advanced gamification (milestones only, simple)

---

## 9. Next Steps (to kick off build)

1. Confirm stack (Next.js + Prisma + Stripe) — or swap if team prefers
2. Run Phase 0 scaffold
3. Seed 7 paths from §7 with placeholder lessons
4. Build Phase 1 vertical slice first (assessment → dashboard), demo to coach, then continue

---
*Source: `README.md` + `Document PDC/Personal Development Coaching Platform.md`. This plan is the build translation — product spec remains source of truth for WHAT; this file defines HOW + IN WHAT ORDER.*
