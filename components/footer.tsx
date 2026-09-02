"use client"

import { useState } from "react"
import Link from "next/link"

import { ContactModal } from "@/components/contact-modal"
import { LogoMark } from "@/components/logo-mark"
import { SiteButton } from "@/components/site-button"

export function Footer() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <footer className="bg-background">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-8 px-6 py-12 sm:px-10 lg:px-14">
          <Link href="/" aria-label="TOIMOI home">
            <LogoMark size="nav" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <SiteButton
              variant="footer-link"
              className="text-foreground/40 hover:text-foreground"
              onClick={() => setModalOpen(true)}
            >
              Contact
            </SiteButton>
            <SiteButton asChild variant="footer-link" className="text-foreground/40 hover:text-foreground">
              <Link href="/privacy">Privacy</Link>
            </SiteButton>
            <SiteButton asChild variant="footer-link" className="text-foreground/40 hover:text-foreground">
              <Link href="/terms">Terms</Link>
            </SiteButton>
            <SiteButton asChild variant="footer-link" className="text-foreground/40 hover:text-foreground">
              <Link href="/admin">Admin</Link>
            </SiteButton>
          </div>
          <p className="label text-foreground/30">© {new Date().getFullYear()} TOIMOI</p>
        </div>
      </footer>

      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceType="contact"
      />
    </>
  )
}
