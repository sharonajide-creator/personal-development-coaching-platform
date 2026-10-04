"use client";

// Phase 5 — Route error boundary: friendly retry + sanitized reporting (no PII).
import { useEffect } from "react";
import { reportError } from "@/lib/error-tracking";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { route: typeof window !== "undefined" ? window.location.pathname : undefined });
  }, [error]);

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6 text-center">
      <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-slate-500">
        Your growth data is safe. Try again, or return to your dashboard.
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={reset} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">
          Try again
        </button>
        <a href="/dashboard" className="rounded-xl border px-5 py-2.5">
          Dashboard
        </a>
      </div>
    </div>
  );
}
