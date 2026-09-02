"use client"

import { useEffect, useState } from "react"

import { SiteButton } from "@/components/site-button"

type JoinDatabaseModalProps = {
  isOpen: boolean
  onClose: () => void
}

function whatsAppDeepLink(message = "Hi"): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER ||
    "+14155238886"
  const digits = raw.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function JoinDatabaseModal({ isOpen, onClose }: JoinDatabaseModalProps) {
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleClose = () => {
    setPhone("")
    setError(null)
    setSent(false)
    setIsSubmitting(false)
    onClose()
  }

  const handleTextMe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/join/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
      }
      if (!response.ok) {
        throw new Error(payload.error || "Could not start WhatsApp outreach")
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-md border border-foreground/15 bg-background p-6 shadow-xl sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-xs tracking-[0.2em] text-foreground/50 uppercase hover:text-foreground"
        >
          Close
        </button>

        <p className="font-sans text-[10px] tracking-[0.25em] text-foreground/50 uppercase">
          Private list
        </p>
        <h2 className="mt-3 font-serif text-2xl font-light text-foreground sm:text-3xl">
          Join on WhatsApp
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We’ll get to know you through a warm one-to-one WhatsApp conversation — one question at a
          time. Reply STOP anytime.
        </p>

        {sent ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm leading-relaxed text-foreground">
              You’re in. Check WhatsApp for our opening message, then reply to continue.
            </p>
            <SiteButton variant="outline" onClick={handleClose}>
              Done
            </SiteButton>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 font-sans text-[10px] tracking-[0.2em] text-foreground/45 uppercase">
                On your phone
              </p>
              <SiteButton asChild variant="outline" className="w-full">
                <a href={whatsAppDeepLink("Hi")} target="_blank" rel="noopener noreferrer">
                  Message us on WhatsApp
                </a>
              </SiteButton>
            </div>

            <div className="border-t border-foreground/10 pt-6">
              <p className="mb-3 font-sans text-[10px] tracking-[0.2em] text-foreground/45 uppercase">
                On your computer
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter your WhatsApp number and we’ll message you to begin.
              </p>
              <form onSubmit={handleTextMe} className="space-y-3">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 917 555 0100"
                  className="w-full border border-foreground/15 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/40"
                />
                {error ? <p className="text-sm text-red-700">{error}</p> : null}
                <SiteButton type="submit" variant="outline" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending…" : "Text me on WhatsApp"}
                </SiteButton>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
