import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, CheckSquare, X, ArrowLeft, BellRing, AtSign } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useChat } from '../../context/ChatContext';
import { ChatMessage, Task } from '../../types/crm';
import {
  playAudioNotification,
  triggerUniversalNotification,
  NotificationKind,
  NotificationPayload,
  sanitizeNotificationMessageForEmployee,
  sanitizeNotificationTitleForEmployee
} from '../../utils/notificationSystem';

interface LiveToast {
  id: string;
  type: NotificationKind;
  title: string;
  subtitle: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: number;
  data: any;
}

// Export for legacy callers
export const playNotificationChime = (kind: 'chat' | 'task' = 'chat') => {
  playAudioNotification(kind);
};

export const GlobalLiveNotification: React.FC = () => {
  const { setActiveTab, isManager } = useCRM();
  const { setActiveChat } = useChat();
  const [toasts, setToasts] = useState<LiveToast[]>([]);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const addToast = useCallback((toast: Omit<LiveToast, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: LiveToast = {
      ...toast,
      id,
      timestamp: Date.now()
    };

    setToasts(prev => [newToast, ...prev].slice(0, 3)); // Max 3 visible at once

    // Auto dismiss after 8 seconds
    timeoutsRef.current[id] = setTimeout(() => {
      removeToast(id);
    }, 8000);
  }, [removeToast]);

  // Listen to window custom events
  useEffect(() => {
    const handleUniversalNotif = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationPayload>;
      const payload = customEvent.detail;
      if (!payload) return;

      addToast({
        type: payload.kind,
        title: sanitizeNotificationTitleForEmployee(payload.title, isManager),
        subtitle: sanitizeNotificationMessageForEmployee(payload.body, isManager),
        senderName: payload.senderName || 'سويفت مايند',
        senderAvatar: payload.senderAvatar,
        data: payload.data || payload
      });
    };

    const handleChatNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: ChatMessage; isDirect: boolean }>;
      const msg = customEvent.detail?.message;
      if (!msg) return;

      const isDirect = customEvent.detail.isDirect;
      addToast({
        type: 'chat',
        title: isDirect ? 'رسالة خاصة جديدة' : `رسالة جديدة في #${msg.channelId || 'عام'}`,
        subtitle: msg.text || (msg.attachments && msg.attachments.length > 0 ? '📎 مرفق ملف / صورة' : 'رسالة جديدة'),
        senderName: msg.senderName || 'عضو الفريق',
        senderAvatar: msg.senderAvatar,
        data: msg
      });
    };

    const handleTaskNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ task: Task; creatorName?: string }>;
      const task = customEvent.detail?.task;
      if (!task) return;

      addToast({
        type: 'task',
        title: 'تم تكليفك بمهمة جديدة!',
        subtitle: `${task.title} (موعد التسليم: ${task.dueDate || 'اليوم'})`,
        senderName: customEvent.detail?.creatorName || 'إدارة المهام',
        senderAvatar: undefined,
        data: task
      });
    };

    const handleMentionNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ title?: string; message?: string; senderName?: string; senderAvatar?: string; taskId?: string }>;
      const detail = customEvent.detail;
      if (!detail) return;

      addToast({
        type: 'mention',
        title: detail.title || `منشن لك من ${detail.senderName || 'عضو الفريق'}`,
        subtitle: detail.message || 'تمت الإشارة إليك في تعليق أو مهمة جديدة',
        senderName: detail.senderName || 'تنبيه منشن',
        senderAvatar: detail.senderAvatar,
        data: detail
      });
    };

    window.addEventListener('swiftmynd:universal_notification', handleUniversalNotif);
    window.addEventListener('swiftmynd:chat_notification', handleChatNotif);
    window.addEventListener('swiftmynd:task_notification', handleTaskNotif);
    window.addEventListener('swiftmynd:mention_notification', handleMentionNotif);

    return () => {
      window.removeEventListener('swiftmynd:universal_notification', handleUniversalNotif);
      window.removeEventListener('swiftmynd:chat_notification', handleChatNotif);
      window.removeEventListener('swiftmynd:task_notification', handleTaskNotif);
      window.removeEventListener('swiftmynd:mention_notification', handleMentionNotif);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [addToast]);

  const handleActionClick = (toast: LiveToast) => {
    if (toast.type === 'chat') {
      const msg: ChatMessage = toast.data;
      setActiveTab('chat');
      if (msg?.channelId) {
        setActiveChat(msg.channelId, 'channel');
      } else if (msg?.senderId) {
        setActiveChat(msg.senderId, 'dm');
      }
    } else if (toast.type === 'task') {
      setActiveTab('tasks');
    } else if (toast.type === 'mention') {
      setActiveTab('tasks');
    }
    removeToast(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-20 left-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto sm:max-w-md transition-all duration-300"
      style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.35))' }}
    >
      {toasts.map(toast => {
        const isChat = toast.type === 'chat';
        const isMention = toast.type === 'mention';
        const isTask = toast.type === 'task';

        let badgeColor = 'text-emerald-400';
        let borderColor = 'border-emerald-500/40';
        let barGradient = 'from-emerald-400 via-teal-400 to-cyan-400';
        let btnGradient = 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500';

        if (isMention) {
          badgeColor = 'text-purple-400';
          borderColor = 'border-purple-500/50';
          barGradient = 'from-purple-400 via-violet-400 to-indigo-400';
          btnGradient = 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500';
        } else if (isTask) {
          badgeColor = 'text-amber-400';
          borderColor = 'border-amber-500/40';
          barGradient = 'from-amber-400 via-orange-400 to-rose-400';
          btnGradient = 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500';
        }

        return (
          <div
            key={toast.id}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-xl bg-slate-900/95 text-white ${borderColor}`}
          >
            {/* Top gradient accent line */}
            <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${barGradient}`} />

            <div className="flex items-start gap-3">
              {/* Avatar or Icon */}
              <div className="relative shrink-0">
                {toast.senderAvatar ? (
                  <img
                    src={toast.senderAvatar}
                    alt={toast.senderName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400/50"
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-inner bg-gradient-to-br ${
                      isMention
                        ? 'from-purple-600 to-indigo-700'
                        : isTask
                        ? 'from-amber-600 to-orange-700'
                        : 'from-emerald-600 to-teal-700'
                    }`}
                  >
                    {isMention ? (
                      <AtSign className="w-5 h-5" />
                    ) : isTask ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isMention ? 'bg-purple-400' : isTask ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-slate-900 ${
                    isMention ? 'bg-purple-500' : isTask ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}></span>
                </span>
              </div>

              {/* Text details */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${badgeColor}`}>
                      <BellRing className="w-3.5 h-3.5" />
                      {toast.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 font-mono">
                    الآن
                  </span>
                </div>

                <div className="font-bold text-sm text-slate-100 truncate">
                  {toast.senderName}
                </div>

                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {toast.subtitle}
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleActionClick(toast)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 text-white bg-gradient-to-r ${btnGradient}`}
                  >
                    <span>
                      {isChat ? 'فتح المحادثة والرد' : isMention ? 'عرض المنشن والمهمة' : 'عرض المهمة في لوحة العمل'}
                    </span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
