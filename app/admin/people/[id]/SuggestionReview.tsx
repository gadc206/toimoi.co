"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchmakerName } from "@/lib/types";

export function SuggestionReview({
  assessmentId,
  eligibility,
  matchmakers,
}: {
  assessmentId: string;
  eligibility: string;
  matchmakers: { id: string; name: MatchmakerName }[];
}) {
  const router = useRouter();
  const [matchmakerId, setMatchmakerId] = useState(matchmakers[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function review(decision: "approve" | "hold" | "reject") {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/admin/match-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentId,
        matchmakerId,
        decision,
        notes: notes || null,
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      match?: { id: string } | null;
    };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error || "Could not save review.");
      return;
    }
    if (data.match) {
      router.push(`/admin/matches/${data.match.id}`);
      return;
    }
    setMessage(`${decision} saved.`);
    router.refresh();
  }

  return (
    <div className="mt-3 border-t border-[var(--line)] pt-3">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={matchmakerId}
          onChange={(event) => setMatchmakerId(event.target.value)}
          className="rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-xs"
        >
          {matchmakers.map((matchmaker) => (
            <option key={matchmaker.id} value={matchmaker.id}>
              {matchmaker.name}
            </option>
          ))}
        </select>
        <input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={eligibility === "pass" ? "Optional note" : "Override note required"}
          className="rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-xs"
        />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={pending || !matchmakerId}
          onClick={() => review("approve")}
          className="rounded-xl bg-[var(--accent)] px-2 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={pending || !matchmakerId}
          onClick={() => review("hold")}
          className="rounded-xl border border-[var(--line)] bg-white px-2 py-2 text-xs disabled:opacity-50"
        >
          Hold
        </button>
        <button
          type="button"
          disabled={pending || !matchmakerId}
          onClick={() => review("reject")}
          className="rounded-xl border border-rose-200 bg-white px-2 py-2 text-xs text-rose-800 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
