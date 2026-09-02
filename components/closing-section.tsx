"use client"

import { useState } from "react"

import { GetAddedButton } from "@/components/get-added-button"
import { LogoMark } from "@/components/logo-mark"
import { Reveal } from "@/components/reveal"
import { SiteButton } from "@/components/site-button"
import { ContactModal } from "@/components/contact-modal"

export function ClosingSection() {
  const [isConsultOpen, setIsConsultOpen] = useState(false)

  return (
    <>
      <section
        id="closing"
        className="flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 py-32"
      >
        <Reveal className="flex flex-col items-center text-center">
          <p className="label text-foreground/40">When you are ready</p>
          <div className="mt-12">
            <LogoMark size="intro" state="locked" />
          </div>
          <p className="display mt-16 max-w-xl text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.25]">
            It only takes
            <br />
            <span className="display-italic">one person</span>
            <br />
            to change everything.
          </p>
          <div className="mt-14 flex flex-col items-center gap-5">
            <GetAddedButton>Begin Your Journey</GetAddedButton>
            <SiteButton onClick={() => setIsConsultOpen(true)}>Private Consultation</SiteButton>
          </div>
        </Reveal>
      </section>

      <ContactModal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        serviceType="consultation"
      />
    </>
  )
}
