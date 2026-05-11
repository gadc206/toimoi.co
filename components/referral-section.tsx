"use client"

import Image from "next/image"
import { useState } from "react"
import { ContactModal } from "./contact-modal"

export function ReferralSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        {/* Full crystal background like hero */}
        <div className="absolute inset-0">
          <Image
            src="/images/crystal-bg-1.jpg"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/70" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-6">
            Referral Privilege
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-4">
            Introduce someone to our circle, and if we begin working with them — whether as a client or through a curated introduction — you will receive a complimentary 30-minute private coaching session as our way of saying thank you.
          </p>

          <p className="font-serif text-foreground italic mb-10">
            Because meaningful connections deserve to be celebrated.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block px-8 py-4 border border-foreground/20 text-foreground text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-500"
          >
            Refer Someone
          </button>
        </div>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="referral"
      />
    </>
  )
}
