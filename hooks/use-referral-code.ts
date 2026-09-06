"use client"

import { useEffect, useState } from "react"

import { normalizeReferralCode } from "@/lib/toimo/referral-message"

const STORAGE_KEY = "toimoi_ref"

export function useReferralCode() {
  const [code, setCode] = useState<string | null>(null)

  useEffect(() => {
    const fromUrl = normalizeReferralCode(
      new URLSearchParams(window.location.search).get("ref"),
    )
    if (fromUrl) {
      sessionStorage.setItem(STORAGE_KEY, fromUrl)
      setCode(fromUrl)
      return
    }

    setCode(normalizeReferralCode(sessionStorage.getItem(STORAGE_KEY)))
  }, [])

  return code
}
