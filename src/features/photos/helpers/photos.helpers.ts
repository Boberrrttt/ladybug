export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export function isImageFile(file: File) {
  return file.type.startsWith("image/") && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}

export function isImageKitUrl(url: string, endpoint = process.env.IMAGEKIT_URL_ENDPOINT) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }
    if (parsed.host === "ik.imagekit.io" || parsed.host.endsWith(".imagekit.io")) {
      return true;
    }
    if (!endpoint) {
      return false;
    }
    return parsed.host === new URL(endpoint).host;
  } catch {
    return false;
  }
}
