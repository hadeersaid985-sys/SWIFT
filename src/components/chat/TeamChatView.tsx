import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  MessagesSquare,
  Send,
  Smile,
  Paperclip,
  Search,
  Hash,
  Users,
  User,
  Plus,
  X,
  Reply,
  Trash2,
  Bell,
  BellOff,
  Image as ImageIcon,
  FileText,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Pin,
  AtSign,
  Sparkles,
  Info,
  Circle,
  MoreVertical,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useCRM } from '../../context/CRMContext';
import { ChatMessage, TeamMember, ChatAttachment } from '../../types/crm';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '👏', '🎉', '🚀', '🙌', '💡', '✅', '😂', '💯', '🌸'];

export const TeamChatView: React.FC = () => {
  const {
    channels,
    messages,
    activeChatId,
    activeChatType,
    setActiveChat,
    sendMessage,
    addReaction,
    deleteMessage,
    createChannel,
    unreadPerTarget,
    soundEnabled,
    setSoundEnabled,
    activeTargetName,
    activeTargetAvatar,
    activeTargetRole,
    activeTargetStatus
  } = useChat();

  const { currentUser, team, isManager, impersonateUser } = useCRM();

  // Local state
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'channels' | 'dms'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelIcon, setNewChannelIcon] = useState('💬');
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatId]);

  // When switching chats on mobile, hide the list to show chat
  const handleSelectChat = (id: string, type: 'channel' | 'dm') => {
    setActiveChat(id, type);
    setIsMobileListVisible(false);
    setReplyingTo(null);
  };

  // Filtered messages for current active chat
  const activeMessages = useMemo(() => {
    if (!currentUser) return [];

    if (activeChatType === 'channel') {
      return messages.filter(m => m.channelId === activeChatId);
    } else {
      // 1-on-1 DM between currentUser and activeChatId
      return messages.filter(
        m =>
          !m.channelId &&
          ((m.senderId === currentUser.id && m.recipientId === activeChatId) ||
            (m.senderId === activeChatId && m.recipientId === currentUser.id))
      );
    }
  }, [messages, activeChatId, activeChatType, currentUser]);

  // Search filter for channels and members in sidebar
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    return channels.filter(
      c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const filteredTeamMembers = useMemo(() => {
    return team
      .filter(m => m.id !== currentUser?.id)
      .filter(m => {
        if (!searchQuery.trim()) return true;
        return (
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.department.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [team, currentUser, searchQuery]);

  // Handle Send
  const handleSend = async () => {
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    const payload = {
      text: inputText,
      channelId: activeChatType === 'channel' ? activeChatId : undefined,
      recipientId: activeChatType === 'dm' ? activeChatId : undefined,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text
          }
        : undefined
    };

    setInputText('');
    setPendingAttachments([]);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowMentionMenu(false);

    await sendMessage(payload);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Keydown in input (Enter to send, Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Input change with @ mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

    // Mention trigger check
    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === val.length - 1) {
      setShowMentionMenu(true);
      setMentionQuery('');
    } else if (lastAtIndex !== -1 && showMentionMenu) {
      const q = val.substring(lastAtIndex + 1);
      if (q.includes(' ')) {
        setShowMentionMenu(false);
      } else {
        setMentionQuery(q);
      }
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleSelectMention = (member: TeamMember) => {
    const lastAtIndex = inputText.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const newText = `${inputText.substring(0, lastAtIndex)}@${member.name} `;
      setInputText(newText);
    }
    setShowMentionMenu(false);
    textareaRef.current?.focus();
  };

  // Handle simulated file attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = () => {
        const attach: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: isImg ? 'image' : 'file',
          url: (reader.result as string) || ''
        };
        setPendingAttachments(prev => [...prev, attach]);
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Create Channel Submit
  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    createChannel({
      id: `chan-${newChannelName.trim().toLowerCase().replace(/\s+/g, '-')}`,
      name: newChannelName.trim(),
      description: newChannelDesc.trim() || 'قناة مناقشات الفريق',
      icon: newChannelIcon,
      department: 'عام'
    });

    setNewChannelName('');
    setNewChannelDesc('');
    setShowNewChannelModal(false);
  };

  // Format message time
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateLabel: string; items: ChatMessage[] }[] = [];
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

    activeMessages.forEach(msg => {
      const msgDate = new Date(msg.timestamp).toDateString();
      let label = 'اليوم';
      if (msgDate === todayStr) {
        label = 'اليوم';
      } else if (msgDate === yesterdayStr) {
        label = 'أمس';
      } else {
        label = new Date(msg.timestamp).toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      const existingGroup = groups.find(g => g.dateLabel === label);
      if (existingGroup) {
        existingGroup.items.push(msg);
      } else {
        groups.push({ dateLabel: label, items: [msg] });
      }
    });

    return groups;
  }, [activeMessages]);

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white shadow-xs">
            <MessagesSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white">دردشة وتواصل فريق العمل</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>مباشر وفوري (Real-Time)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              قنوات تواصل مفتوحة ومحادثات خاصة مباشرة بين جميع أفراد سويفت مايند
            </p>
          </div>
        </div>

        {/* Top Controls: Sound, Current User Pill, Impersonation helper */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
              soundEnabled
                ? 'bg-blue-600/30 border-blue-400/40 text-blue-200'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={soundEnabled ? 'كتم صوت الإشعارات' : 'تفعيل صوت الإشعارات'}
          >
            {soundEnabled ? <Bell className="w-3.5 h-3.5 text-blue-300" /> : <BellOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{soundEnabled ? 'صوت مفعل' : 'صامت'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-xl">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-5 h-5 rounded-full object-cover border border-blue-400"
            />
            <span className="text-xs font-bold text-slate-200">{currentUser?.name}</span>
            <span className="text-[10px] text-blue-300 bg-blue-950/70 border border-blue-800/60 px-1.5 py-0.2 rounded">
              {currentUser?.role || 'عضو'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* ================= LEFT/RIGHT SIDEBAR: CHANNELS & MEMBERS ================= */}
        <aside
          className={`${
            isMobileListVisible ? 'flex' : 'hidden md:flex'
          } w-full md:w-80 lg:w-88 flex-col bg-slate-50/90 border-l border-slate-200/90 shrink-0 z-20 overflow-hidden`}
        >
          {/* Search & New Channel Header */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث في القنوات أو الزملاء..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs rounded-xl border border-transparent focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isManager && (
                <button
                  onClick={() => setShowNewChannelModal(true)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  title="إنشاء قناة محادثة جديدة"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter pills: الكل / القنوات / المحادثات الخاصة */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                  filterType === 'all' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterType('channels')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                  filterType === 'channels' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                القنوات ({filteredChannels.length})
              </button>
              <button
                onClick={() => setFilterType('dms')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer text-center ${
                  filterType === 'dms' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                الخاص ({filteredTeamMembers.length})
              </button>
            </div>
          </div>

          {/* Scrollable Channels & DMs List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-3">
            {/* 1. Public Channels Section */}
            {(filterType === 'all' || filterType === 'channels') && (
              <div>
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-500 tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-blue-600" />
                    <span>قنوات الفريق العامة</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                    {filteredChannels.length}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {filteredChannels.map(channel => {
                    const isActive = activeChatType === 'channel' && activeChatId === channel.id;
                    const unread = unreadPerTarget[channel.id] || 0;

                    return (
                      <button
                        key={channel.id}
                        onClick={() => handleSelectChat(channel.id, 'channel')}
                        className={`w-full text-right flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm font-bold'
                            : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                              isActive ? 'bg-white/20 text-white' : 'bg-blue-100/80 text-blue-800'
                            }`}
                          >
                            {channel.icon || '#'}
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{channel.name}</span>
                            </div>
                            <div
                              className={`text-[10px] truncate ${
                                isActive ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {channel.description}
                            </div>
                          </div>
                        </div>

                        {unread > 0 && (
                          <span className="min-w-4 h-4 px-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Direct Messages Section */}
            {(filterType === 'all' || filterType === 'dms') && (
              <div className="pt-2">
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-extrabold text-slate-500 tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>الرسائل الخاصة المباشرة (DMs)</span>
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                    {filteredTeamMembers.length}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {filteredTeamMembers.map(member => {
                    const isActive = activeChatType === 'dm' && activeChatId === member.id;
                    const unread = unreadPerTarget[member.id] || 0;
                    const isOnline = member.status === 'online';

                    return (
                      <button
                        key={member.id}
                        onClick={() => handleSelectChat(member.id, 'dm')}
                        className={`w-full text-right flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm font-bold'
                            : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className={`w-9 h-9 rounded-full object-cover border-2 ${
                                isActive ? 'border-white' : 'border-slate-200'
                              }`}
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                              title={isOnline ? 'متصل الآن' : 'غير متصل'}
                            />
                          </div>

                          <div className="truncate">
                            <div className="text-xs font-bold truncate flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {member.accessLevel === 'admin' && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  أدمن
                                </span>
                              )}
                            </div>
                            <div
                              className={`text-[10px] truncate ${
                                isActive ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {member.role || member.department}
                            </div>
                          </div>
                        </div>

                        {unread > 0 && (
                          <span className="min-w-4 h-4 px-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ================= MAIN CHAT PANE ================= */}
        <main
          className={`${
            !isMobileListVisible ? 'flex' : 'hidden md:flex'
          } flex-1 flex-col bg-[#f8fafc] overflow-hidden min-w-0`}
        >
          {/* Active Conversation Header */}
          <div className="h-14 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Back Button */}
              <button
                onClick={() => setIsMobileListVisible(true)}
                className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                title="العودة لقائمة المحادثات"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {activeChatType === 'channel' ? (
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
                  #
                </div>
              ) : (
                <div className="relative shrink-0">
                  <img
                    src={activeTargetAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                    alt={activeTargetName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-blue-100"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      activeTargetStatus === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>
              )}

              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-slate-900 truncate flex items-center gap-2">
                  <span>{activeTargetName}</span>
                  {activeChatType === 'channel' && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      قناة عامة
                    </span>
                  )}
                  {activeChatType === 'dm' && activeTargetStatus === 'online' && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      متصل الآن
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{activeTargetRole}</div>
              </div>
            </div>

            {/* Right actions: switch identity helper for demonstration, search, info */}
            <div className="flex items-center gap-1.5 text-xs">
              {isManager && (
                <div className="hidden lg:flex items-center gap-1 text-[11px] bg-slate-100 p-1 rounded-xl">
                  <span className="text-[10px] text-slate-500 px-1 font-bold">تجربة الحساب:</span>
                  <select
                    value={currentUser?.id}
                    onChange={e => {
                      const m = team.find(t => t.id === e.target.value);
                      if (m) impersonateUser(m.id);
                    }}
                    className="text-[11px] font-bold bg-white text-blue-700 border border-slate-200 rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                  >
                    {team.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread Feed */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
            {groupedMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 opacity-80" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700">لا توجد رسائل سابقة في هذه المحادثة</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    ابدأ المحادثة الآن واكتب أول رسالة لزملائك في الفريق لتنسيق ومتابعة العمل!
                  </p>
                </div>
              </div>
            ) : (
              groupedMessages.map(group => (
                <div key={group.dateLabel} className="space-y-3">
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] font-bold bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full shadow-2xs">
                      {group.dateLabel}
                    </span>
                  </div>

                  {/* Messages */}
                  {group.items.map(msg => {
                    const isMe = msg.senderId === currentUser?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 items-end group ${
                          isMe ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        {!isMe && (
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 mb-1"
                          />
                        )}

                        {/* Bubble Container */}
                        <div
                          className={`max-w-[85%] sm:max-w-md lg:max-w-lg space-y-1 ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          {/* Sender Info for Teammates */}
                          {!isMe && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1 font-bold">
                              <span>{msg.senderName}</span>
                              {msg.senderRole && (
                                <span className="text-[9px] text-blue-600 font-medium">
                                  ({msg.senderRole})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Message Content Box */}
                          <div
                            className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed relative shadow-2xs ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                            }`}
                          >
                            {/* Replying To snippet */}
                            {msg.replyTo && (
                              <div
                                className={`mb-2 p-2 rounded-lg text-[11px] border-r-2 ${
                                  isMe
                                    ? 'bg-white/15 text-blue-50 border-white'
                                    : 'bg-slate-100 text-slate-600 border-blue-600'
                                }`}
                              >
                                <div className="font-bold">{msg.replyTo.senderName}</div>
                                <div className="truncate opacity-90">{msg.replyTo.text}</div>
                              </div>
                            )}

                            {/* Main Text */}
                            <div className="whitespace-pre-wrap break-words">{msg.text}</div>

                            {/* Attachments preview */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {msg.attachments.map(att => (
                                  <div
                                    key={att.id}
                                    className={`rounded-xl overflow-hidden border p-1.5 flex items-center gap-2 ${
                                      isMe
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    {att.type === 'image' ? (
                                      <img
                                        src={att.url}
                                        alt={att.name}
                                        className="w-16 h-16 object-cover rounded-lg shrink-0 cursor-pointer"
                                        onClick={() => window.open(att.url, '_blank')}
                                      />
                                    ) : (
                                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1 text-[11px]">
                                      <div className="font-bold truncate">{att.name}</div>
                                      <div className="text-[10px] opacity-75">{att.size}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Footer: Time & Status */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              <span>{formatTime(msg.timestamp)}</span>
                              {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                            </div>
                          </div>

                          {/* Reactions Summary */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div
                              className={`flex flex-wrap gap-1 px-1 ${
                                isMe ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {msg.reactions.map(rx => {
                                const hasReacted = currentUser && rx.userIds.includes(currentUser.id);
                                return (
                                  <button
                                    key={rx.emoji}
                                    onClick={() => addReaction(msg.id, rx.emoji)}
                                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-transform hover:scale-105 cursor-pointer ${
                                      hasReacted
                                        ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                                        : 'bg-white text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <span>{rx.emoji}</span>
                                    <span>{rx.count}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Quick Floating Action Bar on Hover */}
                          <div
                            className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-1 ${
                              isMe ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 hover:bg-slate-200 text-slate-600 rounded cursor-pointer transition-colors"
                              title="رد على الرسالة"
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick emoji reactions trigger */}
                            <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg px-1 py-0.5 shadow-2xs">
                              {['👍', '❤️', '🔥', '👏'].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(msg.id, emoji)}
                                  className="hover:scale-125 transition-transform p-0.5 cursor-pointer text-xs"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>

                            {(isMe || isManager) && (
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="p-1 hover:bg-rose-100 text-rose-600 rounded cursor-pointer transition-colors"
                                title="حذف الرسالة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Replying-to Preview Bar */}
          {replyingTo && (
            <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 flex items-center justify-between text-xs text-blue-900 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Reply className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <span>الرد على <strong>{replyingTo.senderName}</strong>: </span>
                  <span className="text-slate-600 truncate">{replyingTo.text}</span>
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-blue-100 rounded text-blue-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Pending Attachments Bar */}
          {pendingAttachments.length > 0 && (
            <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
              {pendingAttachments.map(att => (
                <div
                  key={att.id}
                  className="bg-white border border-slate-300 rounded-lg p-1.5 flex items-center gap-2 text-xs shrink-0"
                >
                  {att.type === 'image' ? (
                    <img src={att.url} alt={att.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-bold max-w-[120px] truncate">{att.name}</span>
                  <button
                    onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== att.id))}
                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mention Autocomplete Popup */}
          {showMentionMenu && (
            <div className="mx-4 bg-white border border-slate-200 rounded-xl shadow-xl p-1 z-30 max-h-48 overflow-y-auto mb-1 animate-in fade-in">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-100">
                منشن عضو الفريق (@)
              </div>
              {team
                .filter(m => m.name.toLowerCase().includes(mentionQuery.toLowerCase()))
                .map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMention(m)}
                    className="w-full text-right flex items-center gap-2 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-bold text-slate-800">{m.name}</span>
                    <span className="text-[10px] text-slate-400">({m.role})</span>
                  </button>
                ))}
            </div>
          )}

          {/* Quick Emoji Picker Tray */}
          {showEmojiPicker && (
            <div className="mx-4 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 flex items-center gap-2 flex-wrap mb-1 animate-in fade-in">
              {QUICK_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputText(prev => prev + emoji);
                    setShowEmojiPicker(false);
                    textareaRef.current?.focus();
                  }}
                  className="text-lg p-1.5 hover:bg-slate-100 rounded-lg hover:scale-125 transition-all cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200/90 shrink-0">
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200/90 focus-within:border-blue-500 focus-within:bg-white rounded-2xl p-1.5 transition-all shadow-2xs">
              {/* Attachment file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer shrink-0"
                title="إرفاق صورة أو مستند"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                  showEmojiPicker
                    ? 'text-amber-500 bg-amber-50'
                    : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title="إضافة إيموجي"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={`اكتب رسالة إلى ${activeTargetName}... (اضغط Enter للإرسال، واكتب @ للمنشن)`}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-0 outline-none resize-none text-xs sm:text-sm py-2 px-1 max-h-32 text-slate-800 placeholder:text-slate-400 leading-normal"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && pendingAttachments.length === 0}
                className={`p-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  inputText.trim() || pendingAttachments.length > 0
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                title="إرسال (Enter)"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ================= MODAL: CREATE NEW CHANNEL ================= */}
      {showNewChannelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl font-black text-sm">
                  #
                </span>
                <h3 className="font-black text-slate-900 text-sm">إنشاء قناة محادثة جديدة للفريق</h3>
              </div>
              <button
                onClick={() => setShowNewChannelModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم القناة (باللغة العربية أو الإنجليزية) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حملات الكويت، مشاريع الويب، خدمة العملاء"
                  value={newChannelName}
                  onChange={e => setNewChannelName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  وصف القناة والهدف منها
                </label>
                <textarea
                  rows={2}
                  placeholder="موضوع ومجال مناقشات هذه القناة لتوجيه الفريق..."
                  value={newChannelDesc}
                  onChange={e => setNewChannelDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أيقونة القناة
                </label>
                <div className="flex items-center gap-2">
                  {['💬', '💼', '💻', '📢', '🎯', '🚀', '🎨', '💡', '🛡️'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewChannelIcon(emoji)}
                      className={`w-9 h-9 text-base rounded-xl border flex items-center justify-center cursor-pointer transition-transform ${
                        newChannelIcon === emoji
                          ? 'border-blue-500 bg-blue-50 scale-110 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  إنشاء القناة الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
