"use client";

// Phase 4 — Notifications center: inbox, mark read, mute types (useful, not
// overwhelming — muted types stop appearing here).
import { useEffect, useState } from "react";

// Mirrors NOTIFICATION_TYPES in app/api/notifications/route.ts (kept local so
// no server code ships to the client bundle).
const NOTIFICATION_TYPES = [
  "session", "reminder", "coach-response", "recommendation", "goal", "milestone", "announcement",
] as const;

type Note = { id: string; type: string; title: string; body: string | null; read: boolean; createdAt: string };

export default function NotificationsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [muted, setMuted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Could not load notifications.");
      const data = await res.json();
      setNotes(data.notifications);
      setMuted(data.mutedTypes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    void load();
  }

  async function toggleMute(type: string) {
    await fetch("/api/notifications", {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, muted: !muted.includes(type) }),
    });
    void load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Notifications</h1>
        <button onClick={() => void markAll()} className="rounded-xl border px-3 py-1.5 text-sm">Mark all read</button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {notes.length === 0 && <p className="text-sm text-slate-500">All caught up 🎉</p>}
      {notes.map((n) => (
        <div key={n.id} className={`rounded-xl border p-3 text-sm ${n.read ? "opacity-60" : ""}`}>
          <p className="font-medium">{n.title}</p>
          {n.body && <p className="text-slate-500">{n.body}</p>}
          <p className="mt-1 text-xs text-slate-400">{n.type} · {new Date(n.createdAt).toLocaleString()}</p>
        </div>
      ))}

      <div className="rounded-xl border p-4">
        <p className="text-sm font-semibold">Mute types</p>
        <p className="text-xs text-slate-500">Muted types stop appearing. Sessions and coach replies are recommended on.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {NOTIFICATION_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => void toggleMute(t)}
              className={`rounded-full px-3 py-1 text-xs ${muted.includes(t) ? "bg-slate-800 text-white" : "border"}`}
            >
              {muted.includes(t) ? `🔕 ${t}` : t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
