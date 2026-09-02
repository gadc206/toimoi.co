import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { handleInbound, type InboundMedia } from "@/lib/toimo/engine";
import { logOutboundOnly, twimlResponse } from "@/lib/sms/send";
import { toE164 } from "@/lib/whatsapp/phone";
import { isAudioContentType, isImageContentType } from "@/lib/whatsapp/transcribe";

export const runtime = "nodejs";

function validateTwilio(req: NextRequest, params: Record<string, string>): boolean {
  if (process.env.SKIP_TWILIO_SIGNATURE === "true") return true;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;
  const signature = req.headers.get("x-twilio-signature") || "";
  const url =
    process.env.TWILIO_WEBHOOK_URL ||
    `${process.env.PUBLIC_BASE_URL}/api/webhooks/twilio/whatsapp`;
  // Also accept legacy SMS webhook path during transition
  const legacy =
    process.env.TWILIO_WEBHOOK_URL ||
    `${process.env.PUBLIC_BASE_URL}/api/webhooks/twilio/sms`;
  return (
    twilio.validateRequest(authToken, signature, url, params) ||
    twilio.validateRequest(authToken, signature, legacy, params)
  );
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });

  if (!validateTwilio(req, params)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const fromRaw = params.From || "";
  const body = params.Body || "";
  const sid = params.MessageSid;
  const numMedia = Number(params.NumMedia || "0");

  const media: InboundMedia[] = [];
  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`];
    const contentType = params[`MediaContentType${i}`] || "";
    if (!url) continue;
    media.push({ url, contentType });
  }

  if (!fromRaw) {
    return new NextResponse("Missing From", { status: 400 });
  }

  // WhatsApp-only: ignore pure SMS channel if somehow pointed here without whatsapp: prefix
  // Still accept sandbox/testing if From is already E.164
  const phone = toE164(fromRaw);

  const text = body;
  const images = media.filter((m) => isImageContentType(m.contentType));
  const audio = media.find((m) => isAudioContentType(m.contentType));

  // Text-only: ask them to type if they send a voice note
  if (audio && !text.trim() && images.length === 0) {
    return new NextResponse(
      twimlResponse([
        "Thanks! For now, please type your answer as text ❤️ (Voice notes aren't supported yet.)",
      ]),
      { status: 200, headers: { "Content-Type": "text/xml" } },
    );
  }

  const result = await handleInbound(phone, text, sid, images.map((m) => m.url));
  await logOutboundOnly(result.person.id, result.outbound);

  return new NextResponse(twimlResponse(result.outbound), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
