/**
 * Centralized Time & Clock Utility for SwiftMynd
 * Synchronized to Cairo / Egypt Standard Time (GMT+2) - 5:36 PM
 */

export const DEFAULT_TIMEZONE = 'Etc/GMT-2'; // GMT+2 (+2 hours from UTC)

/**
 * Returns current Date object with any user-configured calibration offset applied
 */
export function getSystemDate(): Date {
  const now = new Date();
  if (typeof window !== 'undefined') {
    try {
      const savedOffsetMinutes = localStorage.getItem('swiftmynd_time_offset_minutes');
      if (savedOffsetMinutes) {
        const offsetMs = parseInt(savedOffsetMinutes, 10) * 60 * 1000;
        return new Date(now.getTime() + offsetMs);
      }
    } catch {}
  }
  return now;
}

/**
 * Formats time in 12-hour format: e.g., "5:36 PM" or "5:36:12 PM"
 */
export function formatSystemTimeEn(date: Date = getSystemDate(), includeSeconds: boolean = false): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: DEFAULT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(date);
  } catch {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

/**
 * Formats time in Arabic: e.g., "5:36 م" or "5:36:12 م"
 */
export function formatSystemTimeAr(date: Date = getSystemDate(), includeSeconds: boolean = false): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: DEFAULT_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(date);
  } catch {
    return date.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

/**
 * Formats date as YYYY-MM-DD
 */
export function getSystemDateString(date: Date = getSystemDate()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    const y = parts.find(p => p.type === 'year')?.value || '';
    const m = parts.find(p => p.type === 'month')?.value || '';
    const d = parts.find(p => p.type === 'day')?.value || '';
    return `${y}-${m}-${d}`;
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Formats full Arabic date: e.g., "الخميس، 29 أكتوبر 2026"
 */
export function getSystemFullDateAr(date: Date = getSystemDate()): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      timeZone: DEFAULT_TIMEZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return date.toLocaleDateString('ar-EG');
  }
}
