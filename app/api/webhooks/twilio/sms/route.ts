import { after, NextRequest, NextResponse } from "next/server";
import { validateRequest as validateTwilioRequest } from "twilio/lib/webhooks/webhooks";
import { handleInbound, type InboundTiming } from "@/lib/toimo/engine";
import { logOutboundOnly } from "@/lib/sms/log";
import { collectPhotoUrls } from "@/lib/sms/media";
import { twimlResponse } from "@/lib/sms/twiml";
import { toE164 } from "@/lib/whatsapp/phone";
import { isAudioContentType } from "@/lib/whatsapp/media";

export const runtime = "nodejs";
export const maxDuration = 30;

function milliseconds(value: number): string {
  return value.toFixed(1);
}

function validateTwilio(req: NextRequest, params: Record<string, string>): boolean {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.SKIP_TWILIO_SIGNATURE === "true"
  ) {
    return true;
  }
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;
  const signature = req.headers.get("x-twilio-signature") || "";
  const url =
    process.env.TWILIO_WEBHOOK_URL ||
    `${process.env.PUBLIC_BASE_URL}/api/webhooks/twilio/whatsapp`;
  const legacy =
    process.env.TWILIO_WEBHOOK_URL ||
    `${process.env.PUBLIC_BASE_URL}/api/webhooks/twilio/sms`;
  return (
    validateTwilioRequest(authToken, signature, url, params) ||
    validateTwilioRequest(authToken, signature, legacy, params)
  );
}

export async function POST(req: NextRequest) {
  const requestStarted = performance.now();
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });
  const parseMs = performance.now() - requestStarted;

  if (!validateTwilio(req, params)) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const fromRaw = params.From || "";
  const body = params.Body || "";
  const sid = params.MessageSid;
  const numMedia = Number(params.NumMedia || "0");

  const media: { url: string; contentType: string }[] = [];
  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`];
    const contentType = params[`MediaContentType${i}`] || "";
    if (!url) continue;
    media.push({ url, contentType });
  }

  if (!fromRaw) {
    return new NextResponse("Missing From", { status: 400 });
  }

  const phone = toE164(fromRaw);
  const text = body;
  const photos = collectPhotoUrls(media);
  const audio = media.find((m) => isAudioContentType(m.contentType));

  if (audio && !text.trim() && photos.length === 0) {
    return new NextResponse(
      twimlResponse([
        "Thanks! For now, please type your answer as text ❤️ (Voice notes aren't supported yet.)",
      ]),
      { status: 200, headers: { "Content-Type": "text/xml" } },
    );
  }

  let engineTiming: InboundTiming | undefined;
  const result = await handleInbound(phone, text, sid, photos, {
    onTiming: (timing) => {
      engineTiming = timing;
    },
  });
  after(() => logOutboundOnly(result.person.id, result.outbound));

  const twimlStarted = performance.now();
  const responseBody = twimlResponse(result.outbound);
  const twimlMs = performance.now() - twimlStarted;
  const totalMs = performance.now() - requestStarted;
  const timing = engineTiming ?? {
    personLookupMs: 0,
    inboundSaveMs: 0,
    answerAndStateMs: 0,
  };

  console.info("whatsapp_webhook_timing", {
    requestId: sid || "missing",
    region: process.env.VERCEL_REGION || "local",
    mediaCount: media.length,
    parseMs: Number(milliseconds(parseMs)),
    personLookupMs: Number(milliseconds(timing.personLookupMs)),
    inboundSaveMs: Number(milliseconds(timing.inboundSaveMs)),
    answerAndStateMs: Number(milliseconds(timing.answerAndStateMs)),
    twimlMs: Number(milliseconds(twimlMs)),
    totalMs: Number(milliseconds(totalMs)),
  });

  const serverTiming = [
    `parse;dur=${milliseconds(parseMs)}`,
    `person-lookup;dur=${milliseconds(timing.personLookupMs)}`,
    `inbound-save;dur=${milliseconds(timing.inboundSaveMs)}`,
    `answer-state;dur=${milliseconds(timing.answerAndStateMs)}`,
    `twiml;dur=${milliseconds(twimlMs)}`,
    `total;dur=${milliseconds(totalMs)}`,
  ].join(", ");

  return new NextResponse(responseBody, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
      "Server-Timing": serverTiming,
    },
  });
}
