"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HowHeardEditor({
  personId,
  initial,
  referredByName,
}: {
  personId: string;
  initial: string;
  referredByName?: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/people/${personId}/how-heard`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ howHeard: value }),
    });
    setPending(false);
    setMessage(response.ok ? "Saved." : "Could not save.");
    if (response.ok) router.refresh();
  }

  return (
    <label className="block text-sm font-semibold text-[var(--ink)]">
      How they heard about us
      {referredByName ? (
        <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
          Referred by {referredByName}
        </span>
      ) : null}
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={2}
        className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
      />
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="mt-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {message ? <span className="ml-2 text-[var(--muted)]">{message}</span> : null}
    </label>
  );
}
