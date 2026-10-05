export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const IMAGE_NAME = /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i;

export function uploadFromForm(value: FormDataEntryValue | null): File | null {
  if (!value || typeof value === "string") return null;
  if (value.size <= 0 || typeof value.arrayBuffer !== "function") return null;
  return value;
}

export function photoUploadError(file: File): string | null {
  const type = file.type.toLowerCase();
  const image =
    type.startsWith("image/") ||
    type.includes("heic") ||
    type.includes("heif") ||
    ((!type || type === "application/octet-stream") && IMAGE_NAME.test(file.name));
  if (!image) return "Choose an image for the photo.";
  if (file.size > MAX_PHOTO_BYTES) return "That photo is too large. Use one under 4 MB.";
  return null;
}
