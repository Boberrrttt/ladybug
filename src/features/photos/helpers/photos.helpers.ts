import type { MediaKind } from "../../../shared/media-kind.ts";

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const MAX_PHOTOS_PER_EVENT = 500;
export const MAX_EVENT_UPLOAD_BYTES = 500 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

export function getMediaKind(file: File): MediaKind | null {
  if (ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "IMAGE";
  }
  if (ALLOWED_VIDEO_TYPES.has(file.type)) {
    return "VIDEO";
  }
  return null;
}

export function rejectMediaReason(file: File): string | null {
  const kind = getMediaKind(file);
  if (!kind) {
    return "Unsupported file type.";
  }
  if (file.size <= 0) {
    return "Unsupported file type.";
  }
  if (kind === "IMAGE" && file.size > MAX_PHOTO_BYTES) {
    return "Image too large (max 15MB).";
  }
  if (kind === "VIDEO" && file.size > MAX_VIDEO_BYTES) {
    return "Video too large (max 15MB).";
  }
  return null;
}

export function isAllowedMediaFile(file: File) {
  return rejectMediaReason(file) === null;
}

export const isAllowedImageFile = isAllowedMediaFile;
export const isImageFile = isAllowedMediaFile;

function hasImageMagic(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return true;
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return true;
  }
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function hasVideoMagic(bytes: Uint8Array) {
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return true;
  }
  if (bytes.length < 8) {
    return false;
  }
  return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
}

export async function hasAllowedMediaMagic(file: File) {
  const kind = getMediaKind(file);
  if (!kind) {
    return false;
  }
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return kind === "IMAGE" ? hasImageMagic(bytes) : hasVideoMagic(bytes);
}

export const hasAllowedImageMagic = hasAllowedMediaMagic;

export function formatPhotoCount(count: number) {
  return count === 1 ? "1 photo" : `${count} photos`;
}

export function uploadBudgetError(count: number, bytes: number, addBytes: number) {
  if (count >= MAX_PHOTOS_PER_EVENT) {
    return "Album is full";
  }
  if (bytes + addBytes > MAX_EVENT_UPLOAD_BYTES) {
    return "Album storage limit reached";
  }
  return "Album is full";
}

export function isImageKitUrl(url: string, endpoint = process.env.IMAGEKIT_URL_ENDPOINT) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !endpoint) {
      return false;
    }
    const expected = new URL(endpoint);
    if (parsed.host !== expected.host) {
      return false;
    }
    const prefix = expected.pathname.replace(/\/$/, "");
    if (!prefix) {
      return true;
    }
    return parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`);
  } catch {
    return false;
  }
}
