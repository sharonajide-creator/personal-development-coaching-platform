"use client";

// Phase 1 — Profile CRUD: name, age range, interests, goals, improve areas,
// career/business interests, coaching interests. Tags edited comma-separated.
import { useEffect, useState } from "react";

const AGE_OPTIONS = [
  { value: "R16_17", label: "16–17" },
  { value: "R18_24", label: "18–24" },
  { value: "R25_32", label: "25–32" },
  { value: "R33_40", label: "33–40" },
];

function toCsv(v: string[] | undefined): string {
  return (v ?? []).join(", ");
}
function fromCsv(s: string): string[] {
  return s.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState("R18_24");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [interests, setInterests] = useState("");
  const [devGoals, setDevGoals] = useState("");
  const [improveAreas, setImproveAreas] = useState("");
  const [careerInterests, setCareerInterests] = useState("");
  const [coachingInterests, setCoachingInterests] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Could not load profile.");
        const { profile } = await res.json();
        setName(profile.name ?? "");
        if (profile.ageRange) setAgeRange(profile.ageRange);
        setGuardianConsent(!!profile.guardianConsent);
        setInterests(toCsv(profile.interests));
        setDevGoals(toCsv(profile.devGoals));
        setImproveAreas(toCsv(profile.improveAreas));
        setCareerInterests(toCsv(profile.careerInterests));
        setCoachingInterests(toCsv(profile.coachingInterests));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          ageRange,
          guardianConsent,
          interests: fromCsv(interests),
          devGoals: fromCsv(devGoals),
          improveAreas: fromCsv(improveAreas),
          careerInterests: fromCsv(careerInterests),
          coachingInterests: fromCsv(coachingInterests),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading your profile…</p>;

  const input = "mt-1 w-full rounded-lg border px-3 py-2";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-slate-500">Editable as you grow — your assessment recommendations use these too.</p>
      </div>
      <form onSubmit={onSave} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={input} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Age range</span>
          <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className={input}>
            {AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        {ageRange === "R16_17" && (
          <label className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <input type="checkbox" checked={guardianConsent} onChange={(e) => setGuardianConsent(e.target.checked)} className="mt-1" />
            <span>My parent/guardian consents to my participation (required for 16–17).</span>
          </label>
        )}
        {(
          [
            ["Interests", interests, setInterests, "e.g. reading, music, volunteering"],
            ["Development goals", devGoals, setDevGoals, "e.g. confidence, purpose, career"],
            ["Areas to improve", improveAreas, setImproveAreas, "e.g. time management, speaking up"],
            ["Career / business interests", careerInterests, setCareerInterests, "e.g. nursing, design, startup"],
            ["Coaching interests", coachingInterests, setCoachingInterests, "e.g. purpose, relationships, leadership"],
          ] as const
        ).map(([label, val, set, ph]) => (
          <label key={label} className="block">
            <span className="text-sm font-medium">{label} <span className="font-normal text-slate-400">(comma-separated)</span></span>
            <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className={input} />
          </label>
        ))}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {saved && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Profile saved.</p>}
        <button disabled={saving} className="rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
