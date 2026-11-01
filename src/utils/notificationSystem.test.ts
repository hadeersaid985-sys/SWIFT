import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatNotificationHeader,
  isSoundNotificationEnabled,
  NOTIF_STORAGE_KEYS,
  NotificationKind
} from './notificationSystem';

test('formatNotificationHeader returns Arabic descriptions for each kind', () => {
  assert.equal(formatNotificationHeader('task'), '📋 مهمة جديدة لك في سويفت مايند');
  assert.equal(formatNotificationHeader('mention', 'هدير سعيد'), '🔔 منشن لك من هدير سعيد');
  assert.equal(formatNotificationHeader('chat', 'Amira'), '💬 رسالة جديدة من Amira');
});

test('storage keys are well defined', () => {
  assert.equal(NOTIF_STORAGE_KEYS.SOUND_ENABLED, 'swiftmynd_sound_enabled');
  assert.equal(NOTIF_STORAGE_KEYS.SYSTEM_NOTIF_ENABLED, 'swiftmynd_system_notif_enabled');
});

test('isSoundNotificationEnabled defaults to true in non-browser or unconfigured environment', () => {
  assert.equal(isSoundNotificationEnabled(), true);
});
