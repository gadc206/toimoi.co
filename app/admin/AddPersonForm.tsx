"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { consultationDateFromLocalInput } from "@/lib/consultation";

type Option = { id: string; label: string };
type SavedQuestion = { id: string; text: string };
type AnswerRow = { id: string; question: string; answer: string };

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        on ? "bg-[var(--accent)]" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          on ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

const fieldClass =
  "w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)]";

function newRow(): AnswerRow {
  return { id: crypto.randomUUID(), question: "", answer: "" };
}

export function AddPersonForm({
  people,
  questions,
}: {
  people: Option[];
  questions: SavedQuestion[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [sendOpening, setSendOpening] = useState(false);
  const [saved, setSaved] = useState(questions);
  const [rows, setRows] = useState<AnswerRow[]>([newRow()]);

  async function rememberQuestion(text: string) {
    const trimmed = text.trim();
    if (trimmed.length < 2 || saved.some((item) => item.text === trimmed)) return;
    const response = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
    const data = (await response.json()) as { question?: SavedQuestion };
    if (data.question) {
      setSaved((current) =>
        current.some((item) => item.text === data.question!.text)
          ? current
          : [data.question!, ...current],
      );
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const consultationAt = String(form.get("consultationAt") || "");
    const answers = rows
      .map((row) => ({ question: row.question.trim(), answer: row.answer.trim() }))
      .filter((row) => row.question && row.answer);
    const response = await fetch("/api/admin/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: String(form.get("firstName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        referredById: String(form.get("referredById") || "") || undefined,
        isClient,
        consultationAt:
          isClient && consultationAt
            ? consultationDateFromLocalInput(consultationAt)?.toISOString()
            : undefined,
        sendOpening,
        answers,
      }),
    });
    const data = (await response.json()) as { error?: string; personId?: string; warning?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error || "Could not add this person.");
      return;
    }
    if (data.personId) router.push(`/admin/people/${data.personId}`);
    else router.push("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Name</span>
        <input name="firstName" className={fieldClass} />
      </label>
      <label className="block space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Phone</span>
        <input name="phone" required placeholder="+1…" className={fieldClass} />
      </label>
      <label className="block space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Email</span>
        <input name="email" type="email" className={fieldClass} />
      </label>
      <label className="block space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Who referred them?</span>
        <select name="referredById" className={fieldClass}>
          <option value="">Unknown</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-5">
        {rows.map((row, index) => (
          <div key={row.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-base font-semibold text-[var(--ink)]">
                {index === 0 ? "Question" : `Question ${index + 1}`}
              </span>
              {rows.length > 1 ? (
                <button
                  type="button"
                  className="text-sm text-[var(--muted)]"
                  onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input
              list="saved-questions"
              value={row.question}
              onChange={(event) => {
                const question = event.target.value;
                setRows((current) =>
                  current.map((item) => (item.id === row.id ? { ...item, question } : item)),
                );
              }}
              onBlur={() => rememberQuestion(row.question)}
              placeholder="Write a question, or pick one"
              className={fieldClass}
            />
            <textarea
              value={row.answer}
              onChange={(event) => {
                const answer = event.target.value;
                setRows((current) =>
                  current.map((item) => (item.id === row.id ? { ...item, answer } : item)),
                );
              }}
              rows={3}
              placeholder="Answer"
              className={fieldClass}
            />
          </div>
        ))}
        <datalist id="saved-questions">
          {saved.map((question) => (
            <option key={question.id} value={question.text} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={() => setRows((current) => [...current, newRow()])}
          className="text-sm font-medium text-[var(--accent)]"
        >
          Add another question
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-[var(--ink)]">Are they a client?</p>
        <Toggle on={isClient} onChange={setIsClient} />
      </div>

      {isClient ? (
        <label className="block space-y-2">
          <span className="block text-base font-semibold text-[var(--ink)]">
            When is the consultation? (New York time)
          </span>
          <input type="datetime-local" name="consultationAt" required className={fieldClass} />
        </label>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-base font-semibold text-[var(--ink)]">Send the WhatsApp opening?</p>
        <Toggle on={sendOpening} onChange={setSendOpening} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add"}
      </button>
      {message ? <p className="text-center text-sm text-rose-700">{message}</p> : null}
    </form>
  );
}
