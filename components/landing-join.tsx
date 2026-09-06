"use client"

import { useReferralCode } from "@/hooks/use-referral-code"
import { whatsAppJoinLink } from "@/lib/whatsapp-join"

export function LandingJoin() {
  const referralCode = useReferralCode()

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    el.style.transform = `translate(${x * 0.1}px, ${y * 0.12}px)`
  }

  return (
    <a
      href={whatsAppJoinLink(referralCode)}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-lux group"
      data-magnetic=""
      onMouseMove={handleMove}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ""
      }}
    >
      <span>Join the TOIMOI network</span>
      <span className="cta-arrow" aria-hidden>
        →
      </span>
    </a>
  )
}
