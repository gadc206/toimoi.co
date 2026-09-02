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

export async function downloadTwilioMedia(
  mediaUrl: string,
): Promise<{ buffer: Buffer; contentType: string | null }> {
  const res = await fetch(mediaUrl, { headers: authHeader() });
  if (!res.ok) {
    throw new Error(`Failed to download media: ${res.status}`);
  }
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get("content-type"),
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
      // Help with English + possible Hebrew/French mixed answers
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
  return contentType.toLowerCase().startsWith("image/");
}
