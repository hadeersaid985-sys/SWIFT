import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ChatMessage, ChatChannel, ChatAttachment, TeamMember } from '../types/crm';
import { INITIAL_CHAT_CHANNELS, INITIAL_CHAT_MESSAGES } from '../data/chatData';
import {
  saveChatMessageToFirestore,
  deleteChatMessageFromFirestore,
  onChatMessagesSnapshot,
  seedInitialChatMessagesIfEmpty,
  purgeDemoChatMessagesFromFirestore,
  clearAllChatMessagesFromFirestore
} from '../firebase';
import { useCRM } from './CRMContext';

interface SendMessagePayload {
  text: string;
  channelId?: string;
  recipientId?: string;
  attachments?: ChatAttachment[];
  replyTo?: ChatMessage['replyTo'];
}

interface ChatContextType {
  channels: ChatChannel[];
  messages: ChatMessage[];
  activeChatId: string;
  activeChatType: 'channel' | 'dm';
  setActiveChat: (id: string, type: 'channel' | 'dm') => void;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createChannel: (channel: Omit<ChatChannel, 'createdAt' | 'createdById'>) => void;
  clearAllMessages: () => Promise<void>;
  clearCurrentChat: () => Promise<void>;
  unreadCount: number;
  unreadPerTarget: Record<string, number>;
  markAsRead: (targetId: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeTargetName: string;
  activeTargetAvatar?: string;
  activeTargetRole?: string;
  activeTargetStatus?: 'online' | 'busy' | 'away' | 'offline';
  isTypingNotice: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = 'swiftmynd_team_chat_messages_v2';
const CHANNELS_STORAGE_KEY = 'swiftmynd_team_chat_channels_v1';
const SOUND_STORAGE_KEY = 'swiftmynd_chat_sound_enabled';

// Specific IDs used by the previous demo placeholder messages
const DEMO_MSG_IDS = new Set([
  'msg-gen-1', 'msg-gen-2', 'msg-gen-3', 'msg-gen-4',
  'msg-sal-1', 'msg-sal-2',
  'msg-tech-1',
  'msg-ann-1',
  'dm-1', 'dm-2', 'dm-3', 'dm-4'
]);

const isDemoMessage = (id: string) =>
  DEMO_MSG_IDS.has(id) ||
  id.startsWith('msg-gen-') ||
  id.startsWith('msg-sal-') ||
  id.startsWith('msg-tech-') ||
  id.startsWith('msg-ann-') ||
  (id.startsWith('dm-') && id.length <= 8);

// Pleasant short tone synthesized with Web Audio API
const playTone = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, team } = useCRM();

