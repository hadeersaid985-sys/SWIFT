import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isUserChatAdmin,
  isUserParticipantInMessage,
  getVisibleMessagesForChat,
  buildAllTeamConversations,
  getVisibleTeamMembersForUser
} from './chatSecurity';
import { ChatMessage, TeamMember } from '../types/crm';

const mockAdmin = {
  id: 'user-1',
  name: 'هدير سعيد',
  role: 'مدير عام النظام والعمليات',
  department: 'المبيعات',
  avatar: 'https://images.unsplash.com/admin.jpg',
  accessLevel: 'admin',
  status: 'online'
} as unknown as TeamMember;

const mockEmployeeA = {
  id: 'emp-islam',
  name: 'Islam',
  role: 'SEO Specialist',
  department: 'التسويق',
  avatar: 'https://images.unsplash.com/islam.jpg',
  accessLevel: 'member',
  status: 'online'
} as unknown as TeamMember;

const mockEmployeeB = {
  id: 'emp-yomna',
  name: 'Yomna',
  role: 'SEO Specialist',
  department: 'التسويق',
  avatar: 'https://images.unsplash.com/yomna.jpg',
  accessLevel: 'member',
  status: 'online'
} as unknown as TeamMember;

const mockEmployeeC = {
  id: 'emp-aya',
  name: 'Aya Gaber',
  role: 'Designer',
  department: 'التطوير والتقنية',
  avatar: 'https://images.unsplash.com/aya.jpg',
  accessLevel: 'member',
  status: 'online'
} as unknown as TeamMember;

const mockTeam: TeamMember[] = [mockAdmin, mockEmployeeA, mockEmployeeB, mockEmployeeC];

const sampleMessages: ChatMessage[] = [
  // General Channel
  {
    id: 'm1',
    channelId: 'general',
    senderId: mockAdmin.id,
    senderName: mockAdmin.name,
    senderAvatar: mockAdmin.avatar,
    text: 'صباح الخير جميعاً',
    timestamp: '2026-10-31T09:00:00.000Z'
  },
  // DM between Islam & Yomna
  {
    id: 'm2',
    senderId: mockEmployeeA.id,
    recipientId: mockEmployeeB.id,
    senderName: mockEmployeeA.name,
    senderAvatar: mockEmployeeA.avatar,
    text: 'مرحبا يمنى، هل شيت الكلمات المفتاحية جاهز؟',
    timestamp: '2026-10-31T09:05:00.000Z'
  },
  {
    id: 'm3',
    senderId: mockEmployeeB.id,
    recipientId: mockEmployeeA.id,
    senderName: mockEmployeeB.name,
    senderAvatar: mockEmployeeB.avatar,
    text: 'أهلاً إسلام، نعم تم تحديثه',
    timestamp: '2026-10-31T09:06:00.000Z'
  },
  // DM between Aya & Admin
  {
    id: 'm4',
    senderId: mockEmployeeC.id,
    recipientId: mockAdmin.id,
    senderName: mockEmployeeC.name,
    senderAvatar: mockEmployeeC.avatar,
    text: 'أستاذة هدير، تم رفع التصاميم الجديدة',
    timestamp: '2026-10-31T09:10:00.000Z'
  }
];

test('isUserChatAdmin accurately distinguishes admin from employees', () => {
  assert.equal(isUserChatAdmin(mockAdmin), true);
  assert.equal(isUserChatAdmin(mockEmployeeA), false);
  assert.equal(isUserChatAdmin(mockEmployeeB), false);
  assert.equal(isUserChatAdmin(null), false);
});

test('Employee A (Islam) can only view messages where they are sender or recipient in DMs', () => {
  // When Islam views chat with Yomna
  const islamToYomna = getVisibleMessagesForChat({
    messages: sampleMessages,
    currentUser: mockEmployeeA,
    activeChatId: mockEmployeeB.id,
    activeChatType: 'dm'
  });
  assert.equal(islamToYomna.length, 2);
  assert.equal(islamToYomna[0].id, 'm2');
  assert.equal(islamToYomna[1].id, 'm3');

  // If Islam tries to view chat with Aya (where Islam has no messages), returns 0
  const islamToAya = getVisibleMessagesForChat({
    messages: sampleMessages,
    currentUser: mockEmployeeA,
    activeChatId: mockEmployeeC.id,
    activeChatType: 'dm'
  });
  assert.equal(islamToAya.length, 0);
});

test('Employee C (Aya) cannot see DMs between Islam and Yomna', () => {
  // Even if Aya sets activeChatId to Yomna, Aya must never see Islam & Yomna messages
  const ayaToYomna = getVisibleMessagesForChat({
    messages: sampleMessages,
    currentUser: mockEmployeeC,
    activeChatId: mockEmployeeB.id,
    activeChatType: 'dm'
  });
  assert.equal(ayaToYomna.length, 0);
});

test('Admin can see all team conversations across any two employees in audit mode', () => {
  const allConversations = buildAllTeamConversations({
    messages: sampleMessages,
    team: mockTeam
  });

  // There are two 1-on-1 pairs: (Islam & Yomna) and (Admin & Aya)
  assert.equal(allConversations.length, 2);

  const islamYomnaConv = allConversations.find(
    c =>
      (c.memberA.id === mockEmployeeA.id && c.memberB.id === mockEmployeeB.id) ||
      (c.memberA.id === mockEmployeeB.id && c.memberB.id === mockEmployeeA.id)
  );
  assert.ok(islamYomnaConv, 'Islam & Yomna conversation pair must exist for Admin');
  assert.equal(islamYomnaConv.messages.length, 2);

  // Admin inspects Islam & Yomna chat
  const adminAuditMessages = getVisibleMessagesForChat({
    messages: sampleMessages,
    currentUser: mockAdmin,
    activeChatId: '',
    activeChatType: 'dm',
    isAuditMode: true,
    auditPair: { memberAId: mockEmployeeA.id, memberBId: mockEmployeeB.id }
  });

  assert.equal(adminAuditMessages.length, 2);
  assert.equal(adminAuditMessages[0].text, 'مرحبا يمنى، هل شيت الكلمات المفتاحية جاهز؟');
  assert.equal(adminAuditMessages[1].text, 'أهلاً إسلام، نعم تم تحديثه');
});

test('getVisibleTeamMembersForUser isolates member list for employee vs admin', () => {
  // Employee A (Islam) only chatted with Yomna, plus Admin is always included
  const islamVisibleMembers = getVisibleTeamMembersForUser({
    team: mockTeam,
    currentUser: mockEmployeeA,
    messages: sampleMessages
  });

  const memberIds = islamVisibleMembers.map(m => m.id);
  assert.ok(memberIds.includes(mockEmployeeB.id), 'Yomna should be visible to Islam');
  assert.ok(memberIds.includes(mockAdmin.id), 'Admin should be visible to Islam');
  assert.ok(!memberIds.includes(mockEmployeeC.id), 'Aya should NOT be in Islam active chats yet');

  // Admin sees all team members
  const adminVisibleMembers = getVisibleTeamMembersForUser({
    team: mockTeam,
    currentUser: mockAdmin,
    messages: sampleMessages
  });
  assert.equal(adminVisibleMembers.length, 3); // Islam, Yomna, Aya
});
