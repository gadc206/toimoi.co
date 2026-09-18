"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NudgeButton({
  personId,
  lastNudgedAt,
}: {
  personId: string;
  lastNudgedAt: string | null;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);
  const last = lastNudgedAt ? new Date(lastNudgedAt) : null;
  const recent = last ? Date.now() - last.getTime() < 7 * 24 * 60 * 60 * 1000 : false;

  return (
    <div>
      {last ? (
        <p className="mb-2 text-sm text-[var(--muted)]">
          Nudged {last.toLocaleDateString()}
        </p>
      ) : null}
      <button
        type="button"
        disabled={pending || recent}
        className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm disabled:opacity-50"
        onClick={async () => {
          setPending(true);
          setMsg("");
          const res = await fetch("/api/admin/nudge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ personId }),
          });
          const data = (await res.json()) as { error?: string };
          setPending(false);
          setMsg(res.ok ? "Nudge sent" : data.error || "Failed");
          if (res.ok) router.refresh();
        }}
      >
        {recent ? "Nudged this week" : "Nudge"}
      </button>
      {msg ? <p className="mt-2 text-sm text-[var(--muted)]">{msg}</p> : null}
    </div>
  );
}
