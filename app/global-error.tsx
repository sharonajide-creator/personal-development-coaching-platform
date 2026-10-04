"use client";

// Phase 5 — Global error boundary (root layout). Must include <html>/<body>.
import { reportError } from "@/lib/error-tracking";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { route: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Something went wrong</h1>
          <button onClick={reset} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
