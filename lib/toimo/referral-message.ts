/** Browser-safe referral helpers. Keep server DB logic in referral.ts. */

export function referralJoinMessage(code?: string | null): string {
  return code ? `Hi ${code}` : "Hi"
}

export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null
  const match = raw.toUpperCase().match(/TM-([A-HJ-NP-Z2-9]{6})/)
  if (match) return `TM-${match[1]}`
  const loose = raw.toUpperCase().match(/\b([A-HJ-NP-Z2-9]{6})\b/)
  return loose ? `TM-${loose[1]}` : null
}
