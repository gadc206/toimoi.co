"use client"

import { useState } from "react"

import { JoinDatabaseModal } from "@/components/join-database-modal"

export function LandingJoin() {
  const [open, setOpen] = useState(false)

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    el.style.transform = `translate(${x * 0.1}px, ${y * 0.12}px)`
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onMouseMove={handleMove}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = ""
        }}
        className="btn-lux group"
        data-magnetic=""
      >
        <span>Join our database</span>
        <span className="cta-arrow" aria-hidden>
          →
        </span>
      </button>
      <JoinDatabaseModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
