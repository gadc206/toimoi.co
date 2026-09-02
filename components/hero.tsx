"use client"

import { useEffect, useState } from "react"

import { LandingJoin } from "@/components/landing-join"
import { LogoMark } from "@/components/logo-mark"

export function Hero() {
  const [phase, setPhase] = useState<"boot" | "apart" | "lock">("boot")

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setPhase("lock")
      return
    }

    setPhase("apart")
    const lock = window.setTimeout(() => setPhase("lock"), 560)
    return () => window.clearTimeout(lock)
  }, [])

  const locked = phase === "lock"

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 pb-36">
      <p
        className="label text-foreground/40 transition-opacity duration-1000"
        style={{ opacity: phase === "boot" ? 0 : 1 }}
      >
        New York
      </p>

      <div className="mt-12">
        <LogoMark size="intro" state={locked ? "locked" : "apart"} />
      </div>

      <p
        className="label mt-14 text-foreground/35 transition-opacity duration-1000"
        style={{ opacity: phase === "boot" ? 0 : 1 }}
      >
        Toi · Moi
      </p>

      <ul
        className="label mt-14 space-y-2 text-center text-foreground/40 transition-opacity duration-[1400ms]"
        style={{ opacity: locked ? 1 : 0 }}
      >
        <li>Private Matchmaking</li>
        <li>Dating Coaching</li>
      </ul>

      <div
        className="absolute inset-x-0 bottom-10 flex justify-center px-6 transition-opacity duration-[1600ms] sm:bottom-12"
        style={{ opacity: locked ? 1 : 0, pointerEvents: locked ? "auto" : "none" }}
      >
        <LandingJoin />
      </div>
    </section>
  )
}
