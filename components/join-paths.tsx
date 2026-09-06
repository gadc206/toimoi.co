"use client"

import { useReferralCode } from "@/hooks/use-referral-code"
import { cn } from "@/lib/utils"
import { whatsAppJoinLink } from "@/lib/whatsapp-join"

type JoinPathsProps = {
  className?: string
}

export function JoinPaths({ className }: JoinPathsProps) {
  const referralCode = useReferralCode()

  return (
    <a
      href={whatsAppJoinLink(referralCode)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("btn-lux group", className)}
      data-magnetic=""
    >
      <span>Open WhatsApp</span>
      <span className="cta-arrow" aria-hidden>
        →
      </span>
    </a>
  )
}
