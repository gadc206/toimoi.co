/** Browser-safe referral helpers. Keep server DB logic in referral.ts. */

/**
 * Pre-filled WhatsApp draft when someone taps Join.
 * Avoid reserved Twilio/WhatsApp keywords (START, STOP, HELP, END, etc.) —
 * those can get intercepted before our webhook runs.
 */
export function referralJoinMessage(code?: string | null): string {
  return code ? `Hi ${code}! Please tap Send.` : "Hi! Please tap Send."
}

/** True when the inbound text is the join draft / a bare greeting, not a real answer. */
export function isJoinGreeting(text: string): boolean {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[!?.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!t) return false
  if (["hi", "hello", "hey", "hola"].includes(t)) return true
  if (/^hi tm-[a-hj-np-z2-9]{6}$/i.test(t)) return true
  // Current + previous canned drafts
  if (t.includes("tap send") || t.includes("please tap send")) return true
  return false
}

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null
  const match = raw.toUpperCase().match(/TM-([A-HJ-NP-Z2-9]{6})/)
  if (match) return `TM-${match[1]}`
  const loose = raw.toUpperCase().match(/\b([A-HJ-NP-Z2-9]{6})\b/)
  return loose ? `TM-${loose[1]}` : null
}