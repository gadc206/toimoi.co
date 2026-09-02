"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RecalculateButton({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const response = await fetch(`/api/admin/matches/${matchId}/recalculate`, {
          method: "POST",
        });
        setPending(false);
        if (response.ok) router.refresh();
      }}
      className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--accent)] disabled:opacity-50"
    >
      {pending ? "Recalculating…" : "Recalculate"}
    </button>
  );
}
