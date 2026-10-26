import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Building,
  User,
  ShieldAlert,
  Send,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  History,
  Zap,
  Gift,
  Copy,
  Share2,
  FileSpreadsheet,
  Folder,
  Link2,
  Mail,
  FileText,
  CheckSquare,
  Layers,
  Users,
  Paperclip,
  Download,
  Upload,
  Shield,
  Tag
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientRenewal, RenewalStatus, ClientFileDocument } from '../../types/crm';
import { WhatsAppRenewalModal } from './WhatsAppRenewalModal';
import { ClientInvoiceModal } from './ClientInvoiceModal';
import { exportClientsToExcel } from '../../utils/excelExport';

export const ClientRenewalsView: React.FC = () => {
  const {
    clientRenewals,
    visibleClients,
    team,
    tasks,
    currentUser,
    addClientRenewal,
    updateClientRenewal,
    deleteClientRenewal,
    markRenewalCompleted,
    addClientFile,
    deleteClientFile,
    updateClientFilePermissions,
    addClientNote,
    assignClientTeam,
    renewalsDueSoonCount,
    isManager,
    coachingOffers,
    sendCoachingOffer
  } = useCRM();

  // Subtabs: 'client_dossiers' (ملفات العملاء والشيتات للتيم), 'renewals_list' (مواعيد التجديد), 'timeline', 'coaching_offers', 'swift_accounts'
  const [activeRenewalSubTab, setActiveRenewalSubTab] = useState<'client_dossiers' | 'renewals_list' | 'timeline' | 'coaching_offers' | 'swift_accounts'>('client_dossiers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_soon' | 'active' | 'overdue' | 'renewed'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all'); // تصفية العملاء حسب كل موظف
  const [editingFilePermsId, setEditingFilePermsId] = useState<string | null>(null); // إدارة صلاحيات كل ملف
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);

  // Client Dossier & Sheet States (ملف كل عميل وفولدر المستندات وتوزيع التيم)
  const [selectedClientForDossier, setSelectedClientForDossier] = useState<ClientRenewal | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<'folder' | 'team_visibility' | 'notes' | 'overview' | 'tasks'>('folder');
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFileData, setNewFileData] = useState<{
    name: string;
    category: 'عقد' | 'فاتورة' | 'بريف فني' | 'عرض سعر' | 'ملفات تصميم' | 'أخرى';
    url: string;
    size: string;
    allowedTeamMemberIds: string[];
  }>({
    name: '',
    category: 'عقد',
    url: '',
    size: '1.4 MB',
    allowedTeamMemberIds: []
  });
  const [newClientNoteInput, setNewClientNoteInput] = useState('');
  const [selectedTeamMemberIdsForClient, setSelectedTeamMemberIdsForClient] = useState<string[]>([]);

  const [editingSheetClient, setEditingSheetClient] = useState<ClientRenewal | null>(null);
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [sheetTitleInput, setSheetTitleInput] = useState('');
  const [clientNoteInput, setClientNoteInput] = useState('');
  const [copiedSheetId, setCopiedSheetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState<ClientRenewal | null>(null);
  const [whatsAppModalClient, setWhatsAppModalClient] = useState<ClientRenewal | null>(null);
  const [invoiceModalClient, setInvoiceModalClient] = useState<ClientRenewal | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    id?: string;
    isBulk?: boolean;
    title: string;
  } | null>(null);

  // Active pool: Admin sees all clientRenewals; non-admin employee sees visibleClients
  const activeClientsPool = visibleClients || clientRenewals;

  // Active client being viewed in the dossier modal (always synced with latest state)
  const currentDossierClient = selectedClientForDossier
    ? (visibleClients || clientRenewals).find(c => c.id === selectedClientForDossier.id) || selectedClientForDossier
    : null;

  // Form state
  const [formData, setFormData] = useState<Omit<ClientRenewal, 'id' | 'createdAt'>>({
    clientName: '',
    company: '',
    projectDescription: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    serviceName: 'استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)',
    planCycle: 'سنوي',
    amount: 2500,
    currency: 'ج.م',
    renewalDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'renewing_soon',
    notes: '',
    managedBy: 'هدير سعيد',
    sheetUrl: '',
    sheetTitle: '',
    contractNumber: '',
    assignedTeamMemberIds: []
  });

  // Calculate days remaining helper
  const getDaysRemaining = (renewalDateStr: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const renDate = new Date(renewalDateStr);
    const renTime = new Date(renDate.getFullYear(), renDate.getMonth(), renDate.getDate()).getTime();
    return Math.ceil((renTime - today) / (1000 * 60 * 60 * 24));
  };

  // Filter renewals
  const filteredRenewals = activeClientsPool.filter(r => {
    const diff = getDaysRemaining(r.renewalDate);

    if (statusFilter === 'due_soon') {
      if (r.status === 'renewed' || r.status === 'cancelled') return false;
      if (diff > 4 || diff < 0) return false;
    } else if (statusFilter === 'active') {
      if (r.status !== 'active' && (diff <= 4 || diff < 0)) return false;
    } else if (statusFilter === 'overdue') {
      if (diff >= 0 && r.status !== 'overdue') return false;
    } else if (statusFilter === 'renewed') {
      if (r.status !== 'renewed') return false;
    }

    if (employeeFilter !== 'all') {
      const isAssigned = (r.assignedTeamMemberIds || []).includes(employeeFilter) ||
        r.managedBy === employeeFilter ||
        team.find(m => m.id === employeeFilter)?.name === r.managedBy;
      if (!isAssigned) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.clientName.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q) ||
        (r.projectDescription && r.projectDescription.toLowerCase().includes(q)) ||
        r.serviceName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.renewalDate.includes(q)
      );
    }
    return true;
  });

  // Bulk selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRenewals.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  // Save add/edit submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.company.trim()) return;

    if (editingRenewal) {
      updateClientRenewal(editingRenewal.id, formData);
      setEditingRenewal(null);
    } else {
      addClientRenewal(formData);
      setShowAddModal(false);
    }

    setFormData({
      clientName: '',
      company: '',
      projectDescription: '',
      phone: '',
      whatsappNumber: '',
      email: '',
      serviceName: 'استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)',
      planCycle: 'سنوي',
      amount: 2500,
      currency: 'ج.م',
      renewalDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'renewing_soon',
      notes: '',
      managedBy: 'هدير سعيد',
      sheetUrl: '',
      sheetTitle: '',
      contractNumber: '',
      assignedTeamMemberIds: []
    });
  };

  const handleOpenEdit = (ren: ClientRenewal) => {
    setEditingRenewal(ren);
    setFormData({
      clientName: ren.clientName,
      company: ren.company,
      projectDescription: ren.projectDescription || '',
      phone: ren.phone,
      whatsappNumber: ren.whatsappNumber,
      email: ren.email || '',
      serviceName: ren.serviceName,
      planCycle: ren.planCycle,
      amount: ren.amount,
      currency: ren.currency,
      renewalDate: ren.renewalDate,
      status: ren.status,
      notes: ren.notes || '',
      managedBy: ren.managedBy || 'هدير سعيد',
      sheetUrl: ren.sheetUrl || '',
      sheetTitle: ren.sheetTitle || '',
      contractNumber: ren.contractNumber || '',
      assignedTeamMemberIds: ren.assignedTeamMemberIds || []
    });
  };

  // Open Full Client Dossier
  const handleOpenDossier = (client: ClientRenewal) => {
    setSelectedClientForDossier(client);
    setSelectedTeamMemberIdsForClient(client.assignedTeamMemberIds || []);
    setDossierActiveTab('folder');
  };

  // Toggle Team Member visibility for client
  const handleToggleTeamVisibility = (memberId: string) => {
    if (!currentDossierClient) return;
    const currentList = currentDossierClient.assignedTeamMemberIds || [];
    const updated = currentList.includes(memberId)
      ? currentList.filter(id => id !== memberId)
      : [...currentList, memberId];

    setSelectedTeamMemberIdsForClient(updated);
    assignClientTeam(currentDossierClient.id, updated);
    showToast('تم تحديث صلاحيات ظهور العميل في التيم بنجاح ✅');
  };

  // Add Document to Client Folder
  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDossierClient || !newFileData.name.trim()) return;

    addClientFile(currentDossierClient.id, {
      name: newFileData.name.trim(),
      category: newFileData.category,
      url: newFileData.url.trim() || '#',
      size: newFileData.size || '1.4 MB',
      type: 'pdf',
      uploadedBy: currentUser.name,
      allowedTeamMemberIds: newFileData.allowedTeamMemberIds
    });

    setNewFileData({
      name: '',
      category: 'عقد',
      url: '',
      size: '1.4 MB',
      allowedTeamMemberIds: []
    });
    setShowAddFileModal(false);
    showToast('تمت إضافة المستند وتحديد صلاحيات الوصول بنجاح 📁');
  };

  // Add Note to Client Dossier
  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDossierClient || !newClientNoteInput.trim()) return;

    addClientNote(currentDossierClient.id, newClientNoteInput.trim());
    setNewClientNoteInput('');
    showToast('تم حفظ الملاحظة في سجل العميل 📝');
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  // 1-Click Copy Google Sheet link helper
  const handleCopySheetLink = (e: React.MouseEvent, client: ClientRenewal) => {
    e.stopPropagation();
    if (!client.sheetUrl) {
      showToast('لا يوجد رابط شيت مسجل لهذا العميل حتى الآن');
      return;
    }
    navigator.clipboard.writeText(client.sheetUrl);
    setCopiedSheetId(client.id);
    showToast('تم نسخ رابط الشيت إلى الحافظة بنجاح! 📋');
    setTimeout(() => setCopiedSheetId(null), 2500);
  };

  // Open quick sheet edit modal
  const handleOpenEditSheet = (e: React.MouseEvent, client: ClientRenewal) => {
    e.stopPropagation();
    setEditingSheetClient(client);
    setSheetUrlInput(client.sheetUrl || '');
    setSheetTitleInput(client.sheetTitle || `شيت متابعة ${client.clientName} (${client.company})`);
  };

  // Save quick sheet edit
  const handleSaveSheetLink = () => {
    if (!editingSheetClient) return;
    const updates = {
      sheetUrl: sheetUrlInput.trim() || undefined,
      sheetTitle: sheetTitleInput.trim() || undefined
    };
    updateClientRenewal(editingSheetClient.id, updates);
    if (selectedClientForDossier && selectedClientForDossier.id === editingSheetClient.id) {
      setSelectedClientForDossier({
        ...selectedClientForDossier,
        ...updates
      });
    }
    setEditingSheetClient(null);
    showToast('تم حفظ وتحديث رابط الشيت بنجاح! 📗');
  };

  // Compose WhatsApp message link
  const getWhatsAppLink = (ren: ClientRenewal) => {
    const rawNumber = (ren.whatsappNumber || ren.phone).replace(/[^0-9]/g, '');
    const diff = getDaysRemaining(ren.renewalDate);
    const dayText = diff === 0 ? 'اليوم' : diff === 1 ? 'غداً' : `خلال ${diff} أيام`;

    const msg = encodeURIComponent(
      `السلام عليكم ورحمه الله وبركاته أخي ${ren.clientName} المحترم 🌸\nتحية طيبة من فريق سويفت مايند.\n\nنود تذكيركم بموعد تجديد اشتراك خدمتكم:\n📌 الخدمة: ${ren.serviceName}\n📅 موعد التجديد: ${dayText} (بتاريخ ${ren.renewalDate})\n💰 قيمة الاشتراك: ${ren.amount.toLocaleString()} ${ren.currency}\n\nهل ترغب في تأكيد التجديد وتجهيز رابط السداد والفاتورة الضريبية؟ شاكرين لكم ثقتكم الدائمة بنا.`
    );
    return `https://wa.me/${rawNumber}?text=${msg}`;
  };

  // KPI calculations
  const totalDueSoon = clientRenewals.filter(r => {
    if (r.status === 'renewed' || r.status === 'cancelled') return false;
    const diff = getDaysRemaining(r.renewalDate);
    return diff <= 4 && diff >= 0;
  });

  const totalRevenueExpected = clientRenewals
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-4 pb-12 animate-in fade-in select-text text-xs">
      {/* 4-DAY URGENT RENEWAL ALERT BANNER (طلب المستخدم: "يقدم لي قبلها بـ 4 أيام تنبيه في عملاء هتجدد") */}
      {totalDueSoon.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white p-4 rounded-2xl shadow-md border border-amber-400 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs flex items-center justify-center">
              <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base">
                  🚨 تنبيه إداري عاجل: يوجد {totalDueSoon.length} عملاء موعد تجديدهم خلال 4 أيام!
                </span>
                <span className="text-[10px] bg-white text-rose-700 font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                  تنبيه 4 أيام نشط
                </span>
              </div>
              <p className="text-[11px] text-white/90 mt-0.5">
                تواصل فوراً مع العملاء عبر الواتساب لتأكيد سداد اشتراكات السيرفرات، الهوست والدومينات، وباقات الـ SEO وCRM.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setStatusFilter('due_soon')}
              className="px-3.5 py-1.5 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-xl shadow-xs transition-all cursor-pointer text-xs flex items-center gap-1.5"
            >
              <span>عرض العملاء الـ ({totalDueSoon.length}) المجددين قريباً</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Role Visibility Indicator Banner (واقدر احط كل عميل يظهر لمين في التيم وكله بيظهر للادمن) */}
      <div className="bg-slate-100 border border-slate-200/80 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-800">
            {isManager
              ? 'صلاحيات الأدمن العام 🔒: تظهر جميع ملفات واشتراكات العملاء وفولدراتهم لكافة أعضاء الفريق دون حجب.'
              : `حساب الموظف (${currentUser.name}) 👤: تظهر لك فقط ملفات وفولدرات العملاء المصرح لك برؤيتها.`}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-600">
          المعروض: {filteredRenewals.length} من أصل {clientRenewals.length} عميل
        </span>
      </div>

      {/* TOP HEADER & ACTION BAR (اي حاجة في الموقع فييها اضافة او حذف او تعديل من فوق) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                مواعيد تجديد اشتراكات العملاء والسيرفرات
              </h1>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full font-mono">
                Client Renewals Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة مواعيد استحقاق تجديد الهوست، الـ 2 دومين، باقات الذكاء الاصطناعي GEO، ونظام السيلز مع نظام تنبيهات ذكي قبل 4 أيام.
            </p>
          </div>
        </div>

        {/* TOP CONTROLS: إضافة | تعديل | حذف (من فوق مباشرة) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. ➕ إضافة من فوق */}
          <button
            onClick={() => {
              setEditingRenewal(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
            title="إضافة عميل وموعد تجديد جديد"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ إضافة اشتراك / تجديد عميل</span>
          </button>

          {/* 2. ✏️ تعديل من فوق */}
          {selectedIds.length === 1 && (
            <button
              onClick={() => {
                const target = clientRenewals.find(r => r.id === selectedIds[0]);
                if (target) handleOpenEdit(target);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold rounded-xl transition-all cursor-pointer text-xs"
              title="تعديل بيانات الاشتراك المحدد"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>تعديل المحدد</span>
            </button>
          )}

          {/* 3. 🗑️ حذف من فوق */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                setDeleteConfirmModal({
                  isBulk: true,
                  title: `حذف ${selectedIds.length} اشتراك محدد`
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs animate-in fade-in"
              title="حذف الاشتراكات المحددة"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف المحدد ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">إجمالي اشتراكات العملاء</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{clientRenewals.length} عميل</div>
          <div className="text-[10px] text-slate-500 mt-0.5">مسجلة في قاعدة بيانات سويفت</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs bg-amber-50/30">
          <div className="text-amber-800 font-bold text-[11px] flex items-center gap-1">
            <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>تجديد خلال 4 أيام (تنبيه!)</span>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalDueSoon.length} اشتراك</div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-bold">يستحق التواصل العاجل</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">إجمالي إيراد التجديدات المتوقع</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {totalRevenueExpected.toLocaleString()} ر.س
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">عبر العقود السنوية والشهرية</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">اشتراكات متأخرة عن السداد</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {clientRenewals.filter(r => getDaysRemaining(r.renewalDate) < 0 && r.status !== 'renewed').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">بانتظار تحصيل المستحقات</div>
        </div>
      </div>

      {/* 5 CORE MODES SWITCHER BAR (ملفات العملاء والشيتات للتيم + مواعيد التجديد وتنبيهات 4 أيام + تاريخ كل اكونت + عروض الكوتشن + طلبات سويفت) */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold flex-wrap gap-1">
          {/* SubTab 1: ملفات العملاء والشيتات (Google Sheets) لسهولة وصول التيم */}
          <button
            onClick={() => setActiveRenewalSubTab('client_dossiers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer font-bold ${
              activeRenewalSubTab === 'client_dossiers'
                ? 'bg-emerald-600 text-white shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>ملفات العملاء وشيتات المتابعة (للتيم) 📗</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeRenewalSubTab === 'client_dossiers' ? 'bg-white text-emerald-900' : 'bg-emerald-100 text-emerald-800'}`}>
              {activeClientsPool.length} عميل
            </span>
          </button>

          <button
            onClick={() => setActiveRenewalSubTab('renewals_list')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeRenewalSubTab === 'renewals_list'
                ? 'bg-blue-600 text-white shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواعيد التجديد وتنبيهات الـ 4 أيام</span>
            {totalDueSoon.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeRenewalSubTab === 'renewals_list' ? 'bg-amber-400 text-slate-900' : 'bg-rose-500 text-white animate-pulse'}`}>
                {totalDueSoon.length} تجديد عاجل
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveRenewalSubTab('timeline')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeRenewalSubTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>سجل وتاريخ كل اكونت من ساعات اشترك وجدد (للأدمن 🔒)</span>
          </button>

          <button
            onClick={() => setActiveRenewalSubTab('coaching_offers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeRenewalSubTab === 'coaching_offers'
                ? 'bg-rose-600 text-white shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-400" />
            <span>تنبيهات الكوتشن والعروض لإرسالها للعملاء 📣</span>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-bold">
              {coachingOffers.length} قوالب
            </span>
          </button>

          <button
            onClick={() => setActiveRenewalSubTab('swift_accounts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeRenewalSubTab === 'swift_accounts'
                ? 'bg-amber-600 text-white shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>طلبات واكونتات سويفت ⚡</span>
          </button>
        </div>
      </div>

      {/* ================= MODE: CLIENT DOSSIERS & SHEETS (ملف كل عميل بتفاصيله ولينك الشيت لسهولة الوصول للتيم) ================= */}
      {activeRenewalSubTab === 'client_dossiers' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Banner & Search */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {isManager
                        ? 'إدارة ملفات العملاء وتوزيعها على الفريق (شيتات وملفات المشاريع)'
                        : `قائمة العملاء المخصصين لك (${activeClientsPool.length} عميل)`}
                    </h2>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                      {isManager ? 'إدارة الأدمن والتحكم 🔒' : 'العملاء المسندين لحسابك فقط 👤'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isManager
                      ? 'إدارة وتوزيع العملاء على الموظفين، تحديد وصف ومرفقات كل مشروع، والتحكم في ظهور الملفات لكل موظف.'
                      : 'قائمة العملاء المسندين إليك من قبل الإدارة مع وصف المشروع والمستندات المصرح لك بالاطلاع عليها.'}
                  </p>
                </div>
              </div>

              {isManager && (
                <button
                  onClick={() => {
                    setEditingRenewal(null);
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ إضافة عميل ومشروع جديد</span>
                </button>
              )}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  كافة العملاء ({activeClientsPool.length})
                </button>
                <button
                  onClick={() => setStatusFilter('due_soon')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    statusFilter === 'due_soon'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>تجديد خلال 4 أيام ({totalDueSoon.length})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'active'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  ساري
                </button>
                <button
                  onClick={() => setStatusFilter('overdue')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === 'overdue'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  متأخر
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => exportClientsToExcel(activeClientsPool)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-102 shrink-0"
                  title="تصدير كشف العملاء وشيتات المتابعة بصيغة ملف إكسيل (.xlsx)"
                >
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span>تصدير إكسيل (Excel) 📗</span>
                </button>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="بحث باسم العميل، الشركة، الخدمة، أو الشيت..."
                    className="w-full bg-slate-50 pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* شريط تصفية وتوزيع العملاء حسب كل موظف (للأدمن لعرض عملاء كل موظف والأعداد الفعلية) */}
            {isManager && (
              <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-700 flex items-center gap-1.5 shrink-0">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>عملاء كل موظف (التحكم والتوزيع):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEmployeeFilter('all')}
                    className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                      employeeFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-2xs font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    الكل ({clientRenewals.length})
                  </button>
                  {team.map(member => {
                    const empClientsCount = clientRenewals.filter(c =>
                      (c.assignedTeamMemberIds || []).includes(member.id) ||
                      c.managedBy === member.name ||
                      c.managedBy === member.id
                    ).length;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setEmployeeFilter(member.id)}
                        className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          employeeFilter === member.id
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs font-black'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                        title={`عرض عملاء ${member.name} (${empClientsCount} عميل)`}
                      >
                        <img src={member.avatar} alt={member.name} className="w-4 h-4 rounded-full object-cover shrink-0" />
                        <span>{member.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                          employeeFilter === member.id
                            ? 'bg-white text-indigo-900'
                            : empClientsCount > 0
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {empClientsCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Dossiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRenewals.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <Folder className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black text-slate-800">
                  {isManager
                    ? 'لا توجد ملفات عملاء مطابقة للتصفية الحالية'
                    : 'لم يتم إسناد أي عملاء لحسابك حالياً (0 عميل)'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isManager
                    ? 'يمكنك تغيير الموظف المحدد في الفلتر أو النقر على "+ إضافة عميل ومشروع جديد" لتسجيل عميل جديد وتوزيعه.'
                    : 'عندما يقوم الأدمن بتخصيص عملاء لك، ستظهر تفاصيل المشروع، الملفات المصرح بها، وشيتات جوجل الخاصة بهم هنا مباشرة.'}
                </p>
              </div>
            ) : (
              filteredRenewals.map(client => {
                const diff = getDaysRemaining(client.renewalDate);
                const isDueSoon = diff <= 4 && diff >= 0 && client.status !== 'renewed';
                const isOverdue = diff < 0 && client.status !== 'renewed';
                const isCopied = copiedSheetId === client.id;

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 space-y-3.5 flex flex-col justify-between group relative hover:border-emerald-300"
                  >
                    <div>
                      {/* Top Row: Client Name, Company, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                            {client.clientName.charAt(0)}
                          </div>
                          <div>
                            <h3
                              onClick={() => setSelectedClientForDossier(client)}
                              className="font-black text-sm text-slate-900 group-hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
                              title="انقر لفتح ملف العميل الكامل"
                            >
                              {client.clientName}
                            </h3>
                            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{client.company}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 text-left">
                          {client.status === 'renewed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>مجدد</span>
                            </span>
                          ) : isDueSoon ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-white" />
                              <span>🚨 تجديد {diff} يوم!</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              <span>متأخر {Math.abs(diff)} يوم</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              <span>ساري ({diff} يوم)</span>
                            </span>
                          )}
                          {client.contractNumber && (
                            <div className="text-[9px] font-mono text-slate-400 mt-1 text-left">
                              {client.contractNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 📗 GOOGLE SHEET BOX (طلب المستخدم: لينك الشيت لسهولة الوصول ليه للتيم) */}
                      <div className="mt-3 bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border-2 border-emerald-300/80 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>شيت المتابعة (Google Sheet):</span>
                          </span>
                          <button
                            type="button"
                            onClick={e => handleOpenEditSheet(e, client)}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                          >
                            {client.sheetUrl ? 'تعديل الرابط ✏️' : '+ إضافة رابط'}
                          </button>
                        </div>

                        {client.sheetUrl ? (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-800 truncate" title={client.sheetTitle || client.sheetUrl}>
                              {client.sheetTitle || 'شيت متابعة الحملات والسيرفرات'}
                            </div>

                            <div className="flex items-center gap-1.5 pt-1">
                              {/* Open Google Sheet Direct Button */}
                              <a
                                href={client.sheetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-101"
                                title="فتح شيت جوجل الخاص بالعميل في نافذة جديدة"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" />
                                <span>فتح الشيت الآن (Google Sheets) ↗</span>
                              </a>

                              {/* Copy Link */}
                              <button
                                type="button"
                                onClick={e => handleCopySheetLink(e, client)}
                                className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                                  isCopied
                                    ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                }`}
                                title="نسخ رابط الشيت"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={e => handleOpenEditSheet(e, client)}
                            className="w-full py-2 px-3 bg-white hover:bg-emerald-100/50 border border-dashed border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ إضافة رابط شيت جوجل لهذا العميل</span>
                          </button>
                        )}
                      </div>

                      {/* Contact Bar: WhatsApp + Call + Email */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setWhatsAppModalClient(client)}
                          className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          title="مراسلة وتذكير ذكي بقوالب التجديد الجاهزة عبر الواتساب"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>واتساب (قوالب)</span>
                        </button>

                        <a
                          href={`tel:${client.phone}`}
                          className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer font-mono"
                          title={`اتصال: ${client.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>اتصال</span>
                        </a>

                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title={`بريد: ${client.email}`}
                          >
                            <Mail className="w-3.5 h-3.5 text-indigo-600" />
                          </a>
                        )}
                      </div>

                      {/* Service & Renewal Details */}
                      <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">باقة الخدمة:</span>
                          <span className="font-extrabold text-slate-900 truncate max-w-[180px] text-left">
                            {client.serviceName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">الاشتراك والدورة:</span>
                          <span className="font-black text-slate-900">
                            {client.amount.toLocaleString()} {client.currency} / {client.planCycle}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-bold">موعد التجديد:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {client.renewalDate}
                          </span>
                        </div>

                        {client.managedBy && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                            <span className="text-slate-400 font-bold">مسؤول المتابعة:</span>
                            <span className="font-bold text-indigo-700">
                              {client.managedBy}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Project Description snippet if exists */}
                      {client.projectDescription && (
                        <div className="mt-2 text-[11px] text-slate-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200/80">
                          <span className="font-bold text-amber-900 block mb-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600" />
                            وصف المشروع:
                          </span>
                          <p className="line-clamp-2 text-slate-600 leading-relaxed font-medium">
                            {client.projectDescription}
                          </p>
                        </div>
                      )}

                      {/* Notes snippet if exists */}
                      {client.notes && (
                        <p className="mt-2 text-[10px] text-slate-500 line-clamp-2 bg-slate-50/70 p-1.5 rounded-md border border-slate-100">
                          {client.notes}
                        </p>
                      )}

                      {/* Folder Files & Team Visibility Badges */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                          <Folder className="w-3.5 h-3.5 text-amber-500" />
                          <span>{client.folderFiles?.length || 0} مستندات</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          {client.assignedTeamMemberIds && client.assignedTeamMemberIds.length > 0 ? (
                            <span className="text-[10px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                              {client.assignedTeamMemberIds.length} من التيم
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              الأدمن فقط
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenDossier(client)}
                        className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Folder className="w-3.5 h-3.5 text-emerald-600" />
                        <span>الملف والفولدر 📁</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setInvoiceModalClient(client)}
                        className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                        title="إنشاء وطباعة فاتورة وسند اشتراك PDF رسمي"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>فاتورة PDF</span>
                      </button>

                      {isManager && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200 cursor-pointer transition-colors shadow-2xs shrink-0"
                          title="تعديل بيانات العميل والشيت"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isManager && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmModal({
                            id: client.id,
                            isBulk: false,
                            title: `حذف ملف واشتراك العميل (${client.clientName}) بالكامل؟`
                          })}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl border border-rose-200 cursor-pointer transition-colors shadow-2xs shrink-0"
                          title="حذف العميل نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODE 1: RENEWALS LIST (مواعيد التجديد وتنبيهات الـ 4 أيام) */}
      {activeRenewalSubTab === 'renewals_list' && (
        <div className="space-y-4">
          {/* Tabs Filter Bar & Search */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كافة الاشتراكات ({clientRenewals.length})
          </button>

          <button
            onClick={() => setStatusFilter('due_soon')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'due_soon'
                ? 'bg-amber-600 text-white shadow-2xs ring-2 ring-amber-300'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>🚨 تجديد خلال 4 أيام ({totalDueSoon.length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            سارية ومستقبلية
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            متأخرة عن التجديد
          </button>

          <button
            onClick={() => setStatusFilter('renewed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'renewed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            تم التجديد حديثاً ✅
          </button>
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => exportClientsToExcel(activeClientsPool)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-102 shrink-0"
            title="تصدير كشف العملاء ومواعيد التجديد لإكسيل (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>تصدير إكسيل (Excel) 📗</span>
          </button>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم العميل أو الشركة أو الخدمة..."
              className="w-full bg-slate-50 pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* RENEWALS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredRenewals.length && filteredRenewals.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">العميل والمؤسسة</th>
                <th className="py-3 px-4">الخدمة / باقة الاشتراك</th>
                <th className="py-3 px-4">شيت العميل (Google Sheets) 📗</th>
                <th className="py-3 px-4">تاريخ التجديد والمدة المتبقية</th>
                <th className="py-3 px-4">الدورة والمبلغ</th>
                <th className="py-3 px-4">تواصل فوري (واتساب / هاتف)</th>
                <th className="py-3 px-4 text-center">تأكيد التجديد</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRenewals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    لا توجد اشتراكات مطابقة للبحث أو التصفية الحالية
                  </td>
                </tr>
              ) : (
                filteredRenewals.map(ren => {
                  const isSelected = selectedIds.includes(ren.id);
                  const diff = getDaysRemaining(ren.renewalDate);
                  const isDueSoon = diff <= 4 && diff >= 0 && ren.status !== 'renewed';
                  const isOverdue = diff < 0 && ren.status !== 'renewed';

                  return (
                    <tr
                      key={ren.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDueSoon ? 'bg-amber-50/50' : isOverdue ? 'bg-rose-50/30' : isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(ren.id)}
                          className="rounded text-blue-600 cursor-pointer"
                        />
                      </td>

                      {/* Client & Company */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>{ren.clientName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{ren.company}</span>
                        </div>
                      </td>

                      {/* Service / Plan */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 leading-snug">{ren.serviceName}</div>
                        {ren.notes && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                            {ren.notes}
                          </div>
                        )}
                      </td>

                      {/* Google Sheet Link Column (لينك الشيت لسهولة الوصول ليه للتيم) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {ren.sheetUrl ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={ren.sheetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-2xs hover:scale-102"
                              title={`فتح الشيت: ${ren.sheetTitle || ren.sheetUrl}`}
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                              <span>فتح الشيت ↗</span>
                            </a>
                            <button
                              type="button"
                              onClick={e => handleCopySheetLink(e, ren)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-colors cursor-pointer"
                              title="نسخ رابط الشيت"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={e => handleOpenEditSheet(e, ren)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
                              title="تعديل رابط الشيت"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={e => handleOpenEditSheet(e, ren)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-dashed border-slate-200 hover:border-emerald-300 px-2 py-1 rounded-lg transition-all cursor-pointer"
                            title="ربط شيت جوجل لهذا العميل"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ ربط شيت</span>
                          </button>
                        )}
                      </td>

                      {/* Renewal Date & Countdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ren.renewalDate}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-1">
                          {ren.status === 'renewed' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>تم التجديد بنجاح</span>
                            </span>
                          ) : isDueSoon ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-white" />
                              <span>🚨 يستحق التجديد خلال {diff === 0 ? 'اليوم!' : diff === 1 ? 'يوم واحد!' : `${diff} أيام!`}</span>
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-rose-600" />
                              <span>متأخر بمقدار {Math.abs(diff)} يوم</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-blue-500" />
                              <span>متبقي {diff} يوم</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount & Plan Cycle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-slate-900 text-xs">
                          {ren.amount.toLocaleString()} {ren.currency}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">دورة: {ren.planCycle}</div>
                      </td>

                      {/* Quick Contact: WhatsApp / Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {/* 1-Click WhatsApp Button (قوالب التجديد الذكية) */}
                          <button
                            type="button"
                            onClick={() => setWhatsAppModalClient(ren)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer"
                            title="إرسال تذكير التجديد الفوري عبر قوالب الواتساب الذكية"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>واتساب التجديد</span>
                          </button>

                          {/* Direct Call */}
                          <a
                            href={`tel:${ren.phone}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title={`اتصال: ${ren.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-600" />
                          </a>
                        </div>
                      </td>

                      {/* Mark Completed */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => markRenewalCompleted(ren.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-2xs flex items-center gap-1 mx-auto"
                          title="تسجيل سداد وتجديد الاشتراك للدورة القادمة"
                        >
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          <span>تأكيد التجديد</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* زر ملف العميل الكامل */}
                          <button
                            type="button"
                            onClick={() => setSelectedClientForDossier(ren)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="فتح ملف العميل الكامل والشيت"
                          >
                            <Folder className="w-3.5 h-3.5 text-blue-600" />
                            <span>ملف العميل</span>
                          </button>

                          {/* زر فاتورة وسند PDF */}
                          <button
                            type="button"
                            onClick={() => setInvoiceModalClient(ren)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                            title="إنشاء وطباعة فاتورة وسند اشتراك PDF رسمي"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ren)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-700 cursor-pointer"
                            title="تعديل بيانات الاشتراك"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteConfirmModal({
                                id: ren.id,
                                isBulk: false,
                                title: `حذف اشتراك العميل: ${ren.clientName}`
                              });
                            }}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="حذف السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* MODE 2: TIMELINE & SUBSCRIPTION LIFECYCLE (مواعيد وتفاصيل كل اكونت من ساعات اشترك وجدد معانا كل ده للادمن بس) */}
      {activeRenewalSubTab === 'timeline' && isManager && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>سجل وتاريخ كل حساب من ساعة الاشتراك والتجديدات (Account Lifecycle Ledger)</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full">
                  للأدمن فقط 🔒
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تتبع كامل لكل اكونت عميل: من تاريخ وساعة أول اشتراك، عدد مرات التجديد السابقة، إيصالات السداد، وطلبات سويفت الخاصة به.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-200">
              إجمالي الحسابات: {clientRenewals.length}
            </div>
          </div>

          <div className="space-y-4">
            {clientRenewals.map(client => {
              const diffDays = getDaysRemaining(client.renewalDate);
              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 space-y-4"
                >
                  {/* Account Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                        {client.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">{client.clientName}</h3>
                          <span className="text-xs text-slate-500 font-semibold">({client.company})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="text-indigo-600 font-bold">{client.serviceName}</span>
                          <span className="text-slate-300">•</span>
                          <span>دورة السداد: <strong>{client.planCycle}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block">ساعة أول اشتراك</span>
                        <span className="font-mono font-black text-slate-800 text-xs">
                          {client.firstSubscribedAt || '2024-10-22 11:30'}
                        </span>
                      </div>

                      <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
                        <span className="text-[10px] text-emerald-600 block">مرات التجديد</span>
                        <span className="font-mono font-black text-emerald-800 text-xs">
                          {client.totalRenewalsCount || 2} مرات
                        </span>
                      </div>

                      <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 text-center">
                        <span className="text-[10px] text-indigo-600 block">القيمة الحالية</span>
                        <span className="font-mono font-black text-indigo-900 text-xs">
                          {client.amount.toLocaleString()} {client.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Timeline of Renewals from First Hour */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>سجل دورات الاشتراك والتجديدات من البداية:</span>
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {client.renewalHistory && client.renewalHistory.length > 0 ? (
                        client.renewalHistory.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{item.cycle}</span>
                              <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                                {item.receiptNumber}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                              <span>📅 {item.date}</span>
                              <span className="font-black text-emerald-700">
                                {item.amount.toLocaleString()} {client.currency}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-[10px] text-slate-600 bg-white/80 p-1.5 rounded border border-slate-100">
                                {item.note}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-500 text-xs">
                          لا توجد سجلات تجديد سابقة بعد، الاشتراك في دورته الأولى.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Swift Requests and Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    {client.swiftRequests && client.swiftRequests.length > 0 && (
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>طلبات واحتياجات سويفت الخاصة بالحساب:</span>
                        </span>
                        <ul className="space-y-1 text-slate-700 text-[11px]">
                          {client.swiftRequests.map((req, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-700">ملاحظات الإدارة:</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {client.notes || 'العميل منتظم بالسداد، وحالة الربط التقني مستقرة.'}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>إدارة: {client.managedBy || 'هدير سعيد'}</span>
                        <a
                          href={getWhatsAppLink(client)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>محادثة واتساب سريعة</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: COACHING & PROMOTIONAL OFFERS CENTER (مكان تبيهات للكوتشن او العروض ابعتها للعملاء) */}
      {activeRenewalSubTab === 'coaching_offers' && (
        <div className="space-y-5 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-600" />
                <span>مركز تنبيهات الكوتشن والعروض الترويجية لإرسالها للعملاء (Coaching & Offers Broadcast)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                رسائل وقوالب جاهزة لتذكير العملاء بجلسات الكوتشنج، عروض التجديد المبكر بخصم، وباقات دمج الذكاء الاصطناعي مع واتساب المباشر بنقرة واحدة.
              </p>
            </div>
            <div className="text-xs font-bold bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200">
              قوالب جاهزة: {coachingOffers.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {coachingOffers.map(offer => {
              const isCopied = copiedOfferId === offer.id;
              // Sample client for preview
              const sampleClient = clientRenewals[0] || {
                clientName: 'عبدالعزيز العتيبي',
                company: 'شركة الأفق',
                serviceName: 'استضافة وسيرفرات سويفت',
                amount: 3200,
                currency: 'ر.س',
                whatsappNumber: '+96599881234'
              };

              const formattedMessage = offer.messageTemplate
                .replace('{clientName}', sampleClient.clientName)
                .replace('{company}', sampleClient.company)
                .replace('{serviceName}', sampleClient.serviceName)
                .replace('{meetLink}', 'https://meet.google.com/zoh-vip-otaibi')
                .replace('{discountedAmount}', ((sampleClient.amount || 2000) * 0.8).toLocaleString())
                .replace('{currency}', sampleClient.currency);

              const waLink = `https://wa.me/${(sampleClient.whatsappNumber || '966500000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(formattedMessage)}`;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        offer.type === 'coaching_session'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : offer.type === 'renewal_discount'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {offer.type === 'coaching_session' ? 'جلسة كوتشنج واستشارات' : offer.type === 'renewal_discount' ? 'عرض خصم تجديد' : 'باقة مدمجة'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        ساري حتى: {offer.validUntil}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {offer.title}
                    </h3>

                    <div className="text-[11px] text-slate-500 font-semibold">
                      الجمهور المستهدف: <strong className="text-slate-800">{offer.targetClients}</strong>
                    </div>

                    {/* Message Box */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans max-h-48 overflow-y-auto">
                      {formattedMessage}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => sendCoachingOffer(offer.id)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      title="إرسال عبر واتساب إلى العميل مباشرة"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>إرسال واتساب للعميل</span>
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formattedMessage);
                        setCopiedOfferId(offer.id);
                        setTimeout(() => setCopiedOfferId(null), 2000);
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="نسخ نص الرسالة"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 4: SWIFT ACCOUNTS & PLUGINS (الطلبات او الاكونتات محتاجها سويفت) */}
      {activeRenewalSubTab === 'swift_accounts' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>حسابات وطلبات سويفت (Swift Accounts, Products & Plugins Hub)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة احتياجات العملاء لحلول سويفت: البلاجنز المخصصة، تكاملات الـ CRM، ربط الـ 2 دومين، وتراخيص فريق العمل.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientRenewals.map(client => (
              <div key={client.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">{client.company}</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    حساب سويفت نشط
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  العميل المسؤول: <strong className="text-slate-800">{client.clientName}</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <span className="font-bold text-slate-700 block">طلبات سويفت والبلاجنز:</span>
                  {client.swiftRequests && client.swiftRequests.length > 0 ? (
                    <ul className="space-y-1">
                      {client.swiftRequests.map((req, i) => (
                        <li key={i} className="text-slate-700 flex items-center gap-1.5 text-[11px]">
                          <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 text-[11px]">لا توجد طلبات سويفت معلقة حالياً.</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">سيرفر: <strong>2 دومين + SSL</strong></span>
                  <span className="font-mono font-bold text-emerald-600">{client.amount} {client.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT RENEWAL MODAL */}
      {(showAddModal || editingRenewal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{editingRenewal ? 'تعديل موعد تجديد اشتراك العميل' : 'إضافة موعد تجديد اشتراك عميل جديد'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRenewal(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل: *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="مثال: عبدالعزيز العتيبي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشركة أو المؤسسة: *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    placeholder="مثال: شركة الأفق للاستشارات"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value, whatsappNumber: e.target.value })}
                    placeholder="+965 99 000 000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب (للتنبيه المباشر):</label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+96599000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الخدمة أو الباقة المشترك بها: *</label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="مثال: استضافة وسيرفرات سويفت 2 سيستم و2 دومين"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المشروع وتفاصيل العمل: *</label>
                <textarea
                  rows={2}
                  value={formData.projectDescription || ''}
                  onChange={e => setFormData({ ...formData, projectDescription: e.target.value })}
                  placeholder="اكتب وصف المشروع ومتطلبات العمل والملفات ليطلع عليها الموظف المسند إليه..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 resize-none font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التجديد: *</label>
                  <input
                    type="date"
                    required
                    value={formData.renewalDate}
                    onChange={e => setFormData({ ...formData, renewalDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">دورة التجديد:</label>
                  <select
                    value={formData.planCycle}
                    onChange={e => setFormData({ ...formData, planCycle: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="شهري">شهري</option>
                    <option value="ربع سنوي">ربع سنوي</option>
                    <option value="نصف سنوي">نصف سنوي</option>
                    <option value="سنوي">سنوي</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">قيمة الاشتراك:</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                    />
                    <span className="text-xs text-slate-500 font-bold">{formData.currency}</span>
                  </div>
                </div>
              </div>

              {/* بيانات العقد والمسؤول والشيت لسهولة وصول التيم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم العقد / المعرف:</label>
                  <input
                    type="text"
                    value={formData.contractNumber || ''}
                    onChange={e => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="مثال: CNT-2026-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مسؤول المتابعة في التيم:</label>
                  <input
                    type="text"
                    value={formData.managedBy || ''}
                    onChange={e => setFormData({ ...formData, managedBy: e.target.value })}
                    placeholder="مثال: هدير سعيد"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              {/* قسم رابط شيت جوجل الخاص بالعميل (Google Sheets) */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>ملف وشيت جوجل (Google Sheet) لسهولة وصول التيم:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">عنوان / اسم الشيت:</label>
                    <input
                      type="text"
                      value={formData.sheetTitle || ''}
                      onChange={e => setFormData({ ...formData, sheetTitle: e.target.value })}
                      placeholder="مثال: شيت متابعة استضافة وسيرفرات الأفق"
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">رابط الشيت (Google Sheets Link):</label>
                    <input
                      type="url"
                      value={formData.sheetUrl || ''}
                      onChange={e => setFormData({ ...formData, sheetUrl: e.target.value })}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-600 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* اختيار أعضاء التيم المصرح لهم برؤية هذا العميل */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>من يظهر له هذا العميل في التيم؟ (صلاحيات الرؤية)</span>
                  </label>
                  <span className="text-[10px] bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                    الأدمن يرى الكل 🔒
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                  {team.map(m => {
                    const isChecked = (formData.assignedTeamMemberIds || []).includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer ${
                          isChecked ? 'bg-purple-50 border-purple-300 font-bold text-purple-950' : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            const cur = formData.assignedTeamMemberIds || [];
                            const updated = e.target.checked
                              ? [...cur, m.id]
                              : cur.filter(id => id !== m.id);
                            setFormData({ ...formData, assignedTeamMemberIds: updated });
                          }}
                          className="w-3.5 h-3.5 text-purple-600 rounded cursor-pointer"
                        />
                        <span className="truncate">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({m.role})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إدارية عن العميل والتجديد:</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="مثال: تم إرسال ملفات السيستمين للهوست مع ربط الدومينين، العميل يفضل السداد عبر التحويل البنكي..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRenewal(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingRenewal ? 'حفظ التعديلات' : 'تسجيل موعد التجديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900">{deleteConfirmModal.title}</h3>
            <p className="text-xs text-slate-600">
              هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً من قائمة التجديدات؟
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmModal.isBulk) {
                    selectedIds.forEach(id => deleteClientRenewal(id));
                    setSelectedIds([]);
                  } else if (deleteConfirmModal.id) {
                    deleteClientRenewal(deleteConfirmModal.id);
                  }
                  setDeleteConfirmModal(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-2xs"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= MODAL: ملف العميل المتكامل وفولدر المستندات وتوزيع التيم ================= */}
      {currentDossierClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  {currentDossierClient.clientName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {currentDossierClient.clientName}
                    </h2>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                      ملف العميل المتكامل 📁
                    </span>
                    {currentDossierClient.contractNumber && (
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full font-mono">
                        {currentDossierClient.contractNumber}
                      </span>
                    )}
                    {currentDossierClient.onboardingStage && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                        {currentDossierClient.onboardingStage}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentDossierClient.company}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientForDossier(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* بطاقة تفاصيل ووصف المشروع الفني للعميل (يظهر للموظف والأدمن) */}
            <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/30 p-4 rounded-2xl border border-amber-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>تفاصيل ووصف المشروع الفني:</span>
                </span>
                {isManager && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(currentDossierClient)}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-white/90 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-blue-600" />
                    <span>تعديل الوصف وتفاصيل العميل</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed bg-white/95 p-3 rounded-xl border border-amber-200/80 shadow-2xs whitespace-pre-wrap">
                {currentDossierClient.projectDescription || 'لم يتم تسجيل وصف تفصيلي لهذا المشروع بعد. يمكنك إضافته وتعديله من لوحة التحكم.'}
              </p>
            </div>

            {/* Sub-tabs Navigation inside Dossier */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setDossierActiveTab('folder')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  dossierActiveTab === 'folder'
                    ? 'bg-amber-500 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>فولدر المستندات والملفات</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${dossierActiveTab === 'folder' ? 'bg-white text-amber-900' : 'bg-amber-100 text-amber-800'}`}>
                  {currentDossierClient.folderFiles?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setDossierActiveTab('team_visibility')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  dossierActiveTab === 'team_visibility'
                    ? 'bg-purple-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>من يظهر له العميل بالتيم</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${dossierActiveTab === 'team_visibility' ? 'bg-white text-purple-900' : 'bg-purple-100 text-purple-800'}`}>
                  {currentDossierClient.assignedTeamMemberIds?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setDossierActiveTab('notes')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  dossierActiveTab === 'notes'
                    ? 'bg-blue-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>سجل الملاحظات</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${dossierActiveTab === 'notes' ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'}`}>
                  {currentDossierClient.clientNotes?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setDossierActiveTab('overview')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  dossierActiveTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>الشيت والاشتراك</span>
              </button>

              <button
                onClick={() => setDossierActiveTab('tasks')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  dossierActiveTab === 'tasks'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>المهام المرتبطة</span>
              </button>
            </div>

            {/* TAB 1: فولدر المستندات والملفات (التحكم في ظهور الملفات لكل موظف) */}
            {dossierActiveTab === 'folder' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/90 gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
                      <Folder className="w-4 h-4 text-amber-600" />
                      <span>فولدر المستندات والملفات المرفوعة للعميل</span>
                    </h4>
                    <p className="text-[11px] text-amber-900/80 font-medium mt-0.5">
                      {isManager
                        ? 'يمكنك كأدمن رفع الملفات وتحديد أي من الموظفين مسموح له برؤية كل ملف على حدة.'
                        : 'الملفات والمستندات المصرح لك برؤيتها والاطلاع عليها من قبل الأدمن.'}
                    </p>
                  </div>

                  {isManager && (
                    <button
                      onClick={() => setShowAddFileModal(!showAddFileModal)}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>+ إضافة مستند للفولدر</span>
                    </button>
                  )}
                </div>

                {/* Inline Add Document Form */}
                {showAddFileModal && isManager && (
                  <form onSubmit={handleAddFileSubmit} className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-amber-300 space-y-3 text-xs animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>إرفاق مستند جديد وتحديد صلاحيات ظهور الملف للموظفين</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddFileModal(false)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Local File Upload Picker */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <label className="block font-bold text-slate-700">
                        اختر ملف من جهازك (أو أدخل رابط سحابي بالأسفل):
                      </label>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fileName = file.name;
                          const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const dataUrl = ev.target?.result as string;
                            setNewFileData(prev => ({
                              ...prev,
                              name: prev.name || fileName,
                              size: sizeMB,
                              url: dataUrl
                            }));
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">اسم المستند أو الملف: *</label>
                        <input
                          type="text"
                          required
                          value={newFileData.name}
                          onChange={e => setNewFileData({ ...newFileData, name: e.target.value })}
                          placeholder="مثال: عقد استضافة وسيرفرات معتمد 2026"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">تصنيف المستند:</label>
                        <select
                          value={newFileData.category}
                          onChange={e => setNewFileData({ ...newFileData, category: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="عقد">عقد رسمي 📜</option>
                          <option value="فاتورة">فاتورة أو إيصال سداد 💳</option>
                          <option value="بريف فني">بريف فني ومحتوى العمل 📝</option>
                          <option value="عرض سعر">عرض سعر معتمد 📄</option>
                          <option value="ملفات تصميم">ملفات تصميم وشعار 🎨</option>
                          <option value="أخرى">أخرى 📁</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">رابط المستند السحابي أو التخزين (URL):</label>
                        <input
                          type="text"
                          value={newFileData.url}
                          onChange={e => setNewFileData({ ...newFileData, url: e.target.value })}
                          placeholder="https://drive.google.com/... أو رابط الملف"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">حجم الملف التقديري:</label>
                        <input
                          type="text"
                          value={newFileData.size}
                          onChange={e => setNewFileData({ ...newFileData, size: e.target.value })}
                          placeholder="مثال: 2.4 MB"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* صلاحيات الموظفين المصرح لهم برؤية هذا الملف */}
                    <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>التحكم في ظهور هذا الملف للموظفين:</span>
                        </label>
                        <span className="text-[10px] text-purple-700 font-bold">
                          {newFileData.allowedTeamMemberIds.length === 0
                            ? 'متاح لجميع الموظفين المسندين للعميل 🌐'
                            : `مخصص لـ (${newFileData.allowedTeamMemberIds.length}) موظف 🔒`}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-800">
                        حدد الموظف الذي ترغب في أن يظهر له هذا الملف فقط. إذا لم تحدد أي موظف سيظهر لجميع الموظفين المسندين للعميل.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                        {team.map(m => {
                          const isAssignedToClient = (currentDossierClient.assignedTeamMemberIds || []).includes(m.id);
                          const isChecked = newFileData.allowedTeamMemberIds.includes(m.id);
                          return (
                            <label
                              key={m.id}
                              className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer ${
                                isChecked
                                  ? 'bg-purple-100 border-purple-400 font-bold text-purple-950'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  const updated = e.target.checked
                                    ? [...newFileData.allowedTeamMemberIds, m.id]
                                    : newFileData.allowedTeamMemberIds.filter(id => id !== m.id);
                                  setNewFileData({ ...newFileData, allowedTeamMemberIds: updated });
                                }}
                                className="w-3.5 h-3.5 text-purple-600 rounded cursor-pointer"
                              />
                              <span className="truncate">{m.name}</span>
                              {isAssignedToClient && (
                                <span className="text-[9px] bg-purple-200 text-purple-800 px-1 rounded">مع العميل</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddFileModal(false)}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>حفظ وإضافة للفولدر</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Files List */}
                <div className="space-y-2">
                  {(!currentDossierClient.folderFiles || currentDossierClient.folderFiles.length === 0) ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                      <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">
                        {isManager
                          ? 'لا توجد ملفات أو مستندات في فولدر هذا العميل حتى الآن.'
                          : 'لم يقم الأدمن بمشاركة ملفات أو مستندات معك لهذا العميل حتى الآن.'}
                      </p>
                      {isManager && (
                        <p className="text-[11px] text-slate-400">انقر على زر "+ إضافة مستند للفولدر" أعلاه لإرفاق العقود والفواتير وتحديد صلاحيات ظهورها.</p>
                      )}
                    </div>
                  ) : (
                    currentDossierClient.folderFiles.map(file => {
                      const isFileOpenPerms = editingFilePermsId === file.id;
                      const hasSpecificPerms = file.allowedTeamMemberIds && file.allowedTeamMemberIds.length > 0;
                      const allowedNames = (file.allowedTeamMemberIds || [])
                        .map(id => team.find(m => m.id === id)?.name || id)
                        .join('، ');

                      return (
                        <div
                          key={file.id}
                          className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-900 truncate">{file.name}</span>
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                    {file.category}
                                  </span>
                                  {file.size && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      {file.size}
                                    </span>
                                  )}
                                  {/* بطاقة الصلاحيات للملف */}
                                  {hasSpecificPerms ? (
                                    <span className="text-[10px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                                      <Shield className="w-2.5 h-2.5 text-purple-600" />
                                      <span>متاح فقط لـ: {allowedNames}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Users className="w-2.5 h-2.5 text-slate-400" />
                                      <span>متاح لكافة التيم المسند</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                                  <span>تاريخ الإضافة: {file.uploadedAt}</span>
                                  {file.uploadedBy && <span>• بواسطة: {file.uploadedBy}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {file.url && file.url !== '#' && (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  download={file.name}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                  title="فتح أو تحميل الملف"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>فتح / تحميل ↗</span>
                                </a>
                              )}

                              {/* زر تحكم الأدمن في صلاحيات الملف */}
                              {isManager && (
                                <button
                                  type="button"
                                  onClick={() => setEditingFilePermsId(isFileOpenPerms ? null : file.id)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer flex items-center gap-1 transition-all ${
                                    isFileOpenPerms
                                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                                      : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
                                  }`}
                                  title="تحديد الموظفين المصرح لهم برؤية هذا الملف"
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  <span>صلاحيات الملف ⚙️</span>
                                </button>
                              )}

                              {isManager && (
                                <button
                                  onClick={() => {
                                    if (confirm(`هل تريد بالتأكيد حذف المستند: ${file.name}؟`)) {
                                      deleteClientFile(currentDossierClient.id, file.id);
                                      showToast('تم حذف المستند من الفولدر 🗑️');
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                  title="حذف المستند"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inline Permission Editor for Admin */}
                          {isFileOpenPerms && isManager && (
                            <div className="p-3 bg-purple-50/90 rounded-xl border border-purple-200 space-y-2 animate-in slide-in-from-top-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-black text-purple-950 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                                  <span>تحديد الموظفين المصرح لهم برؤية المستند ({file.name}):</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateClientFilePermissions(currentDossierClient.id, file.id, []);
                                    showToast('تم تعيين الملف متاحاً لجميع موظفي العميل 🌐');
                                  }}
                                  className="text-[10px] font-bold text-purple-700 hover:underline cursor-pointer"
                                >
                                  إتاحة للجميع (عام)
                                </button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                {team.map(m => {
                                  const isAssignedToClient = (currentDossierClient.assignedTeamMemberIds || []).includes(m.id);
                                  const isPermitted = (file.allowedTeamMemberIds || []).includes(m.id);
                                  return (
                                    <label
                                      key={m.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                        isPermitted
                                          ? 'bg-purple-600 text-white border-purple-700 font-bold shadow-2xs'
                                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isPermitted}
                                        onChange={e => {
                                          const cur = file.allowedTeamMemberIds || [];
                                          const updated = e.target.checked
                                            ? [...cur, m.id]
                                            : cur.filter(id => id !== m.id);
                                          updateClientFilePermissions(currentDossierClient.id, file.id, updated);
                                          showToast(`تم تحديث صلاحية الملف للموظف ${m.name} ✅`);
                                        }}
                                        className="w-3.5 h-3.5 text-purple-600 rounded cursor-pointer"
                                      />
                                      <span className="truncate">{m.name}</span>
                                      {isAssignedToClient && (
                                        <span className={`text-[9px] px-1 rounded ${isPermitted ? 'bg-purple-800 text-purple-100' : 'bg-slate-100 text-slate-600'}`}>
                                          مسند
                                        </span>
                                      )}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: صلاحيات الظهور بالتيم (واقدر احط كل عميل يظهر لمنين في التيم وكله بيظهر للادمن) */}
            {dossierActiveTab === 'team_visibility' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-purple-950 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>صلاحيات ظهور العميل لأعضاء الفريق (Team Visibility & Assignment)</span>
                  </h4>
                  <p className="text-[11px] text-purple-900/80 leading-relaxed">
                    <strong>قاعدة الصلاحيات:</strong> الأدمن العام يرى كافة ملفات العملاء دائماً 🔒.
                    حدد من هنا أي موظف في التيم مصرح له برؤية هذا العميل، الوصول لشيت المتابعة، والاطلاع على فولدر مستنداته.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {team.map(member => {
                    const isAssigned = (currentDossierClient.assignedTeamMemberIds || []).includes(member.id);
                    const isAdmin = member.accessLevel === 'admin' || member.id === 'user-1';

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleToggleTeamVisibility(member.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isAssigned
                            ? 'bg-purple-50/90 border-purple-400 text-purple-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => {}} // handled by div click
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer pointer-events-none"
                          />
                          <div className="w-7 h-7 rounded-lg bg-purple-200 text-purple-900 font-black text-xs flex items-center justify-center shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-1 truncate">
                              <span>{member.name}</span>
                              {isAdmin && <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded">أدمن</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                          </div>
                        </div>

                        <div>
                          {isAssigned ? (
                            <span className="text-[10px] font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md">
                              مصرح له ✅
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              غير محدد
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>
                    إجمالي الموظفين المصرح لهم برؤية هذا العميل: <strong>{(currentDossierClient.assignedTeamMemberIds || []).length} موظف</strong>
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>يتم الحفظ تلقائياً فور النقر</span>
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: سجل الملاحظات والتدوينات */}
            {dossierActiveTab === 'notes' && (
              <div className="space-y-4 animate-in fade-in">
                <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                  <label className="block text-xs font-black text-slate-800">
                    تدوين ملاحظة جديدة في ملف العميل:
                  </label>
                  <textarea
                    rows={2}
                    value={newClientNoteInput}
                    onChange={e => setNewClientNoteInput(e.target.value)}
                    placeholder="اكتب أي تحديث، مكالمة هاتفية، أو اتفاق جديد مع العميل ليراه باقي الفريق المصرح له..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 resize-none font-sans"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newClientNoteInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      + تدوين الملاحظة في الملف
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800">سجل التدوينات والملاحظات التاريخية:</h4>
                  {(!currentDossierClient.clientNotes || currentDossierClient.clientNotes.length === 0) ? (
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                      لا توجد ملاحظات مدونة في هذا الملف بعد.
                    </div>
                  ) : (
                    currentDossierClient.clientNotes.map(n => (
                      <div key={n.id} className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span className="text-blue-700 font-extrabold">{n.authorName}</span>
                          <span className="font-mono text-slate-400">{n.date}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-sans">{n.text}</p>
                      </div>
                    ))
                  )}

                  {/* Legacy notes fallback */}
                  {currentDossierClient.notes && (!currentDossierClient.clientNotes || currentDossierClient.clientNotes.length === 0) && (
                    <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
                      <strong>ملاحظة تمهيدية:</strong> {currentDossierClient.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: الشيت والاشتراك وقنوات التواصل (Overview) */}
            {dossierActiveTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in">
                {/* 📗 GOOGLE SHEET HERO CARD (طلب المستخدم: لينك الشيت لسهولة الوصول ليه للتيم) */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                          {currentDossierClient.sheetTitle || 'شيت متابعة العميل (Google Sheet)'}
                        </h4>
                        <p className="text-[11px] text-emerald-800/80 font-medium">
                          رابط الشيت المعتمد لمتابعة المهام والبيانات الخاصة بالعميل
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={e => handleOpenEditSheet(e, currentDossierClient)}
                      className="px-2.5 py-1 text-[11px] font-bold bg-white text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      تعديل الرابط ✏️
                    </button>
                  </div>

                  {currentDossierClient.sheetUrl ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <a
                        href={currentDossierClient.sheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>فتح شيت جوجل في نافذة جديدة (Google Sheets) ↗</span>
                      </a>

                      <button
                        type="button"
                        onClick={e => handleCopySheetLink(e, currentDossierClient)}
                        className="py-2.5 px-4 bg-white hover:bg-emerald-100/70 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        title="نسخ الرابط"
                      >
                        {copiedSheetId === currentDossierClient.id ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>تم النسخ ✅</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-emerald-700" />
                            <span>نسخ الرابط</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-emerald-300 text-center space-y-1.5">
                      <p className="text-xs font-bold text-slate-600">لا يوجد رابط شيت مسجل لهذا العميل بعد.</p>
                      <button
                        type="button"
                        onClick={e => handleOpenEditSheet(e, currentDossierClient)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        + إضافة رابط شيت جوجل الآن
                      </button>
                    </div>
                  )}
                </div>

                {/* تفاصيل العميل والاشتراك */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">باقة الخدمة والسيرفر:</div>
                    <div className="font-black text-slate-900 mt-0.5">{currentDossierClient.serviceName}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">قيمة وتكرار الاشتراك:</div>
                    <div className="font-black text-emerald-700 mt-0.5">
                      {currentDossierClient.amount.toLocaleString()} {currentDossierClient.currency} / {currentDossierClient.planCycle}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">تاريخ التجديد القادم:</div>
                    <div className="font-mono font-black text-slate-900 mt-0.5 flex items-center justify-between">
                      <span>{currentDossierClient.renewalDate}</span>
                      {(() => {
                        const diff = getDaysRemaining(currentDossierClient.renewalDate);
                        return diff <= 4 && diff >= 0 ? (
                          <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-sans font-bold">
                            متبقي {diff} يوم
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-sans">
                            {diff} يوم
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">مسؤول المتابعة بالتيم:</div>
                    <div className="font-black text-indigo-700 mt-0.5">
                      {currentDossierClient.managedBy || 'هدير سعيد'}
                    </div>
                  </div>
                </div>

                {/* قنوات التواصل السريع */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>قنوات التواصل المباشر للتيم:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href={getWhatsAppLink(currentDossierClient)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>مراسلة واتساب</span>
                    </a>

                    <a
                      href={`tel:${currentDossierClient.phone}`}
                      className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors font-mono"
                    >
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>{currentDossierClient.phone}</span>
                    </a>

                    {currentDossierClient.email ? (
                      <a
                        href={`mailto:${currentDossierClient.email}`}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors truncate"
                      >
                        <Mail className="w-4 h-4 text-slate-600 shrink-0" />
                        <span className="truncate">{currentDossierClient.email}</span>
                      </a>
                    ) : (
                      <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-200 text-xs flex items-center justify-center">
                        لا يوجد بريد مسجل
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: المهام المرتبطة بالعميل */}
            {dossierActiveTab === 'tasks' && (
              <div className="space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>المهام المكلف بها التيم والخاصة بهذا العميل:</span>
                  </h4>
                </div>

                {(() => {
                  const linkedTasks = tasks.filter(t =>
                    t.title.includes(currentDossierClient.clientName) ||
                    t.title.includes(currentDossierClient.company) ||
                    (t.relatedTo && t.relatedTo.name && t.relatedTo.name.includes(currentDossierClient.clientName)) ||
                    (currentDossierClient.contractNumber && t.description?.includes(currentDossierClient.contractNumber))
                  );

                  if (linkedTasks.length === 0) {
                    return (
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                        لا توجد مهام مسجلة مباشرة باسم هذا العميل حالياً.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {linkedTasks.map(t => {
                        const assignee = team.find(m => m.id === t.assignedToId);
                        return (
                          <div key={t.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{t.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                مكلف بها: <strong>{assignee ? assignee.name : 'غير محدد'}</strong> • موعد التسليم: {t.dueDate}
                              </div>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                              t.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.status === 'completed' ? 'مكتملة' : t.status === 'in_progress' ? 'قيد التنفيذ' : 'معلقة'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(currentDossierClient);
                    setSelectedClientForDossier(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل بيانات العميل الأساسية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmModal({
                      id: currentDossierClient.id,
                      isBulk: false,
                      title: `حذف ملف واشتراك العميل (${currentDossierClient.clientName}) بالكامل؟`
                    });
                    setSelectedClientForDossier(null);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>حذف العميل</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClientForDossier(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق الملف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: تعديل سريع لرابط شيت جوجل ================= */}
      {editingSheetClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-900">
                  ربط وتعديل شيت جوجل (Google Sheet)
                </h3>
              </div>
              <button
                onClick={() => setEditingSheetClient(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              العميل: <strong className="text-slate-900">{editingSheetClient.clientName}</strong> ({editingSheetClient.company})
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم / عنوان الشيت:</label>
                <input
                  type="text"
                  value={sheetTitleInput}
                  onChange={e => setSheetTitleInput(e.target.value)}
                  placeholder="مثال: شيت متابعة استضافة وسيرفرات العميل"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط شيت جوجل (Google Sheet URL):</label>
                <input
                  type="url"
                  value={sheetUrlInput}
                  onChange={e => setSheetUrlInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  تأكد من إمكانية وصول التيم لرابط الشيت للمشاركة والتحرير (Share: Anyone with link can view/edit).
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSheetClient(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveSheetLink}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ وتحديث الرابط</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS: WHATSAPP TEMPLATES & INVOICE PDF ================= */}
      {whatsAppModalClient && (
        <WhatsAppRenewalModal
          client={whatsAppModalClient}
          onClose={() => setWhatsAppModalClient(null)}
        />
      )}

      {invoiceModalClient && (
        <ClientInvoiceModal
          client={invoiceModalClient}
          onClose={() => setInvoiceModalClient(null)}
        />
      )}

      {/* ================= TOAST NOTIFICATION BANNER ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