  // Channels state
  const [channels, setChannels] = useState<ChatChannel[]>(() => {
    try {
      const saved = localStorage.getItem(CHANNELS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CHAT_CHANNELS;
  });

  // Messages state - starts completely fresh without any demo messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      localStorage.removeItem('swiftmynd_team_chat_messages_v1');
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(m => m?.id && !isDemoMessage(m.id));
        }
      }
    } catch {}
    return [];
  });

  // Active chat selection
  const [activeChatId, setActiveChatId] = useState<string>('general');
  const [activeChatType, setActiveChatType] = useState<'channel' | 'dm'>('channel');

  // Sound preference
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, String(val));
    } catch {}
  };

  // Read message targets tracked by user
  const [readTargets, setReadTargets] = useState<Record<string, number>>({});

  // Real-time synchronization with Firestore
  useEffect(() => {
    // 1. Purge any legacy demo messages from Firestore and local cache
    purgeDemoChatMessagesFromFirestore();
    try {
      localStorage.removeItem('swiftmynd_team_chat_messages_v1');
    } catch {}

    // 2. Listen to real-time updates (ignoring any demo messages)
    const unsubscribe = onChatMessagesSnapshot(remoteMessages => {
      const cleanMessages = (remoteMessages || [])
        .filter(m => m?.id && !isDemoMessage(m.id))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setMessages(cleanMessages);
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(cleanMessages));
      } catch {}
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save messages to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Save channels to local storage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(CHANNELS_STORAGE_KEY, JSON.stringify(channels));
    } catch {}
  }, [channels]);

  // Mark target as read
  const markAsRead = useCallback((targetId: string) => {
    setReadTargets(prev => ({
      ...prev,
      [targetId]: Date.now()
    }));
  }, []);

  // Switch chat
  const setActiveChat = useCallback((id: string, type: 'channel' | 'dm') => {
    setActiveChatId(id);
    setActiveChatType(type);
    markAsRead(id);
  }, [markAsRead]);

  // Compute unread counts per channel or DM
  const unreadPerTarget = useMemo(() => {
    const res: Record<string, number> = {};
    if (!currentUser) return res;

    const currentUserId = currentUser.id;

    messages.forEach(msg => {
      if (msg.senderId === currentUserId) return; // My own messages are not unread

      if (msg.channelId) {
        // Channel message
        const lastRead = readTargets[msg.channelId] || 0;
        const msgTime = new Date(msg.timestamp).getTime();
        if (msgTime > lastRead) {
          res[msg.channelId] = (res[msg.channelId] || 0) + 1;
        }
      } else if (msg.recipientId === currentUserId) {
        // Direct message sent to me
        const lastRead = readTargets[msg.senderId] || 0;
        const msgTime = new Date(msg.timestamp).getTime();
        if (msgTime > lastRead) {
          res[msg.senderId] = (res[msg.senderId] || 0) + 1;
        }
      }
    });

    return res;
  }, [messages, currentUser, readTargets]);

  // Total unread count across all targets
  const unreadCount = useMemo(() => {
    return Object.values(unreadPerTarget).reduce((sum, c) => sum + c, 0);
  }, [unreadPerTarget]);

  // Send message
  const sendMessage = useCallback(async ({
    text,
    channelId,
    recipientId,
    attachments,
    replyTo
  }: SendMessagePayload) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      channelId,
      recipientId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      senderDepartment: currentUser.department,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      attachments,
      replyTo,
      reactions: [],
      readBy: [currentUser.id]
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);

    if (soundEnabled) {
      playTone();
    }

    // Save to Firestore
    try {
      await saveChatMessageToFirestore(newMessage);
    } catch (e) {
      console.warn('Firestore chat save fallback to local:', e);
    }
  }, [currentUser, soundEnabled]);

  // Add / Toggle reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions ? [...msg.reactions] : [];
        const existingRxIndex = currentReactions.findIndex(r => r.emoji === emoji);

        if (existingRxIndex > -1) {
          const rx = currentReactions[existingRxIndex];
          const hasUser = rx.userIds.includes(userId);

          if (hasUser) {
            // Remove user reaction
            const newUserIds = rx.userIds.filter(u => u !== userId);
            if (newUserIds.length === 0) {
              currentReactions.splice(existingRxIndex, 1);
            } else {
              currentReactions[existingRxIndex] = {
                ...rx,
                count: newUserIds.length,
                userIds: newUserIds
              };
            }
          } else {
            // Add user reaction
            currentReactions[existingRxIndex] = {
              ...rx,
              count: rx.count + 1,
              userIds: [...rx.userIds, userId]
            };
          }
        } else {
          // New emoji reaction
          currentReactions.push({
            emoji,
            count: 1,
            userIds: [userId]
          });
        }

        const updatedMsg: ChatMessage = {
          ...msg,
          reactions: currentReactions
        };

        // Async sync to Firestore
        saveChatMessageToFirestore(updatedMsg).catch(() => {});
        return updatedMsg;
      })
    );
  }, [currentUser]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    try {
      await deleteChatMessageFromFirestore(messageId);
    } catch {}
  }, []);

  // Create channel
  const createChannel = useCallback((newChan: Omit<ChatChannel, 'createdAt' | 'createdById'>) => {
    const channel: ChatChannel = {
      ...newChan,
      id: newChan.id || `chan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdById: currentUser?.id
    };
    setChannels(prev => [...prev, channel]);
    setActiveChatId(channel.id);
    setActiveChatType('channel');
  }, [currentUser]);

  // Clear all messages (admin reset)
  const clearAllMessages = useCallback(async () => {
    setMessages([]);
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([]));
    } catch {}
    await clearAllChatMessagesFromFirestore();
  }, []);

  // Clear current active channel or DM conversation messages
  const clearCurrentChat = useCallback(async () => {
    const toDelete = messages.filter(m =>
      activeChatType === 'channel'
        ? m.channelId === activeChatId
        : !m.channelId &&
          ((m.senderId === currentUser?.id && m.recipientId === activeChatId) ||
            (m.senderId === activeChatId && m.recipientId === currentUser?.id))
    );

    setMessages(prev => prev.filter(m => !toDelete.some(d => d.id === m.id)));

    for (const msg of toDelete) {
      await deleteChatMessageFromFirestore(msg.id);
    }
  }, [messages, activeChatId, activeChatType, currentUser]);

  // Active target details for header
  const activeTargetDetails = useMemo(() => {
    if (activeChatType === 'channel') {
      const ch = channels.find(c => c.id === activeChatId);
      return {
        name: ch ? `# ${ch.name}` : '# عام',
        role: ch?.description || 'قناة فريق العمل العامة',
        avatar: undefined,
        status: undefined
      };
    } else {
      const member = team.find(m => m.id === activeChatId);
      return {
        name: member?.name || 'عضو الفريق',
        role: member?.role || member?.department || 'عضو الفريق',
        avatar: member?.avatar,
        status: member?.status || 'online'
      };
    }
  }, [activeChatType, activeChatId, channels, team]);

  const value = {
    channels,
    messages,
    activeChatId,
    activeChatType,
    setActiveChat,
    sendMessage,
    addReaction,
    deleteMessage,
    createChannel,
    clearAllMessages,
    clearCurrentChat,
    unreadCount,
    unreadPerTarget,
    markAsRead,
    soundEnabled,
    setSoundEnabled,
    activeTargetName: activeTargetDetails.name,
    activeTargetAvatar: activeTargetDetails.avatar,
    activeTargetRole: activeTargetDetails.role,
    activeTargetStatus: activeTargetDetails.status,
    isTypingNotice: null
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
