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
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap gap-3">
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp +15551234567"
        className="min-w-[220px] flex-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2"
      />
      <button
        disabled={loading || !phone.trim()}
        className="rounded-full bg-[var(--accent)] px-5 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send WhatsApp opener"}
      </button>
      {message ? <p className="w-full text-sm text-[var(--muted)]">{message}</p> : null}
    </form>
  );
}
