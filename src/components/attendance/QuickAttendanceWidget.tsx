import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  LogOut,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCRM } from '../../context/CRMContext';
import { AttendanceRecord } from '../../types/crm';

export const QuickAttendanceWidget: React.FC = () => {
  const { currentUser, attendanceRecords, recordAttendance, updateAttendanceRecord } = useCRM();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  // Find today's record for this user
  const todayRecord = attendanceRecords.find(
    r => r.memberId === currentUser.id && r.date === todayStr
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCheckIn = () => {
    const newRecord: Omit<AttendanceRecord, 'id' | 'createdAt'> = {
      memberId: currentUser.id,
      memberName: currentUser.name,
      date: todayStr,
      status: 'present',
      checkInTime: nowTimeStr,
      notes: 'تسجيل حضور تلقائي من شريط المنظومة'
    };

    recordAttendance(newRecord);

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}

    showToast(`صباح الخير يا ${currentUser.name}! تم تسجيل حضورك اليوم الساعة (${nowTimeStr}) 🟢`);
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    updateAttendanceRecord(todayRecord.id, {
      checkOutTime: nowTimeStr,
      notes: (todayRecord.notes ? todayRecord.notes + ' • ' : '') + `انصراف: ${nowTimeStr}`
    });

    showToast(`يعطيك العافية يا ${currentUser.name}! تم تسجيل انصرافك الساعة (${nowTimeStr}) 🔴`);
  };

  return (
    <div className="relative flex items-center">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="absolute top-10 left-0 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-700 whitespace-nowrap flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Case 1: Not checked in yet today */}
      {!todayRecord && (
        <button
          type="button"
          onClick={handleCheckIn}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102"
          title="تسجيل حضور اليوم في منظومة العمل"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">تسجيل حضور 🟢</span>
          <span className="md:hidden">حضور</span>
        </button>
      )}

      {/* Case 2: Checked in and currently on duty */}
      {todayRecord && !todayRecord.checkOutTime && (
        <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/90 rounded-lg p-0.5 shadow-2xs">
          <div className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">في الدوام:</span>
            <span className="font-mono text-emerald-700">{todayRecord.checkInTime}</span>
          </div>

          <button
            type="button"
            onClick={handleCheckOut}
            className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
            title="تسجيل انصراف نهاية يوم العمل"
          >
            <LogOut className="w-3 h-3 text-rose-600" />
            <span>انصراف 🔴</span>
          </button>
        </div>
      )}

      {/* Case 3: Completed work day */}
      {todayRecord && todayRecord.checkOutTime && (
        <div
          className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold"
          title={`اكتمل دوام اليوم: من ${todayRecord.checkInTime} إلى ${todayRecord.checkOutTime}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">اكتمل الدوام اليوم</span>
          <span className="font-mono text-[10px]">({todayRecord.checkInTime} - {todayRecord.checkOutTime})</span>
        </div>
      )}
    </div>
  );
};
