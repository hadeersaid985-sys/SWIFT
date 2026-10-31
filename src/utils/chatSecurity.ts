import { ChatMessage, TeamMember } from '../types/crm';

export interface ConversationPair {
  pairKey: string;
  memberA: TeamMember;
  memberB: TeamMember;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
}

/**
 * Checks if a user is an admin or manager with supervisory privileges.
 */
export function isUserChatAdmin(user?: TeamMember | null): boolean {
  if (!user) return false;
  return user.accessLevel === 'admin' || user.id === 'user-1';
}

/**
 * Checks if a given message involves the user as sender or recipient.
 */
export function isUserParticipantInMessage(message: ChatMessage, userId: string): boolean {
  if (!userId) return false;
  return message.senderId === userId || message.recipientId === userId;
}

/**
 * Filter messages visible to a user based on strict role-based access:
 * - Admin sees messages for whatever channel or DM or audit pair they are inspecting.
 * - Non-admin member ONLY sees channel messages OR DMs where they are a participant (sender or recipient).
 */
export function getVisibleMessagesForChat({
  messages,
  currentUser,
  activeChatId,
  activeChatType,
  isAuditMode = false,
  auditPair = null
}: {
  messages: ChatMessage[];
  currentUser: TeamMember | null;
  activeChatId: string;
  activeChatType: 'channel' | 'dm';
  isAuditMode?: boolean;
  auditPair?: { memberAId: string; memberBId: string } | null;
}): ChatMessage[] {
  if (!currentUser) return [];

  const isAdmin = isUserChatAdmin(currentUser);

  // 1. Admin Audit Mode: Admin inspecting a conversation between two employees
  if (isAdmin && isAuditMode && auditPair) {
    const { memberAId, memberBId } = auditPair;
    return messages
      .filter(
        m =>
          !m.channelId &&
          ((m.senderId === memberAId && m.recipientId === memberBId) ||
            (m.senderId === memberBId && m.recipientId === memberAId))
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // 2. Channel messages
  if (activeChatType === 'channel') {
    return messages
      .filter(m => m.channelId === activeChatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // 3. 1-on-1 Direct Messages
  // Security rule: If not admin, currentUser MUST be either sender or recipient with activeChatId
  if (!isAdmin && activeChatId !== currentUser.id) {
    return messages
      .filter(
        m =>
          !m.channelId &&
          ((m.senderId === currentUser.id && m.recipientId === activeChatId) ||
            (m.senderId === activeChatId && m.recipientId === currentUser.id))
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Admin viewing their own DM with activeChatId
  return messages
    .filter(
      m =>
        !m.channelId &&
        ((m.senderId === currentUser.id && m.recipientId === activeChatId) ||
          (m.senderId === activeChatId && m.recipientId === currentUser.id))
    )
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Groups all team 1-on-1 conversations across the entire organization for the Admin view.
 */
export function buildAllTeamConversations({
  messages,
  team
}: {
  messages: ChatMessage[];
  team: TeamMember[];
}): ConversationPair[] {
  const map = new Map<string, ConversationPair>();

  messages.forEach(m => {
    if (!m.channelId && m.senderId && m.recipientId) {
      const sortedIds = [m.senderId, m.recipientId].sort();
      const pairKey = sortedIds.join('__');

      const memA =
        team.find(x => x.id === sortedIds[0]) ||
        (({
          id: sortedIds[0],
          name: m.senderId === sortedIds[0] ? m.senderName : 'عضو الفريق',
          avatar: m.senderId === sortedIds[0] ? m.senderAvatar : '',
          role: m.senderId === sortedIds[0] ? m.senderRole : '',
          department: m.senderId === sortedIds[0] ? m.senderDepartment : ''
        } as unknown) as TeamMember);

      const memB =
        team.find(x => x.id === sortedIds[1]) ||
        (({
          id: sortedIds[1],
          name: m.senderId === sortedIds[1] ? m.senderName : 'عضو الفريق',
          avatar: m.senderId === sortedIds[1] ? m.senderAvatar : '',
          role: m.senderId === sortedIds[1] ? m.senderRole : '',
          department: m.senderId === sortedIds[1] ? m.senderDepartment : ''
        } as unknown) as TeamMember);

      if (!map.has(pairKey)) {
        map.set(pairKey, {
          pairKey,
          memberA: memA,
          memberB: memB,
          messages: [],
          lastMessage: m
        });
      }

      const entry = map.get(pairKey)!;
      entry.messages.push(m);
      if (new Date(m.timestamp).getTime() > new Date(entry.lastMessage.timestamp).getTime()) {
        entry.lastMessage = m;
      }
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );
}

/**
 * Filter which team members are visible in the chat list:
 * - Admin: sees all team members to initiate or view chats.
 * - Non-admin employee: ONLY sees members they have had conversations with, the Admin (for direct escalation), or currently active chat.
 */
export function getVisibleTeamMembersForUser({
  team,
  currentUser,
  messages,
  activeChatId,
  activeChatType,
  searchQuery = ''
}: {
  team: TeamMember[];
  currentUser: TeamMember | null;
  messages: ChatMessage[];
  activeChatId?: string;
  activeChatType?: 'channel' | 'dm';
  searchQuery?: string;
}): TeamMember[] {
  if (!currentUser) return [];

  const isAdmin = isUserChatAdmin(currentUser);

  if (isAdmin) {
    return team
      .filter(m => m.id !== currentUser.id)
      .filter(m => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          (m.role && m.role.toLowerCase().includes(q)) ||
          (m.department && m.department.toLowerCase().includes(q))
        );
      });
  }

  // Non-admin employee: only colleagues they chatted with, plus admin, plus currently selected DM
  const myId = currentUser.id;
  const chattedMemberIds = new Set<string>();

  messages.forEach(m => {
    if (!m.channelId) {
      if (m.senderId === myId && m.recipientId) {
        chattedMemberIds.add(m.recipientId);
      } else if (m.recipientId === myId && m.senderId) {
        chattedMemberIds.add(m.senderId);
      }
    }
  });

  // Always include admin so the employee has an open direct line
  const adminMember = team.find(m => m.id === 'user-1' || m.accessLevel === 'admin');
  if (adminMember && adminMember.id !== myId) {
    chattedMemberIds.add(adminMember.id);
  }

  // Include current active DM if user initiated it via "محادثة جديدة"
  if (activeChatType === 'dm' && activeChatId && activeChatId !== myId) {
    chattedMemberIds.add(activeChatId);
  }

  return team
    .filter(m => m.id !== myId && chattedMemberIds.has(m.id))
    .filter(m => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.role && m.role.toLowerCase().includes(q)) ||
        (m.department && m.department.toLowerCase().includes(q))
      );
    });
}
