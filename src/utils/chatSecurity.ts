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
/**
 * Checks if two user IDs represent the same canonical team member (accounting for legacy IDs and aliases).
 */
export function isSameUserId(idA?: string | null, idB?: string | null): boolean {
  if (!idA || !idB) return false;
  if (idA === idB) return true;
  const a = idA.trim().toLowerCase();
  const b = idB.trim().toLowerCase();
  if (a === b) return true;

  const aliases: Record<string, string[]> = {
    'user-mariam': ['user-mariam', 'user-1793097751331', 'user-1793016396281', 'mariam', 'مريم'],
    'user-islam': ['user-islam', 'user-1793025675186', 'user-1793016178916', 'islam', 'اسلام', 'إسلام'],
    'user-roaa': ['user-roaa', 'user-1793016462810', 'roaa', 'رواء'],
    'user-eman': ['user-eman', 'eman', 'eman ashraf', 'ايمان', 'إيمان'],
    'user-aya': ['user-aya', 'user-1793016503819', 'aya', 'aya gaber', 'آية', 'ايه', 'آيه'],
    'user-yomna': ['user-yomna', 'yomna', 'يمنى', 'يمنه'],
    'user-amira': ['user-amira', 'amira', 'اميرة', 'أميرة', 'اميره'],
    'user-1': ['user-1', 'user-admin', 'hadeer', 'hadeer said', 'هدير', 'هدير سعيد', 'admin']
  };

  for (const list of Object.values(aliases)) {
    const hasA = list.includes(a);
    const hasB = list.includes(b);
    if (hasA && hasB) return true;
  }

  return false;
}

/**
 * Checks if a given message involves the user as sender or recipient.
 */
export function isUserParticipantInMessage(message: ChatMessage, userId: string): boolean {
  if (!userId) return false;
  return isSameUserId(message.senderId, userId) || isSameUserId(message.recipientId, userId);
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
          ((isSameUserId(m.senderId, memberAId) && isSameUserId(m.recipientId, memberBId)) ||
            (isSameUserId(m.senderId, memberBId) && isSameUserId(m.recipientId, memberAId)))
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
  if (!isAdmin && !isSameUserId(activeChatId, currentUser.id)) {
    return messages
      .filter(
        m =>
          !m.channelId &&
          ((isSameUserId(m.senderId, currentUser.id) && isSameUserId(m.recipientId, activeChatId)) ||
            (isSameUserId(m.senderId, activeChatId) && isSameUserId(m.recipientId, currentUser.id)))
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Admin viewing their own DM with activeChatId
  return messages
    .filter(
      m =>
        !m.channelId &&
        ((isSameUserId(m.senderId, currentUser.id) && isSameUserId(m.recipientId, activeChatId)) ||
          (isSameUserId(m.senderId, activeChatId) && isSameUserId(m.recipientId, currentUser.id)))
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
  searchQuery = '',
  includeAllTeam = false
}: {
  team: TeamMember[];
  currentUser: TeamMember | null;
  messages: ChatMessage[];
  activeChatId?: string;
  activeChatType?: 'channel' | 'dm';
  searchQuery?: string;
  includeAllTeam?: boolean;
}): TeamMember[] {
  if (!currentUser) return [];

  const isAdmin = isUserChatAdmin(currentUser);
  const myId = currentUser.id;

  if (isAdmin || includeAllTeam) {
    return team
      .filter(m => !isSameUserId(m.id, myId))
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

  // Non-admin employee: colleagues they chatted with, plus admin, plus currently selected DM
  const chattedMemberIds = new Set<string>();

  messages.forEach(m => {
    if (!m.channelId) {
      if (isSameUserId(m.senderId, myId) && m.recipientId) {
        team.forEach(t => {
          if (isSameUserId(t.id, m.recipientId)) chattedMemberIds.add(t.id);
        });
      } else if (isSameUserId(m.recipientId, myId) && m.senderId) {
        team.forEach(t => {
          if (isSameUserId(t.id, m.senderId)) chattedMemberIds.add(t.id);
        });
      }
    }
  });

  // Always include admin so the employee has an open direct line
  const adminMember = team.find(m => m.id === 'user-1' || m.accessLevel === 'admin');
  if (adminMember && !isSameUserId(adminMember.id, myId)) {
    chattedMemberIds.add(adminMember.id);
  }

  // Include current active DM if user initiated it via "محادثة جديدة"
  if (activeChatType === 'dm' && activeChatId && !isSameUserId(activeChatId, myId)) {
    team.forEach(t => {
      if (isSameUserId(t.id, activeChatId)) chattedMemberIds.add(t.id);
    });
  }

  return team
    .filter(m => !isSameUserId(m.id, myId) && chattedMemberIds.has(m.id))
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

/**
 * WhatsApp-style read receipt calculation:
 * - Direct 1-on-1: has the recipient viewed the message?
 *   Returns true if recipient is present in readBy array or status is 'read'.
 * - Channel: has anyone other than the sender read the message?
 */
export function isMessageReadByRecipient(
  msg?: ChatMessage | null,
  currentUserId?: string | null
): boolean {
  if (!msg) return false;
  if (msg.status === 'read') return true;

  // In Channels: read by any member other than the sender
  if (msg.channelId) {
    if (!msg.readBy || msg.readBy.length === 0) return false;
    return msg.readBy.some(readerId => !isSameUserId(readerId, msg.senderId));
  }

  // In Direct Messages (DMs):
  // Check if recipient is recorded in readBy
  if (msg.recipientId) {
    if (!msg.readBy || msg.readBy.length === 0) return false;
    return msg.readBy.some(readerId => isSameUserId(readerId, msg.recipientId));
  }

  // Fallback if no recipientId explicit: read by anyone other than sender
  if (msg.readBy && msg.readBy.length > 0) {
    return msg.readBy.some(readerId => !isSameUserId(readerId, msg.senderId));
  }

  return false;
}
