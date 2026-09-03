import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import OpenAI from "openai";
import { downloadTwilioMedia } from "@/lib/whatsapp/media";

export {
  downloadTwilioMedia,
  isAudioContentType,
  isImageContentType,
} from "@/lib/whatsapp/media";

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
