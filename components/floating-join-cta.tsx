"use client"

import { useEffect, useState } from "react"

import { useReferralCode } from "@/hooks/use-referral-code"
import { cn } from "@/lib/utils"
import { whatsAppJoinLink } from "@/lib/whatsapp-join"

export function FloatingJoinCta() {
  const referralCode = useReferralCode()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.55)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/92 px-4 py-3 backdrop-blur-md transition-all duration-500 sm:px-8",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-xl justify-center">
        <a
          href={whatsAppJoinLink(referralCode)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-lux group w-full max-w-md"
        >
          <span>Join the TOIMOI network</span>
          <span className="cta-arrow" aria-hidden>
            →
          </span>
        </a>
      </div>
    </div>
  )
}
