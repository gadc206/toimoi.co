import { after, NextRequest, NextResponse } from "next/server";
import { validateRequest as validateTwilioRequest } from "twilio/lib/webhooks/webhooks";
import { handleInbound, type InboundTiming } from "@/lib/toimo/engine";
import { logOutboundOnly } from "@/lib/sms/log";
import { sendWhatsAppAndLog } from "@/lib/sms/send";
import { collectPhotoUrls } from "@/lib/sms/media";
import { twimlResponse } from "@/lib/sms/twiml";
import { toE164 } from "@/lib/whatsapp/phone";
import { isAudioContentType } from "@/lib/whatsapp/media";

export const runtime = "nodejs";
export const maxDuration = 30;

function milliseconds(value: number): string {
  return value.toFixed(1);
}

function webhookUrls(req: NextRequest): string[] {
  const configured = process.env.TWILIO_WEBHOOK_URL;
  const baseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
  const path = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host");
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.nextUrl.protocol.replace(":", "") || "https";

  return Array.from(
    new Set(
      [
        configured,
        req.url,
        host ? `${protocol}://${host}${path}` : undefined,
        baseUrl ? `${baseUrl}${path}` : undefined,
        baseUrl ? `${baseUrl}/api/webhooks/twilio/whatsapp` : undefined,
        baseUrl ? `${baseUrl}/api/webhooks/twilio/sms` : undefined,
      ].filter((url): url is string => Boolean(url)),
    ),
  );
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
  return webhookUrls(req).some((url) =>
    validateTwilioRequest(authToken, signature, url, params),
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
    console.warn("twilio_webhook_signature_rejected", {
      requestId: params.MessageSid || "missing",
      region: process.env.VERCEL_REGION || "local",
      host: req.headers.get("x-forwarded-host") || req.headers.get("host") || "missing",
      path: req.nextUrl.pathname,
    });
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
  const outbound = result.outbound.filter((body) => body.trim().length > 0);
  const [firstOutbound, ...restOutbound] = outbound;

  if (restOutbound.length > 0) {
    after(async () => {
      await logOutboundOnly(result.person.id, [firstOutbound]);
      await sendWhatsAppAndLog(result.person.id, phone, restOutbound);
    });
  } else {
    after(() => logOutboundOnly(result.person.id, outbound));
  }

  const twimlStarted = performance.now();
  const responseBody = twimlResponse(firstOutbound ? [firstOutbound] : []);
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
