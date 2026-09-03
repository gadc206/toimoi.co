import twilio from "twilio";
import { prisma } from "@/lib/db";
import { splitSms } from "@/lib/sms/split";
import { toWhatsAppAddress, twilioWhatsAppFrom } from "@/lib/whatsapp/phone";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendWhatsAppAndLog(personId: string, to: string, bodies: string[]) {
  const from = twilioWhatsAppFrom();
  const client = getClient();
  const chunks = bodies.flatMap((b) => splitSms(b));
  const toWa = toWhatsAppAddress(to);

  for (const body of chunks) {
    let twilioSid: string | undefined;
    if (client && from) {
      const msg = await client.messages.create({
        to: toWa,
        from,
        body,
      });
      twilioSid = msg.sid;
    }
    await prisma.message.create({
      data: {
        personId,
        direction: "outbound",
        body,
        twilioSid,
      },
    });
  }

  return chunks;
}

/** @deprecated use sendWhatsAppAndLog — kept as alias during WhatsApp-only migration */
export const sendSmsAndLog = sendWhatsAppAndLog;
