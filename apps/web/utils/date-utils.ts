import { formatDistanceToNow, format, isValid } from "date-fns";

/**
 * Safely formats a date to relative time (e.g., "2 hours ago")
 * @param date Date string, Date object, or null/undefined
 * @param options Options for formatDistanceToNow
 * @returns Formatted string or fallback message
 */
export function safeFormatDistanceToNow(
  date: string | Date | null | undefined,
  options: { addSuffix?: boolean } = { addSuffix: true },
  fallback: string = "No date"
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = new Date(date);
    if (!isValid(dateObj)) return fallback;
    
    return formatDistanceToNow(dateObj, options);
  } catch {
    return fallback;
  }
}

/**
 * Safely formats a date to a specific format
 * @param date Date string, Date object, or null/undefined
 * @param formatStr Format string (default: "PPP")
 * @param fallback Fallback message for invalid dates
 * @returns Formatted string or fallback message
 */
export function safeFormatDate(
  date: string | Date | null | undefined,
  formatStr: string = "PPP",
  fallback: string = "No date"
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = new Date(date);
    if (!isValid(dateObj)) return fallback;
    
    return format(dateObj, formatStr);
  } catch {
    return fallback;
  }
}

/**
 * Checks if a date is valid
 * @param date Date string, Date object, or null/undefined
 * @returns boolean indicating if date is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    return isValid(dateObj);
  } catch {
    return false;
  }
} 