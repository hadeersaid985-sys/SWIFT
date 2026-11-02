import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BellRing,
  Clock,
  Video,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Calendar,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Meeting } from '../../types/crm';
import { meetingAlarm } from '../../utils/meetingAlarmSound';

export const MeetingAlarmModal: React.FC = () => {
  const { meetings, currentUser, isManager, setActiveTab } = useCRM();

  const [activeAlarmMeeting, setActiveAlarmMeeting] = useState<Meeting | null>(null);
  const [alarmStage, setAlarmStage] = useState<'one_hour' | 'thirty_min' | 'starting'>('one_hour');
  const [remainingMinutes, setRemainingMinutes] = useState<number>(60);
  const [isMuted, setIsMuted] = useState(false);
  const [isDismissedForSession, setIsDismissedForSession] = useState<Record<string, boolean>>({});

  // Audio interval for repeating alarm until dismissed
  const audioIntervalRef = useRef<any>(null);

  // Check upcoming meetings every 15 seconds
  useEffect(() => {
    const checkMeetings = () => {
      if (!currentUser || !Array.isArray(meetings) || meetings.length === 0) return;

      const now = new Date();
      // YYYY-MM-DD in local time
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      for (const m of meetings) {
        if (!m || m.status === 'مكتمل' || m.status === 'ملغي' || m.status === 'completed' || m.status === 'cancelled') {
          continue;
        }

        // Check if current user is involved: Manager, Host, or Attendee
        const isHost = m.hostId === currentUser.id || (m.hostName && currentUser.name && m.hostName.toLowerCase().includes(currentUser.name.toLowerCase()));
        const isAttendee = Array.isArray(m.attendees) && m.attendees.some(id => id === currentUser.id);
        const isCreator = m.creatorId === currentUser.id || m.createdBy === currentUser.name;
        const isInvolved = isManager || isHost || isAttendee || isCreator;

        if (!isInvolved) continue;

        // Parse meeting date & time
        const mDate = m.date || todayStr;
        const mTime = m.time || m.startTime || '12:00';
        const [hoursStr, minutesStr] = mTime.split(':');
        const meetingHour = parseInt(hoursStr || '12', 10);
        const meetingMinute = parseInt(minutesStr || '0', 10);

        const meetingTarget = new Date(mDate);
        meetingTarget.setHours(meetingHour, meetingMinute, 0, 0);

        const diffMs = meetingTarget.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);

        // 1. One Hour Alert: between 50 and 65 minutes before meeting
        const key60 = `alarm_60_${m.id}_${mDate}`;
        if (diffMins <= 60 && diffMins >= 45) {
          if (!sessionStorage.getItem(key60) && !isDismissedForSession[key60]) {
            sessionStorage.setItem(key60, 'true');
            setActiveAlarmMeeting(m);
            setAlarmStage('one_hour');
            setRemainingMinutes(diffMins);
            if (!isMuted && m.alarmSoundEnabled !== false) {
              meetingAlarm.playAlarm('one_hour');
            }
            break;
          }
        }

        // 2. Thirty Minutes Alert: between 20 and 35 minutes before meeting
        const key30 = `alarm_30_${m.id}_${mDate}`;
        if (diffMins <= 30 && diffMins >= 15) {
          if (!sessionStorage.getItem(key30) && !isDismissedForSession[key30]) {
            sessionStorage.setItem(key30, 'true');
            setActiveAlarmMeeting(m);
            setAlarmStage('thirty_min');
            setRemainingMinutes(diffMins);
            if (!isMuted && m.alarmSoundEnabled !== false) {
              meetingAlarm.playAlarm('thirty_min');
            }
            break;
          }
        }

        // 3. Meeting Starting Now: between 5 minutes before and 15 minutes after
        const keyStart = `alarm_start_${m.id}_${mDate}`;
        if (diffMins <= 5 && diffMins >= -15) {
          if (!sessionStorage.getItem(keyStart) && !isDismissedForSession[keyStart]) {
            sessionStorage.setItem(keyStart, 'true');
            setActiveAlarmMeeting(m);
            setAlarmStage('starting');
            setRemainingMinutes(Math.max(0, diffMins));
            if (!isMuted && m.alarmSoundEnabled !== false) {
              meetingAlarm.playAlarm('starting');
            }
            break;
          }
        }
      }
    };

    // Run check on boot and every 15s
    checkMeetings();
    const interval = setInterval(checkMeetings, 15000);
    return () => clearInterval(interval);
  }, [meetings, currentUser, isManager, isDismissedForSession, isMuted]);

  // Repeat bell every 12 seconds while alarm dialog is open if not muted
  useEffect(() => {
    if (activeAlarmMeeting && !isMuted) {
      audioIntervalRef.current = setInterval(() => {
        meetingAlarm.playAlarm(alarmStage);
      }, 12000);
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [activeAlarmMeeting, isMuted, alarmStage]);

  if (!activeAlarmMeeting) return null;

  const handleDismiss = () => {
    const key = `alarm_${alarmStage === 'one_hour' ? '60' : alarmStage === 'thirty_min' ? '30' : 'start'}_${activeAlarmMeeting.id}_${activeAlarmMeeting.date}`;
    setIsDismissedForSession(prev => ({ ...prev, [key]: true }));
    setActiveAlarmMeeting(null);
  };

  const handleSnooze = (minutes = 5) => {
    const key = `alarm_${alarmStage === 'one_hour' ? '60' : alarmStage === 'thirty_min' ? '30' : 'start'}_${activeAlarmMeeting.id}_${activeAlarmMeeting.date}`;
    sessionStorage.removeItem(key);
    setActiveAlarmMeeting(null);
  };

  const handleJoinMeeting = () => {
    if (activeAlarmMeeting.meetingLink) {
      window.open(activeAlarmMeeting.meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      setActiveTab('meetings');
    }
    handleDismiss();
  };

  const stageBadge = {
    one_hour: {
      title: '⏰ تنبيه اقتراب موعد الاجتماع: متبقي ساعة!',
      desc: `فاصل على موعد بدء الاجتماع (ساعة واحدة): ${activeAlarmMeeting.title}`,
      badge: 'متبقي 60 دقيقة',
      color: 'bg-amber-500 text-white border-amber-600',
      glow: 'shadow-amber-500/20'
    },
    thirty_min: {
      title: '⏰ منبه اقتراب موعد الاجتماع: متبقي 30 دقيقة!',
      desc: `متبقي نصف ساعة على بدء اجتماع: ${activeAlarmMeeting.title}`,
      badge: 'متبقي 30 دقيقة',
      color: 'bg-orange-500 text-white border-orange-600',
      glow: 'shadow-orange-500/30'
    },
    starting: {
      title: '🚨 حان الآن موعد بدء الاجتماع!',
      desc: `حان موعد انعقاد اجتماع: ${activeAlarmMeeting.title}`,
      badge: 'يبدأ الآن',
      color: 'bg-rose-600 text-white border-rose-700 animate-pulse',
      glow: 'shadow-rose-600/40'
    }
  }[alarmStage];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      dir="rtl"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        {/* Top Header Banner */}
        <div
          className={`p-5 flex items-center justify-between text-white ${
            alarmStage === 'starting'
              ? 'bg-gradient-to-r from-rose-600 to-rose-700'
              : alarmStage === 'thirty_min'
              ? 'bg-gradient-to-r from-orange-500 to-amber-600'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 shadow-inner">
              <BellRing className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
                  منبه الاجتماعات ⏰
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-white">
                  {stageBadge.badge}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-1 leading-tight text-white drop-shadow-xs">
                {stageBadge.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Meeting Details Card Body */}
        <div className="p-6 space-y-4">
          {/* Card Title & Type */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                {activeAlarmMeeting.meetingType === 'client' ? 'اجتماع مع عميل 🤝' : 'اجتماع داخلي 💼'}
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {activeAlarmMeeting.time || activeAlarmMeeting.startTime} ({activeAlarmMeeting.duration || '45 دقيقة'})
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {activeAlarmMeeting.title}
            </h3>

            {(activeAlarmMeeting.clientName || activeAlarmMeeting.location) && (
              <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <span className="text-slate-400">المكان / العميل:</span>
                <span className="text-slate-900 font-bold">
                  {activeAlarmMeeting.clientName || activeAlarmMeeting.companyName || activeAlarmMeeting.location}
                </span>
              </p>
            )}
          </div>

          {/* Timing & Responsible Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">تاريخ الانعقاد</div>
                <div className="font-bold text-slate-800">{activeAlarmMeeting.date}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
              <User className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">المسؤول عن الاجتماع</div>
                <div className="font-bold text-slate-800 truncate">
                  {activeAlarmMeeting.hostName || 'هدير سعيد'}
                </div>
              </div>
            </div>
          </div>

          {/* Agenda / Notes if available */}
          {activeAlarmMeeting.agenda && (
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-bold text-[11px] text-blue-700">جدول أعمال الجلسة:</div>
              <p className="line-clamp-2 text-[11px] text-slate-600 whitespace-pre-line">
                {Array.isArray(activeAlarmMeeting.agenda)
                  ? activeAlarmMeeting.agenda.join(' • ')
                  : activeAlarmMeeting.agenda}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            {activeAlarmMeeting.meetingLink ? (
              <button
                onClick={handleJoinMeeting}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Video className="w-5 h-5" />
                <span>دخول رابط الاجتماع الآن (Google Meet / Zoom)</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('meetings');
                  handleDismiss();
                }}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Clock className="w-5 h-5" />
                <span>فتح صفحة الاجتماعات وتفاصيل الجلسة</span>
              </button>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSnooze(5)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                تأجيل التنبيه 5 دقائق ⏳
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                إسكات التنبيه وفهمت ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
