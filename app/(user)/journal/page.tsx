"use client";

// Phase 2 — Reflection Journal: private entries (learnings, self-discovery,
// challenges, insights, progress, questions for the coach). Owner-only.
import { useEffect, useState } from "react";

type Entry = {
  id: string; learnings: string | null; selfDiscovery: string | null;
  challenges: string | null; insights: string | null; progressNote: string | null;
  coachQuestion: string | null; createdAt: string;
};

const FIELDS = [
  ["learnings", "What did you learn?"],
  ["selfDiscovery", "What did you discover about yourself?"],
  ["challenges", "What challenged you?"],
  ["insights", "Key insights"],
  ["progressNote", "Progress since last time"],
  ["coachQuestion", "Question for my coach"],
] as const;

const empty = { learnings: "", selfDiscovery: "", challenges: "", insights: "", progressNote: "", coachQuestion: "" };

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error("Could not load journal.");
      const data = await res.json();
      setEntries(data.entries);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load journal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function startEdit(e: Entry) {
    setEditing(e.id);
    setForm({
      learnings: e.learnings ?? "", selfDiscovery: e.selfDiscovery ?? "",
      challenges: e.challenges ?? "", insights: e.insights ?? "",
      progressNote: e.progressNote ?? "", coachQuestion: e.coachQuestion ?? "",
    });
    window.scrollTo({ top: 0 });
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const url = editing ? `/api/journal/${editing}` : "/api/journal";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save entry.");
      if (editing) {
        setEntries((es) => es.map((x) => (x.id === editing ? data.entry : x)));
      } else {
        setEntries((es) => [data.entry, ...es]);
      }
      setForm(empty);
      setEditing(null);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Could not save entry.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
    if (res.ok) setEntries((es) => es.filter((x) => x.id !== id));
  }

  if (loading) return <p className="text-sm text-slate-500">Loading your journal…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reflection Journal</h1>
        <p className="text-sm text-slate-500">Private — only you and your coach can see these. Fill any field, save.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={onSave} className="space-y-3 rounded-xl border p-4">
        <p className="text-sm font-semibold">{editing ? "Edit entry" : "New entry"}</p>
        {FIELDS.map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="font-medium">{label}</span>
            <textarea
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
        ))}
        <div className="flex gap-2">
          <button disabled={saving} className="rounded-xl bg-brand px-5 py-2 font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Save entry"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="rounded-xl border px-5 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>

      {entries.length === 0 && <p className="text-sm text-slate-500">No entries yet — your first reflection starts above.</p>}

      {entries.map((e) => (
        <div key={e.id} className="space-y-1 rounded-xl border p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</p>
            <div className="flex gap-2 text-xs">
              <button onClick={() => startEdit(e)} className="underline">Edit</button>
              <button onClick={() => void onDelete(e.id)} className="text-red-600 underline">Delete</button>
            </div>
          </div>
          {(
            [
              ["Learnings", e.learnings], ["Self-discovery", e.selfDiscovery], ["Challenges", e.challenges],
              ["Insights", e.insights], ["Progress", e.progressNote], ["For my coach", e.coachQuestion],
            ] as const
          ).map(([label, v]) => v ? <p key={label}><span className="font-medium">{label}:</span> {v}</p> : null)}
        </div>
      ))}
    </div>
  );
}
