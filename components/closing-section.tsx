"use client"

import { useState } from "react"
import Image from "next/image"
import { ContactModal } from "./contact-modal"

export function ClosingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <section className="py-32 md:py-40 px-6 relative overflow-hidden">
        {/* Full crystal background like hero */}
        <div className="absolute inset-0">
          <Image
            src="/images/crystal-bg-3.jpg"
            alt=""
            fill
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/70" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-foreground text-balance">
            When you feel aligned with yourself,
            <br />
            the right person no longer feels far.
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block mt-12 px-10 py-5 bg-foreground text-background text-sm tracking-widest uppercase hover:bg-foreground/90 transition-all duration-500"
          >
            Start Your Journey
          </button>

          <p className="mt-16 font-serif text-lg italic text-muted-foreground">
            Not everyone is for everyone.
            <br />
            We are here to help you find the one who is.
          </p>
        </div>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="journey"
      />
    </>
  )
}
