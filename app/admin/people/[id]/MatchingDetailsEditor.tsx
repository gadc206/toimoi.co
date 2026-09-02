"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fields = {
  partnerAgeRange: string;
  relocationFlexibility: string;
  hasChildren: string;
  openToPartnerChildren: string;
  smokingBoundaries: string;
  marriageTimeline: string;
  matchmakerEligibilityNotes: string;
};

export function MatchingDetailsEditor({
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
    const response = await fetch(`/api/admin/people/${personId}/matching`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    setMessage(response.ok ? "Matching details saved." : data.error || "Could not save.");
    if (response.ok) router.refresh();
  }

  const labels: Record<keyof Fields, string> = {
    partnerAgeRange: "Partner age range",
    relocationFlexibility: "Relocation flexibility",
    hasChildren: "Has children",
    openToPartnerChildren: "Open to partner with children",
    smokingBoundaries: "Smoking/substance boundaries",
    marriageTimeline: "Marriage timeline",
    matchmakerEligibilityNotes: "Private eligibility notes",
  };

  return (
    <div className="space-y-3 py-3">
      {(Object.keys(fields) as (keyof Fields)[]).map((key) => (
        <label key={key} className="block text-xs font-medium text-[var(--muted)]">
          {labels[key]}
          <textarea
            value={fields[key]}
            onChange={(event) =>
              setFields((current) => ({ ...current, [key]: event.target.value }))
            }
            rows={key === "matchmakerEligibilityNotes" ? 3 : 2}
            className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
          />
        </label>
      ))}
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save matching details"}
      </button>
      {message ? <p className="text-center text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
