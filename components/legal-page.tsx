import Link from "next/link"
import type { ReactNode } from "react"

import { Footer } from "@/components/footer"
import { LogoMark } from "@/components/logo-mark"

type LegalPageProps = {
  title: string
  effectiveDate: string
  children: ReactNode
}

export function LegalPage({ title, effectiveDate, children }: LegalPageProps) {
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

      <article className="mx-auto max-w-3xl px-6 py-20 sm:px-8 sm:py-28">
        <h1 className="display text-4xl text-foreground md:text-6xl">{title}</h1>
        <p className="label mt-6 text-foreground/40">Effective date: {effectiveDate}</p>

        <div className="mt-14 space-y-10 text-[15px] leading-[1.85] text-foreground/65 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:italic [&_h2]:text-foreground [&_li]:pl-1 [&_p]:text-foreground/65 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </article>

      <Footer />
    </main>
  )
}
