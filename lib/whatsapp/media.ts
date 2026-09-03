function authHeader(): HeadersInit {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return {};
  return {
    Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

export async function downloadTwilioMedia(
  mediaUrl: string,
): Promise<{ buffer: Buffer; contentType: string | null }> {
  const timeoutMs = 8000;
  // Twilio redirects to object storage. Do not forward Twilio credentials there.
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

export function isAudioContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  const type = contentType.toLowerCase();
  if (type.startsWith("image/")) return false;
  return (
    type.startsWith("audio/") ||
    type.includes("ogg") ||
    type.includes("opus") ||
    type.includes("amr") ||
    type.includes("mpeg") ||
    type.includes("mp4")
  );
}

export function isImageContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  const type = contentType.toLowerCase();
  return (
    type.startsWith("image/") ||
    type.includes("heic") ||
    type.includes("heif") ||
    type === "application/octet-stream"
  );
}
