"use client"

import { SiteButton } from "@/components/site-button"
import type { SiteButtonProps } from "@/components/site-button"
import { useReferralCode } from "@/hooks/use-referral-code"
import { whatsAppJoinLink } from "@/lib/whatsapp-join"

type GetAddedButtonProps = {
  children?: React.ReactNode
  variant?: SiteButtonProps["variant"]
  className?: string
}

export function GetAddedButton({
  children = "Join the TOIMOI network",
  variant = "outline",
  className,
}: GetAddedButtonProps) {
  const referralCode = useReferralCode()

  return (
    <SiteButton asChild variant={variant} className={className}>
      <a href={whatsAppJoinLink(referralCode)} target="_blank" rel="noopener noreferrer">
        <span className="underline-lux">{children}</span>
        <span className="cta-arrow" aria-hidden>
          →
        </span>
      </a>
    </SiteButton>
  )
}
