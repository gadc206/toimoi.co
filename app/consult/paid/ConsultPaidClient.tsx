"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { SiteButton } from "@/components/site-button"

type SessionInfo = {
  paid?: boolean
  title?: string | null
  whenLabel?: string | null
  calendarUrl?: string | null
}

export function ConsultPaidClient() {
  const sessionId = useSearchParams().get("session_id")
  const [info, setInfo] = useState<SessionInfo | null>(null)

  useEffect(() => {
    if (!sessionId) return
    fetch(`/api/consult/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SessionInfo | null) => {
        if (data) setInfo(data)
      })
      .catch(() => {})
  }, [sessionId])

  if (!sessionId || info?.paid === false) {
    return (
      <>
        <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">Payment not complete</h1>
        <p className="mt-3 text-[17px] leading-[1.85] text-foreground/65">
          A consultation is only booked after payment. No charge was made.
        </p>
        <div className="mt-10">
          <SiteButton asChild>
            <Link href="/consult">Back to booking</Link>
          </SiteButton>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">You’re confirmed</h1>
      {info?.whenLabel ? (
        <p className="mt-3 text-[17px] leading-[1.85] text-foreground/65">{info.whenLabel}</p>
      ) : (
        <p className="mt-3 text-[17px] leading-[1.85] text-foreground/65">
          Thank you. Your {info?.title || "session"} payment was received.
        </p>
      )}
      <p className="mt-6 text-[17px] leading-[1.85] text-foreground/65">
        Add the meeting to Google Calendar to save it on your side.
      </p>
      <div className="mt-10 flex flex-col items-center gap-5">
        {info?.calendarUrl ? (
          <SiteButton asChild>
            <a href={info.calendarUrl} target="_blank" rel="noreferrer">
              Add to Google Calendar
            </a>
          </SiteButton>
        ) : null}
        <SiteButton asChild variant="outline">
          <Link href="/">Home</Link>
        </SiteButton>
      </div>
    </>
  )
}
