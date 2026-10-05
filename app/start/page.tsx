"use client";

// /start — "Start your Purpose Journey": email first.
// Existing email → welcome back → login (email prefilled).
// New email → remaining account fields → account created → assessment (journey begins).
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { isMinorAgeRange, validateGuardianConsent } from "@/lib/safeguarding";

type Stage = "email" | "register";

export default function StartPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [ageRange, setAgeRange] = useState("R18_24");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/start/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.exists) {
        router.push(`/login?email=${encodeURIComponent(email.trim())}`);
      } else {
        setStage("register");
      }
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const consentError = validateGuardianConsent(ageRange, guardianConsent);
    if (consentError) {
      setError(consentError);
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email(
      {
        name,
        email: email.trim(),
        password,
        ageRange,
        isMinor: isMinorAgeRange(ageRange),
        guardianConsent,
      } as unknown as { name: string; email: string; password: string },
      { onSuccess: () => router.push("/assessment") }
    );
    setLoading(false);
    if (error) setError(error.message ?? "Could not create your account.");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <p className="text-sm font-medium text-brand">🌸 Your Purpose Journey begins here</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">One email. Your whole journey.</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email — if you&apos;re already with us, we&apos;ll welcome you back.
          If you&apos;re new, we&apos;ll create your space in under a minute.
        </p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {stage === "email" ? (
        <form onSubmit={onEmail} className="space-y-4 rounded-2xl border p-6 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium">Email address</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border px-4 py-3"
            />
          </label>
          <button disabled={loading} className="w-full rounded-xl bg-brand px-5 py-3.5 font-bold text-white disabled:opacity-50">
            {loading ? "Checking…" : "Start your Purpose Journey →"}
          </button>
          <p className="text-center text-xs text-slate-400">Free to begin · No card required</p>
        </form>
      ) : (
        <form onSubmit={onRegister} className="space-y-4 rounded-2xl border p-6 shadow-sm">
          <div className="rounded-xl bg-purple-50 p-3 text-sm">
            Welcome, <span className="font-semibold">{email}</span> ✨ Let&apos;s finish setting up your space.{" "}
            <button type="button" onClick={() => setStage("email")} className="underline">Use a different email</button>
          </div>
          <label className="block">
            <span className="text-sm font-medium">Your name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" className="mt-1 w-full rounded-xl border px-4 py-3" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Create a password</span>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="mt-1 w-full rounded-xl border px-4 py-3" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Age range</span>
            <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3">
              <option value="R16_17">16–17</option>
              <option value="R18_24">18–24</option>
              <option value="R25_32">25–32</option>
              <option value="R33_40">33–40</option>
            </select>
          </label>
          {ageRange === "R16_17" && (
            <label className="flex items-start gap-2 rounded-xl border p-3 text-sm">
              <input type="checkbox" checked={guardianConsent} onChange={(e) => setGuardianConsent(e.target.checked)} className="mt-1" />
              <span>I confirm my parent/guardian consents to my participation (required for 16–17).</span>
            </label>
          )}
          <button disabled={loading} className="w-full rounded-xl bg-brand px-5 py-3.5 font-bold text-white disabled:opacity-50">
            {loading ? "Creating your space…" : "Create my account & begin →"}
          </button>
        </form>
      )}
    </div>
  );
}
