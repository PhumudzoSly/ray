"use server";
import { getSession } from "@/actions/account/user";
import { prisma } from "@workspace/backend";

export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
  key: string;
}

export async function validateFileUpload(
  file: File
): Promise<{ valid: boolean; error?: string }> {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size exceeds 50MB limit" };
  }

  return { valid: true };
}

export async function getFileType(file: File): Promise<string> {
  const mimeType = file.type.toLowerCase();

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "document";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "document";
  if (
    mimeType.includes("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("javascript")
  )
    return "code";
  if (
    mimeType.includes("photoshop") ||
    mimeType.includes("illustrator") ||
    mimeType.includes("figma")
  )
    return "design";

  return "other";
}

export async function processUploadedFile(uploadResult: FileUploadResult) {
  const { userId } = await getSession();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return {
    url: uploadResult.url,
    fileName: uploadResult.name,
    fileSize: uploadResult.size,
    mimeType: uploadResult.type,
    uploadedBy: userId,
  };
}
