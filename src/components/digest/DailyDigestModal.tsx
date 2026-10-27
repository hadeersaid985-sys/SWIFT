import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  Square,
  ExternalLink,
  Copy,
  Check,
  Sun,
  Flame,
  ArrowRight,
  ListTodo,
  CheckCheck
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../../context/CRMContext';
import { Task } from '../../types/crm';

export const DailyDigestModal: React.FC = () => {
  const {
    isDailyDigestOpen,
    setIsDailyDigestOpen,
    currentUser,
    tasks,
    getDeadlineStatus,
    startTaskTimer,
    pauseTaskTimer,
    resumeTaskTimer,
    stopTaskTimer,
    changeTaskStatus,
    setActiveTab
  } = useCRM();

  const isManager = Boolean(currentUser && (currentUser.accessLevel === 'admin' || currentUser.id === 'user-1'));

  // Active filter within the digest
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [dontShowAgainToday, setDontShowAgainToday] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  if (!isDailyDigestOpen) return null;

  // Strict user task isolation:
  // Non-managers only see tasks assigned to them or where they are mentioned (@)
  const userTasks = isManager
    ? tasks
    : tasks.filter(t => !t.isPrivate && ((currentUser && isTaskAssignedToUser(t, currentUser)) || isUserMentionedInTask(t, currentUser)));

  // All active/pending tasks for this user
  const activeTasks = userTasks.filter(t => t.status !== 'completed' && !completedTaskIds.includes(t.id));

  // 1. Overdue tasks (المهام المتأخرة)
  const overdueTasks = activeTasks.filter(t => {
    const deadline = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return deadline.isOverdue;
  });

  // 2. Today's scheduled tasks (المهام المجدولة لليوم الحالي فقط)
  const todayTasks = activeTasks.filter(t => {
    const deadline = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return deadline.isToday;
  });

  // 3. Upcoming tasks (مهام قادمة)
  const upcomingTasks = activeTasks.filter(t => {
    const deadline = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return !deadline.isOverdue && !deadline.isToday;
  });

  // Display list based on tab
  const displayedTasks =
    activeTabFilter === 'overdue'
      ? overdueTasks
      : activeTabFilter === 'today'
      ? todayTasks
      : activeTabFilter === 'upcoming'
      ? upcomingTasks
      : activeTasks;

  // Arabic date formatter
  const todayDateFormatted = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const handleClose = () => {
    if (dontShowAgainToday && currentUser?.id) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(`swiftmynd_digest_dismissed_${currentUser.id}_${todayStr}`, 'true');
        }
      } catch (e) {}
    }
    setIsDailyDigestOpen(false);
  };

  const handleCopyTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `📋 مهمة: ${task.title}\nالموعد: ${task.dueDate} ${task.dueTime || ''}\nالأولوية: ${task.priority}\nالحالة: ${task.status}\nالوصف: ${task.description || 'لا يوجد'}`;
    navigator.clipboard.writeText(text);
    setCopiedTaskId(task.id);
    setTimeout(() => setCopiedTaskId(null), 2000);
  };

  const handleMarkDone = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    changeTaskStatus(taskId, 'completed');
    setCompletedTaskIds(prev => [...prev, taskId]);
  };

  const handleOpenInTasks = (taskId?: string) => {
    handleClose();
    setActiveTab('tasks');
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 cursor-default"
      >
        {/* Header with Warm Daily Greeting */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl shadow-lg shrink-0">
                <Sun className="w-6 h-6 animate-spin-slow" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    موجز المهام اليومي (Daily Digest)
                  </h2>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    تنبيهات اليوم
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span>مرحباً، <strong className="text-white font-bold">{currentUser?.name || 'عضو الفريق'}</strong></span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-200/90 font-medium">{todayDateFormatted}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="إغلاق الموجز"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Statistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 relative z-10">
            {/* Overdue Card */}
            <div
              onClick={() => setActiveTabFilter('overdue')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'overdue'
                  ? 'bg-rose-500/25 border-rose-400/60 ring-2 ring-rose-400/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-rose-300 text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>مهام متأخرة</span>
                </span>
                {overdueTasks.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <div className="text-xl font-black text-white mt-1">
                {overdueTasks.length}{' '}
                <span className="text-xs font-normal text-rose-200">مهمة</span>
              </div>
              <div className="text-[10px] text-rose-200/70 mt-0.5">
                {overdueTasks.length > 0 ? 'تتطلب تدخلك العاجل' : 'لا يوجد تأخير ✓'}
              </div>
            </div>

            {/* Today Scheduled Card */}
            <div
              onClick={() => setActiveTabFilter('today')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'today'
                  ? 'bg-blue-500/25 border-blue-400/60 ring-2 ring-blue-400/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-blue-300 text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>مجدولة لليوم</span>
                </span>
                <span className="text-[10px] bg-blue-400/20 text-blue-300 px-1 rounded font-mono">اليوم</span>
              </div>
              <div className="text-xl font-black text-white mt-1">
                {todayTasks.length}{' '}
                <span className="text-xs font-normal text-blue-200">مهمة</span>
              </div>
              <div className="text-[10px] text-blue-200/70 mt-0.5">
                مستحقة التنفيذ خلال ساعات اليوم
              </div>
            </div>

            {/* Total Active Focus */}
            <div
              onClick={() => setActiveTabFilter('all')}
              className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border transition-all cursor-pointer ${
                activeTabFilter === 'all'
                  ? 'bg-amber-500/25 border-amber-400/60 ring-2 ring-amber-400/40'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-amber-300 text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>إجمالي مهامك النشطة</span>
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded font-mono">النشطة</span>
              </div>
              <div className="text-xl font-black text-white mt-1">
                {activeTasks.length}{' '}
                <span className="text-xs font-normal text-amber-200">مهمة</span>
              </div>
              <div className="text-[10px] text-amber-200/70 mt-0.5">
                كافة المهام المكلف بها والمنشن
              </div>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>الكل ({activeTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTabFilter('today')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>مجدولة لليوم ({todayTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTabFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>المتأخرة ({overdueTasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTabFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabFilter === 'upcoming'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>مهام قادمة ({upcomingTasks.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline shrink-0">
            محدث لحظياً ومباشر مع الخادم
          </span>
        </div>

        {/* Task Cards Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 divide-y divide-slate-100">
          {displayedTasks.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-xs border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  رائع جداً! لا توجد مهام في هذا التصنيف 🎉
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {activeTabFilter === 'overdue'
                    ? 'ليس لديك أي مهام متأخرة حالياً! التزامك بالمواعيد ممتاز.'
                    : activeTabFilter === 'today'
                    ? 'لا توجد مهام مجدولة للتسليم اليوم. يومك منظم بنجاح.'
                    : activeTabFilter === 'upcoming'
                    ? 'لا توجد مهام مجدولة لأيام قادمة.'
                    : 'لا توجد أي مهام نشطة مكلف بها أو مشار إليها حالياً.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenInTasks()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span>عرض كافة مهام العمل بالبورد</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            displayedTasks.map(task => {
              const deadline = getDeadlineStatus(task.dueDate, task.dueTime, task.status);
              const isOverdue = deadline.isOverdue;
              const isToday = deadline.isToday;
              const isCopied = copiedTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`pt-3 first:pt-0 p-3.5 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                      : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-2xs'
                  }`}
                >
                  {/* Status & Priority Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-lg">
                          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{deadline.label}</span>
                        </span>
                      )}

                      {isToday && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>{deadline.label}</span>
                        </span>
                      )}

                      {task.priority === 'urgent' && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                          عاجل جداً 🔥
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                          أولوية مرتفعة
                        </span>
                      )}

                      {task.category && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {/* Right side due time indicator */}
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{task.dueDate}</span>
                      {task.dueTime && <span>({task.dueTime})</span>}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Subtasks Progress */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        المهام الفرعية:{' '}
                        <strong>
                          {task.subtasks.filter(s => s.completed).length} من {task.subtasks.length}
                        </strong>{' '}
                        مكتملة
                      </span>
                    </div>
                  )}

                  {/* Action Bar inside Card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                    {/* Timer control */}
                    <div className="flex items-center gap-2">
                      {task.isTimerRunning ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => pauseTaskTimer(task.id)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="إيقاف مؤقت للاستراحة - لن يحسب وقت التوقف"
                          >
                            <Pause className="w-3 h-3" />
                            <span>إيقاف مؤقت</span>
                          </button>
                          <button
                            onClick={() => stopTaskTimer(task.id)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span>إنهاء</span>
                          </button>
                        </div>
                      ) : task.isTimerPaused ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => resumeTaskTimer(task.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>استئناف</span>
                          </button>
                          <button
                            onClick={() => stopTaskTimer(task.id)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span>إنهاء</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startTaskTimer(task.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>بدء التايمر الآن ⏱️</span>
                        </button>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono">
                        المسجل: {Math.floor((task.totalLoggedMinutes || 0) / 60)}س {(task.totalLoggedMinutes || 0) % 60}د
                      </span>
                    </div>

                    {/* Quick Task Actions */}
                    <div className="flex items-center gap-1.5">
                      {/* 1-Click Copy */}
                      <button
                        onClick={e => handleCopyTask(task, e)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="نسخ بيانات المهمة"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'تم النسخ ✓' : 'نسخ'}</span>
                      </button>

                      {/* Mark Done */}
                      <button
                        onClick={e => handleMarkDone(task.id, e)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="تحديد المهمة كمكتملة الآن"
                      >
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>إنجاز ✓</span>
                      </button>

                      {/* Open in tasks */}
                      <button
                        onClick={() => handleOpenInTasks(task.id)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="فتح في بورد المهام"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 text-[11px]">
            <input
              type="checkbox"
              checked={dontShowAgainToday}
              onChange={e => setDontShowAgainToday(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>عدم إظهار هذا الموجز مجدداً اليوم تلقائياً</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenInTasks()}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold transition-colors cursor-pointer text-xs"
            >
              جدول المهام الكامل
            </button>

            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <span>بدء العمل وإغلاق الموجز</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
