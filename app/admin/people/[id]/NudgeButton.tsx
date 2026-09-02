"use client";

import { useState } from "react";

export function NudgeButton({ personId }: { personId: string }) {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <button
        className="rounded-full border border-[var(--line)] bg-white px-4 py-2"
        onClick={async () => {
          setMsg("");
          const res = await fetch("/api/admin/nudge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ personId }),
          });
          const data = await res.json();
          setMsg(res.ok ? "Nudge sent" : data.error || "Failed");
        }}
      >
        Send resume nudge
      </button>
      {msg ? <p className="mt-2 text-sm text-[var(--muted)]">{msg}</p> : null}
    </div>
  );
}
