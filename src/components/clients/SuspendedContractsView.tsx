import React, { useState } from 'react';
import {
  PauseCircle,
  Play,
  Edit3,
  Trash2,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Calendar,
  Phone,
  MessageSquare,
  Building,
  User,
  Plus,
  Download,
  CheckCircle2,
  ExternalLink,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  Check,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientRenewal } from '../../types/crm';
import { exportSuspendedContractsToExcel } from '../../utils/excelExport';

export const SuspendedContractsView: React.FC = () => {
  const {
    clientRenewals,
    suspendedContracts,
    suspendClientContract,
    reactivateClientContract,
    updateSuspensionReason,
    addSuspendedContract,
    deleteClientRenewal,
    brandConfig,
    currentUser,
    setActiveTab
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRenewal | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<ClientRenewal | null>(null);
  const [reactivateConfirmClient, setReactivateConfirmClient] = useState<ClientRenewal | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Reason Form state
  const [editReasonInput, setEditReasonInput] = useState('');
  const [editCategoryInput, setEditCategoryInput] = useState<'financial' | 'client_request' | 'technical' | 'restructuring' | 'project_done' | 'other'>('client_request');
  const [editNotesInput, setEditNotesInput] = useState('');
  const [editResumeDateInput, setEditResumeDateInput] = useState('');

  // Add Suspended Contract Form state
  const [addMode, setAddMode] = useState<'from_existing' | 'new_client'>('from_existing');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');
  const [newClientData, setNewClientData] = useState({
    clientName: '',
    company: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    serviceName: 'باقة سيو وذكاء اصطناعي GEO',
    planCycle: 'شهري' as 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي',
    amount: 2500,
    currency: brandConfig?.systemCurrency || 'ج.م',
    renewalDate: new Date().toISOString().split('T')[0],
    suspensionReason: '',
    suspensionCategory: 'client_request' as 'financial' | 'client_request' | 'technical' | 'restructuring' | 'project_done' | 'other',
    suspendedAt: new Date().toISOString().split('T')[0],
    expectedResumeDate: '',
    notes: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active clients that can be suspended
  const activeClientsToSuspend = clientRenewals.filter(r => r.status !== 'suspended');

  // Category labels and colors
  const categoryMeta: Record<string, { label: string; badgeClass: string; borderClass: string; bgClass: string; icon: string }> = {
    financial: {
      label: 'تعثر مالي / تأخر سداد',
      badgeClass: 'bg-rose-500/15 text-rose-700 border-rose-300',
      borderClass: 'border-rose-400',
      bgClass: 'bg-rose-50/70',
      icon: '💳'
    },
    client_request: {
      label: 'طلب العميل مؤقتاً',
      badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-300',
      borderClass: 'border-amber-400',
      bgClass: 'bg-amber-50/70',
      icon: '⏸️'
    },
    technical: {
      label: 'أسباب فنية وتقنية',
      badgeClass: 'bg-purple-500/15 text-purple-700 border-purple-300',
      borderClass: 'border-purple-400',
      bgClass: 'bg-purple-50/70',
      icon: '⚙️'
    },
    restructuring: {
      label: 'إعادة هيكلة النشاط',
      badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-300',
      borderClass: 'border-blue-400',
      bgClass: 'bg-blue-50/70',
      icon: '🔄'
    },
    project_done: {
      label: 'انتهاء مدة المشروع',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
      borderClass: 'border-emerald-400',
      bgClass: 'bg-emerald-50/70',
      icon: '📦'
    },
    other: {
      label: 'أسباب أخرى',
      badgeClass: 'bg-slate-500/15 text-slate-700 border-slate-300',
      borderClass: 'border-slate-400',
      bgClass: 'bg-slate-50/70',
      icon: '📝'
    }
  };

  // Filter suspended contracts
  const filteredContracts = suspendedContracts.filter(c => {
    if (categoryFilter !== 'all') {
      const cat = c.suspensionCategory || 'other';
      if (cat !== categoryFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.clientName || '').toLowerCase().includes(q);
      const matchComp = (c.company || '').toLowerCase().includes(q);
      const matchServ = (c.serviceName || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchReason = (c.suspensionReason || '').toLowerCase().includes(q);
      const matchNotes = (c.suspensionNotes || c.notes || '').toLowerCase().includes(q);
      return matchName || matchComp || matchServ || matchPhone || matchReason || matchNotes;
    }

    return true;
  });

  // Calculate statistics
  const totalSuspendedCount = suspendedContracts.length;
  const totalSuspendedAmount = suspendedContracts.reduce((sum, c) => sum + (c.amount || 0), 0);
  const financialCount = suspendedContracts.filter(c => c.suspensionCategory === 'financial').length;
  const clientRequestCount = suspendedContracts.filter(c => c.suspensionCategory === 'client_request').length;
  const systemCurrency = brandConfig?.systemCurrency || 'ج.م';

  // Open edit modal
  const handleOpenEditModal = (client: ClientRenewal) => {
    setEditingClient(client);
    setEditReasonInput(client.suspensionReason || '');
    setEditCategoryInput(client.suspensionCategory || 'client_request');
    setEditNotesInput(client.suspensionNotes || client.notes || '');
    setEditResumeDateInput(client.expectedResumeDate || '');
  };

  // Submit edit modal
  const handleSaveEditReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    if (!editReasonInput.trim()) {
      showToast('يرجى إدخال سبب الإيقاف لتسجيله مع بيانات العميل');
      return;
    }

    updateSuspensionReason(
      editingClient.id,
      editReasonInput.trim(),
      editNotesInput.trim(),
      editCategoryInput
    );

    // Also update expected resume date if provided
    if (editResumeDateInput) {
      const target = clientRenewals.find(r => r.id === editingClient.id);
      if (target) {
        target.expectedResumeDate = editResumeDateInput;
      }
    }

    setEditingClient(null);
    showToast(`تم حفظ وتحديث سبب إيقاف عقد العميل (${editingClient.clientName}) بنجاح`);
  };

  // Submit Add Modal
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addMode === 'from_existing') {
      if (!selectedExistingId) {
        showToast('يرجى اختيار عميل من القائمة لإيقاف عقده');
        return;
      }
      if (!newClientData.suspensionReason.trim()) {
        showToast('يرجى كتابة سبب إيقاف العقد ليتم توثيقه');
        return;
      }

      suspendClientContract(
        selectedExistingId,
        newClientData.suspensionReason.trim(),
        newClientData.notes.trim(),
        newClientData.suspensionCategory
      );

      const target = clientRenewals.find(r => r.id === selectedExistingId);
      showToast(`تم نقل العميل (${target?.clientName || ''}) إلى العقود الموقوفة وتوثيق السبب بنجاح`);
      setShowAddModal(false);
      resetNewClientForm();
    } else {
      if (!newClientData.clientName.trim() || !newClientData.company.trim()) {
        showToast('يرجى إدخال اسم العميل والشركة');
        return;
      }
      if (!newClientData.suspensionReason.trim()) {
        showToast('يرجى كتابة سبب الإيقاف');
        return;
      }

      addSuspendedContract({
        clientName: newClientData.clientName.trim(),
        company: newClientData.company.trim(),
        phone: newClientData.phone.trim(),
        whatsappNumber: newClientData.whatsappNumber.trim() || newClientData.phone.trim(),
        email: newClientData.email.trim(),
        serviceName: newClientData.serviceName.trim(),
        planCycle: newClientData.planCycle,
        amount: Number(newClientData.amount) || 0,
        currency: newClientData.currency || systemCurrency,
        renewalDate: newClientData.renewalDate || new Date().toISOString().split('T')[0],
        suspensionReason: newClientData.suspensionReason.trim(),
        suspensionCategory: newClientData.suspensionCategory,
        notes: newClientData.notes.trim(),
        suspendedAt: newClientData.suspendedAt || new Date().toISOString().split('T')[0],
        expectedResumeDate: newClientData.expectedResumeDate || undefined
      });

      showToast(`تمت إضافة العميل الموقوف (${newClientData.clientName}) بنجاح`);
      setShowAddModal(false);
      resetNewClientForm();
    }
  };

  const resetNewClientForm = () => {
    setSelectedExistingId('');
    setNewClientData({
      clientName: '',
      company: '',
      phone: '',
      whatsappNumber: '',
      email: '',
      serviceName: 'باقة سيو وذكاء اصطناعي GEO',
      planCycle: 'شهري',
      amount: 2500,
      currency: systemCurrency,
      renewalDate: new Date().toISOString().split('T')[0],
      suspensionReason: '',
      suspensionCategory: 'client_request',
      suspendedAt: new Date().toISOString().split('T')[0],
      expectedResumeDate: '',
      notes: ''
    });
  };

  // Reactivate contract handler
  const handleConfirmReactivate = () => {
    if (!reactivateConfirmClient) return;
    reactivateClientContract(reactivateConfirmClient.id);
    showToast(`تمت إعادة تفعيل عقد العميل (${reactivateConfirmClient.clientName}) ونقله للاشتراكات السارية بنجاح! 🎉`);
    setReactivateConfirmClient(null);
  };

  // Delete contract handler
  const handleConfirmDelete = () => {
    if (!deleteConfirmClient) return;
    deleteClientRenewal(deleteConfirmClient.id);
    showToast(`تم حذف سجل العميل (${deleteConfirmClient.clientName}) نهائياً`);
    setDeleteConfirmClient(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs font-bold border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <PauseCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black text-slate-900">العقود الموقوفة (العملاء المتوقفين)</h1>
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-300">
                {suspendedContracts.length} عميل موقف
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              سجل متابعة العملاء والاشتراكات المتوقفة مؤقتاً مع سبب الإيقاف الدقيق، وتاريخ التوقف، وإمكانية إعادة التفعيل بضغطة واحدة
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('renewals')}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="الرجوع لملفات العملاء السارية والتجديدات"
          >
            <span>ملفات العملاء والاشتراكات الحالية</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => exportSuspendedContractsToExcel(filteredContracts)}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="تصدير كشف العقود الموقوفة مع أسباب التوقف إلى ملف إكسيل"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير إكسيل (Excel)</span>
          </button>

          <button
            onClick={() => {
              resetNewClientForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إيقاف عقد عميل جديد +</span>
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500">إجمالي العقود الموقوفة</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalSuspendedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">عميل مسجل في الأرشيف الموقف</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <PauseCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500">إجمالي المبالغ المعلقة</div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {totalSuspendedAmount.toLocaleString()} <span className="text-xs text-slate-600 font-bold">{systemCurrency}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">إيراد شهري متوقف حالياً</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500">طلب العميل مؤقتاً</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{clientRequestCount}</div>
            <div className="text-[10px] text-amber-600/80 mt-0.5">تجميد مؤقت مع إمكانية العودة</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500">تعثر مالي / تأخر سداد</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{financialCount}</div>
            <div className="text-[10px] text-rose-600/80 mt-0.5">يحتاج متابعة مالية وجدولة</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Reason Filter & View Toggle */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الشركة، الخدمة، أو سبب الإيقاف..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                categoryFilter === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              الكل ({suspendedContracts.length})
            </button>
            <button
              onClick={() => setCategoryFilter('client_request')}
              className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'client_request'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span>⏸️ طلب العميل</span>
              <span>({suspendedContracts.filter(c => c.suspensionCategory === 'client_request').length})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('financial')}
              className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'financial'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              <span>💳 تعثر مالي</span>
              <span>({suspendedContracts.filter(c => c.suspensionCategory === 'financial').length})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('technical')}
              className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'technical'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
              }`}
            >
              <span>⚙️ أسباب فنية</span>
              <span>({suspendedContracts.filter(c => c.suspensionCategory === 'technical').length})</span>
            </button>
            <button
              onClick={() => setCategoryFilter('restructuring')}
              className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                categoryFilter === 'restructuring'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <span>🔄 إعادة هيكلة</span>
              <span>({suspendedContracts.filter(c => c.suspensionCategory === 'restructuring').length})</span>
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
            title="عرض الكروت التفصيلية"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">كروت</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            }`}
            title="عرض الجدول المدمج"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">جدول</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/90 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <PauseCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-black text-slate-800">لا توجد عقود موقوفة حالياً</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || categoryFilter !== 'all'
                ? 'لا توجد نتائج تطابق معايير البحث والتصفية المحددة.'
                : 'جميع اشتراكات وعقود العملاء سارية ونشطة. يمكنك إيقاف أي عقد من هنا أو من قسم ملفات العملاء وتوثيق السبب.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إعادة ضبط البحث والتصفية
              </button>
            )}
            <button
              onClick={() => {
                resetNewClientForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل عقد موقوف وسبب الإيقاف</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredContracts.map(client => {
            const cat = client.suspensionCategory || 'client_request';
            const meta = categoryMeta[cat] || categoryMeta.other;
            const waPhone = (client.whatsappNumber || client.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-amber-50/30 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {client.clientName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-slate-900 truncate">{client.clientName}</h3>
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.2 rounded-full font-bold shrink-0">
                          عقد موقف ⏸️
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.company}</span>
                        {client.phone && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="dir-ltr text-[11px] font-mono text-slate-600">{client.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-sm font-black text-slate-900">
                      {client.amount?.toLocaleString()} <span className="text-[10px] text-slate-500">{client.currency || systemCurrency}</span>
                    </div>
                    <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold mt-1">
                      دورة: {client.planCycle}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col">
                  {/* Service info */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{client.serviceName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      المسؤول: <strong className="text-slate-700">{client.managedBy || 'هدير سعيد'}</strong>
                    </div>
                  </div>

                  {/* PROMINENT SUSPENSION REASON BOX (السبب يكون معايا بردو) */}
                  <div className={`p-3.5 rounded-xl border ${meta.borderClass} ${meta.bgClass} space-y-2 flex-1`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{meta.icon}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>تاريخ الإيقاف: {client.suspendedAt || client.renewalDate}</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-black text-slate-700 mb-0.5">سبب الإيقاف والتوقف:</div>
                      <p className="text-xs text-slate-900 font-extrabold leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                        {client.suspensionReason || 'لم يتم تسجيل سبب تفصيلي للإيقاف.'}
                      </p>
                    </div>

                    {(client.suspensionNotes || client.notes) && (
                      <div className="text-[11px] text-slate-600 bg-white/50 p-2 rounded-md border border-slate-200/40">
                        <strong className="text-slate-700">ملاحظات المتابعة: </strong>
                        <span>{client.suspensionNotes || client.notes}</span>
                      </div>
                    )}

                    {client.expectedResumeDate && (
                      <div className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-1 rounded font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>تاريخ العودة / الاستئناف المتوقع: {client.expectedResumeDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                          `السلام عليكم أستاذ ${client.clientName}، تحياتنا من شركة سويفت مايند. كنا حابين نطمن على حضرتك ونتابع معاك بخصوص باقة (${client.serviceName}) وإمكانية استئناف الخدمة في أقرب وقت.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="مراسلة العميل واتساب لمتابعة سبب الإيقاف وإمكانية التفعيل"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">واتساب</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(client)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="تعديل وتحديث سبب الإيقاف والملاحظات"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>تعديل السبب</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmClient(client)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                      title="حذف هذا العقد الموقف نهائياً"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setReactivateConfirmClient(client)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
                    title="إعادة تفعيل العقد والاشتراك ونقله فوراً إلى قائمة العملاء السارية"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>إعادة تفعيل العقد ▶️</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">العميل والشركة</th>
                  <th className="p-3.5">الباقة والخدمة</th>
                  <th className="p-3.5">المبلغ والعملة</th>
                  <th className="p-3.5">سبب الإيقاف (مفصل)</th>
                  <th className="p-3.5">تاريخ الإيقاف</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map(client => {
                  const cat = client.suspensionCategory || 'client_request';
                  const meta = categoryMeta[cat] || categoryMeta.other;
                  const waPhone = (client.whatsappNumber || client.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr key={client.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="p-3.5 font-bold">
                        <div className="text-slate-900 font-black">{client.clientName}</div>
                        <div className="text-[11px] text-slate-500">{client.company}</div>
                        {client.phone && <div className="text-[10px] text-slate-400 dir-ltr text-right">{client.phone}</div>}
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-800 font-bold">{client.serviceName}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">دورة: {client.planCycle}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-900 font-black">
                          {client.amount?.toLocaleString()} {client.currency || systemCurrency}
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <div className="mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${meta.badgeClass}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </div>
                        <div className="font-extrabold text-slate-800 bg-amber-50/60 p-2 rounded-md border border-amber-200/60 text-xs">
                          {client.suspensionReason || 'غير محدد'}
                        </div>
                        {client.expectedResumeDate && (
                          <div className="text-[10px] text-indigo-700 font-semibold mt-1">
                            عودة متوقعة: {client.expectedResumeDate}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                        {client.suspendedAt || client.renewalDate}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setReactivateConfirmClient(client)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="إعادة التفعيل"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>تفعيل</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(client)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="تعديل سبب الإيقاف"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                                `السلام عليكم أستاذ ${client.clientName}، تحياتنا من شركة سويفت مايند. كنا حابين نتابع مع حضرتك بخصوص استئناف باقة (${client.serviceName}).`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              title="واتساب"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => setDeleteConfirmClient(client)}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SUSPENSION REASON ================= */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-black text-sm text-slate-800">تعديل سبب إيقاف العقد</h3>
                  <p className="text-[11px] text-slate-500">{editingClient.clientName} ({editingClient.company})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReason} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف سبب الإيقاف:</label>
                <select
                  value={editCategoryInput}
                  onChange={e => setEditCategoryInput(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                >
                  <option value="client_request">⏸️ طلب العميل مؤقتاً (تجميد)</option>
                  <option value="financial">💳 تعثر مالي / تأخر سداد الدفعات</option>
                  <option value="technical">⚙️ أسباب فنية وتقنية لدى العميل</option>
                  <option value="restructuring">🔄 إعادة هيكلة النشاط التجاري</option>
                  <option value="project_done">📦 انتهاء مدة المشروع المطلوب</option>
                  <option value="other">📝 أسباب أخرى خاصة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  سبب الإيقاف والتوقف بالتفصيل <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  value={editReasonInput}
                  onChange={e => setEditReasonInput(e.target.value)}
                  rows={3}
                  placeholder="اكتب هنا السبب الدقيق لتوقف العقد ليكون محفوظاً معك دائماً..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية وتفاصيل المتابعة:</label>
                <textarea
                  value={editNotesInput}
                  onChange={e => setEditNotesInput(e.target.value)}
                  rows={2}
                  placeholder="أي اتفاقات سابقة مع العميل، شروط الاستئناف، أو أرقام الفواتير المعلقة..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ العودة / الاستئناف المتوقع (اختياري):</label>
                <input
                  type="date"
                  value={editResumeDateInput}
                  onChange={e => setEditResumeDateInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black shadow-md cursor-pointer"
                >
                  حفظ وتحديث السبب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD SUSPENDED CONTRACT ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 my-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PauseCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-sm text-slate-800">إيقاف عقد عميل وتسجيل سبب التوقف</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode selection: Existing Client vs New Client */}
            <div className="p-4 border-b border-slate-100 bg-amber-50/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAddMode('from_existing')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    addMode === 'from_existing'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  اختيار من العملاء الحاليين بالسستم ({activeClientsToSuspend.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('new_client')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    addMode === 'new_client'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  تسجيل عميل موقف جديد مباشرة
                </button>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              {addMode === 'from_existing' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اختر العميل المراد إيقاف عقده <span className="text-rose-500">*</span>:
                  </label>
                  {activeClientsToSuspend.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-center">
                      لا يوجد عملاء ساريين حالياً لنقلهم. يمكنك اختيار "تسجيل عميل موقف جديد مباشرة".
                    </div>
                  ) : (
                    <select
                      value={selectedExistingId}
                      onChange={e => setSelectedExistingId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                      required
                    >
                      <option value="">-- اضغط لاختيار العميل --</option>
                      {activeClientsToSuspend.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.clientName} - {c.company} ({c.serviceName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اسم العميل <span className="text-rose-500">*</span>:</label>
                      <input
                        type="text"
                        value={newClientData.clientName}
                        onChange={e => setNewClientData({ ...newClientData, clientName: e.target.value })}
                        placeholder="مثال: أحمد عبد الله"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">اسم الشركة / المنشأة <span className="text-rose-500">*</span>:</label>
                      <input
                        type="text"
                        value={newClientData.company}
                        onChange={e => setNewClientData({ ...newClientData, company: e.target.value })}
                        placeholder="مثال: شركة الأفق"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الواتساب:</label>
                      <input
                        type="text"
                        value={newClientData.phone}
                        onChange={e => setNewClientData({ ...newClientData, phone: e.target.value, whatsappNumber: e.target.value })}
                        placeholder="+966..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg dir-ltr"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الخدمة أو الباقة:</label>
                      <input
                        type="text"
                        value={newClientData.serviceName}
                        onChange={e => setNewClientData({ ...newClientData, serviceName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">قيمة العقد / الاشتراك:</label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={newClientData.amount}
                          onChange={e => setNewClientData({ ...newClientData, amount: Number(e.target.value) })}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          value={newClientData.currency}
                          onChange={e => setNewClientData({ ...newClientData, currency: e.target.value })}
                          className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">دورة السداد:</label>
                      <select
                        value={newClientData.planCycle}
                        onChange={e => setNewClientData({ ...newClientData, planCycle: e.target.value as any })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      >
                        <option value="شهري">شهري</option>
                        <option value="ربع سنوي">ربع سنوي</option>
                        <option value="نصف سنوي">نصف سنوي</option>
                        <option value="سنوي">سنوي</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Suspension Reason fields */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">تصنيف سبب الإيقاف:</label>
                  <select
                    value={newClientData.suspensionCategory}
                    onChange={e => setNewClientData({ ...newClientData, suspensionCategory: e.target.value as any })}
                    className="w-full p-2 bg-white border border-amber-300 rounded-lg font-bold text-slate-800"
                  >
                    <option value="client_request">⏸️ طلب العميل مؤقتاً (تجميد النشاط)</option>
                    <option value="financial">💳 تعثر مالي / تأخر سداد الدفعات</option>
                    <option value="technical">⚙️ أسباب فنية وتقنية لدى العميل</option>
                    <option value="restructuring">🔄 إعادة هيكلة النشاط التجاري</option>
                    <option value="project_done">📦 انتهاء مدة المشروع</option>
                    <option value="other">📝 أسباب أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    سبب الإيقاف بالتفصيل <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    value={newClientData.suspensionReason}
                    onChange={e => setNewClientData({ ...newClientData, suspensionReason: e.target.value })}
                    rows={3}
                    placeholder="اكتب هنا سبب الإيقاف بدقة (ليكون مسجل ومحفوظ معك دائماً)..."
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-slate-900 font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">تاريخ الإيقاف:</label>
                    <input
                      type="date"
                      value={newClientData.suspendedAt}
                      onChange={e => setNewClientData({ ...newClientData, suspendedAt: e.target.value })}
                      className="w-full p-2 bg-white border border-amber-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">تاريخ الاستئناف المتوقع (اختياري):</label>
                    <input
                      type="date"
                      value={newClientData.expectedResumeDate}
                      onChange={e => setNewClientData({ ...newClientData, expectedResumeDate: e.target.value })}
                      className="w-full p-2 bg-white border border-amber-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">ملاحظات إضافية:</label>
                  <input
                    type="text"
                    value={newClientData.notes}
                    onChange={e => setNewClientData({ ...newClientData, notes: e.target.value })}
                    placeholder="أي ملاحظات إضافية للرجوع إليها..."
                    className="w-full p-2 bg-white border border-amber-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black shadow-md cursor-pointer"
                >
                  تأكيد الإيقاف وحفظ السبب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REACTIVATE CONFIRM ================= */}
      {reactivateConfirmClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">إعادة تفعيل عقد العميل</h3>
              <p className="text-slate-600">
                هل تريد إعادة تفعيل عقد <strong className="text-slate-900 font-bold">"{reactivateConfirmClient.clientName}"</strong> ونقله إلى قائمة العملاء السارية والتجديدات؟
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
              ✅ سيتم نقل العميل فوراً إلى ملفات العملاء السارية واستئناف احتساب مواعيد تجديد الاشتراك.
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setReactivateConfirmClient(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReactivate}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black shadow-md cursor-pointer"
              >
                تأكيد إعادة التفعيل ▶️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRM ================= */}
      {deleteConfirmClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">حذف سجل العميل الموقف</h3>
              <p className="text-slate-600">
                هل ترغب في حذف سجل <strong className="text-slate-900">"{deleteConfirmClient.clientName}"</strong> نهائياً من المنظومة؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmClient(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-md cursor-pointer"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
