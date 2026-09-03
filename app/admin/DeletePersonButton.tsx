"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePersonButtonProps = {
  personId: string;
  name?: string | null;
  compact?: boolean;
  redirectTo?: string;
};

export function DeletePersonButton({
  personId,
  name,
  compact = false,
  redirectTo = "/admin",
}: DeletePersonButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const label = name?.trim() || "this person";

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${label}? This removes their profile, messages, and match data permanently.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/people/${personId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not delete");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <button
        type="button"
        disabled={busy}
        onClick={handleDelete}
        className={
          compact
            ? "shrink-0 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 disabled:opacity-60"
            : "rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-60"
        }
      >
        {busy ? "Deleting…" : compact ? "Delete" : "Delete person"}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
