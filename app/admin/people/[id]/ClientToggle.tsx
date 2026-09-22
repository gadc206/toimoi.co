"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  consultationDateFromLocalInput,
  consultationDateTimeLocal,
  formatConsultationTime,
  googleCalendarConsultUrl,
} from "@/lib/consultation";

export function ClientToggle({
  personId,
  isClient,
  consultationAt,
  consultationPaidAt,
}: {
  personId: string;
  isClient: boolean;
  consultationAt: string | null;
  consultationPaidAt: string | null;
}) {
  const router = useRouter();
  const [on, setOn] = useState(isClient);
  const [when, setWhen] = useState(() =>
    consultationAt ? consultationDateTimeLocal(new Date(consultationAt)) : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const savedWhen = consultationAt ? new Date(consultationAt) : null;
  const savedLabel =
    savedWhen && !Number.isNaN(savedWhen.getTime()) ? formatConsultationTime(savedWhen) : null;

  async function save(next: boolean) {
    setPending(true);
    setError("");
    const parsed = when ? consultationDateFromLocalInput(when) : null;
    if (next && when && !parsed) {
      setPending(false);
      setError("That consultation time is not valid.");
      return;
    }
    const response = await fetch(`/api/admin/people/${personId}/client`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isClient: next,
        consultationAt: next && parsed ? parsed.toISOString() : undefined,
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
      <div>
        <p className="text-sm font-semibold text-[var(--ink)]">Consultation</p>
        {savedLabel ? (
          <p className="mt-1 text-sm text-[var(--ink)]">{savedLabel}</p>
        ) : (
          <p className="mt-1 text-sm text-[var(--muted)]">No consultation booked.</p>
        )}
        {savedLabel ? (
          <p className="mt-1 text-xs text-[var(--muted)]">
            {consultationPaidAt ? "Paid" : "Not paid yet"}
          </p>
        ) : null}
      </div>
      <label className="block text-sm font-semibold text-[var(--ink)]">
        Set a New York time
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
      {savedWhen ? (
        <a
          href={googleCalendarConsultUrl(savedWhen)}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-sm text-[var(--accent)]"
        >
          Add to Google Calendar
        </a>
      ) : null}
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
