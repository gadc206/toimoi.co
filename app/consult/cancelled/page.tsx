import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { LogoMark } from "@/components/logo-mark"
import { SiteButton } from "@/components/site-button"

export const metadata: Metadata = {
  title: "Payment cancelled",
}

export default function ConsultCancelledPage() {
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
        <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">Payment cancelled</h1>
        <p className="mt-4 text-[17px] leading-[1.85] text-foreground/65">
          No charge was made. Pick a time again whenever you are ready.
        </p>
        <div className="mt-10">
          <SiteButton asChild>
            <Link href="/consult">Back to booking</Link>
          </SiteButton>
        </div>
      </article>

      <Footer />
    </main>
  )
}
