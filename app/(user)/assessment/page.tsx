"use client";

// Phase 1 — Discovery Assessment wizard: strengths, interests, skills,
// challenges, aspirations, confidence, goals, purpose, coaching needs.
// Submits to POST /api/assessment → personalized starting point.
import { useState } from "react";

type Result = {
  assessment: { id: string; recommendation: string };
  recommendedPaths: { slug: string; title?: string; reason: string }[];
  hasGoal: boolean;
};

const STEPS = ["About you", "Challenges & confidence", "Dreams & purpose", "Review"];

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [f, setF] = useState({
    strengths: "",
    interests: "",
    skills: "",
    challenges: "",
    aspirations: "",
    confidenceScore: 5,
    goals: "",
    purposeUnderstanding: "",
    coachingNeeds: "",
  });

  function set(key: keyof typeof f, value: string | number) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Your personalized starting point ✨</h1>
          <p className="text-sm text-slate-500">Based on your assessment — your dashboard now reflects these picks.</p>
        </div>
        <ul className="space-y-2">
          {result.recommendedPaths.map((p) => (
            <li key={p.slug} className="rounded-xl border p-4">
              <p className="font-semibold">{p.title ?? p.slug}</p>
              <p className="text-sm text-slate-500">{p.reason}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          {!result.hasGoal && (
            <a href="/goals" className="rounded-xl bg-brand px-5 py-3 font-semibold text-white">
              Create your first goal →
            </a>
          )}
          <a href="/dashboard" className="rounded-xl border px-5 py-3">
            See my dashboard →
          </a>
        </div>
      </div>
    );
  }

  const area = "mt-1 w-full rounded-lg border px-3 py-2";
  const label = "block text-sm font-medium";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Discovery Assessment</h1>
        <p className="text-sm text-slate-500">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        <div className="mt-2 flex gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-brand" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <label className={label}>What are your strengths?<textarea value={f.strengths} onChange={(e) => set("strengths", e.target.value)} rows={3} className={area} placeholder="e.g. listening, organizing, encouraging others" /></label>
          <label className={label}>What are your interests?<textarea value={f.interests} onChange={(e) => set("interests", e.target.value)} rows={3} className={area} placeholder="e.g. music, business, helping teens" /></label>
          <label className={label}>What skills do you already have?<textarea value={f.skills} onChange={(e) => set("skills", e.target.value)} rows={3} className={area} placeholder="e.g. writing, cooking, basic design" /></label>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <label className={label}>What challenges are you facing?<textarea value={f.challenges} onChange={(e) => set("challenges", e.target.value)} rows={3} className={area} placeholder="e.g. fear of speaking up, procrastination" /></label>
          <label className={label}>What do you aspire to become?<textarea value={f.aspirations} onChange={(e) => set("aspirations", e.target.value)} rows={3} className={area} placeholder="e.g. a confident nurse who mentors girls" /></label>
          <label className={label}>Confidence right now: {f.confidenceScore}/10
            <input type="range" min={1} max={10} value={f.confidenceScore} onChange={(e) => set("confidenceScore", Number(e.target.value))} className="mt-1 w-full" />
          </label>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <label className={label}>What goals do you have in mind?<textarea value={f.goals} onChange={(e) => set("goals", e.target.value)} rows={3} className={area} placeholder="e.g. finish my course, start a small business" /></label>
          <label className={label}>How would you describe your purpose today?<textarea value={f.purposeUnderstanding} onChange={(e) => set("purposeUnderstanding", e.target.value)} rows={3} className={area} placeholder="e.g. I think it's helping others, but I'm not sure how" /></label>
          <label className={label}>What do you need most from a coach?<textarea value={f.coachingNeeds} onChange={(e) => set("coachingNeeds", e.target.value)} rows={3} className={area} placeholder="e.g. clarity, accountability, confidence" /></label>
        </div>
      )}
      {step === 3 && (
        <div className="rounded-xl border p-4 text-sm">
          <p className="font-semibold">Ready when you are.</p>
          <p className="mt-1 text-slate-500">Submitting creates your personalized starting point: 3 recommended paths plus a next step on your dashboard.</p>
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex justify-between">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-xl border px-5 py-2.5 disabled:opacity-40">
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white">
            Continue →
          </button>
        ) : (
          <button disabled={submitting} onClick={onSubmit} className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-50">
            {submitting ? "Building your starting point…" : "Get my starting point ✨"}
          </button>
        )}
      </div>
    </div>
  );
}
