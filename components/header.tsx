"use client"

import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { ContactModal } from "@/components/contact-modal"
import { SiteButton } from "@/components/site-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PAGE_SECTION_NAV } from "@/lib/page-section-nav"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50">
        <div className="border-b border-foreground/10 bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-center px-5 py-2 sm:px-8 md:px-12">
            <SiteButton asChild variant="outline-sm" size="cta">
              <Link href="#join">Add yourself to our database</Link>
            </SiteButton>
          </div>
        </div>

        <div className="border-b border-border/70 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 md:px-12 md:py-5">
            <Link href="/" className="font-serif text-xl tracking-[0.08em] text-foreground md:text-2xl">
              ToiMoi
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="inline-flex items-center gap-1 font-sans text-xs tracking-[0.2em] text-foreground/65 uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Sections
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[14rem]">
                  {PAGE_SECTION_NAV.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault()
                      setIsContactOpen(true)
                    }}
                  >
                    Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
              aria-label="Toggle menu"
            >
              <span
                className={`h-px w-6 bg-foreground transition-all duration-300 ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-6 bg-foreground transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-px w-6 bg-foreground transition-all duration-300 ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>

          {isMenuOpen && (
            <div className="border-t border-border/60 px-5 py-8 sm:px-8 md:hidden">
              <div className="flex flex-col gap-5">
                {PAGE_SECTION_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-sans text-xs tracking-[0.2em] text-foreground/70 uppercase transition-colors hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsContactOpen(true)
                  }}
                  className="text-left font-sans text-xs tracking-[0.2em] text-foreground/70 uppercase transition-colors hover:text-foreground"
                >
                  Contact
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        serviceType="contact"
      />
    </>
  )
}
