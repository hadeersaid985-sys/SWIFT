import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Users,
  Briefcase,
  Calendar,
  Building,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SwiftMyndLogo } from './common/SwiftMyndLogo';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    team,
    orgId,
    orgName,
    searchQuery,
    setSearchQuery,
    setOpenQuickModal,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    clearNotifications,
    setActiveTab,
    tasks,
    leads,
    deals,
    emails,
    resetToDemoData,
    brandConfig
  } = useCRM();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  const addRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search results
  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? {
        tasks: tasks.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
        deals: deals.filter(d => d.title.toLowerCase().includes(q) || d.company.toLowerCase().includes(q)),
        leads: leads.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q)),
        team: team.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)),
        emails: emails.filter(e => e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q))
      }
    : null;

  const totalResults = searchResults
    ? searchResults.tasks.length +
      searchResults.deals.length +
      searchResults.leads.length +
      searchResults.team.length +
      searchResults.emails.length
    : 0;

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Workspace */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <SwiftMyndLogo variant="full" size="md" isDark={true} />
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline mr-2">
              {orgId} | مساحة فريق CRM
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchPopover(true);
              }}
              onFocus={() => setShowSearchPopover(true)}
              placeholder="بحث في المهام، الصفقات، البريد، جهات الاتصال، وأعضاء الفريق..."
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-400 text-xs sm:text-sm rounded-lg pr-9 pl-8 py-2 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchPopover && q && (
            <div className="absolute top-11 right-0 left-0 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[460px] overflow-y-auto">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>نتائج البحث عن: <strong className="text-slate-900">"{searchQuery}"</strong></span>
                <span className="font-semibold text-blue-600">({totalResults} نتيجة)</span>
              </div>

              {totalResults === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  لا توجد نتائج مطابقة لبحثك في النظام
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {searchResults?.tasks.length ? (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 px-2 uppercase flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> المهام ({searchResults.tasks.length})
                      </div>
                      {searchResults.tasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          onClick={() => {
                            setActiveTab('tasks');
                            setShowSearchPopover(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-400 mr-2 shrink-0">{task.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {searchResults?.deals.length ? (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 px-2 uppercase flex items-center gap-1 mb-1">
                        <Briefcase className="w-3 h-3 text-emerald-600" /> الصفقات ({searchResults.deals.length})
                      </div>
                      {searchResults.deals.slice(0, 3).map(deal => (
                        <div
                          key={deal.id}
                          onClick={() => {
                            setActiveTab('deals');
                            setShowSearchPopover(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate">{deal.title} - {deal.company}</span>
                          <span className="text-[10px] font-bold text-emerald-600 mr-2 shrink-0">{deal.value.toLocaleString()} {deal.currency}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {searchResults?.leads.length ? (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 px-2 uppercase flex items-center gap-1 mb-1">
                        <Building className="w-3 h-3 text-purple-600" /> العملاء المحتملون ({searchResults.leads.length})
                      </div>
                      {searchResults.leads.slice(0, 3).map(lead => (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setActiveTab('leads');
                            setShowSearchPopover(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-medium text-slate-800">{lead.name} ({lead.company})</span>
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">{lead.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {searchResults?.team.length ? (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 px-2 uppercase flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3 text-cyan-600" /> فريق العمل ({searchResults.team.length})
                      </div>
                      {searchResults.team.map(member => (
                        <div
                          key={member.id}
                          onClick={() => {
                            setActiveTab('team');
                            setShowSearchPopover(false);
                          }}
                          className="px-2.5 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2 text-xs"
                        >
                          <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-medium text-slate-800">{member.name}</span>
                          <span className="text-[10px] text-slate-500">({member.role})</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add (+) Menu */}
          <div className="relative" ref={addRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              title="إضافة سريعة"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة جديدة</span>
            </button>

            {showAddMenu && (
              <div className="absolute left-0 sm:right-auto sm:left-0 top-10 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  إضافة سريعة في النظام
                </div>
                <button
                  onClick={() => {
                    setOpenQuickModal('task');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">مهمة عمل جديدة</span>
                    <span className="text-[10px] text-slate-500">تحديد موعد وتعيين عضو</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('mail');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">إنشاء بريد إلكتروني</span>
                    <span className="text-[10px] text-slate-500">إرسال للتيم أو العميل</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('lead');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Building className="w-4 h-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold">عميل محتمل (Lead)</span>
                    <span className="text-[10px] text-slate-500">تسجيل بيانات فرصة</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('deal');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">صفقة مبيعات جديدة</span>
                    <span className="text-[10px] text-slate-500">إضافة قيمة في الـ Pipeline</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('meeting');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-rose-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold">جدولة اجتماع / مكالمة</span>
                    <span className="text-[10px] text-slate-500">تحديد موعد ورابط اللقاء</span>
                  </div>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    setOpenQuickModal('member');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-600" />
                  <div className="flex flex-col">
                    <span className="font-semibold">إضافة عضو جديد للفريق</span>
                    <span className="text-[10px] text-slate-500">تحديد المسمى والصلاحيات</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg relative transition-colors cursor-pointer"
              title="الإشعارات والتنبيهات"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute left-0 top-11 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs sm:text-sm">مركز التنبيهات ومواعيد المهام</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      تحديد كمقروء
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      مسح
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      لا توجد إشعارات جديدة حالياً
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.linkTab) setActiveTab(notif.linkTab);
                          setShowNotifMenu(false);
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          !notif.isRead
                            ? 'bg-blue-50/70 border-blue-200'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            {notif.type === 'task_deadline' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            {notif.type === 'email' && <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                            {notif.type === 'deal_won' && <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                            <span>{notif.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('هل تريد إعادة تعيين البيانات التجريبية لنظام CRM؟')) {
                resetToDemoData();
              }
            }}
            title="إعادة ضبط البيانات التجريبية"
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer hidden md:flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile Switcher */}
          <div className="relative border-r border-slate-700 pr-2 mr-1" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-right"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-600 shadow-xs"
                />
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400">{currentUser.role}</span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute left-0 top-11 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <div className="p-2 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-700 rounded-full">
                      {currentUser.department}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 text-[11px] font-bold text-slate-400">تبديل حساب المستخدم (تجربة الأدوار):</div>
                <div className="space-y-1">
                  {team.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentUser(m);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-right p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        m.id === currentUser.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{m.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{m.department}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('team');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-center text-xs text-blue-600 hover:underline py-1"
                  >
                    عرض الملف الشخصي والفريق كامل
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
