// Phase 5 — Branded 404 keeps users in the journey (back to dashboard/home).
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border p-6 text-center">
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-slate-500">Let&apos;s get you back on your growth path.</p>
      <div className="flex justify-center gap-3">
        <a href="/dashboard" className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">
          Dashboard
        </a>
        <a href="/" className="rounded-xl border px-5 py-2.5">
          Home
        </a>
      </div>
    </div>
  );
}
