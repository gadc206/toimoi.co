"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { ContactModal } from "@/components/contact-modal"
import { LogoMark } from "@/components/logo-mark"
import { PAGE_SECTION_NAV } from "@/lib/page-section-nav"
import { cn } from "@/lib/utils"

export function Header() {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.55)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-opacity duration-700",
          scrolled || menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <Link href="/" aria-label="TOIMOI home" className="relative z-10">
            <LogoMark size="nav" />
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {PAGE_SECTION_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
            <button type="button" className="nav-link" onClick={() => setIsContactOpen(true)}>
              Contact
            </button>
          </nav>

          <button
            type="button"
            className="nav-link relative z-10 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background px-8 pt-28 transition-opacity duration-700 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <nav className="flex flex-col gap-6">
          {PAGE_SECTION_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="display text-5xl text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="display text-left text-5xl text-foreground"
            onClick={() => {
              setMenuOpen(false)
              setIsContactOpen(true)
            }}
          >
            Contact
          </button>
        </nav>
      </div>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        serviceType="contact"
      />
    </>
  )
}
