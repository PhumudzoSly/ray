import { randomBytes, createHash } from "crypto";

/**
 * Generate a secure API key
 */
export function generateApiKey(): string {
  return `ray_${randomBytes(32).toString("hex")}`;
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Get a preview of the API key (first 8 characters)
 */
export function getApiKeyPreview(apiKey: string): string {
  return apiKey.substring(0, 8);
}

/**
 * Verify an API key by comparing its hash with the stored hash
 */
export function verifyApiKey(providedKey: string, storedHash: string): boolean {
  const providedHash = hashApiKey(providedKey);
  return providedHash === storedHash;
}

/**
 * Check if an API key has the required permission
 */
export function hasPermission(
  apiKeyPermissions: string[],
  requiredPermission: string
): boolean {
  // Admin permission grants access to everything
  if (apiKeyPermissions.includes("ADMIN")) {
    return true;
  }

  // Check for specific permission
  return apiKeyPermissions.includes(requiredPermission.toUpperCase());
}

/**
 * Check if an API key has any of the required permissions
 */
export function hasAnyPermission(
  apiKeyPermissions: string[],
  requiredPermissions: string[]
): boolean {
  // Admin permission grants access to everything
  if (apiKeyPermissions.includes("ADMIN")) {
    return true;
  }

  // Check if any of the required permissions are present
  return requiredPermissions.some((permission) =>
    apiKeyPermissions.includes(permission.toUpperCase())
  );
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Check if it starts with "ray_" and has the correct length
  return apiKey.startsWith("ray_") && apiKey.length === 67; // "ray_" + 32 bytes hex
}
