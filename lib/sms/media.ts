import crypto from "crypto";
import { put } from "@vercel/blob";
import { downloadTwilioMedia, isAudioContentType, isImageContentType } from "@/lib/whatsapp/transcribe";

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return "jpg";
  const t = contentType.toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("webp")) return "webp";
  if (t.includes("gif")) return "gif";
  if (t.includes("heic") || t.includes("heif")) return "heic";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  return "jpg";
}

function placeholderUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <rect width="400" height="400" fill="#0f5c4c"/>
  <text x="200" y="210" text-anchor="middle" fill="white" font-size="28" font-family="Arial">Photo</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function collectPhotoUrls(
  media: { url: string; contentType: string }[],
): string[] {
  const nonAudio = media.filter((m) => !isAudioContentType(m.contentType));
  const labeled = nonAudio.filter(
    (m) => isImageContentType(m.contentType) || !m.contentType.trim(),
  );
  return (labeled.length ? labeled : nonAudio).map((m) => m.url);
}

async function storePhoto(
  personId: string,
  buffer: Buffer,
  contentType: string | null,
): Promise<string> {
  const ext = extensionFromContentType(contentType);
  const filename = `${personId}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const blob = await put(`people/${filename}`, buffer, {
    access: "private",
    contentType: contentType || "image/jpeg",
  });
  return `/api/file?pathname=${encodeURIComponent(blob.pathname)}`;
}

/** Save a WhatsApp/Twilio image to Vercel Blob (persists on the live site). */
export async function saveInboundPhoto(
  personId: string,
  mediaUrl: string,
): Promise<string> {
  if (
    mediaUrl === "PHOTO" ||
    mediaUrl.startsWith("/uploads/") ||
    mediaUrl.startsWith("/api/uploads/") ||
    mediaUrl.startsWith("/api/file") ||
    mediaUrl.startsWith("data:")
  ) {
    return placeholderUrl();
  }

  try {
    const { buffer, contentType } = await downloadTwilioMedia(mediaUrl);
    return await storePhoto(personId, buffer, contentType);
  } catch (err) {
    console.error("saveInboundPhoto failed; accepting placeholder", err);
    return placeholderUrl();
  }
}
