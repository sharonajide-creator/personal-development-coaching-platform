"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { isMinorAgeRange, validateGuardianConsent } from "@/lib/safeguarding";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageRange, setAgeRange] = useState("R18_24");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const consentError = validateGuardianConsent(ageRange, guardianConsent);
    if (consentError) {
      setError(consentError);
      return;
    }
    setLoading(true);
    // Phase 5: persist safeguarding fields so server can flag isMinor.
    // Better Auth stores additionalFields declared in lib/auth.ts.
    const { error } = await authClient.signUp.email(
      {
        name,
        email,
        password,
        ageRange,
        isMinor: isMinorAgeRange(ageRange),
        guardianConsent,
      } as unknown as { name: string; email: string; password: string },
      {
        onSuccess: () => router.push("/dashboard"),
      }
    );
    setLoading(false);
    if (error) setError(error.message ?? "Registration failed.");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Start with discovery → assessment → your personalized path.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Age range</span>
          <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2">
            <option value="R16_17">16–17</option>
            <option value="R18_24">18–24</option>
            <option value="R25_32">25–32</option>
            <option value="R33_40">33–40</option>
          </select>
        </label>
        {ageRange === "R16_17" && (
          <label className="flex items-start gap-2 rounded-lg border p-3 text-sm">
            <input type="checkbox" checked={guardianConsent} onChange={(e) => setGuardianConsent(e.target.checked)} className="mt-1" />
            <span>I confirm my parent/guardian consents to my participation (required for 16–17).</span>
          </label>
        )}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="text-brand underline">Log in</a>
        </p>
      </form>
    </div>
  );
}
