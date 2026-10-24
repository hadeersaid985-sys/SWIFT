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
  Briefcase
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead } from '../../types/crm';

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
    setOpenQuickModal,
    currentUser,
    isManager,
    setActiveTab
  } = useCRM();

  const [leadSearch, setLeadSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Interaction Log Modal State (سجل التعاملات والمكالمات مع الأرقام)
  const [logInteractionLead, setLogInteractionLead] = useState<Lead | null>(null);
  const [newInteractionData, setNewInteractionData] = useState({
    type: 'اتصال هاتفي',
    summary: '',
    nextFollowUp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dealingsStatus: 'مهتم جداً'
  });

  // Handoff to Team Modal State (تسليم العميل المحتمل لباقي التيم وتحديد من يظهر له)
  const [handoffModalLead, setHandoffModalLead] = useState<Lead | null>(null);
  const [handoffForm, setHandoffForm] = useState({
    serviceName: 'استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)',
    amount: 2500,
    planCycle: 'سنوي' as 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي',
    currency: 'ر.س',
    assignedTeamIds: [] as string[],
    onboardingNotes: ''
  });
  const [handoffSuccessNotice, setHandoffSuccessNotice] = useState<string | null>(null);

  // Determine active lead pool (Admins see all leads, employees see visibleLeads)
  const activeLeadsList = visibleLeads || leads;

  // Filter leads
  const filteredLeads = activeLeadsList.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (leadSearch.trim()) {
      const q = leadSearch.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
      );
    }
    return true;
  });

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
      amount: 2500,
      planCycle: 'سنوي',
      currency: 'ر.س',
      assignedTeamIds: lead.assignedTeamMemberIds && lead.assignedTeamMemberIds.length > 0
        ? lead.assignedTeamMemberIds
        : (lead.assignedToId ? [lead.assignedToId] : []),
      onboardingNotes: lead.notes ? `ملاحظات العميل من قسم المبيعات: ${lead.notes}` : ''
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
    <div className="space-y-6 pb-12 animate-in fade-in select-none">
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
      <div className="bg-slate-100 border border-slate-200/80 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-600" />
          <span className="font-bold text-slate-800">
            {isManager
              ? 'صلاحيات الأدمن العام 🔒: تظهر جميع العملاء المحتملين لكافة أعضاء الفريق دون حجب.'
              : `حساب الموظف (${currentUser.name}) 👤: تظهر فقط العملاء والليدز المعينة لك من الإدارة.`}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-600">
          المعروض: {filteredLeads.length} من أصل {leads.length}
        </span>
      </div>

      {/* Top Header: إضافة / تعديل / حذف من الأعلى (اي حاجة في الموقع فيها اضافة او حذف او تعديل من فوق) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                العملاء المحتملون ومسار التسليم للتيم (Sales Leads & Handoff Pipeline)
              </h1>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                {filteredLeads.length} عميل محتمل
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              متابعة عملاء المبيعات، تسجيل التعاملات، وتسليم العميل لباقي التيم (Handoff) مع تحديد صلاحيات الرؤية لكل موظف.
            </p>
          </div>
        </div>

        {/* TOP ACTION BAR: إضافة | تعديل | حذف من فوق مباشرة */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. ➕ إضافة من فوق */}
          <button
            onClick={() => setOpenQuickModal('lead')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="إضافة عميل محتمل جديد برقم التواصل"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ إضافة عميل محتمل</span>
          </button>

          {/* 2. ✏️ تسجيل تعامل / تعديل */}
          <button
            onClick={() => {
              if (filteredLeads.length > 0) {
                setLogInteractionLead(filteredLeads[0]);
              } else {
                alert('لا يوجد عملاء محتملون حالياً لتسجيل تعامل معهم.');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="تسجيل مكالمة أو تعامل مع أول عميل"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">تسجيل تعامل مع رقم</span>
          </button>

          {/* 3. 🗑️ حذف من فوق */}
          <button
            onClick={() => {
              const inactive = leads.filter(l => l.status === 'غير مؤهل');
              if (inactive.length === 0) {
                alert('لا يوجد عملاء غير مؤهلين للحذف حالياً.');
                return;
              }
              if (confirm(`هل تريد حذف ${inactive.length} عميل غير مؤهل دفعة واحدة؟`)) {
                inactive.forEach(l => deleteLead(l.id));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="حذف العملاء غير المؤهلين دفعة واحدة"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">حذف غير المؤهلين</span>
          </button>
        </div>
      </div>

      {/* Filter, View Switcher & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
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

        <div className="flex items-center gap-3">
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

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={leadSearch}
              onChange={e => setLeadSearch(e.target.value)}
              placeholder="بحث بالاسم، الشركة، أو رقم الهاتف..."
              className="w-full bg-slate-50 pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-purple-500 font-sans"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* VIEW 1: CARDS WITH PHONE NUMBERS & DEALINGS LOG (وفيها العملاء المحتملين واراقام اتعامل معاهم) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map(lead => {
            const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `السلام عليكم أستاذ ${lead.name}، معك فريق عمل سويفت. نتابع بخصوص طلبك لخدماتنا.`
            )}`;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between space-y-3 relative group hover:border-purple-300"
              >
                {/* Card Header: Name, Score & Status */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                        {lead.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{lead.company}</span>
                        {lead.title && <span className="text-slate-400">({lead.title})</span>}
                      </div>
                    </div>

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
                  </div>
                </div>

                {/* Direct Phone & WhatsApp Bar (أرقام اتعاملت معاهم) */}
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

                  <div className="flex items-center gap-2 pt-1">
                    {/* Direct Call Button */}
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      title="اتصال هاتفي مباشر"
                    >
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>اتصال</span>
                    </a>

                    {/* Direct WhatsApp Button */}
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

                {/* Dealings & Notes Log Snippet (سجل التعاملات السابقة) */}
                <div className="text-xs bg-purple-50/60 p-2.5 rounded-xl border border-purple-100 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-purple-900">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>سجل آخر تعامل مع الرقم:</span>
                    </span>
                    <button
                      onClick={() => setLogInteractionLead(lead)}
                      className="text-purple-700 hover:text-purple-900 underline font-black cursor-pointer"
                    >
                      + تدوين تعامل
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                    {lead.notes || 'تم التواصل وإرسال عرض السعر المبدئي ونموذج إحصائيات باقة الظهور السحابي.'}
                  </p>
                </div>

                {/* Assigned Team Members for visibility (تحديد من يظهر له من التيم) */}
                <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>فريق العمل المصرح له:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {lead.assignedTeamMemberIds && lead.assignedTeamMemberIds.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {lead.assignedTeamMemberIds.length} موظفين
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-200/60 px-2 py-0.5 rounded-full">
                        الأدمن فقط
                      </span>
                    )}
                  </div>
                </div>

                {/* Handoff to Team Action or Converted Badge */}
                {lead.isConvertedToClient ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>تم تسليمه للتيم بنجاح كعميل رسمي 🤝</span>
                    </span>
                    <button
                      onClick={() => setActiveTab('renewals')}
                      className="text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg cursor-pointer shrink-0 transition-colors"
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

                {/* Card Footer: Status Select & Fast Convert */}
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
                      onClick={() => convertLeadToDeal(lead.id)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
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
                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
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
                  <th className="py-3.5 px-4">الشركة والمؤسسة</th>
                  <th className="py-3.5 px-4">أرقام التواصل والواتساب</th>
                  <th className="py-3.5 px-4">سجل آخر تعامل</th>
                  <th className="py-3.5 px-4">تقييم الاهتمام</th>
                  <th className="py-3.5 px-4">القيمة التقديرية</th>
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

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{lead.title}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lead.company}</span>
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

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-600 line-clamp-2">
                          {lead.notes || 'تم التواصل ومناقشة تفاصيل الباقة.'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded-full ${
                            lead.leadScore >= 80
                              ? 'bg-emerald-100 text-emerald-700'
                              : lead.leadScore >= 60
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {lead.leadScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-slate-900 text-xs">
                          {lead.estimatedValue.toLocaleString()} ر.س
                        </span>
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
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {lead.isConvertedToClient ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                              تم التسليم للتيم ✅
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenHandoff(lead)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="تسليم العميل لباقي التيم"
                            >
                              <Send className="w-3 h-3" />
                              <span>نقل للتيم 🚀</span>
                            </button>
                          )}

                          <button
                            onClick={() => convertLeadToDeal(lead.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="تحويل لصفقة مبيعات"
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

      {/* Log Interaction Modal (تدوين مكالمة / تعامل مع رقم العميل) */}
      {logInteractionLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
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
                  placeholder="مثال: تحدثنا هاتفياً وطلب تحليل لموقعه في الكويت، ومهتم بباقة الـ 2 سيستم و2 دومين..."
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

      {/* ================= MODAL: تسليم العميل المحتمل لباقي التيم وتحديد من يظهر له ================= */}
      {handoffModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
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
              {/* Lead Summary Info */}
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
                  <span className="text-slate-400 font-bold block">البريد الإلكتروني:</span>
                  <span className="font-semibold text-slate-700 truncate block">{handoffModalLead.email || 'غير مسجل'}</span>
                </div>
              </div>

              {/* Service & Contract Info */}
              <div className="space-y-2">
                <label className="block font-black text-slate-800">باقة الخدمة والسيرفر المتفق عليها: *</label>
                <input
                  type="text"
                  required
                  value={handoffForm.serviceName}
                  onChange={e => setHandoffForm({ ...handoffForm, serviceName: e.target.value })}
                  placeholder="مثال: استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Amount & Plan Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-800 mb-1">قيمة التعاقد (ر.س): *</label>
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

              {/* TEAM ASSIGNMENT & VISIBILITY (طلب المستخدم: اقدر احط كل عميل يظهر لمين في التيم وكله بيظهر للادمن) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>من يظهر له هذا العميل في التيم؟ (صلاحيات الرؤية)</span>
                  </label>
                  <span className="text-[10px] text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-lg border border-purple-200">
                    الأدمن يرى الجميع 🔒
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  حدد أعضاء الفريق المصرح لهم برؤية ملف هذا العميل ومتابعة مهامه وتفاصيله وفولدر مستنداته:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
                  {team.map(member => {
                    const isChecked = handoffForm.assignedTeamIds.includes(member.id);
                    const isAdmin = member.accessLevel === 'admin' || member.id === 'user-1';

                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-50/80 border-purple-300 text-purple-950 font-bold shadow-2xs'
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
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="w-6 h-6 rounded-lg bg-purple-200 text-purple-900 font-black text-[10px] flex items-center justify-center shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-slate-900 flex items-center gap-1">
                            <span>{member.name}</span>
                            {isAdmin && <span className="text-[9px] bg-slate-200 text-slate-700 px-1 rounded">أدمن</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Handoff Notes & Briefing to the rest of the team */}
              <div className="space-y-1">
                <label className="block font-black text-slate-800">
                  بريف وتوجيهات التسليم لباقي التيم (Handoff Brief):
                </label>
                <textarea
                  rows={3}
                  value={handoffForm.onboardingNotes}
                  onChange={e => setHandoffForm({ ...handoffForm, onboardingNotes: e.target.value })}
                  placeholder="اكتب تفاصيل الاتفاق، متطلبات العميل، الروابط الأولية، وأي تفاصيل تقنية لتسهيل بدء باقي التيم فوراً..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              {/* Modal Actions */}
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
