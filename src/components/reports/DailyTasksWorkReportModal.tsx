import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Search,
  Filter,
  Play,
  Briefcase,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  Activity,
  Layers,
  ListFilter
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Task, TeamMember, TimeLogEntry, TaskStatus } from '../../types/crm';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';
import { exportDailyWorkReportToExcel, DailyWorkReportExportRow } from '../../utils/excelExport';

interface DailyTasksWorkReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onSelectTask?: (taskId: string) => void;
}

export const DailyTasksWorkReportModal: React.FC<DailyTasksWorkReportModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onSelectTask
}) => {
  if (!isOpen) return null;

  const { tasks, team, currentUser, isManager, brandConfig } = useCRM();

  // Helper format date YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Selected date for report (defaults to today or initialDate)
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || getTodayStr());
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reportViewStyle, setReportViewStyle] = useState<'grouped_by_employee' | 'flat_table'>('grouped_by_employee');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedMemberIds, setExpandedMemberIds] = useState<Record<string, boolean>>({});

  // Date helpers
  const handleSetRelativeDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === getTodayStr();

  // Arabic formatted date string
  const formattedDateArabic = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch {}
    return selectedDate;
  }, [selectedDate]);

  // Duration Formatter Helper
  const formatMinutes = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes <= 0) return '0 دقيقة';
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    if (hours > 0 && mins > 0) {
      return `${hours} ساعة و ${mins} دقيقة`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : hours <= 10 ? 'ساعات' : 'ساعة'}`;
    }
    return `${mins} دقيقة`;
  };

  // Collect & Aggregate work records for selectedDate
  const dailyReportData = useMemo(() => {
    interface WorkSession {
      logId: string;
      taskId: string;
      taskTitle: string;
      taskCategory: string;
      taskStatus: TaskStatus;
      isPrivate?: boolean;
      memberId: string;
      memberName: string;
      memberAvatar?: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      durationFormatted: string;
      note: string;
      isLiveTimer?: boolean;
    }

    const allSessions: WorkSession[] = [];

    tasks.forEach(task => {
      // 1. TimeLogs matching selectedDate
      if (task.timeLogs && task.timeLogs.length > 0) {
        task.timeLogs.forEach(log => {
          const logMatches =
            log.startDate === selectedDate ||
            log.endDate === selectedDate ||
            log.createdAt === selectedDate ||
            (log.createdAt && log.createdAt.startsWith(selectedDate));

          if (logMatches) {
            allSessions.push({
              logId: log.id,
              taskId: task.id,
              taskTitle: task.title,
              taskCategory: task.category || 'عام',
              taskStatus: task.status,
              isPrivate: task.isPrivate,
              memberId: log.memberId,
              memberName: log.memberName,
              memberAvatar: log.memberAvatar,
              startTime: log.startTime || '09:00',
              endTime: log.endTime || '17:00',
              durationMinutes: log.durationMinutes || 0,
              durationFormatted: formatMinutes(log.durationMinutes || 0),
              note: log.note || 'جلسة عمل مسجلة'
            });
          }
        });
      }

      // 2. Active Running Timer on selectedDate (if selectedDate === today)
      if (isToday && task.isTimerRunning && task.timerStartedAt) {
        const now = Date.now();
        const startTimestamp = task.timerLastResumedAt || task.timerStartedAt;
        const currentSegmentMs = Math.max(0, now - startTimestamp);
        const totalActiveMs = (task.timerAccumulatedMs || 0) + currentSegmentMs;
        const liveMinutes = Math.max(1, Math.round(totalActiveMs / 60000));

        const startDateObj = new Date(task.timerStartedAt);
        const startTimeStr = startDateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const nowTimeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const assignee = team.find(m => m.id === task.assignedToId);

        allSessions.push({
          logId: `live-${task.id}`,
          taskId: task.id,
          taskTitle: task.title,
          taskCategory: task.category || 'عام',
          taskStatus: task.status,
          isPrivate: task.isPrivate,
          memberId: task.assignedToId || currentUser.id,
          memberName: assignee?.name || currentUser.name,
          memberAvatar: assignee?.avatar || currentUser.avatar,
          startTime: startTimeStr,
          endTime: `جاري الآن (${nowTimeStr})`,
          durationMinutes: liveMinutes,
          durationFormatted: `${formatMinutes(liveMinutes)} (مؤقت نشط 🔴)`,
          note: 'مؤقت عمل جاري تشغيله لحظياً على المهمة',
          isLiveTimer: true
        });
      }
    });

    // Filter by Member if selected
    let filtered = allSessions;
    if (selectedMemberId !== 'all') {
      filtered = filtered.filter(s => s.memberId === selectedMemberId);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        s =>
          s.taskTitle.toLowerCase().includes(q) ||
          s.memberName.toLowerCase().includes(q) ||
          s.note.toLowerCase().includes(q) ||
          s.taskCategory.toLowerCase().includes(q)
      );
    }

    // Sort by startTime descending
    filtered.sort((a, b) => (b.startTime > a.startTime ? 1 : -1));

    // Group by Member
    const memberMap: Record<
      string,
      {
        member: TeamMember | { id: string; name: string; role?: string; avatar?: string; employeeCode?: string };
        totalMinutes: number;
        sessions: WorkSession[];
      }
    > = {};

    filtered.forEach(session => {
      if (!memberMap[session.memberId]) {
        const found = team.find(m => m.id === session.memberId);
        memberMap[session.memberId] = {
          member: found || {
            id: session.memberId,
            name: session.memberName,
            role: 'عضو الفريق',
            avatar: session.memberAvatar,
            employeeCode: 'SM'
          },
          totalMinutes: 0,
          sessions: []
        };
      }
      memberMap[session.memberId].totalMinutes += session.durationMinutes;
      memberMap[session.memberId].sessions.push(session);
    });

    const groupedMembers = Object.values(memberMap).sort((a, b) => b.totalMinutes - a.totalMinutes);

    const totalDayMinutes = filtered.reduce((sum, s) => sum + s.durationMinutes, 0);
    const uniqueTasksCount = new Set(filtered.map(s => s.taskId)).size;
    const uniqueEmployeesCount = Object.keys(memberMap).length;

    return {
      sessions: filtered,
      groupedMembers,
      totalDayMinutes,
      totalDayHours: (totalDayMinutes / 60).toFixed(1),
      uniqueTasksCount,
      uniqueEmployeesCount
    };
  }, [tasks, team, selectedDate, selectedMemberId, searchQuery, isToday, currentUser]);

  // Toggle member accordion
  const toggleMemberAccordion = (memberId: string) => {
    setExpandedMemberIds(prev => ({
      ...prev,
      [memberId]: prev[memberId] === undefined ? false : !prev[memberId]
    }));
  };

  const isMemberExpanded = (memberId: string) => {
    return expandedMemberIds[memberId] !== false; // Default true (expanded)
  };

  // Copy WhatsApp / Telegram Summary
  const handleCopyWhatsAppSummary = () => {
    const brand = brandConfig?.brandName || 'سويفت مايند';
    const lines: string[] = [
      `📊 *تقرير إنجاز عمل الفريق اليومي - ${brand}*`,
      `📅 *اليوم والتاريخ:* ${formattedDateArabic} (${selectedDate})`,
      `⏱️ *إجمالي ساعات العمل المسجلة:* ${dailyReportData.totalDayHours} ساعة (${formatMinutes(dailyReportData.totalDayMinutes)})`,
      `👥 *عدد الموظفين المشاركين:* ${dailyReportData.uniqueEmployeesCount} موظف`,
      `✅ *عدد المهام التي تم العمل عليها:* ${dailyReportData.uniqueTasksCount} مهمة`,
      `-----------------------------------------`
    ];

    if (dailyReportData.groupedMembers.length === 0) {
      lines.push('لا توجد ساعات عمل مسجلة في هذا اليوم.');
    } else {
      dailyReportData.groupedMembers.forEach(item => {
        const m = item.member;
        const totalStr = formatMinutes(item.totalMinutes);
        lines.push(`\n👤 *${m.name}* [${(m as TeamMember).role || 'فريق العمل'}] - (إجمالي: ${totalStr}):`);

        item.sessions.forEach(sess => {
          const timeSpan = sess.startTime && sess.endTime ? ` [${sess.startTime} - ${sess.endTime}]` : '';
          const liveMark = sess.isLiveTimer ? ' 🔴 (مؤقت نشط)' : '';
          lines.push(`• *${sess.taskTitle}*${timeSpan} | الوقت: ${sess.durationFormatted}${liveMark}`);
          if (sess.note && sess.note !== 'جلسة عمل مسجلة') {
            lines.push(`  ↳ ملاحظة: "${sess.note}"`);
          }
        });
      });
    }

    lines.push('\n-----------------------------------------');
    lines.push(`🚀 تم إصدار التقرير آلياً عبر منظومة ${brand}`);

    const textToCopy = lines.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const rows: DailyWorkReportExportRow[] = dailyReportData.sessions.map(s => {
      const m = team.find(item => item.id === s.memberId);
      const statusTitle: Record<TaskStatus, string> = {
        todo: 'قيد الانتظار',
        in_progress: 'جاري العمل',
        review: 'قيد المراجعة',
        completed: 'مكتملة بنجاح'
      };
      return {
        employeeName: s.memberName,
        employeeCode: m?.employeeCode,
        employeeRole: m?.role,
        taskTitle: s.taskTitle,
        taskCategory: s.taskCategory,
        taskStatus: statusTitle[s.taskStatus] || s.taskStatus,
        date: selectedDate,
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: s.durationMinutes,
        durationFormatted: s.durationFormatted,
        note: s.note
      };
    });

    exportDailyWorkReportToExcel(selectedDate, rows, brandConfig?.brandName || 'سويفت مايند');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto flex flex-col max-h-[92vh] cursor-default"
      >
        {/* Header Ribbon (Hidden in Print) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-1/4 w-72 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/50 shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  التقرير اليومي لشغل وتاسكات التيم (Daily Work Report)
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  مجمع باليوم والتاريخ 📅
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate">
                اسم كل موظف والتاسكات اللي اشتغلها والوقت المستغرق بالدقائق والساعات
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto relative z-10 shrink-0">
            <button
              onClick={handleCopyWhatsAppSummary}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600/90 hover:bg-emerald-600 text-white hover:scale-102'
              }`}
              title="نسخ تقرير اليوم بالكامل منسق ومجهز للإرسال لواتساب أو تليجرام"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ بنجاح! ✓' : 'نسخ للواتساب 💬'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs hover:scale-102"
              title="تصدير كشف إكسيل (.xlsx) ببيانات اليوم"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تصدير إكسيل 📗</span>
              <span className="sm:hidden">إكسيل</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              title="طباعة التقرير أو حفظ PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Control Bar (Date Picker & Presets) - Hidden in Print */}
        <div className="bg-slate-50 border-b border-slate-200/90 p-3 sm:p-4 space-y-3 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Date Selection Box & Presets */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs font-mono text-xs font-bold">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-500 font-sans text-[11px]">اختر التاريخ:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-transparent text-slate-900 font-black focus:outline-none cursor-pointer"
                />
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSetRelativeDate(0)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isToday ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  اليوم {isToday && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSetRelativeDate(-1)}
                  className="px-2 py-1 rounded-lg transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/60"
                >
                  أمس
                </button>
                <button
                  type="button"
                  onClick={() => handleSetRelativeDate(-2)}
                  className="px-2 py-1 rounded-lg transition-all cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-white/60 hidden sm:inline-block"
                >
                  أول أمس
                </button>
              </div>

              {/* Display Current Day Name in Arabic */}
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80">
                {formattedDateArabic}
              </span>
            </div>

            {/* View Mode Switcher & Member Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Member Filter Dropdown */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">كل أعضاء الفريق ({team.length})</option>
                  {team.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Style Switcher: Grouped by Employee vs Flat Table */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setReportViewStyle('grouped_by_employee')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    reportViewStyle === 'grouped_by_employee'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="عرض مجمع لكل موظف بكروته الخاصة"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">مجمع حسب الموظفين</span>
                  <span className="sm:hidden">بالموظفين</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportViewStyle('flat_table')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    reportViewStyle === 'flat_table'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="جدول شامل مسطح لكافة الجلسات والتاسكات"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">جدول مجمع شامل</span>
                  <span className="sm:hidden">جدول</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search inside this day's work */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="البحث في مهام أو ملاحظات أو أسماء موظفي هذا اليوم..."
              className="w-full pl-3 pr-9 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div id="printable-daily-report" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 print:p-0">
          {/* Printable Official Header (Only Visible in Print) */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-800 mb-6">
            <div>
              <SwiftMyndLogo variant="full" size="md" />
              <div className="text-sm font-bold mt-1">تقرير إنجاز مهام الفريق اليومي المجمع</div>
              <div className="text-xs text-slate-500 font-mono">سجل فترات العمل وأوقات الإنجاز الفعلي</div>
            </div>
            <div className="text-left dir-ltr">
              <div className="text-lg font-black text-slate-900">DAILY TASKS REPORT</div>
              <div className="text-xs font-mono font-bold text-blue-600">Date: {selectedDate}</div>
              <div className="text-[11px] text-slate-500 font-mono">Generated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          {/* 4 Daily KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-3.5 rounded-2xl border border-blue-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-blue-700 text-[11px] font-bold">
                <span>إجمالي وقت العمل اليوم</span>
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-900 mt-1">
                {dailyReportData.totalDayHours}{' '}
                <span className="text-xs font-normal text-blue-700">ساعة</span>
              </div>
              <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                {dailyReportData.totalDayMinutes} دقيقة مسجلة صافية
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-700 text-[11px] font-bold">
                <span>الموظفين المشاركين</span>
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
                {dailyReportData.uniqueEmployeesCount}{' '}
                <span className="text-xs font-normal text-emerald-700">موظف</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                سجلوا ساعات عمل في هذا اليوم
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold">
                <span>المهام التي تم العمل عليها</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
                {dailyReportData.uniqueTasksCount}{' '}
                <span className="text-xs font-normal text-amber-700">تاسك</span>
              </div>
              <div className="text-[10px] text-amber-700 mt-0.5">
                عبر {dailyReportData.sessions.length} جلسة عمل
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-3.5 rounded-2xl border border-purple-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-purple-700 text-[11px] font-bold">
                <span>متوسط وقت الجلسة</span>
                <Activity className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-900 mt-1">
                {dailyReportData.sessions.length > 0
                  ? Math.round(dailyReportData.totalDayMinutes / dailyReportData.sessions.length)
                  : 0}{' '}
                <span className="text-xs font-normal text-purple-700">دقيقة</span>
              </div>
              <div className="text-[10px] text-purple-600 mt-0.5">
                لكل فترة عمل مسجلة
              </div>
            </div>
          </div>

          {/* Empty State */}
          {dailyReportData.sessions.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                لا توجد فترات عمل مسجلة في هذا التاريخ المحدد ({selectedDate})
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يتم تسجيل الفترات آلياً عند تشغيل المؤقت في جدول المهام أو عند إضافة فترات عمل يدوية لتسجيل ساعات العمل اليومية.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleSetRelativeDate(0)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  الاطلاع على تقرير اليوم الحالي (Today)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* VIEW STYLE 1: GROUPED BY EMPLOYEE (Card per Employee with Tasks breakdown) */}
              {reportViewStyle === 'grouped_by_employee' && (
                <div className="space-y-4">
                  {dailyReportData.groupedMembers.map(item => {
                    const m = item.member;
                    const memberSharePercent =
                      dailyReportData.totalDayMinutes > 0
                        ? Math.round((item.totalMinutes / dailyReportData.totalDayMinutes) * 100)
                        : 0;
                    const expanded = isMemberExpanded(m.id);

                    return (
                      <div
                        key={m.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                      >
                        {/* Member Header Card */}
                        <div
                          onClick={() => toggleMemberAccordion(m.id)}
                          className="bg-slate-50/80 hover:bg-slate-100/80 p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer border-b border-slate-200/70"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                m.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                              }
                              alt={m.name}
                              className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-xs shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-slate-900 text-sm">{m.name}</h3>
                                {(m as TeamMember).employeeCode && (
                                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                                    {(m as TeamMember).employeeCode}
                                  </span>
                                )}
                                {(m as TeamMember).role && (
                                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full font-bold">
                                    {(m as TeamMember).role}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                اشتغل على <strong>{item.sessions.length} جلسة عمل</strong> عبر{' '}
                                <strong>{new Set(item.sessions.map(s => s.taskId)).size} مهمة مختلفة</strong>
                              </p>
                            </div>
                          </div>

                          {/* Member Time Summary Pill */}
                          <div className="flex items-center gap-3">
                            <div className="text-left dir-ltr bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                              <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider text-right font-sans">
                                إجمالي وقت الموظف اليوم
                              </span>
                              <div className="text-emerald-900 font-black text-sm flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 inline" />
                                <span>{formatMinutes(item.totalMinutes)}</span>
                                <span className="text-[10px] text-emerald-700 font-mono font-medium">
                                  ({(item.totalMinutes / 60).toFixed(1)} س / {memberSharePercent}%)
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
                            >
                              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Member Tasks Table */}
                        {expanded && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold">
                                  <th className="py-2.5 px-4">م</th>
                                  <th className="py-2.5 px-3">عنوان المهمة وتصنيفها</th>
                                  <th className="py-2.5 px-3">وقت الجلسة (من - إلى)</th>
                                  <th className="py-2.5 px-3">الوقت المستغرق</th>
                                  <th className="py-2.5 px-3">حالة المهمة</th>
                                  <th className="py-2.5 px-4">ملاحظات ما تم إنجازه</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {item.sessions.map((sess, idx) => {
                                  const statusBadge: Record<TaskStatus, { text: string; bg: string; color: string }> = {
                                    todo: { text: 'قيد الانتظار', bg: 'bg-slate-100', color: 'text-slate-700' },
                                    in_progress: { text: 'جاري العمل', bg: 'bg-blue-100', color: 'text-blue-800' },
                                    review: { text: 'قيد المراجعة', bg: 'bg-amber-100', color: 'text-amber-800' },
                                    completed: { text: 'مكتملة بنجاح ✓', bg: 'bg-emerald-100', color: 'text-emerald-800' }
                                  };
                                  const badge = statusBadge[sess.taskStatus] || statusBadge.in_progress;

                                  return (
                                    <tr key={sess.logId} className="hover:bg-slate-50/70 transition-colors">
                                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                        {idx + 1}
                                      </td>

                                      <td className="py-3 px-3">
                                        <div
                                          onClick={() => {
                                            if (onSelectTask) {
                                              onSelectTask(sess.taskId);
                                              onClose();
                                            }
                                          }}
                                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1.5"
                                        >
                                          <span>{sess.taskTitle}</span>
                                          {sess.isLiveTimer && (
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                                          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                                            {sess.taskCategory}
                                          </span>
                                          {sess.isPrivate && (
                                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                              خاصة بالمدير 🔒
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                                        <div className="flex items-center gap-1">
                                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                                            {sess.startTime}
                                          </span>
                                          <span className="text-slate-400">←</span>
                                          <span className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded font-bold">
                                            {sess.endTime}
                                          </span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-3">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl font-bold font-mono text-xs">
                                          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                                          <span>{sess.durationFormatted}</span>
                                        </div>
                                      </td>

                                      <td className="py-3 px-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.color}`}>
                                          {badge.text}
                                        </span>
                                      </td>

                                      <td className="py-3 px-4 text-slate-600 max-w-sm italic text-[11px]">
                                        "{sess.note}"
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW STYLE 2: CONSOLIDATED ALL-IN-ONE FLAT TABLE */}
              {reportViewStyle === 'flat_table' && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold">
                          <th className="py-3 px-4">م</th>
                          <th className="py-3 px-4">اسم الموظف</th>
                          <th className="py-3 px-3">عنوان المهمة والتصنيف</th>
                          <th className="py-3 px-3">من الساعة</th>
                          <th className="py-3 px-3">إلى الساعة</th>
                          <th className="py-3 px-3">الوقت المستغرق</th>
                          <th className="py-3 px-3">حالة المهمة</th>
                          <th className="py-3 px-4">ملاحظات الإنجاز</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dailyReportData.sessions.map((sess, idx) => {
                          const m = team.find(item => item.id === sess.memberId);
                          const statusBadge: Record<TaskStatus, { text: string; bg: string; color: string }> = {
                            todo: { text: 'قيد الانتظار', bg: 'bg-slate-100', color: 'text-slate-700' },
                            in_progress: { text: 'جاري العمل', bg: 'bg-blue-100', color: 'text-blue-800' },
                            review: { text: 'قيد المراجعة', bg: 'bg-amber-100', color: 'text-amber-800' },
                            completed: { text: 'مكتملة ✓', bg: 'bg-emerald-100', color: 'text-emerald-800' }
                          };
                          const badge = statusBadge[sess.taskStatus] || statusBadge.in_progress;

                          return (
                            <tr key={sess.logId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                {idx + 1}
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={sess.memberAvatar || m?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                    alt={sess.memberName}
                                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <div className="font-extrabold text-slate-900">{sess.memberName}</div>
                                    <div className="text-[10px] text-slate-400">{m?.role || 'عضو الفريق'}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <div
                                  onClick={() => {
                                    if (onSelectTask) {
                                      onSelectTask(sess.taskId);
                                      onClose();
                                    }
                                  }}
                                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  {sess.taskTitle}
                                </div>
                                <div className="text-[10px] text-slate-400">{sess.taskCategory}</div>
                              </td>

                              <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                                {sess.startTime}
                              </td>

                              <td className="py-3 px-3 font-mono text-blue-700 font-bold">
                                {sess.endTime}
                              </td>

                              <td className="py-3 px-3">
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-bold font-mono text-xs">
                                  {sess.durationFormatted}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.color}`}>
                                  {badge.text}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-slate-600 max-w-xs italic text-[11px]">
                                "{sess.note}"
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bottom Consolidated Footer Strip */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-2">
              <SwiftMyndLogo variant="icon" size="sm" isDark={true} />
              <div>
                <span className="font-black">ملخص تقرير يوم: {formattedDateArabic}</span>
                <span className="text-slate-400 block text-[11px]">
                  {brandConfig?.brandName || 'سويفت مايند'} • نظام متابعة وإنجاز ساعات العمل المجمعة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-white/10 px-3 py-1 rounded-xl">
                <span className="text-slate-300 font-sans text-[11px] ml-1">إجمالي الساعات:</span>
                <strong className="text-emerald-400 font-bold">{dailyReportData.totalDayHours} ساعة</strong>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-xl">
                <span className="text-slate-300 font-sans text-[11px] ml-1">الموظفين:</span>
                <strong className="text-blue-300 font-bold">{dailyReportData.uniqueEmployeesCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
