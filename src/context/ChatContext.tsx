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
import { isSameUserId } from '../utils/chatSecurity';
import { triggerUniversalNotification, playAudioNotification } from '../utils/notificationSystem';
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
  playAudioNotification('chat');
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

  // Real-time synchronization with Server SSE & Firestore (Dual-Engine Live Sync)
  useEffect(() => {
    // 1. Purge legacy demo messages
    purgeDemoChatMessagesFromFirestore();
    try {
      localStorage.removeItem('swiftmynd_team_chat_messages_v1');
    } catch {}

    // 2. Initial fetch from server store to catch up immediately
    const fetchServerChat = async () => {
      try {
        const res = await fetch('/api/chat', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(prev => {
              const map = new Map<string, ChatMessage>();
              prev.forEach(m => {
                if (m?.id && !isDemoMessage(m.id)) map.set(m.id, m);
              });
              data.messages.forEach((m: any) => {
                if (m?.id && !isDemoMessage(m.id)) map.set(m.id, m);
              });
              const sorted = Array.from(map.values()).sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
              try {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sorted));
              } catch {}
              return sorted;
            });
          }
        }
      } catch (err) {
        console.warn('[Chat] Initial fetch notice:', err);
      }
    };
    fetchServerChat();

    // 3. Connect to live server SSE stream for 0ms cross-device delivery
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/live-sync');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'CHAT_MESSAGE' && payload.message) {
            const incoming: ChatMessage = payload.message;
            if (isDemoMessage(incoming.id)) return;

            setMessages(prev => {
              if (prev.some(m => m.id === incoming.id)) return prev;
              const next = [...prev, incoming].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
              try {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });

            // If message was sent by someone else, trigger live toast, audio chime, and push notification
            if (currentUser && !isSameUserId(incoming.senderId, currentUser.id)) {
              const isDirectToMe = isSameUserId(incoming.recipientId, currentUser.id);
              const isChannel = Boolean(incoming.channelId);

              if (isDirectToMe || isChannel) {
                // Check if currentUser was mentioned in this chat message
                const isMentioned = Boolean(
                  (incoming.text && currentUser.name && incoming.text.includes(currentUser.name)) ||
                  (Array.isArray(incoming.mentionedUserIds) && incoming.mentionedUserIds.some(id => isSameUserId(id, currentUser.id)))
                );

                if (isMentioned) {
                  triggerUniversalNotification({
                    kind: 'mention',
                    title: `🔔 منشن لك من ${incoming.senderName || 'عضو الفريق'}`,
                    body: incoming.text || 'قام بالإشارة إليك في محادثة الفريق',
                    senderName: incoming.senderName,
                    senderAvatar: incoming.senderAvatar,
                    channelId: incoming.channelId,
                    data: incoming
                  });
                } else {
                  triggerUniversalNotification({
                    kind: 'chat',
                    title: isDirectToMe ? `💬 رسالة خاصة من ${incoming.senderName || 'عضو الفريق'}` : `💬 رسالة جديدة في #${incoming.channelId || 'عام'}`,
                    body: incoming.text || (incoming.attachments?.length ? '📎 مرفق ملف / صورة' : 'رسالة جديدة'),
                    senderName: incoming.senderName,
                    senderAvatar: incoming.senderAvatar,
                    channelId: incoming.channelId,
                    recipientId: incoming.recipientId,
                    data: incoming
                  });
                }
              }
            }
          } else if (payload.type === 'CHAT_MESSAGES_READ') {
            const updatedIds = new Set<string>(payload.messageIds || []);
            const readerId = payload.readerId;
            setMessages(prev => {
              let changed = false;
              const next = prev.map(m => {
                if (updatedIds.has(m.id)) {
                  const currentReadBy = m.readBy || [];
                  if (!currentReadBy.some(u => isSameUserId(u, readerId))) {
                    changed = true;
                    return {
                      ...m,
                      readBy: [...currentReadBy, readerId],
                      status: 'read' as const,
                      readAt: m.readAt || payload.readAt
                    };
                  }
                }
                return m;
              });
              if (changed) {
                try {
                  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
                } catch {}
                return next;
              }
              return prev;
            });
          } else if (payload.type === 'CHAT_REACTION') {
            setMessages(prev =>
              prev.map(m =>
                m.id === payload.messageId ? { ...m, reactions: payload.reactions } : m
              )
            );
          } else if (payload.type === 'CHAT_DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.messageId));
          } else if (payload.type === 'CHAT_CLEAR') {
            if (payload.channelId) {
              setMessages(prev => prev.filter(m => m.channelId !== payload.channelId));
            } else {
              setMessages([]);
            }
          }
        } catch {}
      };
    } catch (e) {
      console.warn('[Chat] EventSource SSE connection notice:', e);
    }

    // 4. Polling fallback every 3 seconds to guarantee 100% sync
    const pollInterval = setInterval(() => {
      fetchServerChat();
    }, 3000);

    // 5. Firestore real-time listener as secondary redundancy
    const unsubscribeFirestore = onChatMessagesSnapshot(remoteMessages => {
      if (Array.isArray(remoteMessages) && remoteMessages.length > 0) {
        setMessages(prev => {
          const map = new Map<string, ChatMessage>();
          prev.forEach(m => {
            if (m?.id && !isDemoMessage(m.id)) map.set(m.id, m);
          });
          remoteMessages.forEach(m => {
            if (m?.id && !isDemoMessage(m.id)) map.set(m.id, m);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      }
    });

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
      if (typeof unsubscribeFirestore === 'function') unsubscribeFirestore();
    };
  }, [currentUser, soundEnabled]);

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

  // Mark target conversation as read by currentUser
  const markAsRead = useCallback(async (targetId: string) => {
    if (!currentUser || !targetId) return;
    const readerId = currentUser.id;

    setReadTargets(prev => ({
      ...prev,
      [targetId]: Date.now()
    }));

    // Optimistically mark messages as read locally
    let updatedCount = 0;
    setMessages(prev => {
      let changed = false;
      const next = prev.map(msg => {
        // Direct message from target to currentUser
        const isDMFromTargetToMe =
          !msg.channelId &&
          isSameUserId(msg.senderId, targetId) &&
          isSameUserId(msg.recipientId, readerId);
        // Channel message
        const isChannelTarget = msg.channelId === targetId && !isSameUserId(msg.senderId, readerId);

        if (isDMFromTargetToMe || isChannelTarget) {
          const alreadyRead = msg.readBy && msg.readBy.some(id => isSameUserId(id, readerId));
          if (!alreadyRead) {
            changed = true;
            updatedCount++;
            return {
              ...msg,
              readBy: [...(msg.readBy || []), readerId],
              status: 'read' as const,
              readAt: msg.readAt || new Date().toISOString()
            };
          }
        }
        return msg;
      });

      if (changed) {
        try {
          localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });

    // Notify backend & broadcast to sender in real time
    try {
      fetch('/api/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId, targetId })
      }).catch(err => console.warn('[Chat] Server read sync notice:', err));
    } catch {}
  }, [currentUser]);

  // Switch chat
  const setActiveChat = useCallback((id: string, type: 'channel' | 'dm') => {
    setActiveChatId(id);
    setActiveChatType(type);
    markAsRead(id);
  }, [markAsRead]);

  // Auto-mark as read when user is actively viewing a conversation with unread incoming messages
  useEffect(() => {
    if (!currentUser || !activeChatId) return;
    const currentUserId = currentUser.id;
    const hasUnread = messages.some(msg => {
      const isFromOtherToMe =
        activeChatType === 'dm'
          ? !msg.channelId &&
            isSameUserId(msg.senderId, activeChatId) &&
            isSameUserId(msg.recipientId, currentUserId)
          : msg.channelId === activeChatId && !isSameUserId(msg.senderId, currentUserId);

      const notReadByMe = !(msg.readBy && msg.readBy.some(id => isSameUserId(id, currentUserId)));
      return isFromOtherToMe && notReadByMe;
    });

    if (hasUnread) {
      markAsRead(activeChatId);
    }
  }, [currentUser, activeChatId, activeChatType, messages, markAsRead]);

  // Compute unread counts per channel or DM
  const unreadPerTarget = useMemo(() => {
    const res: Record<string, number> = {};
    if (!currentUser) return res;

    const currentUserId = currentUser.id;

    messages.forEach(msg => {
      if (isSameUserId(msg.senderId, currentUserId)) return; // My own messages are not unread

      if (msg.channelId) {
        // Channel message
        const lastRead = readTargets[msg.channelId] || 0;
        const msgTime = new Date(msg.timestamp).getTime();
        if (msgTime > lastRead) {
          res[msg.channelId] = (res[msg.channelId] || 0) + 1;
        }
      } else if (isSameUserId(msg.recipientId, currentUserId)) {
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
      readBy: [currentUser.id],
      status: 'sent'
    };

    // Optimistic update
    setMessages(prev => [...prev, newMessage]);

    if (soundEnabled) {
      playTone();
    }

    // 1. Post to Server API for zero-latency SSE broadcast to all devices
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage })
    }).catch(err => console.warn('[Chat] Server broadcast notice:', err));

    // 2. Save to Firestore in parallel
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

    let updatedReactions: any[] = [];
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id !== messageId) return msg;

        const currentReactions = msg.reactions ? [...msg.reactions] : [];
        const existingRxIndex = currentReactions.findIndex(r => r.emoji === emoji);

        if (existingRxIndex > -1) {
          const rx = currentReactions[existingRxIndex];
          const hasUser = rx.userIds.some(u => isSameUserId(u, userId));

          if (hasUser) {
            // Remove user reaction
            const newUserIds = rx.userIds.filter(u => !isSameUserId(u, userId));
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

        updatedReactions = currentReactions;
        const updatedMsg: ChatMessage = {
          ...msg,
          reactions: currentReactions
        };

        // Async sync to server & Firestore
        fetch('/api/chat/reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, reactions: currentReactions })
        }).catch(() => {});

        saveChatMessageToFirestore(updatedMsg).catch(() => {});
        return updatedMsg;
      })
    );
  }, [currentUser]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));

    fetch('/api/chat/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId })
    }).catch(() => {});

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

    fetch('/api/chat/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }).catch(() => {});

    await clearAllChatMessagesFromFirestore();
  }, []);

  // Clear current active channel or DM conversation messages
  const clearCurrentChat = useCallback(async () => {
    const toDelete = messages.filter(m =>
      activeChatType === 'channel'
        ? m.channelId === activeChatId
        : !m.channelId &&
          ((isSameUserId(m.senderId, currentUser?.id) && isSameUserId(m.recipientId, activeChatId)) ||
            (isSameUserId(m.senderId, activeChatId) && isSameUserId(m.recipientId, currentUser?.id)))
    );

    setMessages(prev => prev.filter(m => !toDelete.some(d => d.id === m.id)));

    if (activeChatType === 'channel') {
      fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: activeChatId })
      }).catch(() => {});
    }

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
