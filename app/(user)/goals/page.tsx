"use client";

// Phase 1 — Goals & Action Plans: define goals, break into actions, track, reflect.
import { useEffect, useState } from "react";

type Action = { id: string; title: string; done: boolean; dueDate: string | null };
type Goal = {
  id: string; title: string; timeframe: string | null; status: string;
  reflections: string | null; progress: number; actions: Action[];
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTimeframe, setNewTimeframe] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionInputs, setActionInputs] = useState<Record<string, string>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});

  async function load() {
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Could not load goals.");
      const data = await res.json();
      setGoals(data.goals);
      const r: Record<string, string> = {};
      for (const g of data.goals as Goal[]) r[g.id] = g.reflections ?? "";
      setReflections(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load goals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function updateGoal(id: string, patch: Partial<Goal>) {
    setGoals((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), timeframe: newTimeframe.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create goal.");
      setGoals((gs) => [{ ...data.goal, actions: [] }, ...gs]);
      setNewTitle("");
      setNewTimeframe("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create goal.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleAction(goal: Goal, action: Action) {
    updateGoal(goal.id, { actions: goal.actions.map((a) => (a.id === action.id ? { ...a, done: !a.done } : a)) });
    const res = await fetch(`/api/goals/${goal.id}/actions/${action.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ done: !action.done }),
    });
    if (res.ok) {
      const data = await res.json();
      updateGoal(goal.id, { progress: data.progress });
    } else {
      void load();
    }
  }

  async function addAction(goalId: string) {
    const title = (actionInputs[goalId] ?? "").trim();
    if (!title) return;
    const res = await fetch(`/api/goals/${goalId}/actions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const data = await res.json();
      setGoals((gs) => gs.map((g) => (g.id === goalId ? { ...g, actions: [...g.actions, data.action] } : g)));
      setActionInputs((m) => ({ ...m, [goalId]: "" }));
      void refreshProgress(goalId);
    }
  }

  async function refreshProgress(goalId: string) {
    const res = await fetch(`/api/goals/${goalId}`);
    if (res.ok) {
      const data = await res.json();
      updateGoal(goalId, { progress: data.goal.progress, actions: data.goal.actions });
    }
  }

  async function deleteAction(goalId: string, actionId: string) {
    const res = await fetch(`/api/goals/${goalId}/actions/${actionId}`, { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      setGoals((gs) => gs.map((g) => (g.id === goalId ? { ...g, actions: g.actions.filter((a) => a.id !== actionId), progress: data.progress } : g)));
    }
  }

  async function saveReflection(goal: Goal) {
    const res = await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reflections: reflections[goal.id] ?? "" }),
    });
    if (!res.ok) setError("Could not save reflection.");
  }

  async function setStatus(goal: Goal, status: string) {
    const res = await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      updateGoal(goal.id, { status: data.goal.status });
    }
  }

  async function deleteGoal(id: string) {
    if (!confirm("Delete this goal and all its actions?")) return;
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) setGoals((gs) => gs.filter((g) => g.id !== id));
  }

  if (loading) return <p className="text-sm text-slate-500">Loading your goals…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Goals & Action Plans</h1>
        <p className="text-sm text-slate-500">Turn clarity into goals, break them into actions, track and reflect.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={createGoal} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New goal — e.g. Read one growth book this month" className="flex-1 rounded-lg border px-3 py-2" />
        <input value={newTimeframe} onChange={(e) => setNewTimeframe(e.target.value)} placeholder="Timeframe" className="rounded-lg border px-3 py-2 sm:w-36" />
        <button disabled={creating} className="rounded-xl bg-brand px-5 py-2 font-semibold text-white disabled:opacity-50">
          {creating ? "Adding…" : "Add goal"}
        </button>
      </form>

      {goals.length === 0 && <p className="text-sm text-slate-500">No goals yet — set your first one above.</p>}

      {goals.map((g) => (
        <div key={g.id} className="space-y-3 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">{g.title}</h2>
              <p className="text-xs text-slate-500">{g.timeframe || "No timeframe"} · {g.status} · {g.progress}%</p>
            </div>
            <button onClick={() => void deleteGoal(g.id)} className="text-xs text-red-600 underline">Delete</button>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand" style={{ width: `${g.progress}%` }} />
          </div>

          <ul className="space-y-1">
            {g.actions.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={a.done} onChange={() => void toggleAction(g, a)} className="h-4 w-4" />
                <span className={a.done ? "text-slate-400 line-through" : ""}>{a.title}</span>
                <button onClick={() => void deleteAction(g.id, a.id)} className="ml-auto text-xs text-slate-400 underline">remove</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              value={actionInputs[g.id] ?? ""}
              onChange={(e) => setActionInputs((m) => ({ ...m, [g.id]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void addAction(g.id); } }}
              placeholder="Break it down — add an action"
              className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
            />
            <button onClick={() => void addAction(g.id)} className="rounded-lg border px-3 py-1.5 text-sm">Add</button>
          </div>

          <label className="block text-sm">
            <span className="font-medium">Reflection</span>
            <textarea
              value={reflections[g.id] ?? ""}
              onChange={(e) => setReflections((m) => ({ ...m, [g.id]: e.target.value }))}
              rows={2}
              placeholder="What did you learn? What's next?"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2 text-sm">
            <button onClick={() => void saveReflection(g)} className="rounded-lg border px-3 py-1.5">Save reflection</button>
            {g.status !== "COMPLETED" && <button onClick={() => void setStatus(g, "COMPLETED")} className="rounded-lg border px-3 py-1.5">Mark complete ✓</button>}
            {g.status === "COMPLETED" && <button onClick={() => void setStatus(g, "ACTIVE")} className="rounded-lg border px-3 py-1.5">Reopen</button>}
            {g.status === "ACTIVE" && <button onClick={() => void setStatus(g, "PAUSED")} className="rounded-lg border px-3 py-1.5">Pause</button>}
            {g.status === "PAUSED" && <button onClick={() => void setStatus(g, "ACTIVE")} className="rounded-lg border px-3 py-1.5">Resume</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
