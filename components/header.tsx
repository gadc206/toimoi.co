"use client"

import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="px-6 md:px-12 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-serif text-xl tracking-wide text-foreground">
            ToiMoi
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            <Link
              href="#services"
              className="text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-px bg-foreground transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`w-6 h-px bg-foreground transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`w-6 h-px bg-foreground transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-8 pb-8 border-t border-border pt-8">
            <div className="flex flex-col gap-6">
              <Link
                href="#services"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
              >
                Services
              </Link>
              <Link
                href="#about"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
              >
                About
              </Link>
              <Link
                href="#contact"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-foreground/70 hover:text-foreground transition-colors duration-300"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
