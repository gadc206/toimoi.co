"use client"

import { useState } from "react"

import { preparePhoto } from "@/app/admin/prepare-photo"
import { SiteButton } from "@/components/site-button"
import { useReferralCode } from "@/hooks/use-referral-code"
import { QUESTIONS, QUESTION_ORDER } from "@/lib/toimo/copy"

const fieldClass =
  "w-full border-0 border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"

const SHORT_ANSWERS = new Set(["full_name", "date_of_birth", "gender", "email", "partner_age_range"])

const INPUT_PROPS: Partial<Record<(typeof QUESTION_ORDER)[number], React.InputHTMLAttributes<HTMLInputElement>>> = {
  full_name: { autoComplete: "name" },
  date_of_birth: { type: "date" },
  email: { type: "email", autoComplete: "email" },
  partner_age_range: { placeholder: "27-36" },
}

export function JoinForm() {
  const referralCode = useReferralCode()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const form = new FormData(event.currentTarget)
      const photo = form.get("photo")
      if (!(photo instanceof File) || photo.size === 0) {
        throw new Error("Please add a selfie or a photo of yourself.")
      }
      form.set("photo", await preparePhoto(photo))
      if (referralCode) form.set("ref", referralCode)

      const response = await fetch("/api/join/form", { method: "POST", body: form })
      const result = (await response.json().catch(() => ({}))) as {
        error?: string
        shareUrl?: string
      }
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.")
      setShareUrl(result.shareUrl || "https://www.toimoi.co")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (shareUrl) {
    return (
      <div className="space-y-6 text-[17px] leading-[1.85] text-foreground/75">
        <p className="display text-3xl text-foreground">Thank you for sharing so openly ❤️</p>
        <p>
          You're in the TOIMOI network. A matchmaker will review your profile and you will be
          matched!
        </p>
        <p>If you refer this to 5 people, you go up on our list. Share this link with friends:</p>
        <p className="break-all font-medium text-foreground">{shareUrl}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-10">
      <label className="block">
        <span className="block text-sm tracking-wide text-foreground">
          Your phone number (with country code)
        </span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+1 212 555 0100"
          className={fieldClass}
        />
      </label>

      {QUESTION_ORDER.map((key, index) => (
        <label key={key} className="block">
          <span className="label block text-foreground/40">
            Question {index + 1}/{QUESTION_ORDER.length}
          </span>
          <span className="mt-2 block whitespace-pre-line text-[17px] leading-[1.6] text-foreground">
            {QUESTIONS[key]}
          </span>
          {SHORT_ANSWERS.has(key) ? (
            <input name={key} required className={fieldClass} {...INPUT_PROPS[key]} />
          ) : (
            <textarea name={key} required rows={3} className={`${fieldClass} resize-y`} />
          )}
        </label>
      ))}

      <label className="block">
        <span className="block text-[17px] leading-[1.6] text-foreground">
          Send a selfie or a photo of yourself.
        </span>
        <input
          name="photo"
          type="file"
          accept="image/*"
          required
          className="mt-4 block w-full text-sm text-foreground/70 file:mr-4 file:border file:border-foreground/20 file:bg-transparent file:px-4 file:py-2 file:text-foreground"
        />
      </label>

      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error ? <p className="text-sm text-foreground/70">{error}</p> : null}

      <div className="flex justify-center">
        <SiteButton type="submit" disabled={pending}>
          {pending ? "Sending…" : "Join the TOIMOI network"}
        </SiteButton>
      </div>
    </form>
  )
}
