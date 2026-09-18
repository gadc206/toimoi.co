"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  consultationNotes: string;
  clientLookingFor: string;
  clientNonNegotiables: string;
  date1Feedback: string;
  date2Feedback: string;
  date3Feedback: string;
};

const BLOCKS: { title: string; keys: (keyof Fields)[] }[] = [
  { title: "Consultation notes", keys: ["consultationNotes"] },
  { title: "Looking for", keys: ["clientLookingFor"] },
  { title: "Non-negotiables", keys: ["clientNonNegotiables"] },
  { title: "Date feedback", keys: ["date1Feedback", "date2Feedback", "date3Feedback"] },
];

const LABELS: Record<keyof Fields, string> = {
  consultationNotes: "Consultation notes",
  clientLookingFor: "Looking for",
  clientNonNegotiables: "Non-negotiables",
  date1Feedback: "Feedback from date 1",
  date2Feedback: "Feedback from date 2",
  date3Feedback: "Feedback from date 3",
};

export function ClientNotesEditor({
  personId,
  initial,
}: {
  personId: string;
  initial: Fields;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/people/${personId}/client-notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    setMessage(response.ok ? "Client notes saved." : data.error || "Could not save.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-3">
      {BLOCKS.map((block) => (
        <section
          key={block.title}
          className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4"
        >
          <h2 className="text-base font-semibold text-[var(--ink)]">{block.title}</h2>
          <div className="mt-3 space-y-3">
            {block.keys.map((key) => (
              <label key={key} className="block text-xs font-medium text-[var(--muted)]">
                {block.keys.length > 1 ? LABELS[key] : null}
                <textarea
                  value={fields[key]}
                  onChange={(event) =>
                    setFields((current) => ({ ...current, [key]: event.target.value }))
                  }
                  rows={key.startsWith("date") ? 4 : 8}
                  className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
                />
              </label>
            ))}
          </div>
        </section>
      ))}
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {message ? <p className="text-center text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
