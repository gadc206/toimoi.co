"use client"

import { useEffect, useState } from "react"

import { LogoMark } from "@/components/logo-mark"

export function IntroOverlay() {
  const [phase, setPhase] = useState<"boot" | "apart" | "lock" | "leave" | "gone">(
    "boot",
  )

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const seen = sessionStorage.getItem("toimoi-intro") === "1"

    if (reduce || seen) {
      setPhase("gone")
      return
    }

    setPhase("apart")
    const lock = window.setTimeout(() => setPhase("lock"), 480)
    const leave = window.setTimeout(() => setPhase("leave"), 3200)
    const gone = window.setTimeout(() => {
      sessionStorage.setItem("toimoi-intro", "1")
      setPhase("gone")
    }, 4300)

    return () => {
      window.clearTimeout(lock)
      window.clearTimeout(leave)
      window.clearTimeout(gone)
    }
  }, [])

  if (phase === "gone") return null

  return (
    <div
      className="intro-overlay fixed inset-0 z-[300] flex flex-col items-center justify-center"
      style={{
        opacity: phase === "leave" ? 0 : 1,
        transition: "opacity 1.05s cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: phase === "leave" ? "none" : "auto",
      }}
      aria-hidden
    >
      <p className="label mb-12 text-foreground/40">New York</p>
      <LogoMark
        size="intro"
        state={phase === "lock" || phase === "leave" ? "locked" : "apart"}
      />
      <p className="label mt-14 text-foreground/35">Toi · Moi</p>
    </div>
  )
}
