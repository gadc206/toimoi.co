"use client"

import { useState } from "react"
import { ContactModal } from "@/components/contact-modal"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { SiteButton } from "@/components/site-button"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

/** Keeps price + CTA aligned across “Work With Us” rows on desktop */
const servicesActionCol =
  "flex w-full flex-col gap-4 md:ml-auto md:max-w-[15rem] md:items-end md:text-right md:min-h-[7.5rem] md:justify-end"

function OfferingFlowRule() {
  return (
    <div className="flex justify-center py-6 md:py-8" aria-hidden>
      <div className="h-px w-12 bg-foreground/15 md:w-16" />
    </div>
  )
}

export function ServicesSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalService, setModalService] = useState<"discovery" | "consultation" | "coaching" | "signature">("discovery")

  const openModal = (service: "discovery" | "consultation" | "coaching" | "signature") => {
    setModalService(service)
    setModalOpen(true)
  }

  return (
    <>
      <section
        id="services"
        className={cn(
          sectionY,
          sectionSurfaceClass("paper"),
          "scroll-mt-36",
        )}
      >
        <SectionShell maxWidth="4xl">
          <SectionEyebrow>Work with us</SectionEyebrow>
          <h2 className="mb-3 text-center font-serif text-3xl font-light text-foreground md:text-4xl">
            Offerings
          </h2>
          <p className="mb-12 text-center text-muted-foreground md:mb-14">
            Each offering is designed with intention and care
          </p>

          <div className="space-y-12 md:space-y-14">
            {/* Tiered sessions: distinct band so pricing reads as one intentional block */}
            <div
              className={cn(
                "rounded-sm border border-foreground/12 p-6 shadow-sm ring-1 ring-inset ring-foreground/[0.04] md:p-10",
                "bg-[oklch(0.972_0.008_78)]",
              )}
            >
              <p className="mb-8 text-center text-[0.65rem] tracking-[0.28em] text-foreground/45 uppercase">
                Sessions & pricing
              </p>

              {/* Discovery Call */}
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="mb-4 font-serif text-2xl font-light text-foreground md:text-3xl">
                    Discovery Call
                  </h3>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    A 15-minute conversation to see if we are the right fit for each other. No pressure. No
                    commitment. Just an honest first connection.
                  </p>
                </div>

                <div className={servicesActionCol}>
                  <span className="font-serif text-xl italic text-foreground">Complimentary</span>
                  <SiteButton
                    variant="outline-sm"
                    size="cta"
                    className="rounded-full"
                    onClick={() => openModal("discovery")}
                  >
                    Book your free call
                  </SiteButton>
                </div>
              </div>

              <OfferingFlowRule />

              {/* Personal Consultation */}
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="mb-4 font-serif text-2xl font-light text-foreground md:text-3xl">
                    Personal Consultation
                  </h3>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    A deeply personal in-person meeting where we take the time to truly understand who you are,
                    what you have been through, and what you are genuinely looking for. This is where your journey
                    begins.
                  </p>
                </div>

                <div className={servicesActionCol}>
                  <div className="text-right">
                    <span className="font-serif text-xl text-foreground">$350</span>
                    <p className="mt-1 text-sm text-muted-foreground">One Hour</p>
                  </div>
                  <SiteButton
                    variant="outline-sm"
                    size="cta"
                    className="rounded-full"
                    onClick={() => openModal("consultation")}
                  >
                    Book your consultation
                  </SiteButton>
                </div>
              </div>

              <OfferingFlowRule />

              {/* Clarity & Connection Session */}
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="mb-4 font-serif text-2xl font-light text-foreground md:text-3xl">
                    Clarity & Connection Session
                  </h3>
                  <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    A personalized one on one experience designed to help you gain clarity, strengthen your
                    confidence, refine the way you communicate, and better understand the relationship patterns that
                    may be holding you back. True connection begins with self awareness, presence, and authenticity.
                  </p>
                </div>

                <div className={servicesActionCol}>
                  <span className="font-serif text-xl text-foreground">$500</span>
                  <SiteButton
                    variant="outline-sm"
                    size="cta"
                    className="rounded-full"
                    onClick={() => openModal("coaching")}
                  >
                    Book your session
                  </SiteButton>
                </div>
              </div>
            </div>

            <OfferingFlowRule />

            {/* The Signature Experience — compact so the card reads at a glance */}
            <div>
              <div className="rounded-sm border border-foreground/10 bg-foreground p-5 text-background shadow-sm sm:p-6 md:p-8">
                <div className="mx-auto max-w-5xl md:grid md:grid-cols-12 md:gap-8 md:items-stretch">
                  <div className="md:col-span-7">
                    <p className="text-center text-[0.65rem] tracking-[0.28em] text-background/55 uppercase md:text-left">
                      Our most intimate offering
                    </p>
                    <h3 className="mt-2 text-center font-serif text-2xl font-light text-background sm:text-3xl md:text-left">
                      The Signature Experience
                    </h3>
                    <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-background/78 md:mx-0 md:text-left md:text-[0.9375rem]">
                      A bespoke six-month journey around your story, values, and vision for love—curated
                      introductions, steady guidance, and full discretion.
                    </p>

                    <div className="mt-5 border-t border-background/15 pt-5 md:mt-6 md:pt-6">
                      <p className="text-center text-[0.65rem] tracking-[0.28em] text-background/55 uppercase md:text-left">
                        Includes
                      </p>
                      <ul className="mt-3 grid gap-2 text-center text-sm text-background/85 sm:grid-cols-2 sm:gap-x-6 sm:text-left">
                        <li className="sm:border-r sm:border-background/15 sm:pr-4">
                          Coaching sessions
                        </li>
                        <li>Personal image refinement—natural, elevated, true to you</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col justify-center border-t border-background/15 pt-6 text-center md:col-span-5 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-8 md:text-left">
                    <p className="font-serif text-base italic leading-snug text-background/70">
                      By invitation only—for those truly ready.
                    </p>
                    <p className="mt-4 text-xs leading-relaxed text-background/55">
                      Pricing is discussed privately after your in-person consultation; each journey is
                      unique.
                    </p>
                    <div className="mt-6 flex justify-center md:justify-start">
                      <SiteButton variant="inverse-outline" onClick={() => openModal("signature")}>
                        Begin Your Journey
                      </SiteButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionShell>
      </section>

      <ContactModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        serviceType={modalService}
      />
    </>
  )
}
