"use client"

import { whatsAppDeepLink } from "@/lib/whatsapp-join"
import { cn } from "@/lib/utils"

type JoinPathsProps = {
  className?: string
}

export function JoinPaths({ className }: JoinPathsProps) {
  return (
    <a
      href={whatsAppDeepLink("Hi")}
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
