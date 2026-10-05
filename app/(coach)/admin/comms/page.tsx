"use client";

// Phase 4 — Announcements/reminders: batched in-app notifications (no bulk email).
import { useState } from "react";

export default function CommsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSending(true);
    const res = await fetch("/api/admin/comms", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) {
      setMessage(`Sent to ${data.sent} user(s).`);
      setTitle(""); setBody("");
    } else {
      setMessage(data.error ?? "Could not send.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <a href="/admin" className="text-sm text-brand underline">← Admin</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">Announcements</h1>
        <p className="text-sm text-slate-500">One message → every user&apos;s inbox, in-app only. Use sparingly.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border p-4">
        <label className="block text-sm font-medium">Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">Message
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required maxLength={1000} rows={4} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <button disabled={sending} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-50">
          {sending ? "Sending…" : "Notify all users"}
        </button>
      </form>
      {message && <p className="rounded-lg bg-slate-50 p-3 text-sm">{message}</p>}
    </div>
  );
}
