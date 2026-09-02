"use client"

import { useState } from "react"

import { SiteButton } from "@/components/site-button"
import { whatsAppDeepLink } from "@/lib/whatsapp-join"
import { cn } from "@/lib/utils"

type JoinPathsProps = {
  className?: string
  stacked?: boolean
}

export function JoinPaths({ className, stacked = false }: JoinPathsProps) {
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

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

  if (sent) {
    return (
      <p className={cn("leading-[1.8] text-foreground", className)}>
        You are on the list. Check WhatsApp and reply when you are ready.
      </p>
    )
  }

  return (
    <div
      className={cn(
        "grid items-start gap-10",
        stacked ? "grid-cols-1" : "sm:grid-cols-[1fr_auto_1fr] sm:gap-8",
        className,
      )}
    >
      <div>
        <p className="label mb-6 text-foreground/40">From your phone</p>
        <SiteButton asChild variant="outline">
          <a href={whatsAppDeepLink("Hi")} target="_blank" rel="noopener noreferrer">
            Open WhatsApp
          </a>
        </SiteButton>
      </div>

      <p className="label self-center text-center text-foreground/30">or</p>

      <div>
        <p className="label mb-6 text-foreground/40">From your computer</p>
        <form onSubmit={handleTextMe} className="space-y-5">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            className="w-full border-0 border-b border-foreground/20 bg-transparent py-3 text-sm tracking-[0.04em] text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"
          />
          {error ? <p className="text-sm text-foreground/70">{error}</p> : null}
          <SiteButton type="submit" variant="outline" disabled={isSubmitting}>
            {isSubmitting ? "Adding you" : "Text me on WhatsApp"}
          </SiteButton>
        </form>
      </div>
    </div>
  )
}
