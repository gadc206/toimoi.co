"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { preparePhoto } from "@/app/admin/prepare-photo";

export function PersonPhotoAge({
  personId,
  age,
}: {
  personId: string;
  age: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(age ? String(age) : "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function saveAge() {
    const trimmed = value.trim();
    if (trimmed) {
      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed) || parsed < 18 || parsed > 99) {
        setMessage("Age needs to be between 18 and 99.");
        return;
      }
    }
    setPending(true);
    setMessage("");
    const body = new FormData();
    body.set("age", trimmed);
    const response = await fetch(`/api/admin/people/${personId}`, { method: "PATCH", body });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setMessage(data.error || "Could not save age.");
      return;
    }
    setMessage("Age saved.");
    router.refresh();
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPending(true);
    setMessage("");
    try {
      const prepared = await preparePhoto(file);
      const body = new FormData();
      body.set("photo", prepared);
      const response = await fetch(`/api/admin/people/${personId}`, { method: "PATCH", body });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage(data.error || "Could not save that photo.");
        return;
      }
      setMessage("Photo saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read that photo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-end gap-2">
        <label className="block min-w-0 flex-1 space-y-1">
          <span className="text-sm font-semibold text-[var(--ink)]">Age</span>
          <input
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(event.target.value.replace(/[^\d]/g, "").slice(0, 2))}
            placeholder="Age"
            className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <button
          type="button"
          onClick={saveAge}
          disabled={pending}
          className="rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
      <label className="relative inline-flex cursor-pointer text-sm font-medium text-[var(--accent)]">
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={onPhoto}
          disabled={pending}
        />
        {pending ? "Saving…" : "Add or change photo"}
      </label>
      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
