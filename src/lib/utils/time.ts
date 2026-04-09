import { format, formatDistanceToNow, differenceInSeconds } from "date-fns";
import { pl, enUS, de, uk } from "date-fns/locale";

const localeMap = {
  pl: pl,
  en: enUS,
  de: de,
  ua: uk,
};

/**
 * Format duration from milliseconds to HH:MM:SS
 */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}

/**
 * Format duration to human readable string
 */
export function formatDurationHuman(ms: number, locale = "pl"): string {
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Calculate duration between two dates in milliseconds
 */
export function calculateDuration(
  start: Date | string,
  end: Date | string | null
): number {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  return differenceInSeconds(endDate, startDate) * 1000;
}

/**
 * Format date using locale
 */
export function formatDate(
  date: Date | string,
  formatString: string = "PPP",
  locale: string = "pl"
): string {
  const dateObj = new Date(date);
  return format(dateObj, formatString, {
    locale: localeMap[locale as keyof typeof localeMap] || pl,
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = "pl"
): string {
  const dateObj = new Date(date);
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: localeMap[locale as keyof typeof localeMap] || pl,
  });
}

/**
 * Format time for display in timer
 */
export function formatTimerDisplay(startTime: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const elapsed = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    formatted: formatDuration(elapsed),
  };
}

/**
 * Get current date in ISO format
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string, locale = "pl"): boolean {
  const dateObj = new Date(date);
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string, locale = "pl"): boolean {
  const dateObj = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
}
