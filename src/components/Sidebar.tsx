import React, { useState } from 'react';
import {
  Home,
  FileSpreadsheet,
  BarChart2,
  Users,
  Cpu,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Contact,
  Building2,
  DollarSign,
  TrendingUp,
  FileText,
  Megaphone,
  CheckSquare,
  Calendar,
  PhoneCall,
  Package,
  Headphones,
  Boxes,
  Mail,
  PanelRightClose,
  PanelRightOpen,
  Sliders,
  FolderClock,
  Clock,
  Bell,
  Sparkles,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Server,
  UploadCloud,
  AtSign,
  Timer,
  Lock,
  Settings,
  Camera,
  LogOut,
  FolderGit2
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SwiftMyndLogo } from './common/SwiftMyndLogo';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadEmailsCount,
    tasks,
    getDeadlineStatus,
    currentUser,
    setIsBrandModalOpen,
    isManager,
    renewalsDueSoonCount,
    clientRenewals,
    impersonateUser,
    returnToAdmin,
    team,
    setIsAdminPinModalOpen,
    setIsGitHubModalOpen,
    logoutUser
  } = useCRM();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [salesOpen, setSalesOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Helper: Is current user mentioned in task?
  const isUserMentionedInTask = (t: any) => {
    if (!currentUser) return false;
    if (t.mentionedUserIds && t.mentionedUserIds.includes(currentUser.id)) return true;
    if (t.comments && t.comments.some((c: any) => (currentUser.name && c.content?.includes(`@${currentUser.name}`)) || (currentUser.username && c.content?.includes(`@${currentUser.username}`)))) return true;
    if (t.description && ((currentUser.name && t.description.includes(`@${currentUser.name}`)) || (currentUser.username && t.description.includes(`@${currentUser.username}`)))) return true;
    if (t.title && ((currentUser.name && t.title.includes(`@${currentUser.name}`)) || (currentUser.username && t.title.includes(`@${currentUser.username}`)))) return true;
    return false;
  };

  // Visible tasks for the current user in sidebar
  const userVisibleTasks = isManager
    ? tasks
    : tasks.filter(t => !t.isPrivate && ((currentUser && t.assignedToId === currentUser.id) || isUserMentionedInTask(t)));

  // Check overdue tasks for current user
  const overdueCount = userVisibleTasks.filter(t => {
    const st = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return st.isOverdue;
  }).length;

  const pendingTasksCount = userVisibleTasks.filter(t => t.status !== 'completed').length;
  const mentionedTasksCount = userVisibleTasks.filter(t => isUserMentionedInTask(t)).length;

  return (
    <aside
      className={`bg-[#172033] text-slate-300 border-l border-slate-800 shrink-0 transition-all duration-300 flex flex-col z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header: Brand & Collapse Toggle & Logo Change */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-3 text-white">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 min-w-0">
            <SwiftMyndLogo
              variant="full"
              size="md"
              isDark={true}
              onClick={() => setActiveTab(isManager ? 'home' : 'tasks')}
              className="overflow-hidden"
            />
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-slate-800/90 hover:bg-blue-600 text-blue-300 hover:text-white border border-slate-700 hover:border-blue-500 transition-all cursor-pointer shrink-0 text-[10px] font-bold shadow-2xs"
              title="تغيير اللوجو والشعار مباشرة من الواجهة الرئيسية"
            >
              <Camera className="w-3 h-3 text-blue-400" />
              <span>تغيير</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 mx-auto">
            <SwiftMyndLogo
              variant="icon"
              size="sm"
              isDark={true}
              onClick={() => setIsCollapsed(false)}
              className="mx-auto"
            />
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="p-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="تغيير اللوجو"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
        >
          {isCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge & Quick Switch Helper for User Testing */}
      {!isCollapsed && (
        <div className="p-2 border-b border-slate-800/80 bg-slate-900/40">
          {isManager ? (
            <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-xl p-2 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-blue-200 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>وضع الأدمن (المدير العام)</span>
                </span>
                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                  كامل الصلاحيات
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                لديك وصول شامل: الماركيتنج، تجديد العملاء، الصفقات، التقارير والفريق.
              </p>
              <button
                onClick={() => {
                  const emp = team.find(m => m.id !== 'user-1' && m.accessLevel !== 'admin');
                  if (emp) impersonateUser(emp.id);
                }}
                className="w-full text-center py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-amber-500/20"
                title="التبديل لحساب موظف للتأكد أن التاسكات فقط تظهر له"
              >
                👤 تجربة وضع الموظف (التاسكات بس)
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-blue-400/40 object-cover"
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 border border-slate-900 absolute bottom-0 right-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-400 font-medium truncate">{currentUser.role || 'عضو الفريق'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 text-xs font-medium scrollbar-thin">
        {/* ================= IF EMPLOYEE: ONLY SHOW TASKS, TIMER, MENTIONS, AND WORK ================= */}
        {!isManager ? (
          <div className="space-y-1.5 pt-1">
            <div className="px-2 py-1 flex items-center justify-between text-[11px] font-black text-slate-300 tracking-wide">
              <span>مهام العمل والمتابعة</span>
              <span className="text-[9px] bg-slate-800 text-blue-300 border border-slate-700 px-1.5 py-0.2 rounded font-mono">
                {currentUser.name}
              </span>
            </div>

            {/* Accordion: أنشطة (مطابق لطلب وصورة المستخدم بالتمام) */}
            <div className="pt-0.5">
              {!isCollapsed ? (
                <div className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-slate-300 text-xs font-bold bg-slate-800/40 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>أنشطة</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ) : (
                <div className="h-px bg-slate-800 my-1" />
              )}

              <div className="space-y-0.5 pr-1 mt-1">
                {/* 1. تاسكات الفريق والتايمر (مع البادجات 7 و 4 مطابقة للصورة تماماً) */}
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'bg-blue-600 text-white font-extrabold shadow-md'
                      : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  title="تاسكات الفريق والتايمر ومواعيدها"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    {!isCollapsed && <span className="font-bold">تاسكات الفريق والتايمر</span>}
                  </div>
                  {!isCollapsed && (
                    <div className="flex items-center gap-1 font-mono font-bold">
                      {overdueCount > 0 && (
                        <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded-full font-bold shadow-2xs">
                          {overdueCount}
                        </span>
                      )}
                      <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full">
                        {pendingTasksCount}
                      </span>
                    </div>
                  )}
                </button>

                {/* 2. مهام معمول لي فيها منشن (@) */}
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`w-full text-right flex items-center justify-between px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                    activeTab === 'tasks' && mentionedTasksCount > 0
                      ? 'text-blue-300 hover:bg-slate-800/80'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                  title="المهام المعمول لي فيها منشن (@)"
                >
                  <div className="flex items-center gap-2">
                    <AtSign className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                    {!isCollapsed && <span>مهام منشن لي (@)</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-1.5 py-0.2 rounded-full font-mono font-bold">
                      {mentionedTasksCount}
                    </span>
                  )}
                </button>

                {/* 3. الاجتماعات */}
                <button
                  onClick={() => setActiveTab('meetings')}
                  className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                    activeTab === 'meetings' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title="الاجتماعات"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  {!isCollapsed && <span>الاجتماعات</span>}
                </button>

                {/* 4. المكالمات */}
                <button
                  onClick={() => setActiveTab('calls')}
                  className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                    activeTab === 'calls' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                  title="المكالمات"
                >
                  <PhoneCall className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  {!isCollapsed && <span>المكالمات</span>}
                </button>
              </div>
            </div>

            {/* بريد الفريق (Mail) مع البادج [1] */}
            <button
              onClick={() => setActiveTab('mail')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'mail' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="بريد الفريق (Mail)"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                {!isCollapsed && <span>بريد الفريق (Mail)</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold font-mono">
                  1
                </span>
              )}
            </button>

            {/* قائمة انتظار العمل */}
            <button
              onClick={() => setActiveTab('work_queue')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'work_queue'
                  ? 'bg-blue-600 text-white font-extrabold shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="قائمة انتظار العمل"
            >
              <div className="flex items-center gap-2.5">
                <FolderClock className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>قائمة انتظار العمل</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-bold font-mono">
                  6
                </span>
              )}
            </button>

            {/* ملفات العملاء والشيتات (متاحة للتيم لسهولة وصول الفريق لملف كل عميل وشيت جوجل الخاص به) */}
            <button
              onClick={() => setActiveTab('renewals')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'renewals'
                  ? 'bg-blue-600 text-white font-extrabold shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="ملفات العملاء وشيتات المتابعة (Google Sheets)"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && <span>ملفات العملاء والشيتات</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-bold font-mono">
                  {clientRenewals.length} عميل
                </span>
              )}
            </button>

            {/* الملف الشخصي وتعديل الحساب (الاسم، الصورة، الباسورد) */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer border ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md border-blue-400 ring-1 ring-blue-300/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/60'
                }`}
                title="الملف الشخصي: تعديل الاسم، صورة البروفايل، وكلمة المرور"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-cyan-400 shrink-0"
                  />
                  {!isCollapsed && (
                    <div className="truncate">
                      <div className="font-extrabold truncate text-xs text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-cyan-300 truncate font-semibold">تعديل البروفايل والباسورد ⚙️</div>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                    تعديل
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ================= IF ADMIN: SHOW EVERYTHING (الادمن عنده كل حاجة) ================= */
          <>
            {/* Item 1: الرئيسية */}
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="الرئيسية"
            >
              <Home className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>الرئيسية</span>}
            </button>

            {/* إعدادات السيستم وتغيير اللوجو (مباشرة في الواجهة الرئيسية) */}
            <button
              onClick={() => setActiveTab('system_settings')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer border ${
                activeTab === 'system_settings'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-md border-blue-400 ring-1 ring-blue-300/40'
                  : 'text-slate-200 hover:bg-slate-800/90 hover:text-white bg-slate-800/40 border-blue-500/20'
              }`}
              title="إعدادات المنظومة: تغيير اللوجو، الاسم، الألوان، وأيقونة Favicon"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 shrink-0 text-blue-400" />
                {!isCollapsed && <span className="font-bold">إعدادات السيستم واللوجو</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-bold">
                  تغيير اللوجو 🖼️
                </span>
              )}
            </button>

            {/* Item 2: ماركيتنج الأدمن (Marketing Suite: Board + Planner + Tasks + Inbox) */}
            <button
              onClick={() => setActiveTab('marketing')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-extrabold shadow-md'
                  : 'text-slate-200 hover:bg-slate-800/90 hover:text-white bg-slate-800/40 border border-amber-500/20'
              }`}
              title="لوحة الماركيتنج والمخطط (Planner & Board & Tasks - خاص بالأدمن)"
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span className="font-bold">ماركيتنج الأدمن (Marketing)</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold px-1.5 py-0.5 rounded shadow-2xs">
                  أدمن 🔒
                </span>
              )}
            </button>

            {/* Item 3: مواعيد تجديد العملاء وتنبيهات الـ 4 أيام */}
            <button
              onClick={() => setActiveTab('renewals')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'renewals'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold shadow-md'
                  : 'text-slate-200 hover:bg-slate-800/90 hover:text-white bg-slate-800/30 border border-rose-500/20'
              }`}
              title="مواعيد تجديد اشتراكات العملاء وتنبيهات الـ 4 أيام المسبقة"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0 text-rose-400" />
                {!isCollapsed && <span className="font-bold">ملفات العملاء وتجديد الاشتراكات</span>}
              </div>
              {!isCollapsed && (
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-2xs ${
                    renewalsDueSoonCount > 0
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {renewalsDueSoonCount > 0 ? `🚨 ${renewalsDueSoonCount} تجديد` : 'ساري'}
                </span>
              )}
            </button>

            {/* Item 3.5: نقل 2 سيستم للهوست و2 دومين وتحميل الملفات */}
            <button
              onClick={() => setActiveTab('host_migration')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'host_migration'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold shadow-md'
                  : 'text-slate-200 hover:bg-slate-800/90 hover:text-white bg-slate-800/30 border border-indigo-500/20'
              }`}
              title="نقل 2 سيستم إلى الهوست و2 دومين (ظاهرلي جيو وسوشيال ميديا وتحميل الملفات)"
            >
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isCollapsed && <span className="font-bold">نقل 2 سيستم للهوست</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold px-1.5 py-0.5 rounded">
                  2 دومين
                </span>
              )}
            </button>


            {/* Item 5: التقارير */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="التقارير"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>التقارير</span>}
            </button>

            {/* Item 6: التحليلات */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="التحليلات"
            >
              <BarChart2 className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>التحليلات</span>}
            </button>

            {/* Item 7: فريق العمل (الموظفين) */}
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="فريق العمل والموظفين (مع خيار حذف وتعديل الفريق بالكامل)"
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>فريق العمل (الموظفين)</span>}
            </button>

            {/* Item: المرتبات والحضور والأرباح (خاص بالإدارة والأدمن فقط) */}
            <button
              onClick={() => setActiveTab('payroll')}
              className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer border ${
                activeTab === 'payroll' || activeTab === 'salaries'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold shadow-md border-emerald-400 ring-1 ring-emerald-300/40'
                  : 'text-slate-200 hover:bg-slate-800/90 hover:text-white bg-slate-800/40 border-emerald-500/20'
              }`}
              title="نظام رواتب الموظفين، الحضور والغياب، التأخيرات، ومكسب الشركة (خاص بالأدمن)"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isCollapsed && <span className="font-bold">المرتبات والحضور والأرباح</span>}
              </div>
              {!isCollapsed && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-bold">
                  أدمن 🔒
                </span>
              )}
            </button>

            {/* Item 8: MCP */}
            <button
              onClick={() => setActiveTab('mcp')}
              className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'mcp'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title="MCP"
            >
              <Cpu className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && <span className="font-bold">MCP</span>}
            </button>

            {/* Separator / Workspace label */}
            {!isCollapsed && (
              <div className="pt-2 pb-1 border-t border-slate-800/80 mt-2">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
                      مف
                    </span>
                    <span className="truncate">مساحة فريق CRM</span>
                  </div>
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
                </div>

                {/* Inline search */}
                <div className="relative mt-1 px-1">
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    placeholder="بحث سريع..."
                    className="w-full bg-slate-800/70 text-slate-200 placeholder-slate-500 text-[11px] rounded-md pr-7 pl-2 py-1 border border-slate-700/60 focus:outline-none focus:border-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2" />
                </div>
              </div>
            )}

        {/* Accordion 1: المبيعات */}
        <div className="pt-1">
          {!isCollapsed ? (
            <button
              onClick={() => setSalesOpen(!salesOpen)}
              className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>المبيعات</span>
              </div>
              {salesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-slate-800 my-1" />
          )}

          {(!isCollapsed ? salesOpen : true) && (
            <div className="space-y-0.5 pr-2">
              <button
                onClick={() => setActiveTab('leads')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'leads' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="العملاء المحتملون"
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>العملاء المحتملون</span>}
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'contacts' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="جهات اتصال"
              >
                <Contact className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>جهات اتصال</span>}
              </button>

              <button
                onClick={() => setActiveTab('accounts')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'accounts' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="الحسابات"
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>الحسابات</span>}
              </button>

              <button
                onClick={() => setActiveTab('deals')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'deals' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="صفقات"
              >
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>صفقات</span>}
              </button>

              <button
                onClick={() => setActiveTab('forecasts')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'forecasts' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="التنبؤات"
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>التنبؤات</span>}
              </button>

              <button
                onClick={() => setActiveTab('campaigns')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'campaigns' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="الحملات"
              >
                <Megaphone className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>الحملات</span>}
              </button>
            </div>
          )}
        </div>

        {/* Accordion 2: أنشطة (المهام، الاجتماعات، المكالمات) */}
        <div className="pt-1">
          {!isCollapsed ? (
            <button
              onClick={() => setActivitiesOpen(!activitiesOpen)}
              className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>أنشطة</span>
              </div>
              {activitiesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-slate-800 my-1" />
          )}

          {(!isCollapsed ? activitiesOpen : true) && (
            <div className="space-y-0.5 pr-2">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`w-full text-right flex items-center justify-between px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'tasks' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
                title="مهام وتاسكات الفريق ومؤقت العمل"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  {!isCollapsed && <span>تاسكات الفريق والتايمر</span>}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-1">
                    {overdueCount > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                        {overdueCount}
                      </span>
                    )}
                    {pendingTasksCount > 0 && (
                      <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-full font-bold">
                        {pendingTasksCount}
                      </span>
                    )}
                  </div>
                )}
              </button>

              <button
                onClick={() => setActiveTab('meetings')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'meetings' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="الاجتماعات"
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>الاجتماعات</span>}
              </button>

              <button
                onClick={() => setActiveTab('calls')}
                className={`w-full text-right flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                  activeTab === 'calls' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title="المكالمات"
              >
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span>المكالمات</span>}
              </button>
            </div>
          )}
        </div>

        {/* بريد الفريق (SwiftMail) */}
        <div className="pt-1">
          <button
            onClick={() => setActiveTab('mail')}
            className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'mail'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
            title="بريد الفريق (SwiftMail)"
          >
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
              {!isCollapsed && <span>بريد الفريق (Mail)</span>}
            </div>
            {!isCollapsed && unreadEmailsCount > 0 && (
              <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                {unreadEmailsCount}
              </span>
            )}
          </button>
        </div>

        {/* Additional Sections */}
        <div className="pt-2 border-t border-slate-800/80 space-y-0.5">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              activeTab === 'inventory' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="المخزون"
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>المخزون</span>}
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              activeTab === 'support' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="الدعم"
          >
            <Headphones className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>الدعم والتذاكر</span>}
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              activeTab === 'integrations' ? 'bg-blue-600/40 text-blue-200 font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            title="عمليات التكامل"
          >
            <Boxes className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>عمليات التكامل</span>}
          </button>

          {/* سكشن إعدادات السيستم الشاملة (اللوجو، الاسم، الألوان، فافيكون FAVICON) للأدمن فقط */}
          {isManager && (
            <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1.5">
              {!isCollapsed && (
                <div className="px-2 py-0.5 text-[10px] font-extrabold text-blue-400 flex items-center justify-between">
                  <span>إعدادات السيستم الشاملة</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1 rounded font-bold">
                    أدمن 🔒
                  </span>
                </div>
              )}

              {/* زر التوجيه لصفحة إعدادات السيستم الشاملة */}
              <button
                onClick={() => setActiveTab('system_settings')}
                className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                  activeTab === 'system_settings'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md border-blue-400 ring-1 ring-blue-300/40'
                    : 'bg-slate-800/90 hover:bg-slate-800 text-blue-200 hover:text-white border-slate-700/80'
                }`}
                title="إعدادات السيستم: تعديل اللوجو، الاسم، ألوان المنظومة، وأيقونة FAVICON"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sliders className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && (
                    <div className="truncate">
                      <div className="font-extrabold truncate">إعدادات السيستم واللوجو</div>
                      <div className="text-[10px] text-slate-400 truncate">الاسم، الألوان، Favicon</div>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-bold shrink-0">
                    فتح ←
                  </span>
                )}
              </button>

              {/* زر تعديل اللوجو والاسم السريع */}
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="w-full text-right flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
                title="نافذة تعديل سريعة للشعار والاسم"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  {!isCollapsed && <span>تعديل اللوجو والشعار سريعاً</span>}
                </div>
                {!isCollapsed && <span className="text-[10px] text-slate-500">نافذة ⚙️</span>}
              </button>

              {/* زر تصدير واستيراد أحدث نسخة من GitHub */}
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="w-full text-right flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white transition-colors cursor-pointer border border-cyan-500/20"
                title="تصدير واستيراد أحدث نسخة عبر GitHub لحماية البيانات من المسح"
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                  {!isCollapsed && <span>تصدير واستيراد GitHub</span>}
                </div>
                {!isCollapsed && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-bold">حفظ الداتا</span>}
              </button>

              {/* زر الملف الشخصي للمدير */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-right flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer border ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white font-bold border-blue-400'
                    : 'bg-slate-900/40 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                }`}
                title="الملف الشخصي: تعديل الاسم، صورة البروفايل، وكلمة المرور"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-4 h-4 rounded-full object-cover border border-cyan-400"
                  />
                  {!isCollapsed && <span>الملف الشخصي والباسورد</span>}
                </div>
                {!isCollapsed && <span className="text-[10px] text-slate-500">👤</span>}
              </button>
            </div>
          )}

          {/* زر تسجيل الخروج والعودة للرئيسية مباشرة */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                try {
                  if (typeof window !== 'undefined' && window.history) {
                    window.history.replaceState({}, '', '/');
                  }
                } catch (e) {}
                logoutUser();
              }}
              className="w-full text-right flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors cursor-pointer border border-rose-900/30"
              title="تسجيل الخروج والعودة للرئيسية مباشرة"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {!isCollapsed && <span>تسجيل الخروج</span>}
              </div>
              {!isCollapsed && <span className="text-[10px] text-rose-400/80">الرئيسية</span>}
            </button>
          </div>
        </div>
        </>
      )}
      </div>
    </aside>
  );
};
