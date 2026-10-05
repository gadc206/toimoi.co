"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { consultationDateFromLocalInput } from "@/lib/consultation";
import { preparePhoto } from "@/app/admin/prepare-photo";

type Option = { id: string; name: string; label: string };

function matchedReferrer(text: string, people: Option[]): string | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;
  const byLabel = people.find((person) => person.label.toLowerCase() === trimmed);
  if (byLabel) return byLabel.id;
  const byName = people.filter((person) => person.name.trim().toLowerCase() === trimmed);
  if (byName.length === 1) return byName[0].id;
  return null;
}
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
  const [savedPersonId, setSavedPersonId] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [sendOpening, setSendOpening] = useState(false);
  const [saved, setSaved] = useState(questions);
  const [rows, setRows] = useState<AnswerRow[]>([newRow()]);
  const [age, setAge] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoPending, setPhotoPending] = useState(false);
  const photoRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearPhoto() {
    photoRef.current = null;
    setPhotoName("");
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      clearPhoto();
      return;
    }
    setPhotoPending(true);
    setMessage("");
    try {
      const prepared = await preparePhoto(file);
      photoRef.current = prepared;
      setPhotoName(file.name);
      setPhotoPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(prepared);
      });
    } catch (error) {
      photoRef.current = null;
      setPhotoName("");
      setPhotoPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setMessage(error instanceof Error ? error.message : "Could not read that photo.");
      event.target.value = "";
    } finally {
      setPhotoPending(false);
    }
  }

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
    if (photoPending) {
      setMessage("Still reading the photo. Try again in a moment.");
      return;
    }
    setPending(true);
    setMessage("");
    setSavedPersonId("");
    const form = new FormData(event.currentTarget);
    const trimmedAge = age.trim();
    if (trimmedAge) {
      const parsedAge = Number(trimmedAge);
      if (!Number.isInteger(parsedAge) || parsedAge < 18 || parsedAge > 99) {
        setPending(false);
        setMessage("Age needs to be between 18 and 99.");
        return;
      }
    }
    const consultationAt = String(form.get("consultationAt") || "");
    const answers = rows
      .map((row) => ({ question: row.question.trim(), answer: row.answer.trim() }))
      .filter((row) => row.question && row.answer);
    const body = new FormData();
    body.set("firstName", String(form.get("firstName") || ""));
    body.set("phone", String(form.get("phone") || ""));
    body.set("email", String(form.get("email") || ""));
    const referredByText = String(form.get("referredBy") || "").trim();
    body.set("referredById", matchedReferrer(referredByText, people) || "");
    body.set("referredByName", referredByText);
    body.set("isClient", String(isClient));
    body.set("sendOpening", String(sendOpening));
    body.set("age", trimmedAge);
    body.set("answers", JSON.stringify(answers));
    if (isClient && consultationAt) {
      body.set("consultationAt", consultationDateFromLocalInput(consultationAt)?.toISOString() || "");
    }
    if (photoRef.current) body.set("photo", photoRef.current);
    let response: Response;
    try {
      response = await fetch("/api/admin/people", {
        method: "POST",
        body,
      });
    } catch {
      setPending(false);
      setMessage("Could not reach the server. Check your connection and try again.");
      return;
    }
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      personId?: string;
      warning?: string;
    };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error || "Could not add this person.");
      setSavedPersonId(data.personId || "");
      return;
    }
    if (data.personId) router.push(`/admin/people/${data.personId}`);
    else router.push("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Photo</span>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--accent-soft)]">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-[var(--accent)]">+</span>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <label className="relative inline-flex cursor-pointer items-center rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                onChange={onPhoto}
              />
              {photoPending ? "Reading photo…" : photoPreview ? "Change photo" : "Add photo"}
            </label>
            {photoName ? (
              <p className="truncate text-sm text-[var(--muted)]">{photoName}</p>
            ) : (
              <p className="text-sm text-[var(--muted)]">Optional. Take one or choose from your photos.</p>
            )}
            {photoPreview ? (
              <button type="button" onClick={clearPhoto} className="text-sm text-[var(--muted)]">
                Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <label className="block space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Name</span>
        <input name="firstName" className={fieldClass} />
      </label>
      <label className="block space-y-2">
        <span className="block text-base font-semibold text-[var(--ink)]">Age</span>
        <input
          name="age"
          inputMode="numeric"
          value={age}
          onChange={(event) => setAge(event.target.value.replace(/[^\d]/g, "").slice(0, 2))}
          placeholder="Optional"
          className={fieldClass}
        />
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
        <input
          name="referredBy"
          list="referrers"
          placeholder="Type a name"
          autoComplete="off"
          className={fieldClass}
        />
        <datalist id="referrers">
          {people.map((person) => (
            <option key={person.id} value={person.label} />
          ))}
        </datalist>
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
        disabled={pending || photoPending}
        className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add"}
      </button>
      {message ? <p className="text-center text-sm text-rose-700">{message}</p> : null}
      {savedPersonId ? (
        <p className="text-center text-sm">
          <a href={`/admin/people/${savedPersonId}`} className="text-[var(--accent)]">
            Open their page
          </a>
        </p>
      ) : null}
    </form>
  );
}
