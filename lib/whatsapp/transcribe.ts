import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import OpenAI from "openai";

function authHeader(): HeadersInit {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return {};
  return {
    Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
  };
}

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return "ogg";
  if (contentType.includes("mpeg") || contentType.includes("mp3")) return "mp3";
  if (contentType.includes("wav")) return "wav";
  if (contentType.includes("mp4") || contentType.includes("m4a")) return "m4a";
  if (contentType.includes("ogg") || contentType.includes("opus")) return "ogg";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("amr")) return "amr";
  return "ogg";
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs);
  return fetch(url, { ...init, signal });
}

export async function downloadTwilioMedia(
  mediaUrl: string,
): Promise<{ buffer: Buffer; contentType: string | null }> {
  const timeoutMs = 8000;
  // Don't follow redirects automatically: Twilio sends us to S3, and forwarding
  // Basic auth to S3 causes 403s.
  const first = await fetchWithTimeout(
    mediaUrl,
    { headers: authHeader(), redirect: "manual" },
    timeoutMs,
  );

  if (first.status >= 300 && first.status < 400) {
    const location = first.headers.get("location");
    if (!location) {
      throw new Error("Failed to download media: redirect without location");
    }
    const second = await fetchWithTimeout(location, {}, timeoutMs);
    if (!second.ok) {
      throw new Error(`Failed to download media: ${second.status}`);
    }
    return {
      buffer: Buffer.from(await second.arrayBuffer()),
      contentType: second.headers.get("content-type") || first.headers.get("content-type"),
    };
  }

  if (!first.ok) {
    throw new Error(`Failed to download media: ${first.status}`);
  }
  return {
    buffer: Buffer.from(await first.arrayBuffer()),
    contentType: first.headers.get("content-type"),
  };
}

/** Transcribe a WhatsApp voice note with OpenAI Whisper. */
export async function transcribeVoiceNote(
  mediaUrl: string,
  contentType?: string | null,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for voice transcription");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { buffer, contentType: detected } = await downloadTwilioMedia(mediaUrl);
  const ext = extensionFromContentType(contentType || detected);
  const tmp = path.join(os.tmpdir(), `toimo-voice-${crypto.randomBytes(8).toString("hex")}.${ext}`);
  fs.writeFileSync(tmp, buffer);

  try {
    const result = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmp),
      model: "whisper-1",
      prompt:
        "Jewish matchmaking coaching conversation. May include English, Hebrew, French, or names.",
    });
    return (result.text || "").trim();
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      // ignore cleanup errors
    }
  }
}

export function isAudioContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  const t = contentType.toLowerCase();
  if (t.startsWith("image/")) return false;
  return (
    t.startsWith("audio/") ||
    t.includes("ogg") ||
    t.includes("opus") ||
    t.includes("amr") ||
    t.includes("mpeg") ||
    t.includes("mp4")
  );
}

export function isImageContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  const t = contentType.toLowerCase();
  return (
    t.startsWith("image/") ||
    t.includes("heic") ||
    t.includes("heif") ||
    t === "application/octet-stream"
  );
}
