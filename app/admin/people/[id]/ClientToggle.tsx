"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ClientToggle({
  personId,
  isClient,
  consultationAt,
}: {
  personId: string;
  isClient: boolean;
  consultationAt: string | null;
}) {
  const router = useRouter();
  const [on, setOn] = useState(isClient);
  const [when, setWhen] = useState(toLocalInput(consultationAt));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(next: boolean) {
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/people/${personId}/client`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isClient: next,
        consultationAt: next && when ? new Date(when).toISOString() : undefined,
      }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not update client.");
      return;
    }
    setOn(next);
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--ink)]">Client</p>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={pending}
          onClick={() => save(!on)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            on ? "bg-[var(--accent)]" : "bg-stone-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              on ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>
      <label className="block text-sm font-semibold text-[var(--ink)]">
        Consultation
        <input
          type="datetime-local"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)]"
        />
      </label>
      {on && when ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => save(true)}
          className="w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save consultation time"}
        </button>
      ) : null}
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
