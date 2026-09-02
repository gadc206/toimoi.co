"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || (res.status >= 500 ? "Server error. Try again" : "Incorrect password"));
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">TOIMOI</p>
      <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">Matchmaker login</h1>
      <p className="mt-2 text-[var(--muted)]">Enter the admin password to view people.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
        />
        {error ? <p className="text-sm text-[var(--highlight)]">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-white disabled:opacity-60"
        >
          {loading ? "Checking…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
