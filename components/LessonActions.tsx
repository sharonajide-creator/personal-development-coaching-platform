"use client";

// Phase 2 — Per-lesson actions: mark complete / save favorite.
import { useState } from "react";

export default function LessonActions({
  lessonId,
  initialStatus,
  initialSaved,
}: {
  lessonId: string;
  initialStatus: string | null;
  initialSaved: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(initialSaved);
  const [message, setMessage] = useState<string | null>(null);

  async function complete() {
    setMessage(null);
    const next = status === "COMPLETED" ? "STARTED" : "COMPLETED";
    const res = await fetch(`/api/lessons/${lessonId}/complete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.status === 401) {
      setMessage("Log in to track your progress.");
      return;
    }
    if (!res.ok) {
      setMessage("Could not save — try again.");
      return;
    }
    const data = await res.json();
    setStatus(next);
    if (data.milestone) setMessage(`🏆 ${data.milestone.title}!`);
    else setMessage(next === "COMPLETED" ? "Marked complete ✓" : "Reopened.");
  }

  async function toggleSave() {
    setMessage(null);
    const res = await fetch(`/api/lessons/${lessonId}/save`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ saved: !saved }),
    });
    if (res.status === 401) {
      setMessage("Log in to save favorites.");
      return;
    }
    if (res.ok) {
      setSaved(!saved);
    } else {
      setMessage("Could not save — try again.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => void complete()}
        className={`rounded-xl px-4 py-2 text-sm font-semibold ${
          status === "COMPLETED" ? "border border-green-600 text-green-700" : "bg-brand text-white"
        }`}
      >
        {status === "COMPLETED" ? "✓ Completed" : "Mark complete"}
      </button>
      <button onClick={() => void toggleSave()} className="rounded-xl border px-4 py-2 text-sm">
        {saved ? "★ Saved" : "☆ Save"}
      </button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </div>
  );
}
