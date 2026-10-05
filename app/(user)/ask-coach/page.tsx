"use client";

// Phase 3 — Ask the Coach: submit questions, see history, responses + referrals.
import { useEffect, useState } from "react";

type Question = {
  id: string; question: string; response: string | null; status: string;
  resourceLinks: string[]; createdAt: string; answeredAt: string | null;
};

export default function AskCoachPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/ask-coach");
      if (!res.ok) throw new Error("Could not load questions.");
      setQuestions((await res.json()).questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load questions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("Please give a little detail (min 10 characters).");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/ask-coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send question.");
      setQuestions((qs) => [data.question, ...qs]);
      setText("");
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Could not send question.");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Ask the Coach</h1>
        <p className="text-sm text-slate-500">Stuck on your journey? Ask — your coach replies with guidance and resources.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={onSubmit} className="space-y-2 rounded-xl border p-4">
        <label className="block text-sm font-medium">Your question
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="e.g. How do I stay consistent when motivation fades?" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <button disabled={sending} className="rounded-xl bg-brand px-5 py-2 font-semibold text-white disabled:opacity-50">
          {sending ? "Sending…" : "Ask my coach"}
        </button>
      </form>

      {questions.length === 0 && <p className="text-sm text-slate-500">No questions yet — your conversation starts above.</p>}

      {questions.map((q) => (
        <div key={q.id} className="space-y-2 rounded-xl border p-4 text-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleString()}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs ${q.status === "ANSWERED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {q.status === "ANSWERED" ? "Answered ✓" : "Open"}
            </span>
          </div>
          <p><span className="font-medium">You:</span> {q.question}</p>
          {q.response ? (
            <div className="rounded-lg bg-purple-50 p-3">
              <p><span className="font-medium">Coach:</span> {q.response}</p>
              {q.resourceLinks.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {q.resourceLinks.map((u) => (
                    <li key={u}><a href={u} target="_blank" rel="noreferrer" className="text-brand underline">{u}</a></li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Your coach will respond soon — you&apos;ll be notified.</p>
          )}
        </div>
      ))}
    </div>
  );
}
