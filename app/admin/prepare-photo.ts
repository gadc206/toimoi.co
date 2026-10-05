const IMAGE_NAME = /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i;
const MAX_EDGE = 1600;

function looksLikeImage(file: File): boolean {
  const type = file.type.toLowerCase();
  return (
    type.startsWith("image/") ||
    type.includes("heic") ||
    type.includes("heif") ||
    !type ||
    type === "application/octet-stream" ||
    IMAGE_NAME.test(file.name)
  );
}

/** Turn a phone photo into a JPEG the admin page can show, and keep it small enough to upload. */
export async function preparePhoto(file: File): Promise<File> {
  if (!looksLikeImage(file)) {
    throw new Error("Choose an image for the photo.");
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not read that photo.");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.85);
    });
    if (!blob) throw new Error("Could not read that photo.");
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch (error) {
    if (error instanceof Error && error.message === "Could not read that photo.") throw error;
    if (file.size > 4 * 1024 * 1024) {
      throw new Error("That photo is too large. Use one under 4 MB.");
    }
    if (!IMAGE_NAME.test(file.name) && !file.type.toLowerCase().startsWith("image/")) {
      throw new Error("Choose an image for the photo.");
    }
    return file;
  }
}
