"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="px-6 md:px-12 lg:px-24 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl md:text-2xl tracking-wide text-foreground">
          The Circle
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#services" className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
            Services
          </Link>
          <Link href="#about" className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="#contact" className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <nav className="flex flex-col px-6 py-4 gap-4">
            <Link 
              href="#services" 
              className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="#about" 
              className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              href="#contact" 
              className="text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
