"use node";

import crypto from "crypto";

// Generate a secure random API key
export function generateApiKey(prefix: string = "rk"): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString("hex");
  return `${prefix}_${key}`;
}

// Hash an API key for secure storage
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

// Verify an API key against its hash
export function verifyApiKey(key: string, hash: string): boolean {
  const keyHash = hashApiKey(key);
  return crypto.timingSafeEqual(
    Buffer.from(keyHash, "hex"),
    Buffer.from(hash, "hex")
  );
}

// Get preview of API key (first 8 characters)
export function getApiKeyPreview(key: string): string {
  return key.substring(0, 8) + "...";
}

// Generate a secure random string for key names
export function generateSecureId(length: number = 16): string {
  return crypto.randomBytes(length).toString("hex");
}
