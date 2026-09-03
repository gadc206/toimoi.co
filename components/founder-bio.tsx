"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

type FounderBioProps = {
  children: React.ReactNode
}

export function FounderBio({ children }: FounderBioProps) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div
        className={cn(
          "relative space-y-5 text-[16px] leading-[1.85] text-foreground/65",
          !open && "max-h-24 overflow-hidden",
        )}
      >
        {children}
        {!open ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
            aria-hidden
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="label mt-5 text-foreground/40 transition-colors hover:text-foreground"
      >
        {open ? "Close" : "Read"}
      </button>
    </div>
  )
}
