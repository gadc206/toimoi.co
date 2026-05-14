"use client"

import { useState } from "react"

import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { JoinDatabaseModal } from "@/components/join-database-modal"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { SiteButton } from "@/components/site-button"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

export function JoinDatabaseSection() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section
        id="join"
        className={cn(
          sectionY,
          sectionSurfaceClass("paper"),
          "relative overflow-hidden scroll-mt-36 border-b border-foreground/10",
        )}
      >
        <CrystalBackdrop
          src="/images/crystal-bg-2.jpg"
          imageClassName="opacity-[0.16]"
          overlayClassName="bg-gradient-to-b from-background/88 via-background/75 to-background/92"
        />
        <SectionShell maxWidth="2xl" className="text-center">
          <SectionEyebrow>Private list</SectionEyebrow>
          <h2 className="mb-6 font-serif text-3xl font-light text-foreground md:text-4xl">
            Add yourself to our database
          </h2>

          <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
            Join our private singles list and let us guide you toward the right match.
          </p>

          <div className="flex justify-center">
            <SiteButton variant="outline" onClick={() => setModalOpen(true)}>
              Click Here to Join
            </SiteButton>
          </div>
        </SectionShell>
      </section>

      <JoinDatabaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
