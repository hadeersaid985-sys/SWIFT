import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Volume2, VolumeX, CheckCircle, Smartphone, Laptop, X, Sparkles } from 'lucide-react';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  playAudioNotification,
  triggerUniversalNotification,
  isSoundNotificationEnabled,
  setSoundNotificationEnabled,
  unlockAudioAutoplay
} from '../../utils/notificationSystem';

export const NotificationPermissionBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [testedKind, setTestedKind] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermissionStatus());
    setSoundEnabled(isSoundNotificationEnabled());
    const dismissedUntil = localStorage.getItem('swiftmynd_notif_banner_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      setIsDismissed(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    unlockAudioAutoplay();
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === 'granted') {
      triggerUniversalNotification({
        kind: 'task',
        title: '✅ تم تفعيل إشعارات سويفت مايند بنجاح!',
        body: 'ستصلك الآن تنبيهات المهام الجديدة، المنشن، والشات بالصوت على هذا الجهاز والموبايل كأي تطبيق.'
      });
    } else {
      // Play sound test to verify audio works regardless
      playAudioNotification('task');
    }
  };

  const handleTestSound = (kind: 'task' | 'mention' | 'chat') => {
    unlockAudioAutoplay();
    playAudioNotification(kind);
    setTestedKind(kind);
    setTimeout(() => setTestedKind(null), 1500);

    triggerUniversalNotification({
      kind,
      title: kind === 'task' ? '📋 تجربة تنبيه مهمة جديدة' : kind === 'mention' ? '🔔 تجربة تنبيه منشن' : '💬 تجربة تنبيه شات',
      body: 'هذا إشعار تجريبي للتأكد من وصول الصوت والكتابة على جهازك.'
    });
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundNotificationEnabled(next);
    if (next) {
      playAudioNotification('chat');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 24 hours
    localStorage.setItem('swiftmynd_notif_banner_dismissed', String(Date.now() + 24 * 3600 * 1000));
  };

  if (isDismissed && permission === 'granted') return null;

  return (
    <div
      dir="rtl"
      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/30 px-3 py-2 sm:px-4 sm:py-2.5 text-xs shadow-md transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left / Info */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/40 shrink-0">
            {permission === 'granted' ? (
              <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-xs text-white flex items-center gap-1.5">
                <span>تنبيهات سويفت مايند بالصوت والمكتوب (موبايل وكمبيوتر)</span>
                {permission === 'granted' && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> مفعلة كـ App
                  </span>
                )}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
              تصلك تنبيهات صوتية ومكتوبة فورية عند إضافة مهمة جديدة، أو الإشارة إليك بمنشن، أو وصول رسالة شات.
            </p>
          </div>
        </div>

        {/* Right / Controls & Test Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-all text-xs"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>تفعيل الإشعارات بالصوت 🔔</span>
            </button>
          ) : null}

          {/* Test Sound Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-[11px]">
            <span className="text-slate-400 px-1 font-bold">تجربة:</span>
            <button
              type="button"
              onClick={() => handleTestSound('task')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                testedKind === 'task' ? 'bg-amber-500 text-slate-950 font-black' : 'hover:bg-slate-700 text-slate-200'
              }`}
              title="تجربة رنة المهمة الجديدة"
            >
              📋 تاسك
            </button>
            <button
              type="button"
              onClick={() => handleTestSound('mention')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                testedKind === 'mention' ? 'bg-purple-500 text-white font-black' : 'hover:bg-slate-700 text-slate-200'
              }`}
              title="تجربة رنة المنشن"
            >
              🔔 منشن
            </button>
            <button
              type="button"
              onClick={() => handleTestSound('chat')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                testedKind === 'chat' ? 'bg-emerald-500 text-slate-950 font-black' : 'hover:bg-slate-700 text-slate-200'
              }`}
              title="تجربة رنة الشات"
            >
              💬 شات
            </button>
          </div>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-600/30 border-indigo-400/40 text-indigo-300 hover:bg-indigo-600/50'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Close Banner */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="إخفاء الشريط"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
