"use client"

import { useReferralCode } from "@/hooks/use-referral-code"
import { cn } from "@/lib/utils"
import { JOIN_VIA_FORM, joinLink, joinLinkTarget } from "@/lib/whatsapp-join"

type JoinPathsProps = {
  className?: string
}

export function JoinPaths({ className }: JoinPathsProps) {
  const referralCode = useReferralCode()

  return (
    <a
      href={joinLink(referralCode)}
      {...joinLinkTarget}
      className={cn("btn-lux group", className)}
      data-magnetic=""
    >
      <span>{JOIN_VIA_FORM ? "Start" : "Open WhatsApp"}</span>
      <span className="cta-arrow" aria-hidden>
        →
      </span>
    </a>
  )
}
