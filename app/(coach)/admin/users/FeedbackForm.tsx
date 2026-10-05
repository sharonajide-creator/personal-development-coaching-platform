"use client";

// Phase 4 — Coach writes personalized feedback for a user (observations,
// improvements, resources, next steps, encouragement). User reads it on journey.
import { useState } from "react";

export default function FeedbackForm({ userId }: { userId: string }) {
  const [contextType, setContextType] = useState("ASSESSMENT");
  const [observations, setObservations] = useState("");
  const [improvements, setImprovements] = useState("");
  const [resources, setResources] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [encouragement, setEncouragement] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const res = await fetch("/api/admin/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, contextType, observations, improvements, resources, nextSteps, encouragement }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Feedback sent — the user is notified.");
      setObservations(""); setImprovements(""); setResources(""); setNextSteps(""); setEncouragement("");
    } else {
      setMessage("Could not send feedback.");
    }
  }

  const area = "mt-1 w-full rounded-lg border px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-xl border p-4">
      <p className="text-sm font-semibold">Give feedback</p>
      <label className="block text-sm">Context
        <select value={contextType} onChange={(e) => setContextType(e.target.value)} className={area}>
          <option value="ASSESSMENT">Assessment</option>
          <option value="EXERCISE">Exercise</option>
          <option value="CONSULTATION">Consultation</option>
        </select>
      </label>
      {(
        [
          ["Observations", observations, setObservations],
          ["Areas to improve", improvements, setImprovements],
          ["Resources", resources, setResources],
          ["Next steps", nextSteps, setNextSteps],
          ["Encouragement", encouragement, setEncouragement],
        ] as const
      ).map(([label, v, set]) => (
        <label key={label} className="block text-sm">{label}
          <textarea value={v} onChange={(e) => set(e.target.value)} rows={2} className={area} />
        </label>
      ))}
      <button disabled={saving} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Sending…" : "Send feedback"}
      </button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </form>
  );
}
