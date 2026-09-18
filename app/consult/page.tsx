import type { Metadata } from "next"
import Link from "next/link"

import { ConsultBooking } from "@/components/consult-booking"
import { Footer } from "@/components/footer"
import { LogoMark } from "@/components/logo-mark"

export const metadata: Metadata = {
  title: "Book a consultation",
  description: "Choose a time for your ToiMoi consultation, then confirm with payment.",
  alternates: { canonical: "https://www.toimoi.co/consult" },
}

export default function ConsultPage() {
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

      <article className="mx-auto max-w-xl px-6 py-16 sm:py-24">
        <p className="label text-foreground/50">Personal consultation</p>
        <h1 className="display mt-4 text-4xl text-foreground md:text-6xl">Book a time</h1>
        <p className="mt-6 text-[17px] leading-[1.85] text-foreground/65">
          One hour, in person in New York. Choose a day, then pay to hold the meeting.
          After payment you can add it to Google Calendar.
        </p>
        <div className="mt-12">
          <ConsultBooking />
        </div>
      </article>

      <Footer />
    </main>
  )
}
