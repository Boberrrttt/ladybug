import { randomBytes } from "node:crypto";

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
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
  body.set("fileName", `${randomBytes(16).toString("hex")}.${IMAGE_EXTENSIONS[file.type] ?? "bin"}`);
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
  if (!result.url || !result.fileId) {
    throw new Error("ImageKit upload failed");
  }
  return {
    url: result.url,
    fileId: result.fileId,
    filePath: result.filePath ?? "",
  };
}

export async function deleteImageKitFile(fileId: string) {
  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: imageKitAuthHeader() },
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete ImageKit file");
  }
}
