"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GateResult, MatchmakerName, StoredMatchAssessment } from "@/lib/types";

type PersonOption = {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  status: string;
};

type MatchmakerOption = { id: string; name: MatchmakerName };

export function CreateMatchForm({
  people,
  matchmakers,
  initialPersonAId = "",
}: {
  people: PersonOption[];
  matchmakers: MatchmakerOption[];
  initialPersonAId?: string;
}) {
  const router = useRouter();
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [personAId, setPersonAId] = useState(initialPersonAId);
  const [personBId, setPersonBId] = useState("");
  const [matchmakerId, setMatchmakerId] = useState(matchmakers[0]?.id || "");
  const [status, setStatus] = useState<"approved" | "proposed">("approved");
  const [notes, setNotes] = useState("");
  const [overrideNote, setOverrideNote] = useState("");
  const [assessment, setAssessment] = useState<StoredMatchAssessment | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const filter = (query: string, excludeId: string) =>
    people.filter((person) => {
      if (person.id === excludeId) return false;
      const haystack = `${person.name} ${person.age || ""} ${person.gender || ""} ${
        person.location || ""
      }`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  const optionsA = filter(queryA, personBId);
  const optionsB = filter(queryB, personAId);

  async function preview() {
    setError("");
    setAssessment(null);
    if (!personAId || !personBId) {
      setError("Choose both people first.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/admin/matches/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personAId, personBId }),
      });
      const data = (await response.json()) as {
        assessment?: StoredMatchAssessment;
        error?: string;
      };
      if (!response.ok || !data.assessment) throw new Error(data.error || "Preview failed.");
      setAssessment(data.assessment);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Preview failed.");
    } finally {
      setPending(false);
    }
  }

  async function save() {
    if (!assessment) {
      setError("Preview this pair before saving.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personAId,
          personBId,
          matchmakerId,
          status,
          notes,
          overrideNote,
        }),
      });
      const data = (await response.json()) as { match?: { id: string }; error?: string };
      if (!response.ok || !data.match) throw new Error(data.error || "Could not save match.");
      router.push(`/admin/matches/${data.match.id}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save match.");
    } finally {
      setPending(false);
    }
  }

  function personPicker(
    label: string,
    query: string,
    setQuery: (value: string) => void,
    selectedId: string,
    setSelectedId: (value: string) => void,
    options: PersonOption[],
  ) {
    return (
      <fieldset className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <legend className="px-1 text-sm font-semibold text-[var(--ink)]">{label}</legend>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, city, age…"
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
          {options.map((person) => (
            <label
              key={person.id}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 ${
                selectedId === person.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              <input
                type="radio"
                name={label}
                checked={selectedId === person.id}
                onChange={() => {
                  setSelectedId(person.id);
                  setAssessment(null);
                }}
              />
              <span className="min-w-0">
                <span className="block font-medium">
                  {person.name}
                  {person.age ? `, ${person.age}` : ""}
                </span>
                <span className="block truncate text-xs text-[var(--muted)]">
                  {[person.gender, person.location, person.status].filter(Boolean).join(" · ")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="mt-5 space-y-4">
      <label className="block rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
        <span className="text-sm font-semibold">Who is creating this match?</span>
        <select
          value={matchmakerId}
          onChange={(event) => setMatchmakerId(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
        >
          {matchmakers.map((matchmaker) => (
            <option key={matchmaker.id} value={matchmaker.id}>
              {matchmaker.name}
            </option>
          ))}
        </select>
      </label>

      {personPicker("Person A", queryA, setQueryA, personAId, setPersonAId, optionsA)}
      {personPicker("Person B", queryB, setQueryB, personBId, setPersonBId, optionsB)}

      <button
        type="button"
        disabled={pending || !personAId || !personBId}
        onClick={preview}
        className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Checking…" : "Check this pair"}
      </button>

      {assessment ? (
        <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Assessment</p>
              <h2 className="text-xl font-semibold capitalize">{assessment.fitBand} fit</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">{assessment.score}</p>
              <p className="text-xs text-[var(--muted)]">
                {Math.round(assessment.confidence * 100)}% evidence
              </p>
            </div>
          </div>
          <p
            className={`mt-3 rounded-2xl px-3 py-2 text-sm ${
              assessment.eligibility === "pass"
                ? "bg-emerald-100 text-emerald-900"
                : assessment.eligibility === "blocked"
                  ? "bg-rose-100 text-rose-900"
                  : "bg-amber-100 text-amber-900"
            }`}
          >
            Eligibility: {assessment.eligibility.replace("_", " ")}
          </p>
          <div className="mt-3 space-y-2">
            {assessment.gates
              .filter((item: GateResult) => item.status !== "pass")
              .map((item: GateResult) => (
                <div key={item.key} className="rounded-2xl border border-[var(--line)] p-3 text-sm">
                  <p className="font-medium">{item.label}</p>
                  <p className="mt-1 text-[var(--muted)]">{item.detail}</p>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {assessment ? (
        <section className="space-y-3 rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <label className="block text-sm font-medium">
            Starting status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "approved" | "proposed")}
              className="mt-1 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
            >
              <option value="approved">Approved internally</option>
              <option value="proposed">Already proposed</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Private matchmaker note
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Why these two? e.g. met at shul, families know each other…"
              className="mt-1 min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
            />
          </label>
          {assessment.eligibility !== "pass" ? (
            <label className="block text-sm font-medium text-rose-900">
              Required override note
              <textarea
                required
                value={overrideNote}
                onChange={(event) => setOverrideNote(event.target.value)}
                placeholder="Explain why this warning is safe to override."
                className="mt-1 min-h-20 w-full rounded-2xl border border-rose-300 bg-white px-3 py-3 text-[var(--ink)]"
              />
            </label>
          ) : null}
          <button
            type="button"
            disabled={
              pending ||
              !matchmakerId ||
              (assessment.eligibility !== "pass" && !overrideNote.trim())
            }
            onClick={save}
            className="w-full rounded-2xl bg-[var(--highlight)] px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Create match"}
          </button>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-rose-100 px-3 py-2 text-sm text-rose-900" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
