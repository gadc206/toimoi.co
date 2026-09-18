"use client"

import Link from "next/link"
import { useState } from "react"

import { ContactModal } from "@/components/contact-modal"
import { Reveal } from "@/components/reveal"
import { SiteButton } from "@/components/site-button"

const offerings = [
  {
    key: "discovery" as const,
    title: "Discovery Call",
    body: "Fifteen minutes. To see if we are a fit.",
    price: "Complimentary",
    cta: "Begin",
  },
  {
    key: "consultation" as const,
    title: "Personal Consultation",
    body: "One hour, in person.",
    price: "$360",
    cta: "Book",
  },
  {
    key: "coaching" as const,
    title: "Clarity & Connection",
    body: "A session for how you show up.",
    price: "$500",
    cta: "Book",
  },
]

export function ServicesSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalService, setModalService] = useState<
    "discovery" | "consultation" | "coaching" | "signature"
  >("discovery")

  const openModal = (
    service: "discovery" | "consultation" | "coaching" | "signature",
  ) => {
    setModalService(service)
    setModalOpen(true)
  }

  return (
    <>
      <section
        id="offerings"
        className="flex min-h-0 flex-col items-center justify-center bg-background px-6 py-16 md:min-h-[100svh] md:py-32"
      >
        <div id="services" className="sr-only" />
        <Reveal className="text-center">
          <p className="label text-foreground/50">Offerings</p>
        </Reveal>

        <div className="mt-12 w-full max-w-md md:mt-20">
          {offerings.map((item, i) => (
            <Reveal key={item.key} delay={i * 80}>
              <div className="border-t border-foreground/10 py-10 text-center">
                <h3 className="display text-4xl md:text-5xl">{item.title}</h3>
                <p className="mt-3 text-[17px] leading-[1.85] text-foreground/65">{item.body}</p>
                <p className="label mt-5 text-foreground/50">{item.price}</p>
                <div className="mt-6 flex justify-center">
                  {item.key === "consultation" ? (
                    <SiteButton asChild>
                      <Link href="/consult">{item.cta}</Link>
                    </SiteButton>
                  ) : item.key === "coaching" ? (
                    <SiteButton asChild>
                      <Link href="/clarity">{item.cta}</Link>
                    </SiteButton>
                  ) : (
                    <SiteButton onClick={() => openModal(item.key)}>{item.cta}</SiteButton>
                  )}
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={240}>
            <div className="border-y border-foreground/10 py-10 text-center">
              <h3 className="display text-4xl md:text-5xl">
                The Signature <span className="display-italic">Experience</span>
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-[17px] leading-[1.85] text-foreground/65">
                Six months. Invitation only. Price after consultation.
              </p>
              <div className="mt-6 flex justify-center">
                <SiteButton onClick={() => openModal("signature")}>Ask about it</SiteButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceType={modalService}
      />
    </>
  )
}
