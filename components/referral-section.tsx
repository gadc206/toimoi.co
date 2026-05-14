"use client"

import { useState } from "react"

import { ContactModal } from "@/components/contact-modal"
import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { SiteButton } from "@/components/site-button"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

export function ReferralSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section
        id="referral"
        className={cn(
          sectionY,
          sectionSurfaceClass("sage"),
          "relative overflow-hidden scroll-mt-36",
        )}
      >
        <CrystalBackdrop
          src="/images/crystal-bg-1.jpg"
          imageClassName="opacity-[0.15]"
          overlayClassName="bg-gradient-to-b from-[oklch(0.965_0.014_155/0.9)] via-[oklch(0.965_0.014_155/0.72)] to-[oklch(0.965_0.014_155/0.9)]"
        />
        <SectionShell maxWidth="2xl" className="text-center">
          <SectionEyebrow>For friends</SectionEyebrow>
          <h2 className="mb-5 font-serif text-2xl font-light text-foreground md:text-3xl">
            Referral privilege
          </h2>

          <p className="mb-4 text-muted-foreground leading-relaxed">
            Introduce someone to our circle, and if we begin working with them — whether as a client or through a curated introduction — you will receive a complimentary 30-minute private coaching session as our way of saying thank you.
          </p>

          <p className="mb-8 font-serif italic text-foreground">
            Because meaningful connections deserve to be celebrated.
          </p>

          <div className="flex justify-center">
            <SiteButton variant="outline" onClick={() => setIsModalOpen(true)}>
              Refer someone
            </SiteButton>
          </div>
        </SectionShell>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="referral"
      />
    </>
  )
}
