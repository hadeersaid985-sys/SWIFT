import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Calendar,
  Settings,
  Grid,
  Store,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Building,
  Briefcase,
  Users,
  KeyRound,
  ShieldCheck,
  LogIn,
  LogOut,
  Lock,
  Eye,
  AtSign,
  RotateCcw,
  Edit3,
  Sliders,
  Trash2,
  ChevronDown,
  Check,
  FolderClock,
  BarChart3,
  FileText,
  Megaphone,
  Clock,
  Sun,
  Copy,
  Camera,
  Image as ImageIcon,
  Palette,
  FolderGit2,
  UserCheck
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { SwiftMyndLogo } from './common/SwiftMyndLogo';

interface TopNavbarProps {
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenLoginModal, onLogout }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    isImpersonating,
    impersonateUser,
    returnToAdmin,
    team,
    setOpenQuickModal,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    clearNotifications,
    tasks,
    deals,
    leads,
    reports,
    deleteReports,
    clearTeamExceptAdmin,
    clearCompletedTasks,
    clearUserAddedData,
    setIsResetModalOpen,
    setIsBrandModalOpen,
    resetBrandConfig,
    setIsAdminPinModalOpen,
    setIsDailyDigestOpen,
    setIsGitHubModalOpen,
    digestOverdueCount,
    digestTodayCount,
    logoutUser
  } = useCRM();

  const isManagerUser = Boolean(
    currentUser &&
      (currentUser.accessLevel === 'admin' ||
        currentUser.accessLevel === 'manager' ||
        currentUser.id === 'user-1')
  );

  const [topSearch, setTopSearch] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showSearchPopover, setShowSearchPopover] = useState(false);

  // Top action confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const addRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const deleteRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setShowAddMenu(false);
      if (editRef.current && !editRef.current.contains(e.target as Node)) setShowEditMenu(false);
      if (deleteRef.current && !deleteRef.current.contains(e.target as Node)) setShowDeleteMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifMenu(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettingsMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Title translation
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'work_queue':
        return 'قائمة انتظار العمل';
      case 'reports':
        return 'التقارير';
      case 'tasks':
        return 'المهام ومواعيدها';
      case 'team':
        return 'فريق العمل (الموظفين)';
      case 'mail':
        return 'بريد الفريق (SwiftMail)';
      case 'analytics':
        return 'التحليلات';
      case 'home':
        return 'الرئيسية';
      case 'leads':
        return 'العملاء المحتملون';
      case 'deals':
        return 'صفقات المبيعات';
      case 'contacts':
        return 'جهات اتصال';
      case 'accounts':
        return 'الحسابات';
      case 'meetings':
        return 'الاجتماعات';
      case 'calls':
        return 'المكالمات';
      case 'campaigns':
        return 'الحملات';
      case 'documents':
        return 'المستندات';
      case 'forecasts':
        return 'التنبؤات';
      case 'inventory':
        return 'المخزون';
      case 'support':
        return 'الدعم';
      case 'integrations':
        return 'عمليات التكامل';
      case 'mcp':
        return 'MCP الذكاء الاصطناعي';
      case 'payroll':
      case 'salaries':
        return 'المرتبات والحضور والأرباح (خاص بالإدارة) 🔒';
      case 'profile':
        return 'الملف الشخصي وإعدادات الحساب 👤';
      default:
        return 'swiftmynd CRM';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-2xs">
      {/* Right Side: Swift Logo & Quick Logo Edit & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <SwiftMyndLogo
          variant="horizontal"
          size="sm"
          isDark={false}
          showSubtitle={false}
          onClick={() => setActiveTab('home')}
        />
        <button
          onClick={() => setIsBrandModalOpen(true)}
          className="flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          title="تغيير اللوجو واسم النظام مباشرة من الواجهة الرئيسية"
        >
          <Camera className="w-3 h-3" />
          <span className="hidden sm:inline">تغيير اللوجو</span>
        </button>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <h1 className="text-base font-bold text-slate-800 tracking-tight hidden sm:block">
          {getTabTitle(activeTab)}
        </h1>
      </div>

      {/* Left Side: Tools & Actions (Search pill, +, Zia, Bell, Calendar, Settings, User) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input Pill */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <input
            type="text"
            value={topSearch}
            onChange={e => setTopSearch(e.target.value)}
            placeholder="البحث عن السجلات"
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-slate-700 placeholder-slate-400 text-xs rounded-full pr-8 pl-4 py-1.5 border border-transparent focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
        </div>

        {/* TOP GLOBAL ACTION GROUP: إضافة | تعديل | حذف */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs">
          {/* 1. ➕ إضافة (Add Menu) */}
          <div className="relative" ref={addRef}>
            <button
              onClick={() => {
                setShowAddMenu(!showAddMenu);
                setShowEditMenu(false);
                setShowDeleteMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="إضافة عناصر وسجلات جديدة من الأعلى"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">إضافة</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {showAddMenu && (
              <div className="absolute left-0 top-10 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>إضافة سجل جديد من الأعلى</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-mono font-bold">+ New</span>
                </div>
                <button
                  onClick={() => {
                    setOpenQuickModal('task');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">مهمة عمل جديدة</div>
                    <div className="text-[10px] text-slate-400">تاسك بمؤقت وتتبع ومنشنات</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('work_queue');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <FolderClock className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold">عنصر لقائمة انتظار العمل</div>
                    <div className="text-[10px] text-slate-400">طابور مهام ومكالمات الانتظار</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-bold">تقرير تحليلي جديد</div>
                    <div className="text-[10px] text-slate-400">إحصاءات البريد والمبيعات</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('deal');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">صفقة مبيعات جديدة</div>
                    <div className="text-[10px] text-slate-400">قيمة مالية ومراحل إغلاق</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('lead');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-bold">عميل محتمل (Lead)</div>
                    <div className="text-[10px] text-slate-400">عميل جديد ومصدر التواصل</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('meeting');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-bold">جدولة اجتماع أو مكالمة</div>
                    <div className="text-[10px] text-slate-400">توقيت ورابط الاجتماع</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setOpenQuickModal('mail');
                    setShowAddMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div className="font-bold">رسالة بريد للفريق</div>
                    <div className="text-[10px] text-slate-400">إرسال تنبيه مباشر</div>
                  </div>
                </button>
                {isManagerUser && (
                  <>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setActiveTab('marketing');
                        setShowAddMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-amber-50/70 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-bold text-amber-900">كارت أو حملة ماركيتنج (الأدمن) 🔒</div>
                        <div className="text-[10px] text-slate-400">GEO AI، استقطاب الكويت، وسوشيال ميديا</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('renewals');
                        setShowAddMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50/70 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="font-bold text-rose-900">موعد تجديد اشتراك عميل 🚨</div>
                        <div className="text-[10px] text-slate-400">تنبيه مسبق بـ 4 أيام وسداد الفواتير</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setOpenQuickModal('member');
                        setShowAddMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-blue-50/60 flex items-center gap-2 text-slate-700 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-slate-600" />
                      <div>
                        <div className="font-bold text-blue-700">إضافة عضو جديد للفريق</div>
                        <div className="text-[10px] text-slate-400">حساب ويوزر وباسورد كامل</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 2. ✏️ تعديل (Edit Menu) */}
          <div className="relative" ref={editRef}>
            <button
              onClick={() => {
                setShowEditMenu(!showEditMenu);
                setShowAddMenu(false);
                setShowDeleteMenu(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200/90 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="تعديل السجلات، اللوجو، الفريق، والمهام من الأعلى"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">تعديل</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showEditMenu && (
              <div className="absolute left-0 top-10 w-60 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                  <span>تعديل السجلات والمنظومة من الأعلى</span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold">Edit Hub</span>
                </div>
                {isManagerUser && (
                  <button
                    onClick={() => {
                      setIsBrandModalOpen(true);
                      setShowEditMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                  >
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-bold text-indigo-900">تعديل لوجو سويفت والاسم والـ Favicon</div>
                      <div className="text-[10px] text-slate-400">تغيير الشعار ورفع صورة وألوان الهوية</div>
                    </div>
                  </button>
                )}
                {isManagerUser && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('marketing');
                        setShowEditMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-amber-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-bold text-amber-900">لوحة الماركيتنج والمخطط والتاسكات (الأدمن) 🔒</div>
                        <div className="text-[10px] text-slate-400">تعديل بوردات التسويق، المحتوى، والخطط</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('renewals');
                        setShowEditMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-rose-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="font-bold text-rose-900">مواعيد تجديد العملاء وتنبيهات الـ 4 أيام 🚨</div>
                        <div className="text-[10px] text-slate-400">تعديل الاشتراكات وتجديد العقود والسداد</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('leads');
                        setShowEditMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-purple-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                    >
                      <Building className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-bold text-purple-900">سجل التعاملات وأرقام العملاء المحتملين</div>
                        <div className="text-[10px] text-slate-400">تعديل أرقام الهواتف وتدوين المكالمات</div>
                      </div>
                    </button>
                  </>
                )}
                {isManagerUser && (
                  <button
                    onClick={() => {
                      setActiveTab('team');
                      setShowEditMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold">تعديل بيانات وحسابات الفريق</div>
                      <div className="text-[10px] text-slate-400">تعديل الباسوردات، الأرقام والأدوار</div>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowEditMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">تعديل وتنظيم مهام العمل</div>
                    <div className="text-[10px] text-slate-400">لوحات كانبان وجداول المهام</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('work_queue');
                    setShowEditMenu(false);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                >
                  <FolderClock className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold">تعديل عناصر قائمة انتظار العمل</div>
                    <div className="text-[10px] text-slate-400">ترتيب الأولويات وحالات الإنجاز</div>
                  </div>
                </button>
                {isManagerUser && (
                  <>
                    <button
                      onClick={() => {
                        setActiveTab('deals');
                        setShowEditMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-bold">تعديل صفقات المبيعات ومراحل البيع</div>
                        <div className="text-[10px] text-slate-400">تحديث المراحل ونسب النجاح</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('reports');
                        setShowEditMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-indigo-50/70 flex items-center gap-2 text-slate-800 cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-cyan-600" />
                      <div>
                        <div className="font-bold">تعديل وتخصيص التقارير</div>
                        <div className="text-[10px] text-slate-400">إدارة مجلدات وتصنيفات التقارير</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3. 🗑️ حذف (Delete Menu) - فقط للمدير العام */}
          {isManagerUser && (
            <div className="relative" ref={deleteRef}>
              <button
                onClick={() => {
                  setShowDeleteMenu(!showDeleteMenu);
                  setShowAddMenu(false);
                  setShowEditMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-800 border border-slate-200/90 hover:border-rose-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="حذف وتفريغ السجلات والبيانات من الأعلى"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">حذف</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showDeleteMenu && (
                <div className="absolute left-0 top-10 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>حذف وتفريغ السجلات من الأعلى</span>
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-mono font-bold">Delete</span>
                  </div>

                  <button
                    onClick={() => {
                      setShowDeleteMenu(false);
                      setConfirmModal({
                        title: 'حذف الفريق بالكامل لتعديله من البداية',
                        message: 'هل أنت متأكد من رغبتك في تفريغ وحذف الفريق بالكامل؟ سيتم الإبقاء على حساب المدير العام فقط لإعادة هيكلة وبناء الفريق وتعديله بالكامل.',
                        confirmLabel: 'نعم، حذف الفريق بالكامل',
                        onConfirm: () => {
                          clearTeamExceptAdmin();
                          showToast('تم تفريغ وحذف الفريق بنجاح، يمكنك الآن تعديل وإضافة الفريق الجديد بالكامل');
                        }
                      });
                    }}
                    className="w-full text-right px-3 py-2.5 hover:bg-rose-50/80 flex items-center gap-2 text-rose-700 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <div className="font-black text-rose-900">حذف الفريق لتعديل الفريق بالكامل</div>
                      <div className="text-[10px] text-rose-600/80">إعادة هيكلة الفريق من الصفر للمدير</div>
                    </div>
                  </button>

                <button
                  onClick={() => {
                    setShowDeleteMenu(false);
                    setConfirmModal({
                      title: 'حذف كافة التقارير',
                      message: 'هل تريد حذف جميع التقارير المنشأة في المنظومة؟',
                      confirmLabel: 'حذف كافة التقارير',
                      onConfirm: () => {
                        deleteReports(reports.map(r => r.id));
                        showToast('تم حذف كافة التقارير بنجاح');
                      }
                    });
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-rose-50/60 flex items-center gap-2 text-slate-700 hover:text-rose-700 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-bold">حذف وتفريغ التقارير ({reports.length})</div>
                    <div className="text-[10px] text-slate-400">حذف كافة تقارير التحليلات</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowDeleteMenu(false);
                    const completedTasks = tasks.filter(t => t.status === 'completed');
                    if (completedTasks.length === 0) {
                      showToast('لا توجد مهام مكتملة لحذفها حالياً');
                      return;
                    }
                    setConfirmModal({
                      title: 'حذف وتفريغ المهام المكتملة',
                      message: `يوجد حالياً ${completedTasks.length} مهمة مكتملة. هل ترغب في حذفها وتفريغ القائمة؟`,
                      confirmLabel: 'حذف المهام المكتملة',
                      onConfirm: () => {
                        clearCompletedTasks();
                        showToast(`تم حذف ${completedTasks.length} مهمة مكتملة بنجاح`);
                      }
                    });
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-rose-50/60 flex items-center gap-2 text-slate-700 hover:text-rose-700 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="font-bold">حذف المهام المكتملة وتصفيتها</div>
                    <div className="text-[10px] text-slate-400">تفريغ المهام المنتهية من البورد</div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() => {
                    setShowDeleteMenu(false);
                    clearUserAddedData();
                    showToast('تم مسح وحذف البيانات المضافة بنجاح');
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-rose-50/60 flex items-center gap-2 text-slate-700 hover:text-rose-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold">مسح البيانات المضافة فقط</div>
                    <div className="text-[10px] text-slate-400">حذف ما أدخلته بدون لمس الإعدادات</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowDeleteMenu(false);
                    setIsResetModalOpen(true);
                  }}
                  className="w-full text-right px-3 py-2 hover:bg-rose-50/60 flex items-center gap-2 text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <div className="font-black text-rose-800">تصفير كامل ومسح كل الداتا (Reset)</div>
                    <div className="text-[10px] text-slate-400">إعادة ضبط المصنع بالكامل للمنظومة</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

        {/* Zia / AI Icon (Manager only) */}
        {isManagerUser && (
          <button
            onClick={() => setActiveTab('mcp')}
            className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-0.5"
            title="مساعد الذكاء الاصطناعي Zia / MCP"
          >
            <span className="text-amber-500 text-sm font-black">Zia</span>
          </button>
        )}

        {/* Calendar Icon */}
        <button
          onClick={() => setActiveTab('meetings')}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="التقويم"
        >
          <Calendar className="w-4 h-4" />
        </button>

        {/* Daily Digest Button (موجز المهام اليومي للموظف) */}
        <button
          onClick={() => setIsDailyDigestOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="موجز المهام اليومي (Daily Digest) - المهام المتأخرة والمجدولة لليوم"
        >
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden md:inline">موجز اليوم 📋</span>
          {(digestOverdueCount + digestTodayCount) > 0 && (
            <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-4 text-center">
              {digestOverdueCount + digestTodayCount}
            </span>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer relative"
            title="الإشعارات ومواعيد المهام ومنشنات الفريق"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="min-w-4 h-4 px-1 bg-rose-600 text-white rounded-full absolute -top-1 -right-1 text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute left-0 top-9 w-84 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-extrabold flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>تنبيهات المنظومة والمنشن (@)</span>
                </span>
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-blue-600 hover:underline text-[11px] font-bold cursor-pointer"
                >
                  تحديد الكل كمقروء
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-400">لا توجد إشعارات جديدة</div>
                ) : (
                  notifications.map(n => {
                    const isMention = n.type === 'task_mention';
                    const isDigest = n.type === 'daily_digest';
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (isDigest) {
                            setIsDailyDigestOpen(true);
                          } else if (n.linkTab) {
                            setActiveTab(n.linkTab);
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`p-2.5 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors flex items-start gap-2.5 ${
                          !n.isRead ? (isMention ? 'bg-blue-50/70' : isDigest ? 'bg-amber-50/70' : 'bg-slate-50/70') : ''
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isMention
                              ? 'bg-blue-600 text-white'
                              : isDigest
                              ? 'bg-amber-500 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isMention ? <AtSign className="w-3.5 h-3.5" /> : isDigest ? <Sun className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 truncate">{n.title}</span>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          {isMention && (
                            <span className="inline-block text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                              @ منشن فوري في مهمة
                            </span>
                          )}
                          {isDigest && (
                            <span className="inline-block text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                              ☀️ موجز المهام اليومي
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Marketplace Store Icon */}
        <button
          onClick={() => setActiveTab('integrations')}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block"
          title="سوق التطبيقات والربط"
        >
          <Store className="w-4 h-4" />
        </button>

        {/* Prominent Direct Change Logo Button */}
        <button
          onClick={() => setIsBrandModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0"
          title="تغيير اللوجو والشعار وهوية المنظومة فوراً"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>تغيير اللوجو 🖼️</span>
        </button>

        {/* Settings Menu Dropdown (Accessible directly from main interface) */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => {
              setShowSettingsMenu(!showSettingsMenu);
              setShowAddMenu(false);
              setShowEditMenu(false);
              setShowDeleteMenu(false);
              setShowNotifMenu(false);
              setShowUserMenu(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'system_settings' || showSettingsMenu
                ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
            }`}
            title="الإعدادات الشاملة للمنظومة وتغيير اللوجو"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">الإعدادات</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showSettingsMenu && (
            <div className="absolute left-0 top-10 w-72 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>إعدادات السيستم وتغيير اللوجو</span>
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold font-mono">
                  Settings
                </span>
              </div>

              {/* 1. Fast Logo Customizer Modal */}
              <button
                onClick={() => {
                  setIsBrandModalOpen(true);
                  setShowSettingsMenu(false);
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-blue-50 flex items-center gap-2.5 text-slate-700 cursor-pointer border-b border-slate-50"
              >
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-blue-900 text-xs flex items-center gap-1">
                    <span>تغيير اللوجو والشعار فوراً</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">سريع ⚡</span>
                  </div>
                  <div className="text-[10px] text-slate-400">رفع صورة من جهازك، أو رابط، أو ضبط الارتفاع</div>
                </div>
              </button>

              {/* 2. Full System Settings View */}
              <button
                onClick={() => {
                  setActiveTab('system_settings');
                  setShowSettingsMenu(false);
                }}
                className="w-full text-right px-3.5 py-2.5 hover:bg-indigo-50 flex items-center gap-2.5 text-slate-700 cursor-pointer border-b border-slate-50"
              >
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-indigo-950 text-xs">صفحة إعدادات الهوية واللوجو الشاملة</div>
                  <div className="text-[10px] text-slate-400">اللوجو، أيقونة المتصفح Favicon، الألوان، والمعاينة الحية</div>
                </div>
              </button>

              {/* 3. Team Management */}
              <button
                onClick={() => {
                  setActiveTab('team');
                  setShowSettingsMenu(false);
                }}
                className="w-full text-right px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-bold text-slate-800">إدارة حسابات فريق العمل والموظفين</div>
                  <div className="text-[10px] text-slate-400">الصلاحيات، كلمات المرور، وإضافة موظف جديد</div>
                </div>
              </button>

              {/* 4. Reset to Default Swift Logo */}
              <button
                onClick={() => {
                  if (window.confirm('هل تريد استعادة شعار سويفت الأصلي الافتراضي؟')) {
                    resetBrandConfig();
                    showToast('تمت استعادة شعار سويفت الافتراضي بنجاح ✨');
                  }
                  setShowSettingsMenu(false);
                }}
                className="w-full text-right px-3.5 py-2 hover:bg-amber-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-bold text-slate-800">استعادة شعار سويفت الأصلي</div>
                  <div className="text-[10px] text-slate-400">إلغاء اللوجو المخصص والرجوع للأيقونة الأصلية</div>
                </div>
              </button>

              {/* GitHub Sync */}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsGitHubModalOpen(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-right px-3.5 py-2 hover:bg-slate-100 flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <FolderGit2 className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>تصدير واستيراد GitHub</span>
                      <span className="text-[9px] bg-cyan-100 text-cyan-800 px-1 py-0.2 rounded font-bold">حفظ الداتا</span>
                    </div>
                    <div className="text-[10px] text-slate-400">حفظ واسترجاع أحدث نسخة من المستودع لعدم فقدان البيانات</div>
                  </div>
                </button>
              </div>

              {/* 5. Reset Data */}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsResetModalOpen(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-right px-3.5 py-2 hover:bg-rose-50 flex items-center gap-2.5 text-rose-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-bold">مسح الداتا وإعادة الضبط (Reset)</div>
                    <div className="text-[10px] text-rose-400">تفريغ السجلات وإعادة السيستم للبداية</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Pill: Only shown for Admin to test employee view */}
        {isManagerUser && (
          <button
            onClick={() => {
              const emp = team.find(m => m.id !== 'user-1' && m.accessLevel !== 'admin');
              if (emp) {
                impersonateUser(emp.id);
                showToast(`تم التبديل لحساب (${emp.name})`);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="تجربة وضع الموظف للتأكد من أن التاسكات فقط تظهر له"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">وضع الأدمن 👑</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">تجربة الموظف</span>
          </button>
        )}

        {/* User Profile Avatar with status dot */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
            title={currentUser.name}
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white absolute bottom-0 right-0" />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute left-0 top-9 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in">
              <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{currentUser.name}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold font-mono">
                    {currentUser.employeeCode}
                  </span>
                </div>
                <div className="text-[11px] text-blue-600 font-bold mt-0.5">{currentUser.role}</div>
                <div className="text-[10px] text-slate-500">{currentUser.department}</div>

                {/* زر الملف الشخصي وتعديل الحساب (الاسم، الصورة، الباسورد) */}
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full mt-2 py-2 px-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  title="تعديل اسمك، صورتك الشخصية، كلمة المرور وبياناتك"
                >
                  <UserCheck className="w-4 h-4 text-white" />
                  <span>الملف الشخصي (الاسم، الصورة، الباسورد) 👤</span>
                </button>

                {/* زر المزامنة والتصدير والاستيراد من GitHub */}
                <button
                  onClick={() => {
                    setIsGitHubModalOpen(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full mt-1.5 py-1.5 px-2 bg-slate-900 hover:bg-black text-cyan-300 border border-cyan-500/30 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  title="تصدير واستيراد أحدث نسخة عبر GitHub لحماية البيانات من المسح"
                >
                  <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>تصدير واستيراد GitHub (حفظ الداتا) 🛡️</span>
                </button>

                <div className="mt-2 pt-2 border-t border-slate-200/60 font-mono text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-sans font-bold text-slate-400">اليوزر:</span>
                    <span className="font-bold text-blue-700 select-all">{currentUser.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-sans font-bold text-slate-400">الباسورد:</span>
                    <span className="font-bold text-slate-800 select-all">{currentUser.password}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-sans font-bold text-slate-400">الهاتف:</span>
                    <span className="dir-ltr text-right text-slate-700">{currentUser.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDailyDigestOpen(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full mt-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>موجز المهام اليومي (Daily Digest)</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    try {
                      if (typeof window !== 'undefined' && window.history) {
                        window.history.replaceState({}, '', '/');
                      }
                    } catch (e) {}
                    if (onLogout) {
                      onLogout();
                    } else {
                      logoutUser();
                    }
                  }}
                  className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span>تسجيل الخروج والعودة للرئيسية</span>
                </button>
              </div>

              {/* Action buttons (Manager / Admin Only) */}
              {isManagerUser && (
                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('team');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>إدارة الحسابات وفريق العمل</span>
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded">كل التيم</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://www.tazkoraio.com/login');
                      showToast('تم نسخ لينك دخول الموظفين: https://www.tazkoraio.com/login 📋');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
                    title="نسخ رابط صفحة تسجيل دخول الموظفين المباشرة"
                  >
                    <span className="flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>نسخ لينك لوجن الموظفين (/login)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded font-mono">
                      tazkoraio
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsBrandModalOpen(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-800 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>تعديل لوجو سويفت واسم المنظومة</span>
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.2 rounded">مدير</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsResetModalOpen(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 hover:text-rose-800 flex items-center justify-between text-xs font-bold cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                      <span>مسح البيانات / Reset</span>
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded">إعادة ضبط</span>
                  </button>
                </div>
              )}

              {isManagerUser && (
                <div className="py-1 border-t border-slate-100 max-h-40 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5">تبديل فوري كعضو آخر:</div>
                  {team.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setCurrentUser(m);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-right px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer ${
                        currentUser && m.id === currentUser.id ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate">{m.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 9 Dots Grid (App Launcher) */}
        <button
          onClick={() => setActiveTab(isManagerUser ? 'home' : 'tasks')}
          className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="كافة التطبيقات"
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* Confirmation Modal for Top Actions */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">{confirmModal.title}</h3>
                <p className="text-[11px] text-slate-500">يرجى التأكيد للمتابعة</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-all cursor-pointer"
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 border border-slate-800">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </header>
  );
};
