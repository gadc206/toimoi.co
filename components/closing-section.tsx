"use client"

import { useState } from "react"

import { ContactModal } from "@/components/contact-modal"
import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { SiteButton } from "@/components/site-button"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

export function ClosingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section
        id="closing"
        className={cn(
          sectionY,
          sectionSurfaceClass("cream"),
          "relative overflow-hidden scroll-mt-36 md:py-32",
        )}
      >
        <CrystalBackdrop
          src="/images/crystal-bg-3.jpg"
          imageClassName="opacity-[0.2]"
          overlayClassName="bg-gradient-to-b from-[oklch(0.985_0.006_82/0.88)] via-[oklch(0.985_0.006_82/0.65)] to-[oklch(0.985_0.006_82/0.9)]"
        />
        <SectionShell maxWidth="2xl" className="text-center">
          <SectionEyebrow>When you are ready</SectionEyebrow>
          <p className="text-balance font-serif text-2xl font-light leading-relaxed text-foreground md:text-3xl lg:text-4xl">
            When you feel aligned with yourself,
            <br />
            the right person no longer feels far.
          </p>

          <div className="mt-10 flex justify-center">
            <SiteButton variant="solid" onClick={() => setIsModalOpen(true)}>
              Start your journey
            </SiteButton>
          </div>

          <p className="mt-12 font-serif text-lg italic text-muted-foreground">
            Not everyone is for everyone.
            <br />
            We are here to help you find the one who is.
          </p>
        </SectionShell>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="journey"
      />
    </>
  )
}
