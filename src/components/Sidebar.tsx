import React, { useState } from 'react';
import {
  Home,
  Inbox,
  BarChart2,
  PieChart,
  Bot,
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronUp,
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
  Boxes,
  Mail,
  PanelRightClose,
  PanelRightOpen,
  Sliders,
  Clock,
  UserCheck,
  Server,
  Settings,
  Camera,
  LogOut,
  FolderGit2,
  PauseCircle,
  MessagesSquare,
  Wallet,
  Percent,
  Lightbulb,
  X,
  Folder,
  Layers,
  AtSign,
  Award,
  ShieldCheck
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../context/CRMContext';
import { useChat } from '../context/ChatContext';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { unreadCount: unreadChatCount } = useChat();
  const {
    activeTab,
    setActiveTab,
    unreadEmailsCount,
    tasks,
    currentUser,
    setIsBrandModalOpen,
    isManager,
    renewalsDueSoonCount,
    suspendedContracts,
    logoutUser,
    setIsGitHubModalOpen,
    visibleClients
  } = useCRM();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [salesOpen, setSalesOpen] = useState(true);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Visible tasks for the current user in sidebar
  const userVisibleTasks = isManager
    ? tasks
    : tasks.filter(t => !t.isPrivate && ((currentUser && isTaskAssignedToUser(t, currentUser)) || isUserMentionedInTask(t, currentUser)));

  const pendingTasksCount = userVisibleTasks.filter(t => t.status !== 'completed').length;

  const myMentionTasksCount = tasks.filter(
    t => !t.isPrivate && isUserMentionedInTask(t, currentUser)
  ).length;

  const clientCount = (visibleClients || []).length;

  // Search filter helper for Manager
  const matchesSearch = (text: string) => {
    if (!sidebarSearch.trim()) return true;
    return text.toLowerCase().includes(sidebarSearch.trim().toLowerCase());
  };

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
    onCloseMobile?.();
  };

  const handleSelectAllTasks = () => {
    try {
      sessionStorage.removeItem('swiftmynd_tasks_filter');
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete('filter');
        window.history.replaceState({}, '', url.toString());
      }
      window.dispatchEvent(new CustomEvent('swiftmynd_tasks_filter', { detail: 'all' }));
    } catch {}
    handleSelectTab('tasks');
  };

  const handleSelectMentionTasks = () => {
    try {
      sessionStorage.setItem('swiftmynd_tasks_filter', 'mentions');
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.set('filter', 'mentions');
        window.history.replaceState({}, '', url.toString());
      }
      window.dispatchEvent(new CustomEvent('swiftmynd_tasks_filter', { detail: 'mentions' }));
    } catch {}
    handleSelectTab('tasks');
  };

  const isMentionsFilterActive = () => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('swiftmynd_tasks_filter') === 'mentions';
    } catch {
      return false;
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP SIDEBAR: EMPLOYEE VIEW (ONLY THIS FOR EMPLOYEES) */}
      {/* ========================================================= */}
      {!isManager ? (
        <aside
          className={`hidden md:flex bg-[#182642] text-[#cbd5e1] border-l border-[#24375a] shrink-0 transition-all duration-300 flex-col z-30 select-none ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Header: Cloud | Tasks / المهام وتتبع الإنتاجية */}
          <div className="h-14 border-b border-[#24375a] px-3.5 flex items-center justify-between text-white shrink-0">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <span className="text-blue-400">Cloud</span>
                    <span className="text-slate-500">|</span>
                    <span>Tasks</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">
                    المهام وتتبع الإنتاجية
                  </div>
                </div>

                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#24375a]/60 transition-colors cursor-pointer"
                  title="تصغير القائمة"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mx-auto flex flex-col items-center gap-1 py-1">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#24375a]/60 transition-colors cursor-pointer"
                  title="توسيع القائمة"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* User Mini Profile Header */}
          {!isCollapsed ? (
            <div className="px-3.5 py-3 border-b border-[#24375a] bg-[#121c32]/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full border border-slate-600 object-cover"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#182642]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-400 truncate">{currentUser.role || 'account manager'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2.5 flex justify-center border-b border-[#24375a] shrink-0">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#182642]" />
              </div>
            </div>
          )}

          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1.5 text-xs font-medium scrollbar-thin">
            {!isCollapsed && (
              <div className="px-2.5 text-[11px] font-bold text-slate-400 tracking-tight">
                مهام العمل والمتابعة
              </div>
            )}

            {/* Accordion: أنشطة ▾ */}
            <div className="space-y-0.5">
              {!isCollapsed ? (
                <button
                  onClick={() => setActivitiesOpen(!activitiesOpen)}
                  className="w-full text-right flex items-center justify-between px-2.5 py-1 text-slate-300 hover:text-white text-xs font-bold cursor-pointer rounded hover:bg-[#24375a]/40"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-blue-400 fill-blue-400 shrink-0" />
                    <span>أنشطة</span>
                  </div>
                  {activitiesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              ) : null}

              {activitiesOpen && (
                <div className="space-y-1 mt-1 pr-1">
                  {/* 1. تاسكات الفريق والتايمر */}
                  <button
                    onClick={handleSelectAllTasks}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === 'tasks' && !isMentionsFilterActive()
                        ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#24375a]/70'
                    }`}
                    title="تاسكات الفريق والتايمر"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className="w-4 h-4 shrink-0 text-slate-300" />
                      {!isCollapsed && <span className="truncate">تاسكات الفريق والتايمر</span>}
                    </div>
                  </button>

                  {/* 2. مهام منشن لي (@) */}
                  <button
                    onClick={handleSelectMentionTasks}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === 'tasks' && isMentionsFilterActive()
                        ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#24375a]/70'
                    }`}
                    title="مهام منشن لي (@)"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <AtSign className="w-4 h-4 shrink-0 text-slate-300" />
                      {!isCollapsed && <span className="truncate">مهام منشن لي (@)</span>}
                    </div>
                    {!isCollapsed && (
                      <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold font-mono">
                        {myMentionTasksCount}
                      </span>
                    )}
                  </button>

                  {/* 3. الاجتماعات */}
                  <button
                    onClick={() => handleSelectTab('meetings')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === 'meetings'
                        ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#24375a]/70'
                    }`}
                    title="الاجتماعات"
                  >
                    <Calendar className="w-4 h-4 shrink-0 text-slate-300" />
                    {!isCollapsed && <span>الاجتماعات</span>}
                  </button>

                  {/* 4. المكالمات */}
                  <button
                    onClick={() => handleSelectTab('calls')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === 'calls'
                        ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#24375a]/70'
                    }`}
                    title="المكالمات"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0 text-slate-300" />
                    {!isCollapsed && <span>المكالمات</span>}
                  </button>

                  {/* 5. بريد الفريق (Mail) */}
                  <button
                    onClick={() => handleSelectTab('mail')}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === 'mail'
                        ? 'bg-[#2563eb] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#24375a]/70'
                    }`}
                    title="بريد الفريق (Mail)"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Mail className="w-4 h-4 shrink-0 text-slate-300" />
                      {!isCollapsed && <span className="truncate">بريد الفريق (Mail)</span>}
                    </div>
                    {!isCollapsed && unreadEmailsCount > 0 && (
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold font-mono">
                        {unreadEmailsCount}
                      </span>
                    )}
                  </button>

                  {/* 6. ملفات العملاء والشيتات (Selected in screenshot) */}
                  <button
                    onClick={() => handleSelectTab('renewals')}
                    className={`w-full text-right flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activeTab === 'renewals'
                        ? 'bg-[#2563eb] text-white font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-[#24375a]/70'
                    }`}
                    title="ملفات العملاء والشيتات"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Boxes className="w-4 h-4 shrink-0 text-slate-300" />
                      {!isCollapsed && <span className="truncate">ملفات العملاء والشيتات</span>}
                    </div>
                    {!isCollapsed && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                        activeTab === 'renewals'
                          ? 'bg-blue-400/30 text-white'
                          : 'bg-slate-900 text-cyan-300 border border-slate-700'
                      }`}>
                        {clientCount} عميل
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Profile & Password Card (Exact match to screenshot bottom) */}
          {!isCollapsed ? (
            <div className="p-2.5 border-t border-[#24375a] bg-[#121c32]/80 shrink-0">
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#182642] border border-[#24375a]">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full border border-slate-600 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Settings className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">تعديل البروفايل والباسورد</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTab('profile')}
                  className="px-2.5 py-1 bg-[#24375a] hover:bg-blue-600 text-white rounded text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  title="تعديل البروفايل والباسورد"
                >
                  تعديل
                </button>
              </div>

              {/* Logout button */}
              <div className="mt-2 flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    try {
                      if (typeof window !== 'undefined' && window.history) {
                        window.history.replaceState({}, '', '/');
                      }
                    } catch (e) {}
                    logoutUser();
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-rose-300 hover:text-white py-1 px-2 rounded hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>تسجيل الخروج</span>
                </button>

                <span className="text-[10px] text-slate-500 font-mono">
                  Swift Mynd
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2 border-t border-[#24375a] flex flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => handleSelectTab('profile')}
                className="p-1.5 rounded hover:bg-[#24375a] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="تعديل البروفايل والباسورد"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined' && window.history) {
                      window.history.replaceState({}, '', '/');
                    }
                  } catch (e) {}
                  logoutUser();
                }}
                className="p-1.5 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
      ) : (
        /* ========================================================= */
        /* 2. DESKTOP SIDEBAR: ADMIN VIEW (FULL SYSTEM CAPABILITIES) */
        /* ========================================================= */
        <aside
          className={`hidden md:flex bg-[#223458] text-[#cbd5e1] border-l border-[#2d456f] shrink-0 transition-all duration-300 flex-col z-30 select-none ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Top Header: In RTL: Blue Logo + Swift Mynd CRM ▾ on the right, Collapse button on the left */}
          <div className="h-14 border-b border-[#2d456f] flex items-center justify-between px-3 text-white">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                {/* Right side: Blue Logo + Swift Mynd CRM ▾ */}
                <div
                  onClick={() => setIsBrandModalOpen(true)}
                  className="flex items-center gap-2 cursor-pointer group"
                  title="إعدادات وهوية المنظومة"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#2563eb] hover:bg-blue-600 flex items-center justify-center text-white shadow-xs transition-colors shrink-0">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-wide text-white group-hover:text-blue-200 transition-colors">
                      Swift Mynd CRM
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb] group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Left side: Collapse Icon */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-[#9bb0cb] hover:text-white p-1 rounded hover:bg-[#2d456f]/60 transition-colors cursor-pointer"
                  title="تصغير القائمة"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 mx-auto py-1">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-8 h-8 rounded-lg bg-[#2563eb] hover:bg-blue-600 flex items-center justify-center text-white shadow-xs cursor-pointer transition-colors"
                  title="توسيع القائمة"
                >
                  <Layers className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="text-[#9bb0cb] hover:text-white p-1 rounded hover:bg-[#2d456f]/60 transition-colors cursor-pointer"
                  title="توسيع القائمة"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* User Mini Profile Header (When not collapsed) */}
          {!isCollapsed && (
            <div className="px-3 py-2 border-b border-[#2d456f] bg-[#1a2b4c]/60 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full border border-[#2d456f] object-cover"
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-[#223458]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#9bb0cb] truncate">مدير عام النظام (Admin)</div>
                </div>
              </div>
              <button
                onClick={() => setIsBrandModalOpen(true)}
                className="p-1 rounded text-[#9bb0cb] hover:text-white hover:bg-[#2d456f] transition-colors cursor-pointer"
                title="تغيير الشعار"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Scrollable Navigation Body for Admin */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 text-xs font-medium scrollbar-thin">
            {/* Top Direct Items */}
            <div className="space-y-0.5">
              {matchesSearch('الرئيسية') && (
                <button
                  onClick={() => handleSelectTab('home')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="الرئيسية"
                >
                  <Home className={`w-4 h-4 shrink-0 ${activeTab === 'home' ? 'text-white' : 'text-[#38bdf8]'}`} />
                  {!isCollapsed && <span>الرئيسية</span>}
                </button>
              )}

              {matchesSearch('قائمة انتظار العمل') && (
                <button
                  onClick={() => handleSelectTab('tasks')}
                  className={`w-full text-right flex items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="قائمة انتظار العمل"
                >
                  <div className="flex items-center gap-3">
                    <Inbox className={`w-4 h-4 shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-[#fb923c]'}`} />
                    {!isCollapsed && <span>قائمة انتظار العمل</span>}
                  </div>
                  {!isCollapsed && pendingTasksCount > 0 && (
                    <span className="text-[10px] bg-[#fb923c]/20 text-[#fb923c] px-1.5 py-0.2 rounded font-mono font-bold">
                      {pendingTasksCount}
                    </span>
                  )}
                </button>
              )}

              {matchesSearch('التقارير') && (
                <button
                  onClick={() => handleSelectTab('reports')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="التقارير"
                >
                  <BarChart2 className={`w-4 h-4 shrink-0 ${activeTab === 'reports' ? 'text-white' : 'text-[#f43f5e]'}`} />
                  {!isCollapsed && <span>التقارير</span>}
                </button>
              )}

              {matchesSearch('التحليلات') && (
                <button
                  onClick={() => handleSelectTab('analytics')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="التحليلات"
                >
                  <PieChart className={`w-4 h-4 shrink-0 ${activeTab === 'analytics' ? 'text-white' : 'text-[#c084fc]'}`} />
                  {!isCollapsed && <span>التحليلات</span>}
                </button>
              )}

              {matchesSearch('العاملون') && (
                <button
                  onClick={() => handleSelectTab('team')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="العاملون"
                >
                  <Bot className={`w-4 h-4 shrink-0 ${activeTab === 'team' ? 'text-white' : 'text-[#fbbf24]'}`} />
                  {!isCollapsed && <span>العاملون</span>}
                </button>
              )}

              {matchesSearch('تقييم الأداء') && (
                <button
                  onClick={() => handleSelectTab('performance')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'performance'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="تقييم الأداء والموظفين"
                >
                  <Award className={`w-4 h-4 shrink-0 ${activeTab === 'performance' ? 'text-white' : 'text-[#34d399]'}`} />
                  {!isCollapsed && <span>تقييم الأداء والموظفين</span>}
                </button>
              )}

              {matchesSearch('الحضور') && (
                <button
                  onClick={() => handleSelectTab('delays')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'delays'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="الحضور والتأخيرات"
                >
                  <Clock className={`w-4 h-4 shrink-0 ${activeTab === 'delays' ? 'text-white' : 'text-[#fbbf24]'}`} />
                  {!isCollapsed && <span>الحضور والتأخيرات</span>}
                </button>
              )}

              {matchesSearch('قواعد') && (
                <button
                  onClick={() => handleSelectTab('company_rules')}
                  className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                    activeTab === 'company_rules'
                      ? 'bg-[#2f4874] text-white font-bold'
                      : 'text-[#e2e8f0] hover:bg-[#2b416a] hover:text-white'
                  }`}
                  title="قواعد وسياسات الشركة"
                >
                  <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === 'company_rules' ? 'text-white' : 'text-[#818cf8]'}`} />
                  {!isCollapsed && <span>قواعد وسياسات الشركة</span>}
                </button>
              )}
            </div>

            {/* Workspace Bar & Search */}
            {!isCollapsed && (
              <div className="pt-2 pb-1 border-t border-[#2d456f] mt-2">
                <div className="flex items-center justify-between px-2 py-1 text-xs text-[#cbd5e1]">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <span className="w-6 h-6 rounded bg-[#ea580c] text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0">
                      مف
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">مساحة فريق CRM</span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb]" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(true)}
                    className="text-[#9bb0cb] hover:text-white p-1 rounded cursor-pointer hover:bg-[#2b416a]/60"
                    title="خيارات مساحة العمل"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative mt-2 px-1">
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={e => setSidebarSearch(e.target.value)}
                    placeholder="بحث في القوائم..."
                    className="w-full bg-[#182642] text-slate-200 placeholder-[#7990b5] text-xs rounded pr-8 pl-3 py-1.5 border border-[#2d456f] focus:outline-none focus:border-blue-400"
                  />
                  <Search className="w-3.5 h-3.5 text-[#7990b5] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Accordion 1: المبيعات */}
            <div className="pt-1">
              {!isCollapsed ? (
                <button
                  onClick={() => setSalesOpen(!salesOpen)}
                  className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-[#e2e8f0] hover:text-white text-xs font-bold cursor-pointer rounded hover:bg-[#2b416a]/50"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6] shrink-0" />
                    <span>المبيعات</span>
                  </div>
                  {salesOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9bb0cb]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb]" />}
                </button>
              ) : (
                <div className="h-px bg-[#2d456f] my-1" />
              )}

              {(!isCollapsed ? salesOpen : true) && (
                <div className="space-y-0.5 pr-2 mt-0.5">
                  {matchesSearch('العملاء المحتملون') && (
                    <button
                      onClick={() => handleSelectTab('leads')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'leads' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="العملاء المحتملون"
                    >
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'leads' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>العملاء المحتملون</span>}
                    </button>
                  )}

                  {matchesSearch('جهات اتصال') && (
                    <button
                      onClick={() => handleSelectTab('contacts')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'contacts' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="جهات اتصال"
                    >
                      <Contact className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'contacts' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>جهات اتصال</span>}
                    </button>
                  )}

                  {matchesSearch('الحسابات') && (
                    <button
                      onClick={() => handleSelectTab('accounts')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'accounts' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="الحسابات"
                    >
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'accounts' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>الحسابات</span>}
                    </button>
                  )}

                  {matchesSearch('صفقات') && (
                    <button
                      onClick={() => handleSelectTab('deals')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'deals' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="صفقات"
                    >
                      <Briefcase className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'deals' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>صفقات</span>}
                    </button>
                  )}

                  {matchesSearch('التنبؤات') && (
                    <button
                      onClick={() => handleSelectTab('forecasts')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'forecasts' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="التنبؤات"
                    >
                      <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'forecasts' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>التنبؤات</span>}
                    </button>
                  )}

                  {matchesSearch('المستندات') && (
                    <button
                      onClick={() => handleSelectTab('documents')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'documents' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="المستندات"
                    >
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'documents' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>المستندات</span>}
                    </button>
                  )}

                  {matchesSearch('الحملات') && (
                    <button
                      onClick={() => handleSelectTab('campaigns')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeTab === 'campaigns' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                      }`}
                      title="الحملات"
                    >
                      <Megaphone className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'campaigns' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span>الحملات</span>}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: أنشطة */}
            <div className="pt-1">
              {!isCollapsed ? (
                <button
                  onClick={() => setActivitiesOpen(!activitiesOpen)}
                  className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-[#e2e8f0] hover:text-white text-xs font-bold cursor-pointer rounded hover:bg-[#2b416a]/50"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6] shrink-0" />
                    <span>أنشطة</span>
                  </div>
                  {activitiesOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9bb0cb]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb]" />}
                </button>
              ) : (
                <div className="h-px bg-[#2d456f] my-1" />
              )}

              {(!isCollapsed ? activitiesOpen : true) && (
                <div className="space-y-0.5 pr-2 mt-0.5">
                  <button
                    onClick={() => handleSelectTab('tasks')}
                    className={`w-full text-right flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'tasks' ? 'bg-[#2f4874] text-white font-bold shadow-xs' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="مهام العمل والمتابعة"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'tasks' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                      {!isCollapsed && <span className="truncate whitespace-nowrap">مهام العمل والمتابعة</span>}
                    </div>
                  </button>

                  <button
                    onClick={() => handleSelectTab('meetings')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'meetings' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="الاجتماعات"
                  >
                    <Calendar className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'meetings' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>الاجتماعات</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('calls')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'calls' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="المكالمات"
                  >
                    <PhoneCall className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'calls' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>المكالمات</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 3: المخزون */}
            <div className="pt-1">
              {!isCollapsed ? (
                <button
                  onClick={() => setInventoryOpen(!inventoryOpen)}
                  className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-[#e2e8f0] hover:text-white text-xs font-bold cursor-pointer rounded hover:bg-[#2b416a]/50"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6] shrink-0" />
                    <span>المخزون</span>
                  </div>
                  {inventoryOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9bb0cb]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb]" />}
                </button>
              ) : (
                <div className="h-px bg-[#2d456f] my-1" />
              )}

              {(!isCollapsed ? inventoryOpen : true) && (
                <div className="space-y-0.5 pr-2 mt-0.5">
                  <button
                    onClick={() => handleSelectTab('inventory')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'inventory' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="المنتجات"
                  >
                    <Package className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'inventory' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>المنتجات</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 4: المالية والعقود */}
            <div className="pt-1">
              {!isCollapsed ? (
                <button
                  onClick={() => setFinanceOpen(!financeOpen)}
                  className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-[#e2e8f0] hover:text-white text-xs font-bold cursor-pointer rounded hover:bg-[#2b416a]/50"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6] shrink-0" />
                    <span>المالية والعقود</span>
                  </div>
                  {financeOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9bb0cb]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb]" />}
                </button>
              ) : (
                <div className="h-px bg-[#2d456f] my-1" />
              )}

              {(!isCollapsed ? financeOpen : true) && (
                <div className="space-y-0.5 pr-2 mt-0.5">
                  <button
                    onClick={() => handleSelectTab('finance')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'finance' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="المنظومة المالية والمصروفات"
                  >
                    <Wallet className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'finance' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>المنظومة المالية والمصروفات</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('sales_commissions')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'sales_commissions' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="عمولات المبيعات"
                  >
                    <Percent className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'sales_commissions' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>عمولات المبيعات</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('renewals')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'renewals' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="ملفات العملاء وتجديد الاشتراكات"
                  >
                    <Clock className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'renewals' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>ملفات العملاء والاشتراكات</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('suspended_contracts')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'suspended_contracts' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="العقود الموقوفة"
                  >
                    <PauseCircle className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'suspended_contracts' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>العقود الموقوفة</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('payroll')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'payroll' || activeTab === 'salaries' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="سجل الحضور والرواتب"
                  >
                    <DollarSign className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'payroll' || activeTab === 'salaries' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>سجل الرواتب والحضور</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 5: التسويق والتطوير */}
            <div className="pt-1">
              {!isCollapsed ? (
                <button
                  onClick={() => setMarketingOpen(!marketingOpen)}
                  className="w-full text-right flex items-center justify-between px-2.5 py-1.5 text-[#e2e8f0] hover:text-white text-xs font-bold cursor-pointer rounded hover:bg-[#2b416a]/50"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6] shrink-0" />
                    <span>التسويق والتطوير</span>
                  </div>
                  {marketingOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9bb0cb]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9bb0cb]" />}
                </button>
              ) : (
                <div className="h-px bg-[#2d456f] my-1" />
              )}

              {(!isCollapsed ? marketingOpen : true) && (
                <div className="space-y-0.5 pr-2 mt-0.5">
                  <button
                    onClick={() => handleSelectTab('marketing')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'marketing' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="لوحة التسويق والحملات"
                  >
                    <Megaphone className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'marketing' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>لوحة التسويق</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('marketing_ideas')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'marketing_ideas' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="أفكار التسويق والملاحظات"
                  >
                    <Lightbulb className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'marketing_ideas' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>أفكار التسويق</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('host_migration')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'host_migration' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="نقل الأنظمة والاستضافة"
                  >
                    <Server className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'host_migration' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>نقل الأنظمة والهوست</span>}
                  </button>

                  <button
                    onClick={() => handleSelectTab('system_settings')}
                    className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'system_settings' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                    }`}
                    title="إعدادات المنظومة"
                  >
                    <Sliders className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'system_settings' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                    {!isCollapsed && <span>إعدادات المنظومة</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Communication & Actions */}
            <div className="pt-2 border-t border-[#2d456f] space-y-0.5">
              <button
                onClick={() => handleSelectTab('mail')}
                className={`w-full text-right flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === 'mail' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                }`}
                title="بريد الفريق"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'mail' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                  {!isCollapsed && <span>بريد الفريق</span>}
                </div>
                {!isCollapsed && unreadEmailsCount > 0 && (
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold font-mono">
                    {unreadEmailsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleSelectTab('chat')}
                className={`w-full text-right flex items-center justify-between px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === 'chat' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                }`}
                title="دردشة وتواصل الفريق"
              >
                <div className="flex items-center gap-2.5">
                  <MessagesSquare className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'chat' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                  {!isCollapsed && <span>دردشة الفريق</span>}
                </div>
                {!isCollapsed && unreadChatCount > 0 && (
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold font-mono animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs text-[#9bb0cb] hover:text-white hover:bg-[#2b416a]/60 transition-colors cursor-pointer"
                title="تصدير واستيراد GitHub"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-[#9bb0cb] shrink-0" />
                {!isCollapsed && <span>مزامنة GitHub</span>}
              </button>

              <button
                onClick={() => handleSelectTab('profile')}
                className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                  activeTab === 'profile' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1] hover:text-white hover:bg-[#2b416a]/60'
                }`}
                title="الملف الشخصي"
              >
                <UserCheck className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'profile' ? 'text-white' : 'text-[#9bb0cb]'}`} />
                {!isCollapsed && <span>الملف الشخصي</span>}
              </button>
            </div>
          </div>

          {/* Footer: Logout */}
          <div className="p-2 border-t border-[#2d456f] bg-[#1a2b4c]/70 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                try {
                  if (typeof window !== 'undefined' && window.history) {
                    window.history.replaceState({}, '', '/');
                  }
                } catch (e) {}
                logoutUser();
              }}
              className="flex items-center gap-2 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-rose-950/40"
              title="تسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              {!isCollapsed && <span>تسجيل الخروج</span>}
            </button>
            {!isCollapsed && (
              <span className="text-[10px] text-[#7990b5] font-mono">Admin v2.4</span>
            )}
          </div>
        </aside>
      )}

      {/* ========================================================= */}
      {/* 3. MOBILE DRAWER: ROLE-AWARE (EMPLOYEE vs ADMIN)          */}
      {/* ========================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Panel */}
          <aside className={`relative w-72 sm:w-80 max-w-[85vw] h-full ${!isManager ? 'bg-[#182642]' : 'bg-[#223458]'} text-[#cbd5e1] z-50 shadow-2xl flex flex-col border-l border-[#24375a] animate-in slide-in-from-right duration-200`}>
            {/* Header */}
            <div className="h-14 border-b border-[#24375a] flex items-center justify-between px-3.5 text-white shrink-0">
              {!isManager ? (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <span className="text-blue-400">Cloud</span>
                    <span className="text-slate-500">|</span>
                    <span>Tasks</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">
                    المهام وتتبع الإنتاجية
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-xs">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-white">Swift Mynd CRM</span>
                </div>
              )}

              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#24375a] transition-colors cursor-pointer"
                title="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-3 border-b border-[#24375a] bg-[#121c32]/60 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full border border-slate-600 object-cover"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-1 ring-[#182642]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.role || (isManager ? 'مدير عام النظام' : 'account manager')}
                  </div>
                </div>
              </div>
              <span className="w-6 h-6 rounded bg-[#ea580c] text-white flex items-center justify-center font-bold text-[10px]">
                مف
              </span>
            </div>

            {/* Mobile Scrollable Links */}
            <div className="flex-1 overflow-y-auto py-2.5 px-3 space-y-1.5 text-xs font-medium scrollbar-thin">
              {!isManager ? (
                /* EMPLOYEE MOBILE LINKS */
                <div className="space-y-1.5">
                  <div className="px-2 text-[11px] font-bold text-slate-400">
                    مهام العمل والمتابعة
                  </div>

                  <div className="space-y-1 pr-1">
                    <button
                      onClick={handleSelectAllTasks}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === 'tasks' && !isMentionsFilterActive()
                          ? 'bg-[#2563eb] text-white font-bold'
                          : 'text-slate-300 hover:bg-[#24375a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className="w-4 h-4 text-slate-300" />
                        <span>تاسكات الفريق والتايمر</span>
                      </div>
                    </button>

                    <button
                      onClick={handleSelectMentionTasks}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === 'tasks' && isMentionsFilterActive()
                          ? 'bg-[#2563eb] text-white font-bold'
                          : 'text-slate-300 hover:bg-[#24375a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <AtSign className="w-4 h-4 text-slate-300" />
                        <span>مهام منشن لي (@)</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold font-mono">
                        {myMentionTasksCount}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('meetings')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === 'meetings' ? 'bg-[#2563eb] text-white font-bold' : 'text-slate-300 hover:bg-[#24375a]'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-slate-300" />
                      <span>الاجتماعات</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('calls')}
                      className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === 'calls' ? 'bg-[#2563eb] text-white font-bold' : 'text-slate-300 hover:bg-[#24375a]'
                      }`}
                    >
                      <PhoneCall className="w-4 h-4 text-slate-300" />
                      <span>المكالمات</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('mail')}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === 'mail' ? 'bg-[#2563eb] text-white font-bold' : 'text-slate-300 hover:bg-[#24375a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-slate-300" />
                        <span>بريد الفريق (Mail)</span>
                      </div>
                      {unreadEmailsCount > 0 && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold font-mono">
                          {unreadEmailsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleSelectTab('renewals')}
                      className={`w-full text-right flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        activeTab === 'renewals' ? 'bg-[#2563eb] text-white font-bold shadow-md' : 'text-slate-300 hover:bg-[#24375a]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Boxes className="w-4 h-4 text-slate-300 shrink-0" />
                        <span className="truncate">ملفات العملاء والشيتات</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                        activeTab === 'renewals' ? 'bg-blue-400/30 text-white' : 'bg-slate-900 text-cyan-300 border border-slate-700'
                      }`}>
                        {clientCount} عميل
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ADMIN MOBILE LINKS */
                <div className="space-y-1">
                  <button
                    onClick={() => handleSelectTab('home')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'home' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <Home className="w-4 h-4 text-[#38bdf8]" />
                    <span>الرئيسية</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('tasks')}
                    className={`w-full text-right flex items-center justify-between px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'tasks' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Inbox className="w-4 h-4 text-[#fb923c]" />
                      <span>قائمة انتظار العمل</span>
                    </div>
                    {pendingTasksCount > 0 && (
                      <span className="text-[10px] bg-[#fb923c]/20 text-[#fb923c] px-1.5 py-0.2 rounded font-mono font-bold">
                        {pendingTasksCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSelectTab('reports')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'reports' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4 text-[#f43f5e]" />
                    <span>التقارير</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('analytics')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'analytics' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <PieChart className="w-4 h-4 text-[#c084fc]" />
                    <span>التحليلات</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('team')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'team' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <Bot className="w-4 h-4 text-[#fbbf24]" />
                    <span>العاملون</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('performance')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'performance' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <Award className="w-4 h-4 text-[#34d399]" />
                    <span>تقييم الأداء والموظفين</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('delays')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'delays' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#fbbf24]" />
                    <span>الحضور والتأخيرات</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('company_rules')}
                    className={`w-full text-right flex items-center gap-3 px-3 py-2 rounded text-xs transition-colors cursor-pointer ${
                      activeTab === 'company_rules' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#e2e8f0] hover:bg-[#2b416a]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#818cf8]" />
                    <span>قواعد وسياسات الشركة</span>
                  </button>

                  {/* Folders in mobile */}
                  <div className="pt-2 border-t border-[#2d456f] space-y-1">
                    <div className="px-2 py-1 text-[11px] font-bold text-white flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6]" />
                      <span>المبيعات</span>
                    </div>
                    <div className="space-y-0.5 pr-2">
                      <button
                        onClick={() => handleSelectTab('leads')}
                        className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs ${activeTab === 'leads' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#9bb0cb]" />
                        <span>العملاء المحتملون</span>
                      </button>
                      <button
                        onClick={() => handleSelectTab('deals')}
                        className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs ${activeTab === 'deals' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                      >
                        <Briefcase className="w-3.5 h-3.5 text-[#9bb0cb]" />
                        <span>صفقات</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2d456f] space-y-1">
                    <div className="px-2 py-1 text-[11px] font-bold text-white flex items-center gap-2">
                      <Folder className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6]" />
                      <span>المالية والعقود</span>
                    </div>
                    <div className="space-y-0.5 pr-2">
                      <button
                        onClick={() => handleSelectTab('finance')}
                        className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs ${activeTab === 'finance' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                      >
                        <Wallet className="w-3.5 h-3.5 text-[#9bb0cb]" />
                        <span>المنظومة المالية</span>
                      </button>
                      <button
                        onClick={() => handleSelectTab('sales_commissions')}
                        className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs ${activeTab === 'sales_commissions' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                      >
                        <Percent className="w-3.5 h-3.5 text-[#9bb0cb]" />
                        <span>عمولات المبيعات</span>
                      </button>
                      <button
                        onClick={() => handleSelectTab('renewals')}
                        className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs ${activeTab === 'renewals' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                      >
                        <Clock className="w-3.5 h-3.5 text-[#9bb0cb]" />
                        <span>ملفات العملاء والاشتراكات</span>
                      </button>
                      <button
                        onClick={() => handleSelectTab('payroll')}
                        className={`w-full text-right flex items-center gap-2.5 px-3 py-1.5 rounded text-xs ${activeTab === 'payroll' || activeTab === 'salaries' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                      >
                        <DollarSign className="w-3.5 h-3.5 text-[#9bb0cb]" />
                        <span>الرواتب والحضور</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2d456f] space-y-1">
                    <button
                      onClick={() => handleSelectTab('mail')}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded text-xs ${activeTab === 'mail' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#9bb0cb]" />
                        <span>بريد الفريق</span>
                      </div>
                      {unreadEmailsCount > 0 && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold font-mono">
                          {unreadEmailsCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleSelectTab('chat')}
                      className={`w-full text-right flex items-center justify-between px-3 py-2 rounded text-xs ${activeTab === 'chat' ? 'bg-[#2f4874] text-white font-bold' : 'text-[#cbd5e1]'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MessagesSquare className="w-4 h-4 text-[#9bb0cb]" />
                        <span>دردشة الفريق</span>
                      </div>
                      {unreadChatCount > 0 && (
                        <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold font-mono animate-pulse">
                          {unreadChatCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            <div className="p-3 border-t border-[#24375a] bg-[#121c32]/80 shrink-0 flex items-center justify-between">
              <button
                onClick={() => {
                  onCloseMobile?.();
                  try {
                    if (typeof window !== 'undefined' && window.history) {
                      window.history.replaceState({}, '', '/');
                    }
                  } catch (e) {}
                  logoutUser();
                }}
                className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white font-bold py-1.5 px-3 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>تسجيل الخروج</span>
              </button>

              <button
                onClick={() => handleSelectTab('profile')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold py-1.5 px-3 rounded bg-[#24375a]/70 hover:bg-blue-600 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>تعديل البروفايل</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
