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
  fiveYearLife: string;
  lifestyle: string;
  matchmakerEligibilityNotes: string;
};

const GROUPS: { title: string; keys: (keyof Fields)[] }[] = [
  {
    title: "Practical",
    keys: [
      "partnerAgeRange",
      "relocationFlexibility",
      "hasChildren",
      "openToPartnerChildren",
      "smokingBoundaries",
      "marriageTimeline",
    ],
  },
  {
    title: "Life",
    keys: ["fiveYearLife", "lifestyle"],
  },
  {
    title: "Private",
    keys: ["matchmakerEligibilityNotes"],
  },
];

const LABELS: Record<keyof Fields, string> = {
  partnerAgeRange: "Partner age range",
  relocationFlexibility: "Relocation flexibility",
  hasChildren: "Has children",
  openToPartnerChildren: "Open to partner with children",
  smokingBoundaries: "Smoking/substance boundaries",
  marriageTimeline: "Marriage timeline",
  fiveYearLife: "Five-year vision",
  lifestyle: "Lifestyle",
  matchmakerEligibilityNotes: "Private notes",
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

  return (
    <div className="space-y-5 py-3">
      {GROUPS.map((group) => (
        <div key={group.title} className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{group.title}</p>
          {group.keys.map((key) => (
            <label key={key} className="block text-xs font-medium text-[var(--muted)]">
              {LABELS[key]}
              <textarea
                value={fields[key]}
                onChange={(event) =>
                  setFields((current) => ({ ...current, [key]: event.target.value }))
                }
                rows={
                  key === "matchmakerEligibilityNotes" || key === "fiveYearLife" || key === "lifestyle"
                    ? 3
                    : 2
                }
                className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
              />
            </label>
          ))}
        </div>
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
