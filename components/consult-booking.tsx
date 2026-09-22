"use client"

import { useEffect, useMemo, useState } from "react"

import { SiteButton } from "@/components/site-button"
import type { BookingServiceId } from "@/lib/booking"
import { formatConsultationSlot, type FounderId } from "@/lib/consultation"

type Slot = { at: string; hosts: FounderId[] }
type Availability = {
  amountLabel: string
  days: { date: string; slots: Slot[] }[]
}

const fieldClass =
  "w-full border-0 border-b border-foreground/20 bg-transparent py-3 text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground"

export function ConsultBooking({
  service = "consultation",
  fallbackAmountLabel = "$360",
}: {
  service?: BookingServiceId
  fallbackAmountLabel?: string
}) {
  const free = service === "discovery"
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/consult/availability?service=${service}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: Availability) => {
        if (!cancelled) setAvailability(data)
      })
      .catch(() => {
        if (!cancelled) setError("Times could not be loaded. Refresh and try again.")
      })
    return () => {
      cancelled = true
    }
  }, [service])

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const day of availability?.days || []) {
      map.set(new Date(day.date).toDateString(), day.slots)
    }
    return map
  }, [availability])

  const slots = selectedDay ? slotsByDay.get(selectedDay.toDateString()) || [] : []
  const amountLabel = availability?.amountLabel || fallbackAmountLabel
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(month)
  const monthDays = useMemo(() => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const startPad = new Date(year, monthIndex, 1).getDay()
    const lastDate = new Date(year, monthIndex + 1, 0).getDate()
    const cells: Array<Date | null> = []
    for (let i = 0; i < startPad; i += 1) cells.push(null)
    for (let date = 1; date <= lastDate; date += 1) cells.push(new Date(year, monthIndex, date))
    return cells
  }, [month])

  const shiftMonth = (delta: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  }

  const book = async () => {
    setError("")
    if (!selectedSlot || !name.trim() || !email.trim()) {
      setError("Choose a time and add your name and email.")
      return
    }
    setPending(true)
    try {
      if (free) {
        const response = await fetch("/api/discover/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            at: selectedSlot,
          }),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || "Could not book this time.")
        window.location.href = `/discover/confirmed?when=${encodeURIComponent(selectedSlot)}`
        return
      }
      const response = await fetch("/api/consult/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          consultationAt: selectedSlot,
          service,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start payment.")
      }
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete this booking.")
      setPending(false)
    }
  }

  if (!ready) {
    return <p className="text-center text-foreground/55">Loading times…</p>
  }

  return (
    <div className="space-y-10">
      <div className="mx-auto w-full max-w-[360px]">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="nav-link" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            ←
          </button>
          <p className="text-sm tracking-wide text-foreground">{monthLabel}</p>
          <button type="button" className="nav-link" onClick={() => shiftMonth(1)} aria-label="Next month">
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] tracking-wide text-foreground/40">
          {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {monthDays.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />
            const enabled = (slotsByDay.get(day.toDateString()) || []).length > 0
            const selected = selectedDay?.toDateString() === day.toDateString()
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={!enabled}
                onClick={() => {
                  setSelectedDay(day)
                  setSelectedSlot("")
                }}
                className={`aspect-square text-sm transition-colors ${
                  selected
                    ? "bg-foreground text-background"
                    : enabled
                      ? "text-foreground hover:bg-foreground/10"
                      : "text-foreground/25"
                }`}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDay ? (
        <div>
          <p className="label text-foreground/50">Available times</p>
          {slots.length === 0 ? (
            <p className="mt-4 text-foreground/60">No times left on this day.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot.at}
                  type="button"
                  onClick={() => setSelectedSlot(slot.at)}
                  className={`border px-3 py-3 text-sm tracking-wide transition-colors ${
                    selectedSlot === slot.at
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 text-foreground hover:border-foreground/40"
                  }`}
                >
                  {formatConsultationSlot(new Date(slot.at))}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-foreground/55">Pick a day to see times.</p>
      )}

      <div className="space-y-6">
        <label className="block">
          <span className="block text-sm tracking-wide text-foreground">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            autoComplete="name"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="block text-sm tracking-wide text-foreground">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
            autoComplete="email"
            placeholder="your@email.com"
          />
        </label>
      </div>

      {error ? <p className="text-sm text-foreground/70">{error}</p> : null}

      <div className="flex justify-center">
        <SiteButton onClick={book} disabled={pending || !selectedSlot}>
          {pending ? "Saving…" : free ? "Confirm time" : `Pay ${amountLabel} to confirm`}
        </SiteButton>
      </div>
    </div>
  )
}
