import { splitSms } from "@/lib/sms/split";

/** TwiML reply for WhatsApp inbound webhooks. */
export function twimlResponse(messages: string[]): string {
  const parts = messages.flatMap((message) => splitSms(message));
  const escaped = parts
    .map((body) => {
      const safe = body
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
      return `<Message>${safe}</Message>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${escaped}</Response>`;
}
