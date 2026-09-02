import fs from "fs";
import path from "path";
import crypto from "crypto";
import { downloadTwilioMedia } from "@/lib/whatsapp/transcribe";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "jpg";
}

/** Save a WhatsApp/Twilio image (or simulator PHOTO placeholder) to public/uploads. */
export async function saveInboundPhoto(
  personId: string,
  mediaUrl: string,
): Promise<string> {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  if (mediaUrl === "PHOTO" || mediaUrl.startsWith("/uploads/")) {
    const svgName = `${personId}-${crypto.randomBytes(4).toString("hex")}.svg`;
    const svgPath = path.join(UPLOAD_DIR, svgName);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <rect width="400" height="400" fill="#0f5c4c"/>
  <text x="200" y="210" text-anchor="middle" fill="white" font-size="28" font-family="Arial">Photo</text>
</svg>`;
    fs.writeFileSync(svgPath, svg);
    return `/uploads/${svgName}`;
  }

  const { buffer, contentType } = await downloadTwilioMedia(mediaUrl);
  const ext = extensionFromContentType(contentType);
  const filename = `${personId}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}
