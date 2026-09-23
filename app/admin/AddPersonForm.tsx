"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
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
  const [savedPersonId, setSavedPersonId] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [sendOpening, setSendOpening] = useState(false);
  const [saved, setSaved] = useState(questions);
  const [rows, setRows] = useState<AnswerRow[]>([newRow()]);
  const [age, setAge] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
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

  function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      clearPhoto();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image for the photo.");
      event.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage("That photo is too large. Use one under 4 MB.");
      event.target.value = "";
      return;
    }
    setMessage("");
    photoRef.current = file;
    setPhotoName(file.name);
    setPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
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
    body.set("referredById", String(form.get("referredById") || ""));
    body.set("isClient", String(isClient));
    body.set("sendOpening", String(sendOpening));
    body.set("age", trimmedAge);
    body.set("answers", JSON.stringify(answers));
    if (isClient && consultationAt) {
      body.set("consultationAt", consultationDateFromLocalInput(consultationAt)?.toISOString() || "");
    }
    if (photoRef.current) body.set("photo", photoRef.current);
    const response = await fetch("/api/admin/people", {
      method: "POST",
      body,
    });
    const data = (await response.json()) as { error?: string; personId?: string; warning?: string };
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onPhoto}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)]"
            >
              {photoPreview ? "Change photo" : "Add photo"}
            </button>
            {photoName ? (
              <p className="truncate text-sm text-[var(--muted)]">{photoName}</p>
            ) : (
              <p className="text-sm text-[var(--muted)]">Optional. JPG, PNG, or HEIC under 4 MB.</p>
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
