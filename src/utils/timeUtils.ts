/**
 * Centralized Time & Clock Utility for SwiftMynd
 * Synchronized to Cairo Official Time (Africa/Cairo)
 * - Summer Time (Currently): GMT+3 (6:47 PM)
 * - Transitions back 1 hour at midnight tonight (end of Thursday, Oct 29) to Winter Time (GMT+2)
 */

export const DEFAULT_TIMEZONE = 'Africa/Cairo';

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
 * Formats time in 12-hour format: e.g., "6:47 PM" or "6:47:12 PM"
 * Correctly accounts for Africa/Cairo daylight saving transition
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
    // Fallback: Check if before or after Egypt winter time change (Oct 29, 2026 21:00:00 UTC)
    const isSummerTime = date.getTime() < new Date('2026-10-29T21:00:00.000Z').getTime();
    const offsetHours = isSummerTime ? 3 : 2;
    const adjustedDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
    return adjustedDate.toISOString().slice(11, 16);
  }
}

/**
 * Formats time in Arabic: e.g., "6:47 م" or "6:47:12 م"
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
    return formatSystemTimeEn(date, includeSeconds)
      .replace('PM', 'م')
      .replace('AM', 'ص');
  }
}

/**
 * Formats date as YYYY-MM-DD in Cairo timezone
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
 * Formats full Arabic date in Cairo timezone: e.g., "الخميس، 29 أكتوبر 2026"
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
