// Phase 5 — Minimal privacy-friendly analytics wrapper.
// No external calls unless NEXT_PUBLIC_ANALYTICS_ENABLED=true and an endpoint
// is configured. Keeps MVP launch light; swap internals for Plausible/PostHog later.

export function isAnalyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;
  // PII minimization: never send name/email/free text — ids + buckets only.
  const safe = { ...props };
  delete (safe as Record<string, unknown>).email;
  delete (safe as Record<string, unknown>).name;
  if (typeof window !== "undefined" && typeof window.fetch === "function") {
    const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
    if (!endpoint) return;
    void fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, props: safe }),
      keepalive: true,
    }).catch(() => undefined);
  }
}
