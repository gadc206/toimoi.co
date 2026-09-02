"use client"

import { useState } from "react"

import { JoinDatabaseModal } from "@/components/join-database-modal"

export function LandingJoin() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group label text-foreground/45 transition-colors duration-500 hover:text-foreground"
        data-magnetic=""
      >
        <span className="underline-lux">Join our database</span>
        <span className="cta-arrow ml-3 inline-block" aria-hidden>
          →
        </span>
      </button>
      <JoinDatabaseModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
