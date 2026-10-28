import test from 'node:test';
import assert from 'node:assert/strict';
import { ChatMessage } from '../types/crm';

// Pure logic helper functions for Chat
export function toggleMessageReaction(
  reactions: NonNullable<ChatMessage['reactions']>,
  emoji: string,
  userId: string
): NonNullable<ChatMessage['reactions']> {
  const current = [...reactions];
  const idx = current.findIndex(r => r.emoji === emoji);

  if (idx > -1) {
    const rx = current[idx];
    if (rx.userIds.includes(userId)) {
      const filtered = rx.userIds.filter(u => u !== userId);
      if (filtered.length === 0) {
        current.splice(idx, 1);
      } else {
        current[idx] = { emoji, count: filtered.length, userIds: filtered };
      }
    } else {
      current[idx] = { emoji, count: rx.count + 1, userIds: [...rx.userIds, userId] };
    }
  } else {
    current.push({ emoji, count: 1, userIds: [userId] });
  }

  return current;
}

export function filterMessagesForChat(
  messages: ChatMessage[],
  currentUserId: string,
  chatId: string,
  chatType: 'channel' | 'dm'
): ChatMessage[] {
  if (chatType === 'channel') {
    return messages.filter(m => m.channelId === chatId);
  }
  return messages.filter(
    m =>
      !m.channelId &&
      ((m.senderId === currentUserId && m.recipientId === chatId) ||
        (m.senderId === chatId && m.recipientId === currentUserId))
  );
}

test('toggleMessageReaction adds emoji reaction for a new user', () => {
  const initial: NonNullable<ChatMessage['reactions']> = [];
  const updated = toggleMessageReaction(initial, '🔥', 'user-1');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].emoji, '🔥');
  assert.equal(updated[0].count, 1);
  assert.deepEqual(updated[0].userIds, ['user-1']);
});

test('toggleMessageReaction toggles off when user clicks same reaction again', () => {
  const initial = [{ emoji: '🔥', count: 1, userIds: ['user-1'] }];
  const updated = toggleMessageReaction(initial, '🔥', 'user-1');
  assert.equal(updated.length, 0);
});

test('filterMessagesForChat correctly separates channel messages and 1-on-1 DMs', () => {
  const messages: ChatMessage[] = [
    {
      id: '1',
      channelId: 'general',
      senderId: 'user-1',
      senderName: 'Hadeer',
      senderAvatar: '',
      text: 'Hello channel',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      channelId: 'sales',
      senderId: 'user-2',
      senderName: 'Amira',
      senderAvatar: '',
      text: 'Sales update',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      recipientId: 'user-2',
      senderId: 'user-1',
      senderName: 'Hadeer',
      senderAvatar: '',
      text: 'Direct message to Amira',
      timestamp: new Date().toISOString()
    },
    {
      id: '4',
      recipientId: 'user-1',
      senderId: 'user-3',
      senderName: 'Aya',
      senderAvatar: '',
      text: 'Direct message from Aya',
      timestamp: new Date().toISOString()
    }
  ];

  const general = filterMessagesForChat(messages, 'user-1', 'general', 'channel');
  assert.equal(general.length, 1);
  assert.equal(general[0].id, '1');

  const dmAmira = filterMessagesForChat(messages, 'user-1', 'user-2', 'dm');
  assert.equal(dmAmira.length, 1);
  assert.equal(dmAmira[0].id, '3');
});
