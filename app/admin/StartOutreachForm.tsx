"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function StartOutreachForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error || "Failed to start outreach");
      return;
    }
    setMessage(`Opening message sent to ${data.phone}`);
    setPhone("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp"
        className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-white px-4 py-3"
      />
      <button
        disabled={loading || !phone.trim()}
        className="shrink-0 rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "…" : "Open"}
      </button>
      {message ? <p className="basis-full text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
