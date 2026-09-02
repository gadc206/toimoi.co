"use client"

import { useEffect, useRef, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type ParallaxWordProps = {
  children: ReactNode
  className?: string
  speed?: number
}

export function ParallaxWord({ children, className, speed = 0.18 }: ParallaxWordProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed
        el.style.transform = `translate3d(0, ${offset * 0.12}px, 0)`
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [speed])

  return (
    <span ref={ref} className={cn("italic-drift", className)}>
      {children}
    </span>
  )
}
