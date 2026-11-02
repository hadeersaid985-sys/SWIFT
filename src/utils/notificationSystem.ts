/**
 * Real-time Audio Chimes, Native Mobile/Desktop Push Notifications,
 * and Vibration System for SwiftMynd.
 *
 * Supports:
 * 1. New Task Assignment ('task')
 * 2. User Mention in Task or Chat ('mention')
 * 3. Incoming Chat Message ('chat')
 */

export type NotificationKind = 'task' | 'mention' | 'chat' | 'meeting' | 'meeting_reminder';

export interface NotificationPayload {
  kind: NotificationKind;
  title: string;
  body: string;
  senderName?: string;
  senderAvatar?: string;
  taskId?: string;
  channelId?: string;
  recipientId?: string;
  data?: any;
}

export const NOTIF_STORAGE_KEYS = {
  SOUND_ENABLED: 'swiftmynd_sound_enabled',
  SYSTEM_NOTIF_ENABLED: 'swiftmynd_system_notif_enabled'
};

// Check if sound is enabled (defaults to true)
export function isSoundNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(NOTIF_STORAGE_KEYS.SOUND_ENABLED);
  return saved === null ? true : saved === 'true';
}

export function setSoundNotificationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIF_STORAGE_KEYS.SOUND_ENABLED, String(enabled));
}

// Global cached AudioContext
let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtxClass();
  }
  return sharedAudioCtx;
}

/**
 * Unlocks the Web Audio API on first user interaction (touch/click/keydown)
 * Essential for mobile browsers (iOS Safari & Android Chrome)
 */
export function unlockAudioAutoplay(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudioAutoplay();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });
}

/**
 * Synthesizes clear, distinctive notification chimes using Web Audio API:
 * - 'task': Triumphant 3-note ascending arpeggio (C5 - E5 - G5)
 * - 'mention': Bright high-resonance dual bell (A5 - D6)
 * - 'chat': Soft warm dual pop (D5 - A5)
 */
export function playAudioNotification(kind: NotificationKind = 'chat'): boolean {
  if (!isSoundNotificationEnabled()) return false;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (kind === 'task') {
      // 3 upbeat melodic notes (C5=523.25, E5=659.25, G5=783.99)
      const frequencies = [523.25, 659.25, 783.99];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.001, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.3);
      });
    } else if (kind === 'mention') {
      // Bright alert ping (A5=880, D6=1174.66)
      const frequencies = [880, 1174.66];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } else {
      // Soft modern chat chime (D5=587.33, A5=880)
      const frequencies = [587.33, 880];
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.001, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.15, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
      });
    }

    // Trigger mobile vibration if supported
    triggerVibration(kind);
    return true;
  } catch (err) {
    console.warn('[Notifications] Audio play error:', err);
    return false;
  }
}

/**
 * Mobile Haptic Vibration Pattern
 */
export function triggerVibration(kind: NotificationKind): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (kind === 'task') {
        navigator.vibrate([120, 60, 120]);
      } else if (kind === 'mention') {
        navigator.vibrate([150, 50, 100, 50, 150]);
      } else {
        navigator.vibrate([80, 50, 80]);
      }
    } catch {}
  }
}

/**
 * Request Browser/Mobile System Notification Permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  unlockAudioAutoplay();

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(NOTIF_STORAGE_KEYS.SYSTEM_NOTIF_ENABLED, 'true');
    }
    return permission;
  } catch (err) {
    console.warn('[Notifications] Error requesting permission:', err);
    return Notification.permission;
  }
}

/**
 * Gets current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Formats notification display header based on kind
 */
export function formatNotificationHeader(kind: NotificationKind, senderName?: string): string {
  if (kind === 'task') {
    return '📋 مهمة جديدة لك في سويفت مايند';
  }
  if (kind === 'mention') {
    return `🔔 منشن لك من ${senderName || 'أحد أعضاء الفريق'}`;
  }
  return `💬 رسالة جديدة من ${senderName || 'عضو في الفريق'}`;
}

/**
 * Dispatches a native System Push Notification (Mobile / PC)
 * + Audio Chime + In-App Live Toast Event
 */
export function triggerUniversalNotification(payload: NotificationPayload): void {
  // 1. Play Audio Alert & Haptic
  playAudioNotification(payload.kind);

  // 2. Dispatch in-app live custom event for the Floating Toast Banner
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('swiftmynd:universal_notification', { detail: payload })
    );
  }

  // 3. Trigger Native System Notification (Mobile & Desktop)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const header = payload.title || formatNotificationHeader(payload.kind, payload.senderName);
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.senderAvatar || '/assets/aistudio/PROFILE2_3fe3b3a5.png',
        badge: '/assets/aistudio/PROFILE2_3fe3b3a5.png',
        tag: `swiftmynd-${payload.kind}-${Date.now()}`,
        dir: 'rtl',
        lang: 'ar'
      };

      // Try Service Worker notification first (best on mobile/PWA)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(header, options).catch(() => {
            // Fallback to standard Notification
            const notif = new Notification(header, options);
            notif.onclick = () => {
              window.focus();
              notif.close();
            };
          });
        }).catch(() => {
          const notif = new Notification(header, options);
          notif.onclick = () => {
            window.focus();
            notif.close();
          };
        });
      } else {
        const notif = new Notification(header, options);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
    } catch (e) {
      console.warn('[Notifications] System notification failed:', e);
    }
  }
}
