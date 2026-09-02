"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduce) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    let frame = 0
    let active = false

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`

      if (!active) {
        active = true
        ringX = mouseX
        ringY = mouseY
        document.documentElement.classList.add("has-custom-cursor")
        dot.classList.add("is-visible")
        ring.classList.add("is-visible")
      }

      const target = e.target as HTMLElement | null
      const overLink = Boolean(
        target?.closest("a, button, [data-magnetic], label, summary"),
      )
      const overImage = Boolean(target?.closest("[data-cursor='image']"))

      ring.classList.toggle("is-link", overLink && !overImage)
      ring.classList.toggle("is-image", overImage)
      dot.classList.toggle("is-image", overImage)
    }

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18
      ringY += (mouseY - ringY) * 0.18
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    frame = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove("has-custom-cursor")
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
