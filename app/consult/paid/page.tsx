import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ConsultPaidClient } from "./ConsultPaidClient"
import { Footer } from "@/components/footer"
import { LogoMark } from "@/components/logo-mark"

export const metadata: Metadata = {
  title: "Consultation confirmed",
}

export default function ConsultPaidPage() {
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
        <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">You’re confirmed</h1>
        <Suspense>
          <ConsultPaidClient />
        </Suspense>
      </article>

      <Footer />
    </main>
  )
}
