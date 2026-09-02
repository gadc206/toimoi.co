/** Normalize user input / Twilio WhatsApp address to E.164 (+15551234567). */
export function toE164(input: string): string {
  const raw = input.trim().replace(/^whatsapp:/i, "");
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/** Twilio WhatsApp address format. */
export function toWhatsAppAddress(input: string): string {
  const e164 = toE164(input);
  return e164.startsWith("whatsapp:") ? e164 : `whatsapp:${e164}`;
}

export function twilioWhatsAppFrom(): string | null {
  const dedicated = process.env.TWILIO_WHATSAPP_NUMBER?.trim();
  if (dedicated) return toWhatsAppAddress(dedicated);
  const phone = process.env.TWILIO_PHONE_NUMBER?.trim();
  if (!phone) return null;
  return toWhatsAppAddress(phone);
}
