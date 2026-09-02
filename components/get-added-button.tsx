"use client"

import { useState } from "react"

import { JoinDatabaseModal } from "@/components/join-database-modal"
import { SiteButton } from "@/components/site-button"
import type { SiteButtonProps } from "@/components/site-button"

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
  const [open, setOpen] = useState(false)

  return (
    <>
      <SiteButton
        type="button"
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </SiteButton>
      <JoinDatabaseModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
