import React from 'react';
import {
  CheckSquare,
  Clock,
  Briefcase,
  Users,
  Mail,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle2,
  Plus,
  Send,
  PhoneCall,
  ChevronLeft
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../../context/CRMContext';
import { SwiftMyndLogo } from '../common/SwiftMyndLogo';
import { TopPerformerLeaderboard } from './TopPerformerLeaderboard';

export const HomeDashboard: React.FC = () => {
  const {
    currentUser,
    tasks,
    team,
    deals,
    leads,
    emails,
    meetings,
    activities,
    getDeadlineStatus,
    toggleSubTask,
    changeTaskStatus,
    setActiveTab,
    setOpenQuickModal,
    brandConfig
  } = useCRM();

  const currency = brandConfig?.systemCurrency || 'ج.م';

  // Role Check
  const isManager =
    currentUser.accessLevel === 'admin' ||
    currentUser.accessLevel === 'manager' ||
    currentUser.id === 'user-1';

  // Calculated metrics: regular member only sees their own tasks
  const totalPipelineValue = deals
    .filter(d => d.stage !== 'ملغاة')
    .reduce((sum, d) => sum + d.value, 0);

  const wonDealsValue = deals
    .filter(d => d.stage === 'مغلقة ناجحة')
    .reduce((sum, d) => sum + d.value, 0);

  const visibleTasks = isManager
    ? tasks
    : tasks.filter(t => !t.isPrivate && (isTaskAssignedToUser(t, currentUser) || isUserMentionedInTask(t, currentUser)));
  const pendingTasks = visibleTasks.filter(t => t.status !== 'completed');
  const todayTasks = visibleTasks.filter(t => {
    const status = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return status.isToday || status.isOverdue;
  });

  const unreadEmails = emails.filter(m => m.folder === 'inbox' && !m.isRead);

  // Group deals by stage
  const dealsByStage = {
    'مؤهل': deals.filter(d => d.stage === 'مؤهل'),
    'عرض سعر': deals.filter(d => d.stage === 'عرض سعر'),
    'تفاوض': deals.filter(d => d.stage === 'تفاوض'),
    'مغلقة ناجحة': deals.filter(d => d.stage === 'مغلقة ناجحة'),
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-l from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <SwiftMyndLogo variant="horizontal" size="sm" isDark={true} />
            <span className="text-slate-500">|</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              {isManager ? 'لوحة تحكم المنظومة (المدير العام)' : 'لوحة تحكم المنظومة (عضو الفريق)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
            أهلاً بك مجدداً، {currentUser.name} 👋
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            {isManager ? (
              <>
                بصفتك المدير العام، لديك وصول شامل لجميع الحسابات. هناك{' '}
                <strong className="text-emerald-300">
                  {tasks.filter(t => t.isTimerRunning).length} أعضاء يعملون الآن بمؤقت نشط
                </strong>
                ، و <strong className="text-amber-300">{todayTasks.length} مهام تتطلب المتابعة</strong> في المنظومة.
              </>
            ) : (
              <>
                معروض لك هنا مهامك الشخصية فقط. لديك{' '}
                <strong className="text-amber-300">{pendingTasks.length} مهمة مخصصة لك</strong>، منها{' '}
                <strong className="text-rose-300">{todayTasks.length} مستحقة اليوم أو متأخرة</strong>.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setOpenQuickModal('task')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
          <button
            onClick={() => setOpenQuickModal('mail')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>رسالة بريد للفريق</span>
          </button>
          <button
            onClick={() => setOpenQuickModal('deal')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>صفقة جديدة</span>
          </button>
        </div>
      </div>

      {/* 4 Big KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tasks & Deadlines */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المهام ومواعيد التسليم</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{pendingTasks.length}</span>
            <span className="text-xs text-slate-500">مهمة معلقة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {todayTasks.length} مستحق اليوم / متأخر
            </span>
            <span className="text-blue-600 flex items-center gap-0.5 group-hover:translate-x-[-3px] transition-transform">
              عرض الكل <ChevronLeft className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Sales Pipeline Value */}
        <div
          onClick={() => setActiveTab('deals')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">قيمة صفقات المبيعات</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalPipelineValue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500">{currency}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-emerald-600 font-bold">
              ربح: {wonDealsValue.toLocaleString()} {currency}
            </span>
            <span className="text-blue-600 flex items-center gap-0.5 group-hover:translate-x-[-3px] transition-transform">
              الـ Pipeline <ChevronLeft className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Team Activity */}
        <div
          onClick={() => setActiveTab('team')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">فريق العمل (الموظفين)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{team.length}</span>
            <span className="text-xs text-slate-500">عضو نشط بالمنظومة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              {team.filter(m => m.status === 'online').length} متصلين الآن
            </span>
            <span className="text-blue-600 flex items-center gap-0.5 group-hover:translate-x-[-3px] transition-transform">
              دليل الفريق <ChevronLeft className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Team Mail & Leads */}
        <div
          onClick={() => setActiveTab('mail')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">بريد الفريق الوارد</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{unreadEmails.length}</span>
            <span className="text-xs text-slate-500">رسائل جديدة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-purple-600 font-semibold">
              {leads.length} عميل محتمل مسجل
            </span>
            <span className="text-blue-600 flex items-center gap-0.5 group-hover:translate-x-[-3px] transition-transform">
              فتح البريد <ChevronLeft className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Gamification & Top Performer Leaderboard */}
      <TopPerformerLeaderboard />

      {/* Main Grid: Priority Tasks & Pipeline Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Tasks & Deadlines Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    التاسكات المستعجلة ومواعيد التسليم القادمة
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    متابعة المهام المحددة بوقت وتنبيهات التأخير الفورية
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenQuickModal('task')}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> إضافة مهمة
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1.5 rounded-lg"
                >
                  عرض لوحة المهام &larr;
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-3">
              {tasks.slice(0, 5).map(task => {
                const assigned = team.find(m => m.id === task.assignedToId);
                const deadline = getDeadlineStatus(task.dueDate, task.dueTime, task.status);
                const isDone = task.status === 'completed';

                return (
                  <div
                    key={task.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          changeTaskStatus(
                            task.id,
                            isDone ? 'todo' : 'completed'
                          )
                        }
                        className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 hover:border-blue-500'
                        }`}
                        title={isDone ? 'تراجع عن الإنجاز' : 'تحديد كمكتملة'}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isDone
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${deadline.badgeClass}`}
                          >
                            {deadline.label}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-1">
                          {task.description}
                        </p>

                        {/* Subtasks progress */}
                        {task.subtasks.length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                            <span>
                              الخطوات ({task.subtasks.filter(s => s.completed).length}/
                              {task.subtasks.length}):
                            </span>
                            <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all"
                                style={{
                                  width: `${
                                    (task.subtasks.filter(s => s.completed).length /
                                      task.subtasks.length) *
                                    100
                                  }%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mr-8 sm:mr-0">
                      {assigned && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <img
                            src={assigned.avatar}
                            alt={assigned.name}
                            className="w-6 h-6 rounded-full object-cover border"
                          />
                          <span className="hidden sm:inline font-medium">{assigned.name}</span>
                        </div>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority === 'urgent'
                          ? 'أولوية حرجة'
                          : task.priority === 'high'
                          ? 'أولوية عالية'
                          : 'عادية'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Pipeline Funnel Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                    مسار صفقات المبيعات (Pipeline)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    مراحل الصفقات من التأهيل الأولي حتى الإغلاق والتعاقد
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('deals')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                فتح لوحة الصفقات الكانبان &larr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {Object.entries(dealsByStage).map(([stageName, stageDeals]) => {
                const totalVal = stageDeals.reduce((sum, d) => sum + d.value, 0);
                return (
                  <div
                    key={stageName}
                    onClick={() => setActiveTab('deals')}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="text-[11px] font-bold text-slate-500">{stageName}</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{stageDeals.length}</div>
                    <div className="text-xs font-bold text-emerald-600 mt-1">
                      {totalVal.toLocaleString()} {currency}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Team Roster, Today's Meetings & Quick Mail */}
        <div className="space-y-6">
          {/* Team Members Status Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">أعضاء الفريق ومسؤولياتهم</h3>
              </div>
              <button
                onClick={() => setActiveTab('team')}
                className="text-xs text-blue-600 hover:underline"
              >
                الكل ({team.length})
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {team.slice(0, 5).map(member => {
                const memberTasks = tasks.filter(
                  t => t.assignedToId === member.id && t.status !== 'completed'
                );
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                        <span
                          className={`w-2.5 h-2.5 rounded-full border-2 border-white absolute bottom-0 right-0 ${
                            member.status === 'online'
                              ? 'bg-emerald-500'
                              : member.status === 'busy'
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {memberTasks.length} تاسك
                      </span>
                      <button
                        onClick={() => {
                          setActiveTab('mail');
                          setOpenQuickModal('mail');
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="إرسال إيميل"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Meetings Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">الاجتماعات والمكالمات</h3>
              </div>
              <button
                onClick={() => setOpenQuickModal('meeting')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> جدولة
              </button>
            </div>

            <div className="space-y-3 mt-3">
              {meetings.slice(0, 3).map(meet => (
                <div
                  key={meet.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="truncate">{meet.title}</span>
                    <span className="text-[10px] text-blue-600 font-semibold shrink-0">
                      {meet.time} ({meet.duration})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>المكان: {meet.location}</span>
                    {meet.meetingLink && (
                      <a
                        href={meet.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                      >
                        انضمام للجلسة
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100">
              سجل أنشطة مساحة العمل
            </h3>
            <div className="space-y-3 mt-3">
              {activities.slice(0, 4).map(act => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={act.userAvatar}
                    alt={act.userName}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-slate-800">{act.title}</div>
                    <p className="text-[11px] text-slate-500">{act.description}</p>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
