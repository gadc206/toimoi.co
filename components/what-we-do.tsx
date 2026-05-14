import Link from "next/link"

import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { SiteButton } from "@/components/site-button"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

const offerings = [
  {
    title: "Coaching",
    description:
      "Refine how you communicate, express yourself, and connect with ease.",
  },
  {
    title: "Matchmaking",
    description:
      "Carefully curated introductions aligned with who you are and what you truly want.",
  },
  {
    title: "Guidance",
    description:
      "We stay with you throughout the process, offering clarity, honesty, and perspective.",
  },
]

export function WhatWeDo() {
  return (
    <section
      id="what-we-do"
      className={cn(
        sectionY,
        sectionSurfaceClass("paper"),
        "relative overflow-hidden scroll-mt-36",
      )}
    >
      <CrystalBackdrop
        src="/images/crystal-bg-3.jpg"
        imageClassName="opacity-[0.14]"
        overlayClassName="bg-gradient-to-b from-background/85 via-background/70 to-background/90"
      />
      <SectionShell maxWidth="5xl">
        <SectionEyebrow>What we do</SectionEyebrow>
        <h2 className="mb-12 text-center font-serif text-3xl font-light text-foreground md:text-4xl">
          Three ways we walk beside you
        </h2>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {offerings.map((offering) => (
            <div
              key={offering.title}
              className="rounded-sm border border-foreground/10 bg-background/60 p-6 text-center shadow-sm backdrop-blur-[2px] md:p-8"
            >
              <h3 className="mb-3 font-serif text-xl font-medium text-foreground md:text-2xl">
                {offering.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {offering.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <SiteButton asChild variant="outline">
            <Link href="#services">Explore our services</Link>
          </SiteButton>
        </div>
      </SectionShell>
    </section>
  )
}
