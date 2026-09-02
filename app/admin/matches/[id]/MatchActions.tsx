"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchStatus } from "@/lib/types";

export function MatchActions({
  matchId,
  initialStatus,
  initialNotes,
}: {
  matchId: string;
  initialStatus: MatchStatus;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes || "");
  const [stage, setStage] = useState("proposed");
  const [personAResponse, setPersonAResponse] = useState("");
  const [personBResponse, setPersonBResponse] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function updateMatch() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    setMessage(response.ok ? "Match updated." : data.error || "Update failed.");
    if (response.ok) router.refresh();
  }

  async function addOutcome() {
    setPending(true);
    setMessage("");
    const response = await fetch(`/api/admin/matches/${matchId}/outcomes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage,
        personAResponse: personAResponse || null,
        personBResponse: personBResponse || null,
        notes: outcomeNotes || null,
      }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    setMessage(response.ok ? "Outcome added." : data.error || "Could not add outcome.");
    if (response.ok) {
      setOutcomeNotes("");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h2 className="font-semibold">Update match</h2>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as MatchStatus)}
          className="mt-3 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3 capitalize"
        >
          {["draft", "approved", "proposed", "dating", "paused", "closed", "engaged", "married"].map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </select>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Private matchmaker notes"
          className="mt-3 min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
        />
        <button
          type="button"
          disabled={pending}
          onClick={updateMatch}
          className="mt-3 w-full rounded-2xl bg-[var(--accent)] px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          Save changes
        </button>
      </section>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <h2 className="font-semibold">Add dating outcome</h2>
        <select
          value={stage}
          onChange={(event) => setStage(event.target.value)}
          className="mt-3 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
        >
          {[
            "proposed",
            "accepted",
            "declined",
            "first_date",
            "second_date",
            "continued",
            "ended",
            "engaged",
            "married",
          ].map((value) => (
            <option key={value} value={value}>
              {value.replace("_", " ")}
            </option>
          ))}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            value={personAResponse}
            onChange={(event) => setPersonAResponse(event.target.value)}
            placeholder="Person A response"
            className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
          />
          <input
            value={personBResponse}
            onChange={(event) => setPersonBResponse(event.target.value)}
            placeholder="Person B response"
            className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <textarea
          value={outcomeNotes}
          onChange={(event) => setOutcomeNotes(event.target.value)}
          placeholder="What happened? Structured stage above; private context here."
          className="mt-3 min-h-20 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
        />
        <button
          type="button"
          disabled={pending}
          onClick={addOutcome}
          className="mt-3 w-full rounded-2xl bg-[var(--highlight)] px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          Add to timeline
        </button>
      </section>
      {message ? <p className="text-center text-sm text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
