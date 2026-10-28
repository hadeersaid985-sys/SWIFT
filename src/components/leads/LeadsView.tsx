import React, { useState } from 'react';
import {
  Building,
  Plus,
  ArrowRightLeft,
  Mail,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  TrendingUp,
  Star,
  MessageSquare,
  Clock,
  Sparkles,
  Calendar,
  DollarSign,
  Edit3,
  Check,
  X,
  UserCheck,
  PhoneCall,
  Users,
  Send,
  FileCheck,
  ExternalLink,
  Shield,
  Briefcase,
  HelpCircle,
  Banknote,
  FileText,
  BadgePercent,
  CheckSquare,
  Square,
  ChevronDown
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadNegotiationEntry } from '../../types/crm';

export const LeadsView: React.FC = () => {
  const {
    leads,
    visibleLeads,
    team,
    convertLeadToDeal,
    convertLeadToClientAndHandoff,
    deleteLead,
    updateLead,
    addLead,
    assignLeadTeamMembers,
    addLeadNegotiation,
    setOpenQuickModal,
    currentUser,
    isManager,
    isSalesUser,
    setActiveTab
  } = useCRM();

  const [leadSearch, setLeadSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSalesMember, setFilterSalesMember] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal 1: Assign Sales Team Modal (تحديد مين من الموظفين يظهر عندهم العميل)
  const [assignTeamModalLead, setAssignTeamModalLead] = useState<Lead | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Modal 2: Add Negotiation Entry Modal (تدوين جولة تفاوض وتحديث السعر النهائي)
  const [addNegotiationLead, setAddNegotiationLead] = useState<Lead | null>(null);
  const [negotiationForm, setNegotiationForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'اتصال هاتفي',
    summary: '',
    offeredPrice: '',
    finalPrice: '',
    currency: 'ج.م',
    outcome: 'موافقة مبدئية'
  });

  // Modal 3: Full Lead Edit Modal (تعديل كامل للعميل والوصف والتفاوضات والمصدر)
  const [editModalLead, setEditModalLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    source: 'إحالة عميل سابق',
    customSource: '',
    estimatedValue: 0,
    finalPrice: 0,
    currency: 'ج.م',
    status: 'جديد',
    leadScore: 85,
    detailedDescription: '',
    negotiationsHistory: '',
    assignedTeamMemberIds: [] as string[]
  });

  // Modal 4: Interaction Log Modal State (سجل التعاملات والمكالمات مع الأرقام)
  const [logInteractionLead, setLogInteractionLead] = useState<Lead | null>(null);
  const [newInteractionData, setNewInteractionData] = useState({
    type: 'اتصال هاتفي',
    summary: '',
    nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dealingsStatus: 'مهتم جداً'
  });

  // Modal 5: Handoff to Team Modal State (تسليم العميل المحتمل لباقي التيم)
  const [handoffModalLead, setHandoffModalLead] = useState<Lead | null>(null);
  const [handoffForm, setHandoffForm] = useState({
    serviceName: 'استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)',
    amount: 2500,
    planCycle: 'سنوي' as 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي',
    currency: 'ج.م',
    assignedTeamIds: [] as string[],
    onboardingNotes: ''
  });
  const [handoffSuccessNotice, setHandoffSuccessNotice] = useState<string | null>(null);

  // Active leads pool: Admins see all, sales reps see visibleLeads (only assigned ones)
  const activeLeadsList = isManager ? leads : visibleLeads;

  // Filter leads
  const filteredLeads = activeLeadsList.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterSalesMember !== 'all') {
      const assigned = l.assignedTeamMemberIds || (l.assignedToId ? [l.assignedToId] : []);
      if (!assigned.includes(filterSalesMember)) return false;
    }
    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.source && l.source.toLowerCase().includes(q)) ||
        (l.customSource && l.customSource.toLowerCase().includes(q)) ||
        (l.detailedDescription && l.detailedDescription.toLowerCase().includes(q)) ||
        (l.negotiationsHistory && l.negotiationsHistory.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sales members list for easy assignment
  const salesTeamMembers = team.filter(
    m =>
      m.department === 'المبيعات' ||
      m.role?.toLowerCase().includes('sales') ||
      m.role?.toLowerCase().includes('سيلز') ||
      m.id === 'user-maibel' ||
      m.id === 'user-1'
  );

  // Helper to open assign modal
  const handleOpenAssignModal = (lead: Lead) => {
    setAssignTeamModalLead(lead);
    setSelectedMemberIds(lead.assignedTeamMemberIds || (lead.assignedToId ? [lead.assignedToId] : []));
  };

  // Save assigned team
  const handleSaveAssignedTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeamModalLead) return;
    assignLeadTeamMembers(assignTeamModalLead.id, selectedMemberIds);
    updateLead(assignTeamModalLead.id, {
      assignedToId: selectedMemberIds[0] || currentUser.id,
      assignedTeamMemberIds: selectedMemberIds
    });
    setAssignTeamModalLead(null);
  };

  // Open negotiation modal
  const handleOpenNegotiationModal = (lead: Lead) => {
    setAddNegotiationLead(lead);
    setNegotiationForm({
      date: new Date().toISOString().split('T')[0],
      type: 'اتصال هاتفي',
      summary: '',
      offeredPrice: lead.estimatedValue ? String(lead.estimatedValue) : '',
      finalPrice: lead.finalPrice ? String(lead.finalPrice) : '',
      currency: lead.currency || 'ج.م',
      outcome: 'موافقة مبدئية'
    });
  };

  // Save negotiation
  const handleSaveNegotiation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNegotiationLead || !negotiationForm.summary.trim()) return;

    addLeadNegotiation(addNegotiationLead.id, {
      date: negotiationForm.date,
      type: negotiationForm.type,
      summary: negotiationForm.summary.trim(),
      offeredPrice: negotiationForm.offeredPrice ? Number(negotiationForm.offeredPrice) : undefined,
      finalPrice: negotiationForm.finalPrice ? Number(negotiationForm.finalPrice) : undefined,
      currency: negotiationForm.currency,
      outcome: negotiationForm.outcome,
      authorName: currentUser.name,
      authorId: currentUser.id
    });

    setAddNegotiationLead(null);
  };

  // Open Edit Modal
  const handleOpenEditModal = (lead: Lead) => {
    setEditModalLead(lead);
    const isCustom =
      lead.source !== 'إحالة عميل سابق' &&
      lead.source !== 'الموقع الإلكتروني' &&
      lead.source !== 'إعلان ممول' &&
      lead.source !== 'لينكد إن' &&
      lead.source !== 'مؤتمر / ملتقى' &&
      lead.source !== 'محادثة واتساب مباشر' &&
      lead.source !== 'مكالمة هاتفية واردة' &&
      lead.source !== 'تيك توك';

    setEditForm({
      name: lead.name,
      company: lead.company,
      title: lead.title || '',
      phone: lead.phone,
      email: lead.email || '',
      source: isCustom ? 'مصدر آخر' : lead.source,
      customSource: isCustom ? lead.source : (lead.customSource || ''),
      estimatedValue: lead.estimatedValue || 0,
      finalPrice: lead.finalPrice || 0,
      currency: lead.currency || 'ج.م',
      status: lead.status,
      leadScore: lead.leadScore || 80,
      detailedDescription: lead.detailedDescription || '',
      negotiationsHistory: lead.negotiationsHistory || '',
      assignedTeamMemberIds: lead.assignedTeamMemberIds || (lead.assignedToId ? [lead.assignedToId] : [])
    });
  };

  // Save Full Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalLead) return;

    const finalSource = editForm.source === 'مصدر آخر' ? (editForm.customSource.trim() || 'مصدر مخصص') : editForm.source;

    updateLead(editModalLead.id, {
      name: editForm.name.trim(),
      company: editForm.company.trim(),
      title: editForm.title.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      source: finalSource,
      customSource: editForm.source === 'مصدر آخر' ? editForm.customSource.trim() : undefined,
      estimatedValue: Number(editForm.estimatedValue) || 0,
      finalPrice: editForm.finalPrice ? Number(editForm.finalPrice) : undefined,
      currency: editForm.currency || 'ج.م',
      status: editForm.status as any,
      leadScore: Number(editForm.leadScore) || 80,
      detailedDescription: editForm.detailedDescription.trim(),
      negotiationsHistory: editForm.negotiationsHistory.trim(),
      assignedTeamMemberIds: editForm.assignedTeamMemberIds,
      assignedToId: editForm.assignedTeamMemberIds[0] || editModalLead.assignedToId
    });

    setEditModalLead(null);
  };

  // Handle Log Interaction Submit
  const handleSaveInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInteractionLead || !newInteractionData.summary.trim()) return;

    const currentNotes = (logInteractionLead as any).dealingsHistory || [];
    const newEntry = {
      id: 'deal-log-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: newInteractionData.type,
      summary: newInteractionData.summary.trim(),
      nextFollowUp: newInteractionData.nextFollowUp,
      status: newInteractionData.dealingsStatus
    };

    updateLead(logInteractionLead.id, {
      status: newInteractionData.dealingsStatus as any,
      notes: `[${newEntry.date} - ${newEntry.type}]: ${newEntry.summary}`,
      ...({ dealingsHistory: [newEntry, ...currentNotes] } as any)
    });

    setLogInteractionLead(null);
    setNewInteractionData({
      type: 'اتصال هاتفي',
      summary: '',
      nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dealingsStatus: 'مهتم جداً'
    });
  };

  // Open Handoff Modal
  const handleOpenHandoff = (lead: Lead) => {
    setHandoffModalLead(lead);
    setHandoffForm({
      serviceName: 'استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)',
      amount: lead.finalPrice || lead.estimatedValue || 2500,
      planCycle: 'سنوي',
      currency: lead.currency || 'ج.م',
      assignedTeamIds:
        lead.assignedTeamMemberIds && lead.assignedTeamMemberIds.length > 0
          ? lead.assignedTeamMemberIds
          : lead.assignedToId
          ? [lead.assignedToId]
          : [],
      onboardingNotes: lead.notes || lead.detailedDescription ? `وصف العميل واحتياجاته: ${lead.detailedDescription || lead.notes}` : ''
    });
  };

  // Submit Handoff to Team
  const handleConfirmHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoffModalLead) return;

    convertLeadToClientAndHandoff(handoffModalLead.id, {
      serviceName: handoffForm.serviceName,
      amount: Number(handoffForm.amount) || 2500,
      planCycle: handoffForm.planCycle,
      currency: handoffForm.currency,
      assignedTeamIds: handoffForm.assignedTeamIds,
      onboardingNotes: handoffForm.onboardingNotes
    });

    const leadName = handoffModalLead.name;
    setHandoffModalLead(null);
    setHandoffSuccessNotice(`تم نقل العميل "${leadName}" بنجاح إلى ملفات العملاء وتكليف الفريق بالمهام الرسمية 🚀`);
    setTimeout(() => setHandoffSuccessNotice(null), 6000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Success Notification Alert */}
      {handoffSuccessNotice && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-black">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{handoffSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActiveTab('renewals')}
            className="px-3 py-1 bg-white text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 cursor-pointer"
          >
            الانتقال لملفات العملاء 📁
          </button>
        </div>
      )}

      {/* Role Visibility Indicator */}
      <div className="bg-slate-100 border border-slate-200/80 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span className="font-bold text-slate-800">
            {isManager ? (
              <>
                <strong className="text-purple-700 font-black">صلاحيات الإدارة والأدمن 🔒:</strong> تظهر لك جميع العملاء المحتملين، مع إمكانية تحديد أي عميل يظهر لأي موظف في المبيعات (مثل مايبل Maibel).
              </>
            ) : (
              <>
                <strong className="text-purple-700 font-black">قسم المبيعات ({currentUser.name}) 👤:</strong> تظهر لك فقط العملاء المحتملة المحددة والمكلفة لك من الإدارة (المعلم عليها لك حصراً).
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-600">
            المعروض: {filteredLeads.length} من أصل {leads.length} عميل محتمل
          </span>
        </div>
      </div>

      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                العملاء المحتملون والمبيعات (Sales Leads & Negotiations)
              </h1>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full">
                {filteredLeads.length} عميل محتمل
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة عملاء المبيعات، توثيق جولات التفاوض، تحديد السعر النهائي بالجنيه، وإسناد كل عميل للموظف المصرح له.
            </p>
          </div>
        </div>

        {/* TOP ACTION BAR: إضافة عميل محتمل جديد من الأعلى مباشرة */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOpenQuickModal('lead')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
            title="تسجيل عميل محتمل جديد برقم التواصل والمصدر والسعر النهائي"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ تسجيل عميل محتمل جديد</span>
          </button>
        </div>
      </div>

      {/* Filter, Sales Member Switcher, View Switcher & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-500 ml-1">تصفية الحالات:</span>
            {['all', 'جديد', 'تم التواصل', 'مهتم', 'مؤهل'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all' ? 'جميع الحالات' : st}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كروت أرقام التواصل 📇
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جدول تفصيلي 📋
            </button>
          </div>
        </div>

        {/* Second Filter Row: Filter by Assigned Employee (مين من الموظفين) & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Filter by Sales Member (خاص بالأدمن لمعرفة ما يظهر لكل موظف مثل مايبل) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>عرض عملاء الموظف (مين من الموظفين):</span>
            </span>
            <select
              value={filterSalesMember}
              onChange={e => setFilterSalesMember(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:border-purple-500"
            >
              <option value="all">كافة الموظفين المصرح لهم</option>
              {salesTeamMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role || 'مبيعات'})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={leadSearch}
              onChange={e => setLeadSearch(e.target.value)}
              placeholder="بحث بالاسم، الشركة، الهاتف، أو الوصف..."
              className="w-full bg-slate-50 pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-sans"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* VIEW 1: CARDS WITH PHONE NUMBERS, DETAILED DESCRIPTION, FINAL PRICE, NEGOTIATIONS & SALES ASSIGNMENTS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map(lead => {
            const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `السلام عليكم أستاذ ${lead.name}، معك فريق عمل سويفت. نتابع بخصوص طلبك لخدماتنا.`
            )}`;

            const currencySymbol = lead.currency || 'ج.م';
            const assignedMembers = team.filter(m =>
              (lead.assignedTeamMemberIds || (lead.assignedToId ? [lead.assignedToId] : [])).includes(m.id)
            );

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3 relative group hover:border-purple-300"
              >
                {/* 1. Header: Name, Company, Score & Source Badge */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                        {lead.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700">{lead.company}</span>
                        {lead.title && <span className="text-slate-400">({lead.title})</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          lead.leadScore >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.leadScore >= 60
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                        title="تقييم احتمالية الإغلاق"
                      >
                        {lead.leadScore}% اهتمام
                      </span>

                      {/* Source Badge with support for other custom sources */}
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-bold truncate max-w-[130px]" title={`مصدر العميل: ${lead.customSource || lead.source}`}>
                        📍 {lead.customSource || lead.source || 'الموقع الإلكتروني'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Pricing & Currency Section (القيمة التقديرية والسعر النهائي بالجنيه) */}
                <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-emerald-50/50 p-2.5 rounded-xl border border-purple-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">القيمة التقديرية:</span>
                    <span className="font-black text-slate-800 font-mono text-xs">
                      {lead.estimatedValue ? lead.estimatedValue.toLocaleString() : '0'} {currencySymbol}
                    </span>
                  </div>

                  <div className="border-r border-slate-200/80 pr-2">
                    <span className="text-[10px] font-black text-emerald-700 flex items-center gap-1">
                      <Banknote className="w-3 h-3 text-emerald-600" />
                      <span>السعر النهائي:</span>
                    </span>
                    <span className="font-black text-emerald-800 font-mono text-xs">
                      {lead.finalPrice ? `${lead.finalPrice.toLocaleString()} ${currencySymbol}` : <span className="text-[10px] text-slate-400 font-normal">قيد التفاوض</span>}
                    </span>
                  </div>
                </div>

                {/* 3. Direct Phone & WhatsApp Bar */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-purple-600" />
                      <span>رقم الهاتف المسجل:</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dir-ltr">
                      {lead.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="اتصال هاتفي مباشر"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>اتصال</span>
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-2xs"
                      title="فتح محادثة واتساب مع العميل"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>واتساب</span>
                    </a>
                  </div>
                </div>

                {/* 4. الوصف التفصيلي للعميل المحتمل (Detailed Description) */}
                {lead.detailedDescription && (
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs space-y-0.5">
                    <span className="text-[10px] font-black text-slate-600 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>الوصف التفصيلي واحتياجات العميل:</span>
                    </span>
                    <p className="text-[11px] text-slate-700 leading-relaxed line-clamp-2">
                      {lead.detailedDescription}
                    </p>
                  </div>
                )}

                {/* 5. سجل التفاوضات والعروض التي تمت (Negotiations Log) */}
                <div className="text-xs bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>التفاوضات التي تمت والعروض:</span>
                    </span>
                    <button
                      onClick={() => handleOpenNegotiationModal(lead)}
                      className="text-purple-700 hover:text-purple-900 bg-white border border-purple-200 px-2 py-0.5 rounded-md font-black cursor-pointer shadow-2xs hover:bg-purple-50"
                    >
                      + تدوين تفاوض
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                    {lead.negotiationsHistory || lead.notes || 'تم استلام الطلب وتجهيز عرض السعر الأولي لمناقشته مع العميل.'}
                  </p>

                  {/* Negotiation Entries Count */}
                  {lead.negotiationEntries && lead.negotiationEntries.length > 0 && (
                    <div className="text-[10px] text-purple-800 font-bold bg-white/70 px-2 py-0.5 rounded flex items-center justify-between">
                      <span>عدد جولات التفاوض: {lead.negotiationEntries.length}</span>
                      <span className="font-normal text-slate-500">
                        آخر جولة: {lead.negotiationEntries[0].date} ({lead.negotiationEntries[0].type})
                      </span>
                    </div>
                  )}
                </div>

                {/* 6. الموظفون المصرح لهم برؤية هذا العميل (مين من الموظفين) */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1 text-slate-600 font-bold">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>مين من الموظفين مصرح له:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {assignedMembers.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {assignedMembers.slice(0, 2).map(m => (
                          <span
                            key={m.id}
                            className="text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md"
                            title={`مصرح للموظف: ${m.name} (${m.role})`}
                          >
                            {m.name}
                          </span>
                        ))}
                        {assignedMembers.length > 2 && (
                          <span className="text-[10px] font-bold text-slate-500">
                            +{assignedMembers.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-200/60 px-2 py-0.5 rounded-md">
                        الأدمن فقط
                      </span>
                    )}

                    {/* زر سريع لتعديل وتحديد من هم الموظفين المصرح لهم */}
                    <button
                      onClick={() => handleOpenAssignModal(lead)}
                      className="p-1 hover:bg-purple-100 text-purple-700 rounded-md cursor-pointer mr-1"
                      title="تحديد أو تغيير الموظفين المصرح لهم برؤية العميل (مين من الموظفين)"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 7. Handoff to Team or Converted Badge */}
                {lead.isConvertedToClient ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>تم تسليمه للتيم بنجاح كعميل رسمي 🤝</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('renewals')}
                      className="text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-lg cursor-pointer shrink-0"
                    >
                      عرض الملف ↗
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenHandoff(lead)}
                    className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                    title="نقل العميل لباقي التيم وتوزيع المهام وصلاحيات الرؤية"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>نقل العميل لباقي التيم (Handoff) 🚀</span>
                  </button>
                )}

                {/* 8. Card Footer: Status Select, Edit, and Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold">الحالة:</span>
                    <select
                      value={lead.status}
                      onChange={e => updateLead(lead.id, { status: e.target.value as any })}
                      className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2 py-0.5 text-[11px] font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="جديد">جديد</option>
                      <option value="تم التواصل">تم التواصل</option>
                      <option value="مهتم">مهتم</option>
                      <option value="مؤهل">مؤهل</option>
                      <option value="غير مؤهل">غير مؤهل</option>
                      <option value="صفقة ناجحة (Won)">صفقة ناجحة (Won)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(lead)}
                      className="p-1.5 hover:bg-purple-50 text-slate-500 hover:text-purple-700 rounded-lg cursor-pointer transition-colors"
                      title="تعديل تفاصيل العميل والسعر والوصف"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => convertLeadToDeal(lead.id, lead.finalPrice || lead.estimatedValue)}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                      title="تحويل العميل لصفقة مبيعات مباشرة"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>تحويل لصفقة</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`هل تريد حذف العميل المحتمل: ${lead.name}؟`)) {
                          deleteLead(lead.id);
                        }
                      }}
                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DETAILED TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">اسم العميل والمسمى</th>
                  <th className="py-3.5 px-4">الشركة والمصدر</th>
                  <th className="py-3.5 px-4">رقم التواصل والواتساب</th>
                  <th className="py-3.5 px-4">القيمة التقديرية</th>
                  <th className="py-3.5 px-4">السعر النهائي المتفق عليه</th>
                  <th className="py-3.5 px-4">الموظف المصرح له (مين من الموظفين)</th>
                  <th className="py-3.5 px-4">سجل التفاوض والوصف</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `السلام عليكم أستاذ ${lead.name}، معك فريق سويفت.`
                  )}`;
                  const currencySymbol = lead.currency || 'ج.م';
                  const assignedMembers = team.filter(m =>
                    (lead.assignedTeamMemberIds || (lead.assignedToId ? [lead.assignedToId] : [])).includes(m.id)
                  );

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{lead.title}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="text-[10px] text-purple-700 font-bold">
                          📍 {lead.customSource || lead.source}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono text-slate-800 font-bold dir-ltr text-right">
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold hover:bg-slate-200"
                            >
                              اتصال
                            </a>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold hover:bg-emerald-200"
                            >
                              واتساب
                            </a>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-700 font-mono text-xs">
                          {lead.estimatedValue ? lead.estimatedValue.toLocaleString() : '0'} {currencySymbol}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {lead.finalPrice ? (
                          <span className="font-black text-emerald-700 font-mono text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            {lead.finalPrice.toLocaleString()} {currencySymbol}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">قيد التفاوض</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {assignedMembers.length > 0 ? (
                            assignedMembers.map(m => (
                              <span
                                key={m.id}
                                className="text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded"
                              >
                                {m.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">الأدمن فقط</span>
                          )}
                          <button
                            onClick={() => handleOpenAssignModal(lead)}
                            className="p-1 hover:bg-purple-100 text-purple-700 rounded cursor-pointer"
                            title="تعديل الموظفين المصرح لهم"
                          >
                            <UserCheck className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-700 line-clamp-1 font-semibold">
                          {lead.negotiationsHistory || lead.notes || 'لا يوجد سجل تفاوض'}
                        </p>
                        {lead.detailedDescription && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {lead.detailedDescription}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={e => updateLead(lead.id, { status: e.target.value as any })}
                          className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="جديد">جديد</option>
                          <option value="تم التواصل">تم التواصل</option>
                          <option value="مهتم">مهتم</option>
                          <option value="مؤهل">مؤهل</option>
                          <option value="غير مؤهل">غير مؤهل</option>
                          <option value="صفقة ناجحة (Won)">صفقة ناجحة (Won)</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenNegotiationModal(lead)}
                            className="p-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-pointer transition-colors"
                            title="تدوين تفاوض وتحديث السعر النهائي"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(lead)}
                            className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                            title="تعديل العميل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => convertLeadToDeal(lead.id, lead.finalPrice || lead.estimatedValue)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="تحويل لصفقة مبيعات"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>تحويل</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`هل تريد حذف العميل المحتمل: ${lead.name}؟`)) {
                                deleteLead(lead.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* ================= MODAL 1: ASSIGN SALES TEAM MEMBERS (مين من الموظفين المصرح لهم) ================= */}
      {assignTeamModalLead && (
        <div
          onClick={() => setAssignTeamModalLead(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    تحديد الموظفين المصرح لهم برؤية هذا العميل
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {assignTeamModalLead.name} ({assignTeamModalLead.company})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssignTeamModalLead(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignedTeam} className="space-y-4 text-xs">
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-purple-900 space-y-1">
                <span className="font-black flex items-center gap-1 text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>تنبيه الخصوصية والصلاحيات:</span>
                </span>
                <p className="text-[11px] leading-relaxed text-purple-800">
                  الموظفون المبيعات الذين يتم تعليمهم هنا فقط (مثل مايبل Maibel) هم من سيظهر لهم هذا العميل في حساباتهم، ولن يظهر لباقي المبيعات أو الأقسام الأخرى. الأدمن يرى الجميع دائماً 🔒.
                </p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                {team.map(member => {
                  const isChecked = selectedMemberIds.includes(member.id);
                  const isSales =
                    member.department === 'المبيعات' ||
                    member.role?.toLowerCase().includes('sales') ||
                    member.role?.toLowerCase().includes('سيلز') ||
                    member.id === 'user-maibel';

                  return (
                    <label
                      key={member.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-purple-50 border-purple-300 text-purple-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedMemberIds(prev => [...prev, member.id]);
                          } else {
                            setSelectedMemberIds(prev => prev.filter(id => id !== member.id));
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="w-7 h-7 rounded-lg bg-purple-200 text-purple-900 font-black text-xs flex items-center justify-center shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isSales && (
                            <span className="text-[9px] bg-purple-200 text-purple-900 font-black px-1.5 py-0.2 rounded">
                              مبيعات
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignTeamModalLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ التعيين وتحديث الصلاحيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD NEGOTIATION ENTRY & UPDATE FINAL PRICE ================= */}
      {addNegotiationLead && (
        <div
          onClick={() => setAddNegotiationLead(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    تدوين جولة تفاوض وتحديث السعر النهائي
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    العميل: {addNegotiationLead.name} ({addNegotiationLead.company})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddNegotiationLead(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNegotiation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التفاوض:</label>
                  <input
                    type="date"
                    required
                    value={negotiationForm.date}
                    onChange={e => setNegotiationForm({ ...negotiationForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة التفاوض:</label>
                  <select
                    value={negotiationForm.type}
                    onChange={e => setNegotiationForm({ ...negotiationForm, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="اتصال هاتفي">اتصال هاتفي 📞</option>
                    <option value="محادثة واتساب">محادثة واتساب 💬</option>
                    <option value="اجتماع زوم / Google Meet">اجتماع زوم / Google Meet 💻</option>
                    <option value="جلسة تفاوض مباشرة">جلسة تفاوض مباشرة 🤝</option>
                    <option value="إرسال مسودة عرض سعر">إرسال مسودة عرض سعر 📄</option>
                  </select>
                </div>
              </div>

              {/* Pricing row in Egyptian Pounds */}
              <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">السعر المعروض:</label>
                  <input
                    type="number"
                    value={negotiationForm.offeredPrice}
                    onChange={e => setNegotiationForm({ ...negotiationForm, offeredPrice: e.target.value })}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black text-emerald-800 mb-1 text-[11px]">السعر النهائي المتفق عليه: *</label>
                  <input
                    type="number"
                    required
                    value={negotiationForm.finalPrice}
                    onChange={e => setNegotiationForm({ ...negotiationForm, finalPrice: e.target.value })}
                    placeholder="مثال: 95000"
                    className="w-full bg-white border border-emerald-400 rounded-xl px-2.5 py-1.5 text-xs font-mono font-black text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">العملة:</label>
                  <select
                    value={negotiationForm.currency}
                    onChange={e => setNegotiationForm({ ...negotiationForm, currency: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    <option value="ج.م">جنيه مصري (ج.م)</option>
                    <option value="ر.س">ريال سعودي (ر.س)</option>
                    <option value="$">دولار ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نتيجة جولة التفاوض:</label>
                <select
                  value={negotiationForm.outcome}
                  onChange={e => setNegotiationForm({ ...negotiationForm, outcome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  <option value="موافقة مبدئية">موافقة مبدئية وجاري إعداد العقد ✅</option>
                  <option value="طلب تخفيض">طلب تخفيض إضافي أو تسهيلات سداد 🔄</option>
                  <option value="تم الاتفاق النهائي">تم الاتفاق النهائي على السعر والشروط 🤝</option>
                  <option value="متردد / يدرس البدائل">متردد / يدرس البدائل ⏳</option>
                  <option value="مرفوض">مرفوض بسبب الميزانية ❌</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  تفاصيل وما تم الاتفاق عليه خلال التفاوض: *
                </label>
                <textarea
                  rows={3}
                  required
                  value={negotiationForm.summary}
                  onChange={e => setNegotiationForm({ ...negotiationForm, summary: e.target.value })}
                  placeholder="مثال: ناقشنا باقة الـ 2 سيستم و2 دومين، وطلب خصم 10% مقابل سداد الدفعة كاملة كاش، وتم الاتفاق على 95,000 ج.م..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddNegotiationLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  حفظ التفاوض واعتماد السعر النهائي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: FULL LEAD EDIT MODAL ================= */}
      {editModalLead && (
        <div
          onClick={() => setEditModalLead(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    تعديل بيانات العميل المحتمل والتفاوضات
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editModalLead.name} ({editModalLead.company})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalLead(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الشركة / المؤسسة *</label>
                  <input
                    type="text"
                    required
                    value={editForm.company}
                    onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono dir-ltr"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Source & Custom Source */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مصدر العميل</label>
                  <select
                    value={editForm.source}
                    onChange={e => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium cursor-pointer"
                  >
                    <option value="إحالة عميل سابق">إحالة عميل سابق</option>
                    <option value="الموقع الإلكتروني">الموقع الإلكتروني</option>
                    <option value="إعلان ممول">إعلان ممول</option>
                    <option value="لينكد إن">لينكد إن</option>
                    <option value="مؤتمر / ملتقى">مؤتمر / ملتقى</option>
                    <option value="محادثة واتساب مباشر">محادثة واتساب مباشر</option>
                    <option value="مكالمة هاتفية واردة">مكالمة هاتفية واردة</option>
                    <option value="تيك توك">تيك توك</option>
                    <option value="مصدر آخر">مصدر آخر (مخصص)...</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">العملة:</label>
                  <select
                    value={editForm.currency}
                    onChange={e => setEditForm({ ...editForm, currency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold cursor-pointer"
                  >
                    <option value="ج.م">جنيه مصري (ج.م)</option>
                    <option value="ر.س">ريال سعودي (ر.س)</option>
                    <option value="$">دولار ($)</option>
                  </select>
                </div>
              </div>

              {editForm.source === 'مصدر آخر' && (
                <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 space-y-1">
                  <label className="block font-bold text-purple-900 text-xs">اكتب مصدر العميل المخصص: *</label>
                  <input
                    type="text"
                    required
                    value={editForm.customSource}
                    onChange={e => setEditForm({ ...editForm, customSource: e.target.value })}
                    placeholder="مثال: ترشيح من شريك، تليجرام، استشارة مجانية..."
                    className="w-full bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              )}

              {/* Estimated Value & Final Price in EGP */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القيمة التقديرية ({editForm.currency})</label>
                  <input
                    type="number"
                    value={editForm.estimatedValue}
                    onChange={e => setEditForm({ ...editForm, estimatedValue: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black text-emerald-800 mb-1">السعر النهائي المتفق عليه ({editForm.currency})</label>
                  <input
                    type="number"
                    value={editForm.finalPrice}
                    onChange={e => setEditForm({ ...editForm, finalPrice: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-2.5 py-1.5 font-mono font-black text-emerald-900"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">الوصف التفصيلي للعميل واحتياجاته:</label>
                <textarea
                  rows={2}
                  value={editForm.detailedDescription}
                  onChange={e => setEditForm({ ...editForm, detailedDescription: e.target.value })}
                  placeholder="وصف طبيعة النشاط والاحتياجات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none"
                />
              </div>

              {/* Negotiations History */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">التفاوضات التي تمت والعروض:</label>
                <textarea
                  rows={2}
                  value={editForm.negotiationsHistory}
                  onChange={e => setEditForm({ ...editForm, negotiationsHistory: e.target.value })}
                  placeholder="سجل التفاوضات والاتفاقات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none"
                />
              </div>

              {/* Assigned Sales Team Members (مين من الموظفين) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-black text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>مين من الموظفين المصرح لهم برؤية هذا العميل:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                  {team.map(m => {
                    const isChecked = editForm.assignedTeamMemberIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                          isChecked ? 'bg-purple-100/70 border-purple-300 font-bold' : 'bg-white border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setEditForm(prev => ({
                                ...prev,
                                assignedTeamMemberIds: [...prev.assignedTeamMemberIds, m.id]
                              }));
                            } else {
                              setEditForm(prev => ({
                                ...prev,
                                assignedTeamMemberIds: prev.assignedTeamMemberIds.filter(id => id !== m.id)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="truncate">{m.name}</span>
                        {m.id === 'user-maibel' && (
                          <span className="text-[9px] bg-purple-200 text-purple-900 px-1 rounded">سيلز</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: LOG CALL / INTERACTION ================= */}
      {logInteractionLead && (
        <div
          onClick={() => setLogInteractionLead(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-purple-600" />
                  <span>تدوين تعامل / مكالمة مع العميل</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {logInteractionLead.name} ({logInteractionLead.company}) - {logInteractionLead.phone}
                </p>
              </div>
              <button
                onClick={() => setLogInteractionLead(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInteraction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع التعامل:</label>
                  <select
                    value={newInteractionData.type}
                    onChange={e => setNewInteractionData({ ...newInteractionData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="اتصال هاتفي">اتصال هاتفي 📞</option>
                    <option value="محادثة واتساب">محادثة واتساب 💬</option>
                    <option value="اجتماع زوم أو أونلاين">اجتماع زوم أو أونلاين 💻</option>
                    <option value="إرسال عرض سعر">إرسال عرض سعر 📄</option>
                    <option value="زيارة ميدانية">زيارة ميدانية 🏢</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">درجة اهتمام العميل:</label>
                  <select
                    value={newInteractionData.dealingsStatus}
                    onChange={e => setNewInteractionData({ ...newInteractionData, dealingsStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="مهتم">مهتم</option>
                    <option value="مؤهل">مؤهل وجاهز للتعاقد</option>
                    <option value="تم التواصل">تم التواصل وبانتظار الرد</option>
                    <option value="غير مؤهل">غير مناسب حالياً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل ومخرجات التعامل: *</label>
                <textarea
                  rows={3}
                  required
                  value={newInteractionData.summary}
                  onChange={e => setNewInteractionData({ ...newInteractionData, summary: e.target.value })}
                  placeholder="مثال: تحدثنا هاتفياً وطلب تحليل لموقعه، وأكد اهتمامه بالسعر النهائي..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ المتابعة القادمة:</label>
                <input
                  type="date"
                  value={newInteractionData.nextFollowUp}
                  onChange={e => setNewInteractionData({ ...newInteractionData, nextFollowUp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLogInteractionLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ التعامل وتحديث السجل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: HANDOFF TO CLIENT DOSSIER ================= */}
      {handoffModalLead && (
        <div
          onClick={() => setHandoffModalLead(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                    <span>تسليم العميل لباقي التيم (Client Handoff)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                      فولدر رسمي جديد
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تحويل {handoffModalLead.name} ({handoffModalLead.company}) من مرحلة المبيعات لملفات العملاء الرسمية مع توزيع المهام وصلاحيات الرؤية.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHandoffModalLead(null)}
                className="p-1 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmHandoff} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 font-bold block">اسم العميل:</span>
                  <span className="font-black text-slate-900">{handoffModalLead.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">الشركة أو الجهة:</span>
                  <span className="font-black text-slate-900">{handoffModalLead.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">رقم الهاتف:</span>
                  <span className="font-mono font-black text-slate-800 dir-ltr text-right">{handoffModalLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">السعر النهائي المتفق عليه:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {handoffModalLead.finalPrice ? `${handoffModalLead.finalPrice.toLocaleString()} ${handoffModalLead.currency || 'ج.م'}` : `${handoffModalLead.estimatedValue.toLocaleString()} ${handoffModalLead.currency || 'ج.م'}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-black text-slate-800">باقة الخدمة المتفق عليها: *</label>
                <input
                  type="text"
                  required
                  value={handoffForm.serviceName}
                  onChange={e => setHandoffForm({ ...handoffForm, serviceName: e.target.value })}
                  placeholder="مثال: استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">قيمة التعاقد ({handoffForm.currency}): *</label>
                  <input
                    type="number"
                    required
                    value={handoffForm.amount}
                    onChange={e => setHandoffForm({ ...handoffForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-emerald-700 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-black text-slate-800 mb-1">دورة الفاتورة / التجديد: *</label>
                  <select
                    value={handoffForm.planCycle}
                    onChange={e => setHandoffForm({ ...handoffForm, planCycle: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="شهري">شهري</option>
                    <option value="ربع سنوي">ربع سنوي</option>
                    <option value="نصف سنوي">نصف سنوي</option>
                    <option value="سنوي">سنوي</option>
                  </select>
                </div>
              </div>

              {/* Team Assignment for Handoff */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>فريق العمل المكلّف بمتابعة ملف العميل:</span>
                  </label>
                  <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-lg border border-purple-200">
                    الأدمن يرى الجميع 🔒
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {team.map(member => {
                    const isChecked = handoffForm.assignedTeamIds.includes(member.id);

                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-100/80 border-purple-300 text-purple-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setHandoffForm(prev => ({
                                ...prev,
                                assignedTeamIds: [...prev.assignedTeamIds, member.id]
                              }));
                            } else {
                              setHandoffForm(prev => ({
                                ...prev,
                                assignedTeamIds: prev.assignedTeamIds.filter(id => id !== member.id)
                              }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-slate-900">{member.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-black text-slate-800">
                  بريف وتوجيهات التسليم لباقي التيم (Handoff Brief):
                </label>
                <textarea
                  rows={2}
                  value={handoffForm.onboardingNotes}
                  onChange={e => setHandoffForm({ ...handoffForm, onboardingNotes: e.target.value })}
                  placeholder="اكتب تفاصيل الاتفاق والروابط الأولية لبدء باقي التيم فوراً..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHandoffModalLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2 hover:scale-[1.01] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد التسليم ونقل العميل للتيم 🚀</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
