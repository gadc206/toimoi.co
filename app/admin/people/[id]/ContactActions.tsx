"use client";

import { useState } from "react";

export function ContactActions({
  personId,
  phone,
  email,
  firstName,
}: {
  personId: string;
  phone: string;
  email: string | null;
  firstName: string | null;
}) {
  const [channel, setChannel] = useState<"phone" | "email" | null>(null);
  const [to, setTo] = useState(email || "");
  const [subject, setSubject] = useState(firstName ? `From ToiMoi` : "From ToiMoi");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function send() {
    setPending(true);
    setMessage("");
    const path =
      channel === "email"
        ? `/api/admin/people/${personId}/email`
        : `/api/admin/people/${personId}/message`;
    const payload =
      channel === "email" ? { to, subject, body } : { body };
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    setMessage(response.ok ? "Sent." : data.error || "Could not send.");
    if (response.ok) {
      setBody("");
      setChannel(null);
    }
  }

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="text-[var(--muted)]">Phone </span>
        <button
          type="button"
          onClick={() => {
            setChannel("phone");
            setMessage("");
          }}
          className="text-[var(--accent)]"
        >
          {phone}
        </button>
      </p>
      <p>
        <span className="text-[var(--muted)]">Email </span>
        <button
          type="button"
          onClick={() => {
            setChannel("email");
            setTo(email || "");
            setMessage("");
          }}
          className="text-[var(--accent)]"
        >
          {email || "Write from ToiMoi"}
        </button>
      </p>

      {channel ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3">
          {channel === "email" ? (
            <>
              <input
                type="email"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="To"
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              />
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject"
                className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
              />
            </>
          ) : null}
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder={channel === "email" ? "Write the email…" : "Write the WhatsApp…"}
            className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-2"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={send}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-white disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => setChannel(null)}
              className="rounded-full border border-[var(--line)] px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
      {message ? <p className="text-xs text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}
