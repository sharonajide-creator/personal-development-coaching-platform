// Phase 5 — Env validation for launch. Call checkEnv() in health route / scripts;
// never throw at import time so `next build` stays green without secrets.

const REQUIRED = ["DATABASE_URL", "BETTER_AUTH_SECRET"] as const;
const OPTIONAL = [
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "NEXT_PUBLIC_ANALYTICS_ENABLED",
] as const;

export function checkEnv(): { ok: boolean; missing: string[]; warnings: string[] } {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  const warnings = OPTIONAL.filter((k) => !process.env[k]).map(
    (k) => `${k} not set (optional for local launch)`
  );
  return { ok: missing.length === 0, missing, warnings };
}
