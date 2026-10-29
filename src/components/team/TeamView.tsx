import React, { useState, useRef } from 'react';
import {
  Users,
  Mail,
  Phone,
  CheckSquare,
  Plus,
  Briefcase,
  Building,
  Search,
  Filter,
  Send,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  KeyRound,
  LogIn,
  Edit3,
  Trash2,
  ExternalLink,
  MessageSquare,
  Share2,
  Linkedin,
  Github,
  Sparkles,
  UserCheck,
  UserX,
  AtSign,
  X,
  Sliders,
  DollarSign,
  Calendar,
  Clock,
  CreditCard,
  ArrowDownToLine,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser } from '../../context/CRMContext';
import { TeamMember, AccessLevel } from '../../types/crm';
import { PayrollAttendanceView } from '../payroll/PayrollAttendanceView';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
];

export const TeamView: React.FC = () => {
  const {
    team,
    tasks,
    currentUser,
    setOpenQuickModal,
    setActiveTab,
    deleteTeamMember,
    updateUserCredentials,
    impersonateUser,
    addTeamMember,
    setIsBrandModalOpen,
    updateTeamMemberSalary,
    exportSystemBackup,
    brandConfig
  } = useCRM();

  const currency = brandConfig?.systemCurrency || 'ج.م';

  // Role check: Is current user Manager / Admin?
  const isManager =
    currentUser.accessLevel === 'admin' ||
    currentUser.accessLevel === 'manager' ||
    currentUser.id === 'user-1';

  // Active view tab: 'credentials' (Admin Access Hub) | 'directory' (Cards) | 'salaries' (نظام المرتبات وبداية الموظفين)
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'directory' | 'salaries'>(
    isManager ? 'credentials' : 'directory'
  );
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchMember, setSearchMember] = useState<string>('');

  // Salary editing modal state
  const [editingSalaryMember, setEditingSalaryMember] = useState<TeamMember | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    salary: 0,
    salaryCurrency: 'ر.س',
    allowances: 0,
    contractType: 'دوام كامل' as TeamMember['contractType'],
    joinedDate: ''
  });
  
  // Show/Hide passwords map by memberId
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  // Copied state indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TeamMember>>({});

  // Delete Member Confirmation State
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

  // Add Member Modal State inside TeamView
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    employeeCode: `SM-${100 + team.length + 1}`,
    role: '',
    department: 'المبيعات' as TeamMember['department'],
    email: '',
    secondaryEmail: '',
    phone: '+966 50 000 0000',
    whatsappNumber: '+966 50 000 0000',
    username: '',
    password: 'User@Swift2026',
    accessLevel: 'member' as AccessLevel,
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    linkedin: '',
    slack: '',
    whatsapp: '',
    github: ''
  });

  const editAvatarFileRef = useRef<HTMLInputElement>(null);
  const addAvatarFileRef = useRef<HTMLInputElement>(null);

  const handleEditAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 5 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (res) {
        setEditFormData(prev => ({ ...prev, avatar: res }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 5 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      const res = ev.target?.result as string;
      if (res) {
        setNewMemberData(prev => ({ ...prev, avatar: res }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const departments = [
    'all',
    'المبيعات',
    'التطوير والتقنية',
    'التسويق',
    'خدمة العملاء',
    'الإدارة المالية',
    'الموارد البشرية'
  ];

  const filteredTeam = team.filter(m => {
    // Strict isolation: non-managers can ONLY see their own personal card and profile
    if (!isManager) {
      const isSelf =
        m.id === currentUser.id ||
        (m.username && currentUser.username && m.username.toLowerCase() === currentUser.username.toLowerCase()) ||
        (currentUser.id === 'user-islam' && (m.id === 'user-islam' || m.id === 'user-1793025675186' || m.id === 'user-1793016178916'));
      if (!isSelf) return false;
    }
    if (selectedDept !== 'all' && m.department !== selectedDept) return false;
    if (searchMember.trim()) {
      const q = searchMember.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.employeeCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const togglePasswordVisibility = (memberId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditFormData({
      ...member,
      socialAccounts: { ...member.socialAccounts }
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateUserCredentials(editingMember.id, editFormData);
    setEditingMember(null);
  };

  const handleSaveNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberData.name.trim() || !newMemberData.username.trim()) return;

    addTeamMember({
      name: newMemberData.name,
      employeeCode: newMemberData.employeeCode,
      role: newMemberData.role || 'أخصائي مبيعات',
      department: newMemberData.department,
      email: newMemberData.email || `${newMemberData.username}@swiftmynd.com`,
      secondaryEmail: newMemberData.secondaryEmail,
      phone: newMemberData.phone,
      whatsappNumber: newMemberData.whatsappNumber,
      username: newMemberData.username,
      password: newMemberData.password,
      accessLevel: newMemberData.accessLevel,
      isAccountActive: newMemberData.isAccountActive,
      avatar: newMemberData.avatar,
      status: 'online',
      socialAccounts: {
        linkedin: newMemberData.linkedin,
        slack: newMemberData.slack,
        whatsapp: newMemberData.whatsapp,
        github: newMemberData.github
      }
    });

    setIsAddModalOpen(false);
    setNewMemberData({
      name: '',
      employeeCode: `SM-${100 + team.length + 2}`,
      role: '',
      department: 'المبيعات',
      email: '',
      secondaryEmail: '',
      phone: '+966 50 000 0000',
      whatsappNumber: '+966 50 000 0000',
      username: '',
      password: 'User@Swift2026',
      accessLevel: 'member',
      isAccountActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      linkedin: '',
      slack: '',
      whatsapp: '',
      github: ''
    });
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Sw!ft${result}`;
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in text-xs">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{isManager ? 'إدارة فريق العمل، الحسابات وكلمات المرور' : 'دليل فريق العمل والزملاء بالمنظومة'}</span>
              <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                {isManager ? 'swiftmynd Manager Hub' : 'swiftmynd Directory'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isManager
                ? 'كل عضو له يوزر وباسورد واكسيس وصلاحيات محددة. كمدير يمكنك الدخول لحساب أي عضو، تعديل بياناته، وإضافة الأرقام والايميلات والاكونتات.'
                : 'دليل التواصل مع زملاء الفريق وتوزيع المهام والمراسلة المباشرة.'}
            </p>
          </div>
        </div>

        {isManager && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBrandModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap text-xs"
              title="تعديل لوجو سويفت، اسم المنظومة، ورفع شعار مخصص"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>تعديل لوجو سويفت والاسم</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ إضافة عضو جديد بحساب وأرقام كاملة</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">إجمالي العاملين بالمنظومة</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{team.length} أعضاء</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {team.filter(m => m.isAccountActive).length} حسابات نشطة ومفعلة
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">المدراء وصلاحيات الإدارة</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {team.filter(m => m.accessLevel === 'admin' || m.accessLevel === 'manager').length}
          </div>
          <div className="text-[10px] text-blue-600 font-bold mt-0.5">
            {team.filter(m => m.accessLevel === 'admin').length} مدير عام + {team.filter(m => m.accessLevel === 'manager').length} مدراء أقسام
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">الأرقام والايميلات المسجلة</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            كل الحسابات مزودة برقم هاتف وايميل وباسورد
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">
            {isManager ? 'المهام المكلفة قيد العمل' : 'مهامي المكلفة قيد العمل'}
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {(isManager ? tasks : tasks.filter(t => isTaskAssignedToUser(t, currentUser))).filter(t => t.status !== 'completed').length} تاسك
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {isManager ? 'موزعة بين أعضاء الفريق بمؤقتات متابعة' : 'المهام المباشرة المكلف بها حالياً'}
          </div>
        </div>
      </div>

      {/* Sub Tabs: Credentials Hub vs Cards View */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Toggle View Mode */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold overflow-x-auto max-w-full scrollbar-none">
          {isManager && (
            <button
              onClick={() => setActiveSubTab('credentials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer shrink-0 ${
                activeSubTab === 'credentials'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>لوحة تحكم المدير: الحسابات، كلمات المرور، والصلاحيات</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
                {team.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('directory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'directory'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>{isManager ? 'بطاقات الفريق ومتابعة أعباء المهام' : 'دليل الزملاء وفريق العمل'}</span>
          </button>

          {isManager && (
            <button
              onClick={() => setActiveSubTab('salaries')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer shrink-0 ${
                activeSubTab === 'salaries'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className={`w-3.5 h-3.5 ${activeSubTab === 'salaries' ? 'text-white' : 'text-emerald-600'}`} />
              <span>مرتبات الموظفين وبدايتهم بالشركة (للأدمن 🔒)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeSubTab === 'salaries' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'}`}>
                {team.reduce((acc, m) => acc + (m.salary || 0), 0).toLocaleString()} ر.س
              </span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-1 max-w-lg justify-start sm:justify-end flex-wrap w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'جميع الأقسام' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:flex-initial w-full sm:w-56">
            <input
              type="text"
              value={searchMember}
              onChange={e => setSearchMember(e.target.value)}
              placeholder="بحث بالاسم أو اليوزر أو الهاتف..."
              className="w-full bg-slate-50 pr-7 pl-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* VIEW 1: ADMIN CREDENTIALS & ACCOUNTS HUB (MAIN REQUEST) */}
      {activeSubTab === 'credentials' && (
        <div className="space-y-3">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-blue-950 block text-[13px]">
                  مركز صلاحيات المدير العام (Manager Access & Credentials Center)
                </strong>
                <p className="text-blue-800 text-[11px] mt-0.5">
                  هنا تجد بيانات الدخول لجميع أفراد التيم (اليوزر والباسورد والأرقام والايميلات والاكونتات). يمكنك النقر على <strong>"دخول فوري بحسابه"</strong> لتسجيل الدخول مباشرة كالموظف واستعراض النظام كما يراه تماماً، أو النقر على <strong>"تعديل الحساب"</strong> لتحديث بياناته وكلمة مروره وأرقام التواصل.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => exportSystemBackup()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition-all cursor-pointer text-[11px] flex items-center gap-1.5"
                title="تصدير وتنزيل نسخة احتياطية لبيانات الفريق والسيستم كاملاً (JSON)"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs transition-all cursor-pointer text-[11px]"
              >
                + إضافة موظف وحساب
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="min-w-[850px] w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold">
                    <th className="py-3 px-4">الموظف والكود</th>
                    <th className="py-3 px-3">القسم والمسمى</th>
                    <th className="py-3 px-3">اليوزر (اسم الدخول)</th>
                    <th className="py-3 px-3">كلمة المرور (الباسورد)</th>
                    <th className="py-3 px-3">الصلاحية (الاكسيس)</th>
                    <th className="py-3 px-3">أرقام التواصل (الهاتف / واتساب)</th>
                    <th className="py-3 px-3">البريد الإلكتروني</th>
                    <th className="py-3 px-3">الاكونتات</th>
                    <th className="py-3 px-4 text-center">إجراءات المدير (دخول / تعديل)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeam.map(member => {
                    const isCurrent = member.id === currentUser.id;
                    const isPwVisible = !!showPasswords[member.id];
                    const memberTasksCount = tasks.filter(t => isTaskAssignedToUser(t, member) && t.status !== 'completed').length;

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isCurrent ? 'bg-blue-50/40 font-semibold' : ''
                        }`}
                      >
                        {/* Member & Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(member)}
                              className="relative group shrink-0 cursor-pointer"
                              title="انقر لتعديل صورة أو بيانات العضو 📷"
                            >
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                              />
                              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span
                                className={`w-2.5 h-2.5 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 ${
                                  member.status === 'online'
                                    ? 'bg-emerald-500'
                                    : member.status === 'busy'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-400'
                                }`}
                              />
                            </button>
                            <div>
                              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.2 rounded">
                                    أنت الآن
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                كود: <span className="font-bold text-slate-600">{member.employeeCode}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dept & Role */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{member.role}</div>
                          <div className="text-[10px] text-slate-500">{member.department}</div>
                        </td>

                        {/* Username */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 bg-slate-100/90 px-2 py-1 rounded-md border border-slate-200/80 w-fit">
                            <span className="font-mono text-blue-700 font-bold text-[11px] select-all">
                              {member.username}
                            </span>
                            <button
                              onClick={() => copyToClipboard(member.username, `user-${member.id}`)}
                              className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                              title="نسخ اسم المستخدم"
                            >
                              {copiedKey === `user-${member.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 bg-slate-100/90 px-2 py-1 rounded-md border border-slate-200/80 w-fit">
                            <span className="font-mono font-bold text-[11px] text-slate-800 select-all min-w-[70px]">
                              {isPwVisible ? member.password : '••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(member.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                              title={isPwVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            >
                              {isPwVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(member.password, `pw-${member.id}`)}
                              className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                              title="نسخ كلمة المرور"
                            >
                              {copiedKey === `pw-${member.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Access Level */}
                        <td className="py-3 px-3">
                          {member.accessLevel === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                              <ShieldCheck className="w-3 h-3 text-rose-600" />
                              <span>مدير عام (Admin)</span>
                            </span>
                          ) : member.accessLevel === 'manager' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                              <Shield className="w-3 h-3 text-amber-600" />
                              <span>مدير قسم (Manager)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                              <span>موظف (Member)</span>
                            </span>
                          )}
                        </td>

                        {/* Phone & WhatsApp */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-800 dir-ltr text-right">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{member.phone}</span>
                            </div>
                            {member.whatsappNumber && (
                              <a
                                href={`https://wa.me/${member.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-mono dir-ltr text-right"
                                title="مراسلة عبر واتساب"
                              >
                                <MessageSquare className="w-2.5 h-2.5 shrink-0" />
                                <span>واتساب: {member.whatsappNumber}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Emails */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700 select-all">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{member.email}</span>
                            </div>
                            {member.secondaryEmail && (
                              <div className="text-[10px] text-slate-400 font-mono select-all truncate max-w-[140px]" title={member.secondaryEmail}>
                                بديل: {member.secondaryEmail}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Social / Work Accounts */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {member.socialAccounts?.linkedin && (
                              <a
                                href={member.socialAccounts.linkedin.startsWith('http') ? member.socialAccounts.linkedin : `https://${member.socialAccounts.linkedin}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors"
                                title="لينكد إن"
                              >
                                <Linkedin className="w-3 h-3" />
                              </a>
                            )}
                            {member.socialAccounts?.slack && (
                              <span
                                className="p-1 rounded bg-slate-100 text-slate-600 text-[10px] font-mono"
                                title={`سلاك: ${member.socialAccounts.slack}`}
                              >
                                {member.socialAccounts.slack}
                              </span>
                            )}
                            {member.socialAccounts?.whatsapp && (
                              <span className="p-1 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px]">
                                WA
                              </span>
                            )}
                            {member.socialAccounts?.github && (
                              <span className="p-1 rounded bg-slate-100 text-slate-700">
                                <Github className="w-3 h-3" />
                              </span>
                            )}
                            {!member.socialAccounts?.linkedin && !member.socialAccounts?.slack && !member.socialAccounts?.github && (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </div>
                        </td>

                        {/* Manager Actions: Impersonate / Edit */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Impersonate / Direct login as employee */}
                            {!isCurrent ? (
                              <button
                                onClick={() => impersonateUser(member.id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                                title={`تسجيل الدخول الفوري بحساب ${member.name} لاستعراض مهامه ومؤقتاته`}
                              >
                                <LogIn className="w-3 h-3" />
                                <span>دخول كـ {member.name.split(' ')[0]}</span>
                              </button>
                            ) : (
                              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">
                                حسابك الحالي
                              </span>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="تعديل بيانات الحساب والأرقام والاكسيس"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Assign Task */}
                            <button
                              onClick={() => {
                                setActiveTab('tasks');
                                setOpenQuickModal('task');
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="تكليف بمهمة جديدة"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Member Button */}
                            {!isCurrent && member.id !== 'user-1' && (
                              <button
                                onClick={() => setMemberToDelete(member)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 rounded-lg transition-colors cursor-pointer"
                                title={`حذف الموظف (${member.name}) من النظام`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CARDS & WORKLOAD VIEW */}
      {activeSubTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeam.map(member => {
            const memberTasks = tasks.filter(t => isTaskAssignedToUser(t, member));
            const pendingTasks = memberTasks.filter(t => t.status !== 'completed');
            const completedTasks = memberTasks.filter(t => t.status === 'completed');
            const completionRate =
              memberTasks.length > 0
                ? Math.round((completedTasks.length / memberTasks.length) * 100)
                : 100;

            const isCurrent = member.id === currentUser.id;

            return (
              <div
                key={member.id}
                className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 relative ${
                  isCurrent ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-3 left-3 bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    أنت (المستخدم الحالي)
                  </span>
                )}

                {/* Profile Header */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(member)}
                    className="relative shrink-0 group cursor-pointer"
                    title="انقر لتعديل صورة أو بيانات العضو 📷"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`w-3 h-3 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 ${
                        member.status === 'online'
                          ? 'bg-emerald-500'
                          : member.status === 'busy'
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">
                      {member.name}
                    </h3>
                    <div className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                      {member.role}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{member.department}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-slate-600 font-bold">{member.employeeCode}</span>
                    </div>
                  </div>
                </div>

                {/* Username & Credentials Card (Manager Only) OR Contact Card (Member View) */}
                {isManager ? (
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-sans font-bold text-slate-500 text-[10px]">يوزر الدخول:</span>
                      <span className="font-bold text-blue-700 select-all">{member.username}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-sans font-bold text-slate-500 text-[10px]">كلمة المرور:</span>
                      <span className="font-bold text-slate-800 select-all">
                        {showPasswords[member.id] ? member.password : '••••••••'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/50">
                      <span className="font-sans font-bold text-slate-500 text-[10px]">الهاتف:</span>
                      <span className="dir-ltr text-right text-slate-700">{member.phone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800 select-all truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono dir-ltr text-right text-slate-800">{member.phone}</span>
                    </div>
                  </div>
                )}

                {/* Workload */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">عبء المهام:</span>
                    <span className="text-slate-900">
                      {pendingTasks.length} جارية / {completedTasks.length} منجزة
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>نسبة الإنجاز</span>
                      <span className="font-bold text-slate-700">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          completionRate >= 70
                            ? 'bg-emerald-500'
                            : completionRate >= 40
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  {isManager && !isCurrent && (
                    <button
                      onClick={() => impersonateUser(member.id)}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="دخول مباشر لحساب الموظف"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>دخول كـ {member.name.split(' ')[0]}</span>
                    </button>
                  )}

                  {isManager ? (
                    <button
                      onClick={() => handleOpenEdit(member)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="تعديل الحساب والأرقام"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>تعديل</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab('mail');
                        setOpenQuickModal('mail');
                      }}
                      className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>مراسلة</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('tasks');
                      setOpenQuickModal('task');
                    }}
                    className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="تكليف بمهمة"
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>مهمة</span>
                  </button>

                  {isManager && !isCurrent && member.id !== 'user-1' && (
                    <button
                      onClick={() => setMemberToDelete(member)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title={`حذف الموظف (${member.name}) من النظام`}
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: SALARIES, ATTENDANCE & PROFIT (سيستم الرواتب والحضور والغياب والمكسب الشامل - للأدمن فقط) */}
      {activeSubTab === 'salaries' && isManager && (
        <PayrollAttendanceView />
      )}
      {false && activeSubTab === 'salaries' && isManager && (
        <div className="space-y-4 animate-in fade-in">
          {/* Payroll KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-100 text-xs font-bold">إجمالي مسير الرواتب الشهري</span>
                <DollarSign className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="text-2xl font-black mt-2 font-mono">
                {team.reduce((acc, m) => acc + (m.salary || 0), 0).toLocaleString()} ر.س
              </div>
              <div className="text-[10px] text-emerald-100 mt-1">الرواتب الأساسية المعتمدة لـ {team.length} موظفين</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">إجمالي البدلات والمكافآت</span>
                <CreditCard className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black mt-2 font-mono text-slate-900">
                {team.reduce((acc, m) => acc + (m.allowances || 0), 0).toLocaleString()} {currency}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">بدلات إشراف، انتقال، وعمولات صفقات</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">إجمالي الحزمة المالية الشهرية</span>
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black mt-2 font-mono text-blue-600">
                {team.reduce((acc, m) => acc + (m.salary || 0) + (m.allowances || 0), 0).toLocaleString()} {currency}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">الراتب الأساسي + البدلات الشهرية</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-bold">عقود العمل بالشركة</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black mt-2 text-slate-900">
                {team.filter(m => m.contractType === 'دوام كامل' || !m.contractType).length} دوام كامل
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                + {team.filter(m => m.contractType === 'عقد استشاري').length} عقد استشاري ومرن
              </div>
            </div>
          </div>

          {/* Salaries Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>مسير رواتب الموظفين وبدايتهم في الشركة (Salaries & Tenure Tracker)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    خاص بالإدارة العليا 🔒
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  بيانات الرواتب، البدلات، تاريخ بداية العمل في الشركة، الحسابات البنكية، وأنواع العقود.
                </p>
              </div>

              <div className="text-[11px] text-slate-600 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                تاريخ المسير: <span className="font-mono text-emerald-700">أكتوبر 2026</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-extrabold text-[11px]">
                    <th className="py-3 px-4">الموظف والكود</th>
                    <th className="py-3 px-3">القسم والمسمى</th>
                    <th className="py-3 px-3 text-center">تاريخ البداية بالشركة</th>
                    <th className="py-3 px-3 text-center">مدة الخدمة</th>
                    <th className="py-3 px-3 text-left">الراتب الأساسي</th>
                    <th className="py-3 px-3 text-left">البدلات والمكافآت</th>
                    <th className="py-3 px-3 text-left">إجمالي الراتب</th>
                    <th className="py-3 px-3">نوع العقد وساعات العمل</th>
                    <th className="py-3 px-3">الآيبان البنكي (IBAN)</th>
                    <th className="py-3 px-3 text-center">إجراءات المدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeam.map(member => {
                    const baseSal = member.salary || 0;
                    const allow = member.allowances || 0;
                    const totalSal = baseSal + allow;
                    const curr = member.salaryCurrency || currency;

                    // Calculate tenure
                    let tenureText = 'غير محدد';
                    if (member.joinedDate) {
                      const join = new Date(member.joinedDate);
                      const now = new Date(2026, 9, 20); // 2026-10-20
                      const diffMonths = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
                      const years = Math.floor(diffMonths / 12);
                      const months = diffMonths % 12;
                      if (years > 0 && months > 0) {
                        tenureText = `${years} سنة و${months} أشهر`;
                      } else if (years > 0) {
                        tenureText = `${years} سنوات`;
                      } else {
                        tenureText = `${months} أشهر`;
                      }
                    }

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {member.id === 'user-1' && (
                                  <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-bold">
                                    المدير
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                {member.employeeCode}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{member.role}</div>
                          <span className="text-[10px] text-slate-400">{member.department}</span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono font-bold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                            <span>{member.joinedDate || '2023-01-15'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            {tenureText}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-left font-mono font-black text-slate-900">
                          {baseSal.toLocaleString()} {curr}
                        </td>

                        <td className="py-3 px-3 text-left font-mono font-bold text-amber-700">
                          {allow > 0 ? `+${allow.toLocaleString()} ${curr}` : '-'}
                        </td>

                        <td className="py-3 px-3 text-left font-mono font-black text-emerald-700 text-sm">
                          {totalSal.toLocaleString()} {curr}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            member.contractType === 'عقد استشاري'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-50 text-blue-700'
                          }`}>
                            {member.contractType || 'دوام كامل'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                            {member.workingHours || '8 ساعات يومياً'}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-mono text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200/60 truncate max-w-[150px]" title={member.bankIban || 'SA4420000001234567890123'}>
                            {member.bankIban || 'SA4420000001234567890123'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setEditingSalaryMember(member);
                              setSalaryForm({
                                salary: member.salary || 10000,
                                salaryCurrency: member.salaryCurrency || currency,
                                allowances: member.allowances || 0,
                                contractType: member.contractType || 'دوام كامل',
                                joinedDate: member.joinedDate || '2023-01-15'
                              });
                            }}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 mx-auto"
                            title="تعديل الراتب والبدلات وتاريخ البداية"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-600" />
                            <span>تعديل الراتب</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE SALARY & TENURE */}
      {editingSalaryMember && (
        <div
          onClick={() => setEditingSalaryMember(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden cursor-default"
          >
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">
                    تعديل الراتب وتاريخ البداية: {editingSalaryMember.name}
                  </h3>
                  <p className="text-[10px] text-emerald-100">
                    كود: {editingSalaryMember.employeeCode} | {editingSalaryMember.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSalaryMember(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateTeamMemberSalary(
                  editingSalaryMember.id,
                  salaryForm.salary,
                  salaryForm.salaryCurrency,
                  salaryForm.allowances,
                  salaryForm.contractType,
                  salaryForm.joinedDate
                );
                setEditingSalaryMember(null);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">الراتب الأساسي الشهري:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={salaryForm.salary}
                    onChange={e => setSalaryForm({ ...salaryForm, salary: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <select
                    value={salaryForm.salaryCurrency}
                    onChange={e => setSalaryForm({ ...salaryForm, salaryCurrency: e.target.value })}
                    className="px-3 py-2 border border-slate-300 rounded-lg font-bold bg-slate-50 focus:outline-none cursor-pointer"
                  >
                    <option value="ج.م">ج.م (مصري)</option>
                    <option value="ر.س">ر.س (سعودي)</option>
                    <option value="د.ك">د.ك (كويتي)</option>
                    <option value="د.إ">د.إ (إماراتي)</option>
                    <option value="$">$ (دولار)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">البدلات والمكافآت الشهرية:</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={salaryForm.allowances}
                  onChange={e => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ بداية العمل في الشركة:</label>
                <input
                  type="date"
                  value={salaryForm.joinedDate}
                  onChange={e => setSalaryForm({ ...salaryForm, joinedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع العقد:</label>
                <select
                  value={salaryForm.contractType}
                  onChange={e => setSalaryForm({ ...salaryForm, contractType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white focus:outline-none cursor-pointer"
                >
                  <option value="دوام كامل">دوام كامل (Full Time)</option>
                  <option value="دوام جزئي">دوام جزئي (Part Time)</option>
                  <option value="عقد استشاري">عقد استشاري (Consultant)</option>
                  <option value="عقد فريلانس">عقد فريلانس (Freelance)</option>
                </select>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-semibold text-[11px] flex items-center justify-between">
                <span>إجمالي الحزمة الشهرية الجديدة:</span>
                <span className="font-mono font-black text-sm">
                  {((salaryForm.salary || 0) + (salaryForm.allowances || 0)).toLocaleString()} {salaryForm.salaryCurrency}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSalaryMember(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT MEMBER CREDENTIALS & ACCOUNTS */}
      {editingMember && (
        <div
          onClick={() => setEditingMember(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] cursor-default"
          >
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">
                    تعديل بيانات الحساب والوصول: {editingMember.name}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    كود: {editingMember.employeeCode} | كمدير يمكنك تحديث اليوزر، الباسورد، الأرقام والاكونتات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Profile Avatar Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-2">
                  صورة الملف الشخصي / الأفاتار (Profile Avatar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Avatar Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={
                        editFormData.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={editFormData.name || 'avatar'}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 shadow-sm"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => editAvatarFileRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="تغيير الصورة"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upload button & URL input */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={editAvatarFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditAvatarFile}
                      />
                      <button
                        type="button"
                        onClick={() => editAvatarFileRef.current?.click()}
                        className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer text-[11px] transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة من جهازك</span>
                      </button>
                      {editFormData.avatar && (
                        <button
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, avatar: '' })}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                          title="حذف الصورة والرجوع للافتراضي"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="أو الصق رابط صورة مباشر (URL)..."
                        value={editFormData.avatar || ''}
                        onChange={e => setEditFormData({ ...editFormData, avatar: e.target.value })}
                        className="w-full pl-2 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex items-center justify-between">
                    <span>أو اختر صورة جاهزة سريعة:</span>
                    <span className="text-slate-400">انقر للتطبيق الفوري</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((presetUrl, idx) => {
                      const isSelected = editFormData.avatar === presetUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, avatar: presetUrl })}
                          className={`relative rounded-full shrink-0 transition-transform hover:scale-105 cursor-pointer ${
                            isSelected ? 'ring-2 ring-blue-600 scale-105' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${idx + 1}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name || ''}
                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي</label>
                  <input
                    type="text"
                    value={editFormData.role || ''}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Department & Access Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم</label>
                  <select
                    value={editFormData.department}
                    onChange={e => setEditFormData({ ...editFormData, department: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="المبيعات">المبيعات</option>
                    <option value="التطوير والتقنية">التطوير والتقنية</option>
                    <option value="التسويق">التسويق</option>
                    <option value="خدمة العملاء">خدمة العملاء</option>
                    <option value="الإدارة المالية">الإدارة المالية</option>
                    <option value="الموارد البشرية">الموارد البشرية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مستوى الصلاحية (الاكسيس)</label>
                  <select
                    value={editFormData.accessLevel}
                    onChange={e => setEditFormData({ ...editFormData, accessLevel: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="admin">مدير عام للنظام (Admin - كامل الصلاحيات)</option>
                    <option value="manager">مدير قسم (Manager - صلاحيات إدارية)</option>
                    <option value="member">عضو فريق وموظف (Member - تنفيذ وتتبع مهام)</option>
                    <option value="viewer">مشاهد فقط (Viewer)</option>
                  </select>
                </div>
              </div>

              {/* System Credentials (Username & Password) */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="font-extrabold text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>بيانات الدخول للنظام (اليوزر والباسورد):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, password: generateRandomPassword() })}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    توليد كلمة مرور جديدة تلقائياً
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (اليوزر) *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.username || ''}
                      onChange={e => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">كلمة المرور (الباسورد) *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.password || ''}
                      onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Numbers (Phone & WhatsApp) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الرسمي</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب (WhatsApp)</label>
                  <input
                    type="text"
                    value={editFormData.whatsappNumber || ''}
                    onChange={e => setEditFormData({ ...editFormData, whatsappNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Emails (Official & Secondary) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد المؤسسي الرسمي</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد البديل / الشخصي</label>
                  <input
                    type="email"
                    value={editFormData.secondaryEmail || ''}
                    onChange={e => setEditFormData({ ...editFormData, secondaryEmail: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Accounts (LinkedIn, Slack, etc.) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>اكونتات التواصل والعمل (LinkedIn / Slack):</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">رابط حساب LinkedIn</label>
                    <input
                      type="text"
                      value={editFormData.socialAccounts?.linkedin || ''}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          socialAccounts: {
                            ...editFormData.socialAccounts,
                            linkedin: e.target.value
                          }
                        })
                      }
                      placeholder="linkedin.com/in/username"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">معرف سلاك (Slack Handle)</label>
                    <input
                      type="text"
                      value={editFormData.socialAccounts?.slack || ''}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          socialAccounts: {
                            ...editFormData.socialAccounts,
                            slack: e.target.value
                          }
                        })
                      }
                      placeholder="@username"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingMember.id !== 'user-1' && editingMember.id !== currentUser.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDel = editingMember;
                      setMemberToDelete(toDel);
                    }}
                    className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title={`حذف حساب ${editingMember.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الموظف</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer"
                  >
                    حفظ التعديلات وتحديث الحساب
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW MEMBER COMPLETE MODAL */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] cursor-default"
          >
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">
                    إضافة عضو جديد وتعيين حسابه وبيانات دخوله
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    أدخل الاسم، المسمى، اليوزر، الباسورد، الأرقام والاكونتات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMember} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Profile Avatar Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-2">
                  صورة الملف الشخصي / الأفاتار (Profile Avatar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Avatar Preview */}
                  <div className="relative group shrink-0">
                    <img
                      src={
                        newMemberData.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={newMemberData.name || 'avatar'}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 shadow-sm"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addAvatarFileRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="تغيير الصورة"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Upload button & URL input */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={addAvatarFileRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleAddAvatarFile}
                      />
                      <button
                        type="button"
                        onClick={() => addAvatarFileRef.current?.click()}
                        className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer text-[11px] transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>رفع صورة من جهازك</span>
                      </button>
                      {newMemberData.avatar && (
                        <button
                          type="button"
                          onClick={() => setNewMemberData({ ...newMemberData, avatar: '' })}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                          title="حذف الصورة والرجوع للافتراضي"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="أو الصق رابط صورة مباشر (URL)..."
                        value={newMemberData.avatar || ''}
                        onChange={e => setNewMemberData({ ...newMemberData, avatar: e.target.value })}
                        className="w-full pl-2 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1.5 flex items-center justify-between">
                    <span>أو اختر صورة جاهزة سريعة:</span>
                    <span className="text-slate-400">انقر للتطبيق الفوري</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((presetUrl, idx) => {
                      const isSelected = newMemberData.avatar === presetUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewMemberData({ ...newMemberData, avatar: presetUrl })}
                          className={`relative rounded-full shrink-0 transition-transform hover:scale-105 cursor-pointer ${
                            isSelected ? 'ring-2 ring-blue-600 scale-105' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${idx + 1}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newMemberData.name}
                    onChange={e => setNewMemberData({ ...newMemberData, name: e.target.value })}
                    placeholder="مثال: يوسف الرشيدي"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={newMemberData.role}
                    onChange={e => setNewMemberData({ ...newMemberData, role: e.target.value })}
                    placeholder="مثال: مستشار مبيعات كبار العملاء"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم</label>
                  <select
                    value={newMemberData.department}
                    onChange={e => setNewMemberData({ ...newMemberData, department: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="المبيعات">المبيعات</option>
                    <option value="التطوير والتقنية">التطوير والتقنية</option>
                    <option value="التسويق">التسويق</option>
                    <option value="خدمة العملاء">خدمة العملاء</option>
                    <option value="الإدارة المالية">الإدارة المالية</option>
                    <option value="الموارد البشرية">الموارد البشرية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مستوى الصلاحية (الاكسيس)</label>
                  <select
                    value={newMemberData.accessLevel}
                    onChange={e => setNewMemberData({ ...newMemberData, accessLevel: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="member">عضو فريق وموظف (Member)</option>
                    <option value="manager">مدير قسم (Manager)</option>
                    <option value="admin">مدير عام (Admin)</option>
                    <option value="viewer">مشاهد فقط (Viewer)</option>
                  </select>
                </div>
              </div>

              {/* Login Credentials */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="font-extrabold text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>بيانات الدخول للنظام (اليوزر والباسورد):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewMemberData({ ...newMemberData, password: generateRandomPassword() })}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                  >
                    توليد كلمة مرور
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (اليوزر) *</label>
                    <input
                      type="text"
                      required
                      value={newMemberData.username}
                      onChange={e => setNewMemberData({ ...newMemberData, username: e.target.value })}
                      placeholder="مثال: yousef.rashidi"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">كلمة المرور (الباسورد) *</label>
                    <input
                      type="text"
                      required
                      value={newMemberData.password}
                      onChange={e => setNewMemberData({ ...newMemberData, password: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newMemberData.phone}
                    onChange={e => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    value={newMemberData.whatsappNumber}
                    onChange={e => setNewMemberData({ ...newMemberData, whatsappNumber: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد المؤسسي</label>
                  <input
                    type="email"
                    value={newMemberData.email}
                    onChange={e => setNewMemberData({ ...newMemberData, email: e.target.value })}
                    placeholder="yousef.rashidi@swiftmynd.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد البديل</label>
                  <input
                    type="email"
                    value={newMemberData.secondaryEmail}
                    onChange={e => setNewMemberData({ ...newMemberData, secondaryEmail: e.target.value })}
                    placeholder="yousef.personal@gmail.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Accounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حساب LinkedIn</label>
                  <input
                    type="text"
                    value={newMemberData.linkedin}
                    onChange={e => setNewMemberData({ ...newMemberData, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حساب Slack</label>
                  <input
                    type="text"
                    value={newMemberData.slack}
                    onChange={e => setNewMemberData({ ...newMemberData, slack: e.target.value })}
                    placeholder="@username"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs cursor-pointer"
                >
                  إضافة العضو وتفعيل حسابه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE TEAM MEMBER CONFIRMATION */}
      {memberToDelete && (
        <div
          onClick={() => setMemberToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden cursor-default"
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                تأكيد حذف الموظف
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف حساب الموظف{' '}
                <strong className="text-rose-600 font-extrabold">
                  "{memberToDelete.name}"
                </strong>{' '}
                (كود: {memberToDelete.employeeCode} | يوزر: {memberToDelete.username}) نهائياً من المنظومة؟
              </p>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] text-right mb-4 leading-relaxed">
                ⚠️ سيتم حذف حسابه وكافة بيانات دخوله من النظام نهائياً، ولن يتمكن من الدخول للمنظومة بعد ذلك.
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTeamMember(memberToDelete.id);
                    if (editingMember?.id === memberToDelete.id) {
                      setEditingMember(null);
                    }
                    setMemberToDelete(null);
                  }}
                  className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  نعم، حذف الموظف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
