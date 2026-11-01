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

import { getSystemDateString, formatSystemTimeAr } from '../../utils/timeUtils';

export const QuickAttendanceWidget: React.FC = () => {
  const { currentUser, attendanceRecords, recordAttendance, updateAttendanceRecord } = useCRM();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!currentUser) return null;

  const todayStr = getSystemDateString();
  const nowTimeStr = formatSystemTimeAr();

  // Robust canonical alias & employee code matcher across mobile and desktop
  const isMatchingUser = (r: AttendanceRecord): boolean => {
    if (!r) return false;
    if (r.memberId === currentUser.id) return true;

    const aliases: Record<string, string[]> = {
      'user-mariam': ['user-mariam', 'user-1793097751331', 'user-1793016396281', 'mariam', 'مريم'],
      'user-islam': ['user-islam', 'user-1793025675186', 'user-1793016178916', 'islam', 'اسلام', 'إسلام'],
      'user-roaa': ['user-roaa', 'user-1793016462810', 'roaa', 'رواء'],
      'user-eman': ['user-eman', 'eman', 'eman ashraf', 'ايمان', 'إيمان'],
      'user-aya': ['user-aya', 'user-1793016503819', 'aya', 'aya gaber', 'آية', 'ايه', 'آيه'],
      'user-yomna': ['user-yomna', 'yomna', 'يمنى', 'يمنه'],
      'user-amira': ['user-amira', 'amira', 'اميرة', 'أميرة', 'اميره'],
      'user-maibel': ['user-maibel', 'maibel', 'مايبل'],
      'user-1': ['user-1', 'user-admin', 'hadeer', 'hadeer said', 'هدير', 'هدير سعيد', 'admin']
    };

    const mid = (r.memberId || '').toLowerCase().trim();
    const cid = (currentUser.id || '').toLowerCase().trim();
    for (const list of Object.values(aliases)) {
      if (list.includes(mid) && list.includes(cid)) return true;
    }

    if (currentUser.employeeCode && r.employeeCode && currentUser.employeeCode === r.employeeCode) {
      return true;
    }

    if (currentUser.name && r.memberName && currentUser.name.trim().toLowerCase() === r.memberName.trim().toLowerCase()) {
      return true;
    }

    return false;
  };

  // Find today's record for this user
  const todayRecord = attendanceRecords.find(
    r => isMatchingUser(r) && r.date === todayStr
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCheckIn = () => {
    const newRecord: Omit<AttendanceRecord, 'id' | 'createdAt'> = {
      memberId: currentUser.id,
      memberName: currentUser.name,
      employeeCode: currentUser.employeeCode || '',
      date: todayStr,
      status: 'present',
      checkInTime: nowTimeStr,
      checkOutTime: undefined,
      notes: 'تسجيل بداية الدوام من شريط المنظومة'
    };

    recordAttendance(newRecord);

    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}

    showToast(`صباح الخير يا ${currentUser.name}! تم تسجيل بداية دوامك اليوم الساعة (${nowTimeStr}) 🟢`);
  };

  const handleCheckOut = () => {
    if (!todayRecord) return;
    updateAttendanceRecord(todayRecord.id, {
      checkOutTime: nowTimeStr,
      notes: (todayRecord.notes ? todayRecord.notes + ' • ' : '') + `نهاية الدوام: ${nowTimeStr}`
    });

    showToast(`يعطيك العافية يا ${currentUser.name}! تم تسجيل نهاية الدوام والانصراف الساعة (${nowTimeStr}) 🔴`);
  };

  const handleResumeShift = () => {
    if (!todayRecord) return;
    updateAttendanceRecord(todayRecord.id, {
      checkOutTime: undefined,
      notes: (todayRecord.notes ? todayRecord.notes + ' • ' : '') + `تم استئناف الدوام`
    });

    showToast(`تم استئناف الدوام بنجاح يا ${currentUser.name} 🟢`);
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

      {/* الحالة 1: لم يتم الضغط على بداية الدوام بعد */}
      {!todayRecord && (
        <button
          type="button"
          onClick={handleCheckIn}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-102 shrink-0 active:scale-98 whitespace-nowrap"
          title="اضغط هنا لتسجيل بداية الدوام اليوم"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse shrink-0" />
          <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white shrink-0" />
          <span>بداية الدوام 🟢</span>
        </button>
      )}

      {/* الحالة 2: تم تسجيل بداية الدوام وهو قيد العمل الآن ولم يضغط على نهاية الدوام */}
      {todayRecord && !todayRecord.checkOutTime && (
        <div className="flex items-center gap-1 sm:gap-1.5 bg-emerald-50/95 border border-emerald-300 rounded-lg p-0.5 sm:p-1 shadow-2xs shrink-0 whitespace-nowrap">
          <div className="flex items-center gap-1 px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="hidden xs:inline">في الدوام:</span>
            <span className="font-mono text-emerald-700 text-[10px] sm:text-[11px]">{todayRecord.checkInTime}</span>
          </div>

          <button
            type="button"
            onClick={handleCheckOut}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer shadow-xs hover:scale-102 shrink-0 active:scale-98"
            title="اضغط هنا لتسجيل نهاية الدوام والانصراف"
          >
            <LogOut className="w-3 h-3 text-white shrink-0" />
            <span>نهاية الدوام 🔴</span>
          </button>
        </div>
      )}

      {/* الحالة 3: تم الضغط على نهاية الدوام واكتمل دوام اليوم */}
      {todayRecord && todayRecord.checkOutTime && (
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[10px] sm:text-[11px] font-bold shrink-0 whitespace-nowrap"
          title={`اكتمل دوام اليوم: بداية الدوام ${todayRecord.checkInTime} ونهاية الدوام ${todayRecord.checkOutTime}`}
        >
          <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-600 shrink-0" />
          <span>اكتمل الدوام</span>
          <span className="font-mono text-[9px] sm:text-[10px] text-blue-700 hidden md:inline">
            ({todayRecord.checkInTime} - {todayRecord.checkOutTime})
          </span>
          <button
            type="button"
            onClick={handleResumeShift}
            className="text-[9px] sm:text-[10px] bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 px-1 sm:px-1.5 py-0.5 rounded cursor-pointer transition-colors"
            title="تراجع عن الانصراف واستئناف الدوام إذا ضغطت بالخطأ"
          >
            استئناف
          </button>
        </div>
      )}
    </div>
  );
};
