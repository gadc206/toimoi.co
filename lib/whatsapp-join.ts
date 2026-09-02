export function whatsAppDeepLink(message = "Hi"): string {
  const raw =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER ||
    "+14155238886"
  const digits = raw.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
