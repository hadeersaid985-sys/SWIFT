/**
 * Centralized Time & Clock Utility for SwiftMynd
 * Standardized to Egypt Official Time (UTC+2 / Cairo Winter Time)
 * 
 * Rules:
 * - Time is synchronized to Egypt Standard / Winter Time (UTC+2) -> displays 6:xx PM (not 8:xx).
 * - Clear any old lingering offsets.
 */

export const EGYPT_TIMEZONE = 'Etc/GMT-2';
export const STORAGE_OFFSET_KEY = 'swiftmynd_time_offset_minutes';
export const TIME_EVENT_NAME = 'swiftmynd_time_changed';

// Clear legacy offsets that may have shifted the clock incorrectly to 8:xx
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(STORAGE_OFFSET_KEY);
    localStorage.removeItem('swiftmynd_time_offset');
  } catch {}
}

/**
 * Returns current Date object with any active calibration offset applied
 */
export function getSystemDate(): Date {
  const now = new Date();
  let offsetMinutes = 0;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_OFFSET_KEY);
      if (saved) {
        offsetMinutes = parseInt(saved, 10) || 0;
      }
    } catch {}
  }

  return new Date(now.getTime() + offsetMinutes * 60 * 1000);
}

/**
 * Returns active offset in minutes
 */
export function getSystemTimeOffsetMinutes(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem(STORAGE_OFFSET_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

/**
 * Adjusts system time by delta minutes (e.g. -60 or +60)
 */
export function adjustSystemTimeOffset(deltaMinutes: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSystemTimeOffsetMinutes();
    const updated = current + deltaMinutes;
    localStorage.setItem(STORAGE_OFFSET_KEY, updated.toString());
    window.dispatchEvent(new CustomEvent(TIME_EVENT_NAME, { detail: { offset: updated } }));
  } catch {}
}

/**
 * Resets system time back to official Egypt time (UTC+2 -> 6:xx PM)
 */
export function resetSystemTimeToDevice(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_OFFSET_KEY);
    window.dispatchEvent(new CustomEvent(TIME_EVENT_NAME, { detail: { offset: 0 } }));
  } catch {}
}

/**
 * Formats time in 12-hour format: e.g. "6:05 PM"
 * Uses Egypt Official Time (UTC+2 / Etc/GMT-2)
 */
export function formatSystemTimeEn(date: Date = getSystemDate(), includeSeconds: boolean = false): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: EGYPT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(date);
  } catch {
    // Manual fallback for UTC+2
    const utcMs = date.getTime();
    const egyptDate = new Date(utcMs + 2 * 60 * 60 * 1000);
    let hours = egyptDate.getUTCHours();
    const minutes = egyptDate.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    if (includeSeconds) {
      const seconds = egyptDate.getUTCSeconds();
      const secStr = seconds < 10 ? '0' + seconds : seconds;
      return `${hours}:${minStr}:${secStr} ${ampm}`;
    }
    return `${hours}:${minStr} ${ampm}`;
  }
}

/**
 * Formats time in Arabic: e.g. "6:05 م"
 */
export function formatSystemTimeAr(date: Date = getSystemDate(), includeSeconds: boolean = false): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: EGYPT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(date);
  } catch {
    return formatSystemTimeEn(date, includeSeconds)
      .replace('PM', 'م')
      .replace('AM', 'ص');
  }
}

/**
 * Formats date as YYYY-MM-DD in Egypt timezone
 */
export function getSystemDateString(date: Date = getSystemDate()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: EGYPT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Formats full Arabic date: e.g. "الخميس، 29 أكتوبر 2026"
 */
export function getSystemFullDateAr(date: Date = getSystemDate()): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: EGYPT_TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return date.toLocaleDateString('ar-EG');
  }
}
