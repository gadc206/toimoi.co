"use client"

import { SiteButton } from "@/components/site-button"
import type { SiteButtonProps } from "@/components/site-button"
import { whatsAppDeepLink } from "@/lib/whatsapp-join"

type GetAddedButtonProps = {
  children?: React.ReactNode
  variant?: SiteButtonProps["variant"]
  className?: string
}

export function GetAddedButton({
  children = "Begin Your Journey",
  variant = "outline",
  className,
}: GetAddedButtonProps) {
  return (
    <SiteButton asChild variant={variant} className={className}>
      <a href={whatsAppDeepLink("Hi")} target="_blank" rel="noopener noreferrer">
        <span className="underline-lux">{children}</span>
        <span className="cta-arrow" aria-hidden>
          →
        </span>
      </a>
    </SiteButton>
  )
}
