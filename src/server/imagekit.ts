import "server-only";

import { randomBytes } from "node:crypto";
import { isImageKitFileId } from "@/features/photos/helpers/photos.helpers";

const FILE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function imageKitAuthHeader() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not set");
  }
  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
}

export async function uploadImageKitFile(file: File) {
  const body = new FormData();
  body.set("file", file);
  body.set("fileName", `${randomBytes(16).toString("hex")}.${FILE_EXTENSIONS[file.type] ?? "bin"}`);
  body.set("folder", "/ladybug");
  body.set("useUniqueFileName", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: imageKitAuthHeader() },
    body,
  });
  if (!response.ok) {
    throw new Error("ImageKit upload failed");
  }

  const result = (await response.json()) as {
    url?: string;
    fileId?: string;
    filePath?: string;
  };
  if (!result.url || !result.fileId || !isImageKitFileId(result.fileId)) {
    throw new Error("ImageKit upload failed");
  }
  return {
    url: result.url,
    fileId: result.fileId,
    filePath: result.filePath ?? "",
  };
}

export async function deleteImageKitFile(fileId: string) {
  if (!isImageKitFileId(fileId)) {
    throw new Error("Invalid ImageKit file");
  }
  const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: imageKitAuthHeader() },
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete ImageKit file");
  }
}
