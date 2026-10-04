"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.signIn.email(
      { email, password },
      { onSuccess: () => router.push("/dashboard") }
    );
    setLoading(false);
    if (error) setError(error.message ?? "Login failed.");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Continue your growth journey.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50">
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-center text-sm text-slate-500">
          New here? <a href="/register" className="text-brand underline">Create an account</a>
        </p>
      </form>
    </div>
  );
}
