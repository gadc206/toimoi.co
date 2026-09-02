"use client"

import { useState } from "react"

import { ContactModal } from "@/components/contact-modal"
import { Reveal } from "@/components/reveal"
import { SiteButton } from "@/components/site-button"

export function ReferralSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section
        id="referral"
        className="flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 py-32"
      >
        <Reveal className="max-w-xl text-center">
          <p className="label text-foreground/40">Referral</p>
          <h2 className="display mt-8 text-[clamp(2.2rem,5vw,4.4rem)]">
            Send someone.
            <br />
            <span className="display-italic">Get a session.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-sm text-[15px] leading-[1.85] text-foreground/55">
            If we work with the person you refer, you receive a complimentary thirty-minute
            guidance session.
          </p>
          <div className="mt-12 flex justify-center">
            <SiteButton onClick={() => setIsModalOpen(true)}>Refer someone</SiteButton>
          </div>
        </Reveal>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="referral"
      />
    </>
  )
}
