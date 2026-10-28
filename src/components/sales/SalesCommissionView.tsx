import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Eye,
  Briefcase,
  Users,
  Building,
  Check,
  X,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MonthlySalesCommissionRecord, SalesCommissionDeal, TeamMember } from '../../types/crm';
import confetti from 'canvas-confetti';

const AVAILABLE_MONTHS = [
  { id: '2026-11', label: 'نوفمبر 2026' },
  { id: '2026-10', label: 'أكتوبر 2026' },
  { id: '2026-09', label: 'سبتمبر 2026' },
  { id: '2026-08', label: 'أغسطس 2026' },
  { id: '2026-07', label: 'يوليو 2026' },
  { id: '2026-06', label: 'يونيو 2026' }
];

export const SalesCommissionView: React.FC = () => {
  const {
    monthlySalesCommissions,
    addOrUpdateSalesCommission,
    markSalesCommissionPayout,
    addDealToSalesCommission,
    team,
    brandConfig
  } = useCRM();

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'approved' | 'paid'>('all');

  // Modals state
  const [viewingDealsRecord, setViewingDealsRecord] = useState<MonthlySalesCommissionRecord | null>(null);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [targetCommissionForNewDeal, setTargetCommissionForNewDeal] = useState<MonthlySalesCommissionRecord | null>(null);
  const [newDealForm, setNewDealForm] = useState({
    clientName: '',
    dealValue: 25000,
    currency: brandConfig?.systemCurrency || 'ج.م',
    closedDate: new Date().toISOString().split('T')[0],
    commissionRate: 5,
    notes: ''
  });

  const [isEditCommissionModalOpen, setIsEditCommissionModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<MonthlySalesCommissionRecord | null>(null);
  const [editForm, setEditForm] = useState({
    monthlyTarget: 100000,
    baseCommissionRate: 5,
    targetBonusAmount: 2000,
    customAdjustmentAmount: 0,
    notes: ''
  });

  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [selectedMemberForNewRecord, setSelectedMemberForNewRecord] = useState<string>('');
  const [newRecordTarget, setNewRecordTarget] = useState<number>(100000);
  const [newRecordRate, setNewRecordRate] = useState<number>(5);

  // Filter commissions for the selected month
  const monthCommissions = useMemo(() => {
    return monthlySalesCommissions.filter(c => c.month === selectedMonth);
  }, [monthlySalesCommissions, selectedMonth]);

  // Filtered by search and status
  const filteredCommissions = useMemo(() => {
    return monthCommissions.filter(c => {
      const matchSearch =
        c.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.payoutStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [monthCommissions, searchQuery, statusFilter]);

interface CommissionMonthStats {
  totalAchieved: number;
  totalTarget: number;
  totalCommissionsDue: number;
  totalDeals: number;
  paidCommissions: number;
  pendingCommissions: number;
  overallRate: number;
  topPerformer: MonthlySalesCommissionRecord | null;
}

  // Overall Statistics for this month
  const stats = useMemo<CommissionMonthStats>(() => {
    const totalAchieved = monthCommissions.reduce((sum, c) => sum + (c.achievedSales || 0), 0);
    const totalTarget = monthCommissions.reduce((sum, c) => sum + (c.monthlyTarget || 0), 0);
    const totalCommissionsDue = monthCommissions.reduce((sum, c) => sum + (c.totalCommission || 0), 0);
    const totalDeals = monthCommissions.reduce((sum, c) => sum + (c.dealsCount || 0), 0);
    const paidCommissions = monthCommissions
      .filter(c => c.payoutStatus === 'paid')
      .reduce((sum, c) => sum + (c.totalCommission || 0), 0);
    const pendingCommissions = totalCommissionsDue - paidCommissions;
    const overallRate = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

    // Top sales performer
    let topPerformer: MonthlySalesCommissionRecord | null = null;
    let maxSales = -1;
    monthCommissions.forEach(c => {
      if (c.achievedSales > maxSales) {
        maxSales = c.achievedSales;
        topPerformer = c;
      }
    });

    return {
      totalAchieved,
      totalTarget,
      totalCommissionsDue,
      totalDeals,
      paidCommissions,
      pendingCommissions,
      overallRate: Math.round(overallRate * 10) / 10,
      topPerformer
    };
  }, [monthCommissions]);

  // Sales team members eligible for commissions
  const salesTeamMembers = useMemo(() => {
    return team.filter(
      m =>
        m.department === 'المبيعات' ||
        m.role.toLowerCase().includes('sales') ||
        m.name.toLowerCase().includes('maibel')
    );
  }, [team]);

  // Open Edit Commission Modal
  const handleOpenEdit = (comm: MonthlySalesCommissionRecord) => {
    setEditingCommission(comm);
    setEditForm({
      monthlyTarget: comm.monthlyTarget,
      baseCommissionRate: comm.baseCommissionRate,
      targetBonusAmount: comm.targetBonusAmount,
      customAdjustmentAmount: comm.customAdjustmentAmount,
      notes: comm.notes || ''
    });
    setIsEditCommissionModalOpen(true);
  };

  // Save Edit Commission
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommission) return;

    const newTarget = Number(editForm.monthlyTarget) || 0;
    const newRate = Number(editForm.baseCommissionRate) || 0;
    const newBonus = Number(editForm.targetBonusAmount) || 0;
    const newAdjustment = Number(editForm.customAdjustmentAmount) || 0;

    const baseAmount = Math.round((editingCommission.achievedSales * newRate) / 100);
    const achRate = newTarget > 0 ? (editingCommission.achievedSales / newTarget) * 100 : 100;
    const effectiveBonus = achRate >= 100 ? newBonus : 0;
    const total = baseAmount + effectiveBonus + newAdjustment;

    const updated: MonthlySalesCommissionRecord = {
      ...editingCommission,
      monthlyTarget: newTarget,
      baseCommissionRate: newRate,
      baseCommissionAmount: baseAmount,
      achievementRate: Math.round(achRate * 10) / 10,
      targetBonusAmount: newBonus,
      customAdjustmentAmount: newAdjustment,
      totalCommission: total,
      notes: editForm.notes,
      updatedAt: new Date().toISOString()
    };

    addOrUpdateSalesCommission(updated);
    setIsEditCommissionModalOpen(false);
    setEditingCommission(null);
  };

  // Add Deal to commission
  const handleAddDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCommissionForNewDeal) return;
    if (!newDealForm.clientName.trim() || newDealForm.dealValue <= 0) return;

    const commRate = Number(newDealForm.commissionRate) || 5;
    const val = Number(newDealForm.dealValue) || 0;
    const commAmount = Math.round((val * commRate) / 100);

    addDealToSalesCommission(targetCommissionForNewDeal.id, {
      clientName: newDealForm.clientName.trim(),
      dealValue: val,
      currency: newDealForm.currency,
      closedDate: newDealForm.closedDate,
      commissionRate: commRate,
      commissionAmount: commAmount,
      notes: newDealForm.notes
    });

    setIsAddDealModalOpen(false);
    setNewDealForm({
      clientName: '',
      dealValue: 25000,
      currency: brandConfig?.systemCurrency || 'ج.م',
      closedDate: new Date().toISOString().split('T')[0],
      commissionRate: 5,
      notes: ''
    });
  };

  // Create new commission record for a rep in this month
  const handleCreateNewRecord = () => {
    if (!selectedMemberForNewRecord) return;
    const member = team.find(m => m.id === selectedMemberForNewRecord);
    if (!member) return;

    const newRecord: MonthlySalesCommissionRecord = {
      id: `comm-${selectedMonth}-${member.id}`,
      month: selectedMonth,
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      monthlyTarget: newRecordTarget,
      achievedSales: 0,
      achievementRate: 0,
      dealsCount: 0,
      baseCommissionRate: newRecordRate,
      baseCommissionAmount: 0,
      targetBonusAmount: 2000,
      customAdjustmentAmount: 0,
      totalCommission: 0,
      currency: brandConfig?.systemCurrency || 'ج.م',
      payoutStatus: 'draft',
      notes: `كشف عمولة مبيعات شهر ${selectedMonth}`,
      deals: [],
      updatedAt: new Date().toISOString()
    };

    addOrUpdateSalesCommission(newRecord);
    setIsNewRecordModalOpen(false);
    setSelectedMemberForNewRecord('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl text-white shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">عمولات فريق المبيعات الشهرية</h1>
              <p className="text-xs text-slate-500">
                حساب ومتابعة عمولات وحوافز تيم السيلز لكل شهر منفصل وفق التارجت والصفقات المغلقة
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {AVAILABLE_MONTHS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMonth(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedMonth === m.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsNewRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كشف موظف للشهر</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Achieved Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">مبيعات الشهر المحققة</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {stats.totalAchieved.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <span>التارجت المطلوب:</span>
              <strong className="text-slate-700">{stats.totalTarget.toLocaleString()}</strong>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Team Target Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">نسبة تحقيق التارجت الكلي</div>
            <div className="text-xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1">
              <span className={stats.overallRate >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
                %{stats.overallRate}
              </span>
              <span className="text-xs text-slate-400 font-normal">من الهدف</span>
            </div>
            <div className="w-32 bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.overallRate >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, stats.overallRate)}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Total Commissions Due */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">إجمالي العمولات المستحقة</div>
            <div className="text-xl font-black text-amber-600 mt-0.5">
              {stats.totalCommissionsDue.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-2">
              <span className="text-emerald-600">صُرف: {stats.paidCommissions.toLocaleString()}</span>
              <span>|</span>
              <span className="text-amber-600">معلق: {stats.pendingCommissions.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400">أعلى بائع في الشهر (Top Rep)</div>
            {stats.topPerformer ? (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={stats.topPerformer.memberAvatar}
                  alt={stats.topPerformer.memberName}
                  className="w-7 h-7 rounded-full object-cover border border-amber-400"
                />
                <div>
                  <div className="text-sm font-black text-slate-800">{stats.topPerformer.memberName}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">
                    حقق %{stats.topPerformer.achievementRate} ({stats.topPerformer.dealsCount} صفقات)
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1">لا توجد بيانات لهذا الشهر</div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث باسم موظف السيلز أو الملاحظات..."
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">حالة الصرف:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'draft' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مسودة
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'approved' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              معتمد
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                statusFilter === 'paid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تم الصرف
            </button>
          </div>
        </div>
      </div>

      {/* Main Commission Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900">
              كشف عمولات المبيعات - {AVAILABLE_MONTHS.find(m => m.id === selectedMonth)?.label}
            </h2>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full">
            {filteredCommissions.length} موظف مسجل
          </span>
        </div>

        {filteredCommissions.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد سجلات عمولات لهذا الشهر</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              يمكنك إضافة كشف جديد لأي عضو في فريق المبيعات وتحديد التارجت ونسبة العمولة بضغطة زر
            </p>
            <button
              onClick={() => setIsNewRecordModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة كشف لموظف السيلز الآن</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">موظف المبيعات</th>
                  <th className="py-3 px-3">التارجت المستهدف</th>
                  <th className="py-3 px-3">المبيعات المحققة</th>
                  <th className="py-3 px-3">نسبة الإنجاز</th>
                  <th className="py-3 px-3">الصفقات</th>
                  <th className="py-3 px-3">العمولة الأساسية</th>
                  <th className="py-3 px-3">بونص التميز</th>
                  <th className="py-3 px-3">إجمالي العمولة</th>
                  <th className="py-3 px-3">حالة الصرف</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCommissions.map(comm => {
                  const isAchieved = comm.achievementRate >= 100;
                  return (
                    <tr key={comm.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={comm.memberAvatar}
                            alt={comm.memberName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-black text-slate-900">{comm.memberName}</div>
                            <div className="text-[10px] text-slate-400">قسم المبيعات</div>
                          </div>
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-3 font-semibold">
                        {comm.monthlyTarget.toLocaleString()} {comm.currency}
                      </td>

                      {/* Achieved */}
                      <td className="py-3.5 px-3 font-black text-slate-900">
                        {comm.achievedSales.toLocaleString()} {comm.currency}
                      </td>

                      {/* Achievement % */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black ${
                              isAchieved ? 'text-emerald-600' : 'text-blue-600'
                            }`}
                          >
                            %{comm.achievementRate}
                          </span>
                          {isAchieved && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              ناجح ⭐
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Deals Count */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setViewingDealsRecord(comm)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold transition-colors cursor-pointer"
                          title="عرض صفقات الموظف لهذا الشهر"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{comm.dealsCount} صفقات</span>
                        </button>
                      </td>

                      {/* Base Commission */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">
                          {comm.baseCommissionAmount.toLocaleString()} {comm.currency}
                        </div>
                        <div className="text-[10px] text-slate-400">({comm.baseCommissionRate}%)</div>
                      </td>

                      {/* Bonus */}
                      <td className="py-3.5 px-3 font-semibold text-emerald-600">
                        {comm.targetBonusAmount > 0 ? (
                          `+${comm.targetBonusAmount.toLocaleString()} ${comm.currency}`
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Total Commission */}
                      <td className="py-3.5 px-3">
                        <div className="font-black text-sm text-slate-900 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-lg inline-block">
                          {comm.totalCommission.toLocaleString()} {comm.currency}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {comm.payoutStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم الصرف</span>
                          </span>
                        ) : comm.payoutStatus === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold text-[11px]">
                            <Check className="w-3 h-3" />
                            <span>معتمد للصرف</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>مسودة قيد الحساب</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Add Deal Button */}
                          <button
                            onClick={() => {
                              setTargetCommissionForNewDeal(comm);
                              setIsAddDealModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="إضافة صفقة مغلقة جديدة لهذا الموظف"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Commission settings */}
                          <button
                            onClick={() => handleOpenEdit(comm)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="تعديل التارجت ونسبة العمولة والحافز"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve / Pay Actions */}
                          {comm.payoutStatus === 'draft' && (
                            <button
                              onClick={() => markSalesCommissionPayout(comm.id, 'approved')}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                              title="اعتماد كشف العمولة للصرف"
                            >
                              اعتماد
                            </button>
                          )}

                          {comm.payoutStatus === 'approved' && (
                            <button
                              onClick={() => markSalesCommissionPayout(comm.id, 'paid')}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                              title="تأكيد صرف وتحويل العمولة للموظف"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>صرف</span>
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
        )}
      </div>

      {/* Modal: View Deals of Selected Rep */}
      {viewingDealsRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <img
                  src={viewingDealsRecord.memberAvatar}
                  alt={viewingDealsRecord.memberName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    صفقات وعقود: {viewingDealsRecord.memberName}
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    شهر {AVAILABLE_MONTHS.find(m => m.id === viewingDealsRecord.month)?.label} | إجمالي الصفقات: {viewingDealsRecord.achievedSales.toLocaleString()} {viewingDealsRecord.currency}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingDealsRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {viewingDealsRecord.deals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد صفقات مضافة لهذا الموظف في هذا الشهر بعد.
                </div>
              ) : (
                viewingDealsRecord.deals.map((deal, idx) => (
                  <div
                    key={deal.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                        <span>{deal.clientName}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-normal">
                          {deal.closedDate}
                        </span>
                      </div>
                      {deal.notes && <div className="text-[11px] text-slate-500 mt-0.5">{deal.notes}</div>}
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs font-bold text-slate-900">
                        قيمة الصفقة: {deal.dealValue.toLocaleString()} {deal.currency}
                      </div>
                      <div className="text-xs font-black text-emerald-600">
                        العمولة ({deal.commissionRate}%): +{deal.commissionAmount.toLocaleString()} {deal.currency}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setTargetCommissionForNewDeal(viewingDealsRecord);
                  setIsAddDealModalOpen(true);
                  setViewingDealsRecord(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صفقة مغلقة جديدة</span>
              </button>

              <button
                onClick={() => setViewingDealsRecord(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Deal to Rep */}
      {isAddDealModalOpen && targetCommissionForNewDeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">إضافة صفقة مغلقة للموظف</h3>
                <p className="text-[11px] text-slate-500">
                  الموظف: {targetCommissionForNewDeal.memberName} ({AVAILABLE_MONTHS.find(m => m.id === selectedMonth)?.label})
                </p>
              </div>
              <button
                onClick={() => setIsAddDealModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDealSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم العميل / الشركة *</label>
                <input
                  type="text"
                  required
                  value={newDealForm.clientName}
                  onChange={e => setNewDealForm({ ...newDealForm, clientName: e.target.value })}
                  placeholder="مثال: شركة الأفق للاستشارات"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">قيمة الصفقة ({newDealForm.currency}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newDealForm.dealValue}
                    onChange={e => setNewDealForm({ ...newDealForm, dealValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نسبة العمولة (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={100}
                    value={newDealForm.commissionRate}
                    onChange={e => setNewDealForm({ ...newDealForm, commissionRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ إغلاق الصفقة</label>
                  <input
                    type="date"
                    value={newDealForm.closedDate}
                    onChange={e => setNewDealForm({ ...newDealForm, closedDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">العمولة المحسوبة</label>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-black rounded-xl text-center">
                    {Math.round((newDealForm.dealValue * newDealForm.commissionRate) / 100).toLocaleString()} {newDealForm.currency}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الصفقة</label>
                <textarea
                  rows={2}
                  value={newDealForm.notes}
                  onChange={e => setNewDealForm({ ...newDealForm, notes: e.target.value })}
                  placeholder="نوع الباقة، تفاصيل السداد أو الاتفاق..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDealModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ واحتساب العمولة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Commission & Target Settings */}
      {isEditCommissionModalOpen && editingCommission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">تعديل شروط عمولة الموظف</h3>
                <p className="text-[11px] text-slate-500">الموظف: {editingCommission.memberName}</p>
              </div>
              <button
                onClick={() => setIsEditCommissionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">التارجت الشهري المستهدف ({editingCommission.currency})</label>
                <input
                  type="number"
                  min={0}
                  value={editForm.monthlyTarget}
                  onChange={e => setEditForm({ ...editForm, monthlyTarget: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نسبة العمولة الأساسية (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={100}
                    value={editForm.baseCommissionRate}
                    onChange={e => setEditForm({ ...editForm, baseCommissionRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">بونص تحقيق التارجت</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.targetBonusAmount}
                    onChange={e => setEditForm({ ...editForm, targetBonusAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تسويات / مكافآت إضافية (+/-)</label>
                <input
                  type="number"
                  value={editForm.customAdjustmentAmount}
                  onChange={e => setEditForm({ ...editForm, customAdjustmentAmount: Number(e.target.value) })}
                  placeholder="مبلغ إضافي أو خصم..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الاعتماد</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="أسباب التعديل أو شروط الصرف..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditCommissionModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Commission Record for Month */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">إضافة كشف عمولة جديد للموظف</h3>
                <p className="text-[11px] text-slate-500">
                  شهر: {AVAILABLE_MONTHS.find(m => m.id === selectedMonth)?.label}
                </p>
              </div>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر موظف المبيعات *</label>
                <select
                  value={selectedMemberForNewRecord}
                  onChange={e => setSelectedMemberForNewRecord(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {team.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role || m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التارجت المستهدف للشهر ({brandConfig?.systemCurrency || 'ج.م'})</label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={newRecordTarget}
                  onChange={e => setNewRecordTarget(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نسبة العمولة الافتراضية (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={100}
                  value={newRecordRate}
                  onChange={e => setNewRecordRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={!selectedMemberForNewRecord}
                  onClick={handleCreateNewRecord}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  إنشاء الكشف للشهر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
