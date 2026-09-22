import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { LogoMark } from "@/components/logo-mark"
import { SiteButton } from "@/components/site-button"
import { formatConsultationTime, googleCalendarConsultUrl } from "@/lib/consultation"

export const metadata: Metadata = {
  title: "Discovery call booked",
}

export default async function DiscoverConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ when?: string }>
}) {
  const params = await searchParams
  const when = params.when ? new Date(params.when) : null
  const validWhen = when && !Number.isNaN(when.getTime()) ? when : null
  const calendarUrl = validWhen
    ? googleCalendarConsultUrl(validWhen, {
        title: "ToiMoi discovery call",
        details: "A complimentary 15-minute discovery call with ToiMoi.",
        durationMinutes: 15,
      })
    : ""

  return (
    <main className="min-h-screen text-foreground">
      <header className="border-b border-foreground/10 bg-background">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Link href="/" aria-label="TOIMOI home">
            <LogoMark size="nav" />
          </Link>
          <Link href="/" className="nav-link">
            Home
          </Link>
        </div>
      </header>

      <article className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
        <p className="label text-foreground/50">TOIMOI</p>
        <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">You’re booked</h1>
        {validWhen ? (
          <p className="mt-3 text-[17px] leading-[1.85] text-foreground/65">
            {formatConsultationTime(validWhen)}
          </p>
        ) : (
          <p className="mt-3 text-[17px] leading-[1.85] text-foreground/65">
            Your discovery call is confirmed.
          </p>
        )}
        <p className="mt-6 text-[17px] leading-[1.85] text-foreground/65">
          Add it to Google Calendar so it is on your side too.
        </p>
        <div className="mt-10 flex flex-col items-center gap-5">
          {calendarUrl ? (
            <SiteButton asChild>
              <a href={calendarUrl} target="_blank" rel="noreferrer">
                Add to Google Calendar
              </a>
            </SiteButton>
          ) : null}
          <SiteButton asChild variant="outline">
            <Link href="/">Home</Link>
          </SiteButton>
        </div>
      </article>

      <Footer />
    </main>
  )
}
