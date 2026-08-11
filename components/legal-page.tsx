import Link from "next/link"
import type { ReactNode } from "react"
import { Footer } from "@/components/footer"

type LegalPageProps = {
  title: string
  effectiveDate: string
  children: ReactNode
}

export function LegalPage({ title, effectiveDate, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-[0.08em] text-foreground md:text-2xl"
          >
            ToiMoi
          </Link>
          <Link
            href="/"
            className="text-xs tracking-[0.2em] text-foreground/65 uppercase transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
        <p className="mb-3 text-xs tracking-[0.22em] text-muted-foreground uppercase">
          Legal
        </p>
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Effective date: {effectiveDate}
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-muted-foreground [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-light [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:pl-1 [&_p]:text-muted-foreground [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>

        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-8 text-sm">
          <Link
            href="/privacy"
            className="text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Terms and Conditions
          </Link>
        </div>
      </article>

      <Footer />
    </main>
  )
}
