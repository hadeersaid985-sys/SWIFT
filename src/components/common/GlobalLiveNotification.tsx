import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageSquare, CheckSquare, X, ArrowLeft, BellRing } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useChat } from '../../context/ChatContext';
import { ChatMessage, Task } from '../../types/crm';

interface LiveToast {
  id: string;
  type: 'chat' | 'task';
  title: string;
  subtitle: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: number;
  data: any;
}

// Crisp dual-tone notification sound via Web Audio API
export const playNotificationChime = (kind: 'chat' | 'task' = 'chat') => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (kind === 'task') {
      // Triumphant 3-note ascending chime for new task assignment
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } else {
      // Pleasant dual chime for chat message
      const notes = [587.33, 880]; // D5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.22);
      });
    }
  } catch {}
};

export const GlobalLiveNotification: React.FC = () => {
  const { setActiveTab } = useCRM();
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
    const handleChatNotif = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: ChatMessage; isDirect: boolean }>;
      const msg = customEvent.detail?.message;
      if (!msg) return;

      playNotificationChime('chat');

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

      playNotificationChime('task');

      addToast({
        type: 'task',
        title: 'تم تكليفك بمهمة جديدة!',
        subtitle: `${task.title} (موعد التسليم: ${task.dueDate || 'اليوم'})`,
        senderName: customEvent.detail?.creatorName || 'إدارة المهام',
        senderAvatar: undefined,
        data: task
      });
    };

    window.addEventListener('swiftmynd:chat_notification', handleChatNotif);
    window.addEventListener('swiftmynd:task_notification', handleTaskNotif);

    return () => {
      window.removeEventListener('swiftmynd:chat_notification', handleChatNotif);
      window.removeEventListener('swiftmynd:task_notification', handleTaskNotif);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, [addToast]);

  const handleActionClick = (toast: LiveToast) => {
    if (toast.type === 'chat') {
      const msg: ChatMessage = toast.data;
      setActiveTab('chat');
      if (msg.channelId) {
        setActiveChat(msg.channelId, 'channel');
      } else if (msg.senderId) {
        setActiveChat(msg.senderId, 'dm');
      }
    } else if (toast.type === 'task') {
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
        return (
          <div
            key={toast.id}
            className={`relative overflow-hidden rounded-2xl border p-4 shadow-2xl transition-all duration-300 transform translate-y-0 backdrop-blur-xl ${
              isChat
                ? 'bg-slate-900/95 border-emerald-500/40 text-white'
                : 'bg-slate-900/95 border-amber-500/40 text-white'
            }`}
          >
            {/* Top gradient accent line */}
            <div
              className={`absolute top-0 right-0 left-0 h-1 ${
                isChat
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                  : 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400'
              }`}
            />

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
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${
                      isChat
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                        : 'bg-gradient-to-br from-amber-600 to-orange-700'
                    }`}
                  >
                    {isChat ? <MessageSquare className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>

              {/* Text details */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <BellRing className="w-3.5 h-3.5" />
                      {toast.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
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
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                      isChat
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                    }`}
                  >
                    <span>{isChat ? 'فتح المحادثة والرد' : 'عرض المهمة في لوحة العمل'}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
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
