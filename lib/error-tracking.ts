// Phase 5 — Error tracking wrapper with PII minimization.
// Uses console in MVP; forwards to Sentry only if SENTRY_DSN is set and the
// sentry SDK is installed later. Never log emails, names, or journal text.

import { sanitizeUserForLogging } from "./safeguarding";

export function reportError(
  err: unknown,
  context?: { user?: Record<string, unknown> | null; route?: string }
): void {
  const safeUser = sanitizeUserForLogging(context?.user);
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  // Always visible locally; hook external service when configured.
  console.error("[app-error]", { message, route: context?.route ?? null, user: safeUser });
  if (stack) console.error(stack);
  const dsn = process.env.SENTRY_DSN;
  if (dsn) {
    // Placeholder: wire @sentry/nextjs here post-MVP. DSN present = intend to forward.
    console.error("[app-error] external reporter configured (SENTRY_DSN set).");
  }
}
