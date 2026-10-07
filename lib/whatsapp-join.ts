import { referralJoinMessage } from "@/lib/toimo/referral-message"

/** While WhatsApp is offline, every join button opens the website form at /join instead. */
export const JOIN_VIA_FORM = true

export function whatsAppDeepLink(message = "Hi! Please tap Send."): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER ||
    "+14155238886"
  const digits = raw.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function whatsAppJoinLink(referralCode?: string | null): string {
  return whatsAppDeepLink(referralJoinMessage(referralCode))
}

export function joinLink(referralCode?: string | null): string {
  if (!JOIN_VIA_FORM) return whatsAppJoinLink(referralCode)
  return referralCode ? `/join?ref=${encodeURIComponent(referralCode)}` : "/join"
}

export const joinLinkTarget = JOIN_VIA_FORM
  ? {}
  : { target: "_blank", rel: "noopener noreferrer" }
