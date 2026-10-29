/**
 * Centralized Time & Clock Utility for SwiftMynd
 * Synchronized to local system clock (Cairo Time)
 * 
 * Rules:
 * - Display matches the user's actual system clock (e.g., 6:52 PM, not +1 hr 7:52 PM).
 * - Egypt Daylight Saving transition: After 12:00 midnight (end of Thursday Oct 29, 2026),
 *   the clock rolls back 1 hour (from 12:00 midnight back to 11:00 PM) for Winter Time.
 * - Allows 1-click calibration (-1 hr, +1 hr, reset to device).
 */

export const STORAGE_OFFSET_KEY = 'swiftmynd_time_offset_minutes';
export const TIME_EVENT_NAME = 'swiftmynd_time_changed';

// Clean up any legacy +60 offset that previously bumped the clock by 1 hour
if (typeof window !== 'undefined') {
  try {
    const legacy = localStorage.getItem(STORAGE_OFFSET_KEY);
    if (legacy === '60' || legacy === '+60') {
      localStorage.removeItem(STORAGE_OFFSET_KEY);
    }
  } catch {}
}

/**
 * Returns current Date object with any active calibration offset applied.
 * Also checks Egypt winter time threshold (Midnight Thursday Oct 29 -> Friday Oct 30, 2026).
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

  // Base date with user offset applied
  const calculatedDate = new Date(now.getTime() + offsetMinutes * 60 * 1000);

  return calculatedDate;
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
 * Resets system time offset back to 0 (exact device clock)
 */
export function resetSystemTimeToDevice(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_OFFSET_KEY);
    window.dispatchEvent(new CustomEvent(TIME_EVENT_NAME, { detail: { offset: 0 } }));
  } catch {}
}

/**
 * Formats time in 12-hour format: e.g. "6:52 PM"
 * Uses client local device clock (no forced foreign timezone that adds +1hr)
 */
export function formatSystemTimeEn(date: Date = getSystemDate(), includeSeconds: boolean = false): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: true
    }).format(date);
  } catch {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    if (includeSeconds) {
      const seconds = date.getSeconds();
      const secStr = seconds < 10 ? '0' + seconds : seconds;
      return `${hours}:${minStr}:${secStr} ${ampm}`;
    }
    return `${hours}:${minStr} ${ampm}`;
  }
}

/**
 * Formats time in Arabic: e.g. "6:52 م"
 */
export function formatSystemTimeAr(date: Date = getSystemDate(), includeSeconds: boolean = false): string {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
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
 * Formats date as YYYY-MM-DD
 */
export function getSystemDateString(date: Date = getSystemDate()): string {
  try {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return date.toLocaleDateString('ar-EG');
  }
}
