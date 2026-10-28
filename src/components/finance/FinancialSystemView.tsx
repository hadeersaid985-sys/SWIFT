import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  UserCheck,
  FileText,
  Printer,
  Download,
  Share2,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  Phone,
  MessageCircle,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Layers,
  Sparkles,
  Briefcase,
  Calendar
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  ClientFinancialContract,
  ClientPaymentEntry,
  CompanyExpense,
  TeamMember,
  MonthlyPayrollRecord
} from '../../types/crm';
import confetti from 'canvas-confetti';

export const FinancialSystemView: React.FC = () => {
  const {
    team,
    currentUser,
    companyExpenses,
    addCompanyExpense,
    updateCompanyExpense,
    deleteCompanyExpense,
    clientFinancialContracts,
    recordClientPayment,
    addClientFinancialContract,
    updateClientFinancialContract,
    deleteClientFinancialContract,
    monthlyPayrolls,
    saveMonthlyPayroll,
    markPayrollPaid,
    brandConfig,
    clientRenewals,
    deals
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'contracts' | 'expenses' | 'payments' | 'payroll' | 'overview'>('contracts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Modals state
  // 1. Record Payment Modal
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [selectedContractForPayment, setSelectedContractForPayment] = useState<ClientFinancialContract | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 5000,
    paymentMethod: 'تحويل بنكي' as ClientPaymentEntry['paymentMethod'],
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    note: ''
  });

  // 2. Add Contract Modal
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [newContractForm, setNewContractForm] = useState({
    clientName: '',
    companyName: '',
    serviceTitle: 'باقة سيو جيو وحملات تسويقية متكاملة',
    contractTotalValue: 30000,
    currency: brandConfig?.systemCurrency || 'ج.م',
    totalPaidAmount: 15000,
    contractStartDate: new Date().toISOString().split('T')[0],
    nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentPlan: 'أقساط شهرية' as ClientFinancialContract['paymentPlan'],
    phone: '',
    whatsappNumber: '',
    notes: ''
  });

  // 3. View Contract Payments History
  const [viewingContractPayments, setViewingContractPayments] = useState<ClientFinancialContract | null>(null);

  // 4. Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<CompanyExpense | null>(null);
  const [newExpense, setNewExpense] = useState<{
    title: string;
    amount: number;
    currency: string;
    category: CompanyExpense['category'];
    date: string;
    notes: string;
  }>({
    title: '',
    amount: 1500,
    currency: brandConfig?.systemCurrency || 'ج.م',
    category: 'تسويق وإعلانات',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 5. Selected Member for Payslip View
  const [selectedMemberForPayslip, setSelectedMemberForPayslip] = useState<TeamMember | null>(null);
  const [copiedPayslip, setCopiedPayslip] = useState(false);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return clientFinancialContracts.filter(c => {
      const matchSearch =
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [clientFinancialContracts, searchQuery]);

  // All Payments Collected from Clients (flattened across all contracts)
  const allClientPayments = useMemo(() => {
    const list: ClientPaymentEntry[] = [];
    clientFinancialContracts.forEach(c => {
      (c.payments || []).forEach(p => {
        list.push(p);
      });
    });
    return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [clientFinancialContracts]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return companyExpenses.filter(e => {
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSearch;
    });
  }, [companyExpenses, searchQuery]);

  // Financial Metrics Calculation
  const financialKPIs = useMemo(() => {
    // 1. Total Contract Values
    const totalContractValue = clientFinancialContracts.reduce((sum, c) => sum + (c.contractTotalValue || 0), 0);
    // 2. Total Paid / Inflow from Clients
    const totalCollected = clientFinancialContracts.reduce((sum, c) => sum + (c.totalPaidAmount || 0), 0);
    // 3. Outstanding Balances (باقي دفع العملاء)
    const totalRemainingReceivables = clientFinancialContracts.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);
    // 4. Overdue balances
    const overdueReceivables = clientFinancialContracts
      .filter(c => c.paymentStatus === 'متأخر في السداد')
      .reduce((sum, c) => sum + (c.remainingBalance || 0), 0);
    // 5. Operating Expenses
    const totalOperatingExpenses = companyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    // 6. Total Payroll (base salary + allowances)
    const totalPayroll = team.reduce((sum, m) => sum + (m.salary || 0) + (m.allowances || 0), 0);
    // 7. Net Profit = Total Collected - (Operating Expenses + Payroll)
    const netProfit = totalCollected - (totalOperatingExpenses + totalPayroll);

    return {
      totalContractValue,
      totalCollected,
      totalRemainingReceivables,
      overdueReceivables,
      totalOperatingExpenses,
      totalPayroll,
      netProfit
    };
  }, [clientFinancialContracts, companyExpenses, team]);

  // Handle Record Payment Submit
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractForPayment) return;
    if (paymentForm.amount <= 0) return;

    recordClientPayment(selectedContractForPayment.id, {
      clientContractId: selectedContractForPayment.id,
      clientName: selectedContractForPayment.clientName,
      amount: Number(paymentForm.amount),
      currency: selectedContractForPayment.currency,
      paymentDate: paymentForm.paymentDate,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber,
      note: paymentForm.note,
      receivedBy: currentUser?.name || 'المدير'
    });

    setIsRecordPaymentModalOpen(false);
    setSelectedContractForPayment(null);
    setPaymentForm({
      amount: 5000,
      paymentMethod: 'تحويل بنكي',
      paymentDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      note: ''
    });
  };

  // Handle Add Contract Submit
  const handleAddContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContractForm.clientName.trim() || newContractForm.contractTotalValue <= 0) return;

    addClientFinancialContract({
      clientId: 'client-' + Date.now(),
      clientName: newContractForm.clientName.trim(),
      companyName: newContractForm.companyName.trim() || newContractForm.clientName.trim(),
      serviceTitle: newContractForm.serviceTitle,
      contractTotalValue: Number(newContractForm.contractTotalValue),
      currency: newContractForm.currency,
      totalPaidAmount: Number(newContractForm.totalPaidAmount) || 0,
      contractStartDate: newContractForm.contractStartDate,
      nextPaymentDueDate: newContractForm.nextPaymentDueDate,
      paymentPlan: newContractForm.paymentPlan,
      paymentStatus: Number(newContractForm.totalPaidAmount) >= Number(newContractForm.contractTotalValue) ? 'خالص بالكامل' : 'متبقي مبالغ',
      phone: newContractForm.phone,
      whatsappNumber: newContractForm.whatsappNumber || newContractForm.phone,
      notes: newContractForm.notes
    });

    setIsAddContractModalOpen(false);
    setNewContractForm({
      clientName: '',
      companyName: '',
      serviceTitle: 'باقة سيو جيو وحملات تسويقية متكاملة',
      contractTotalValue: 30000,
      currency: brandConfig?.systemCurrency || 'ج.م',
      totalPaidAmount: 15000,
      contractStartDate: new Date().toISOString().split('T')[0],
      nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentPlan: 'أقساط شهرية',
      phone: '',
      whatsappNumber: '',
      notes: ''
    });
  };

  // WhatsApp reminder generator for remaining balance
  const sendWhatsAppReminder = (contract: ClientFinancialContract) => {
    const phone = (contract.whatsappNumber || contract.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `مرحباً بك ${contract.clientName} 🌸\n` +
      `نحيطك علماً بأن الرصيد المتبقي على عقد (${contract.serviceTitle}) هو ${contract.remainingBalance.toLocaleString()} ${contract.currency}.\n` +
      `موعد استحقاق الدفعة القادمة هو: ${contract.nextPaymentDueDate || 'خلال هذا الأسبوع'}.\n` +
      `شاكرين ومقدرين تعاونكم الدائم معنا.\n` +
      `— إدارة ${brandConfig?.brandName || 'سويفت مايند'}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Share Payslip via WhatsApp
  const sharePayslipWhatsApp = (member: TeamMember) => {
    const netSalary = (member.salary || 0) + (member.allowances || 0);
    const phone = (member.whatsappNumber || member.phone || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `مفردات مرتب شهر ${selectedMonth} 📄\n` +
      `الاسم: ${member.name} (${member.employeeCode})\n` +
      `المسمى الوظيفي: ${member.role || member.department}\n` +
      `الراتب الأساسي: ${(member.salary || 0).toLocaleString()} ${member.salaryCurrency || 'ج.م'}\n` +
      `البدلات والمكافآت: ${(member.allowances || 0).toLocaleString()} ${member.salaryCurrency || 'ج.م'}\n` +
      `صافي الراتب المستحق: ${netSalary.toLocaleString()} ${member.salaryCurrency || 'ج.م'}\n` +
      `حالة الصرف: معتمد ومحول بنجاح ✅\n` +
      `— الإدارة المالية ${brandConfig?.brandName || 'سويفت مايند'}`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">المنظومة المالية والمصروفات</h1>
              <p className="text-xs text-slate-500">
                إدارة شاملة للمصروفات، مدفوعات وتحصيلات العملاء، مرتبات الموظفين، والعقود والمبالغ المتبقية
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddContractModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل عقد عميل جديد</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف للشركة</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Collected / Inflow */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">إجمالي المحصل من العملاء</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {financialKPIs.totalCollected.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            من إجمالي عقود: {financialKPIs.totalContractValue.toLocaleString()}
          </div>
        </div>

        {/* Outstanding Receivables / Remaining Balances */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">باقي دفع العملاء (المتبقي)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-amber-600 mt-1">
            {financialKPIs.totalRemainingReceivables.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
          </div>
          <div className="text-[10px] text-rose-600 font-semibold mt-1">
            متأخر في السداد: {financialKPIs.overdueReceivables.toLocaleString()}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">المصروفات التشغيلية</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {financialKPIs.totalOperatingExpenses.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">
            إيجار، سيرفرات، إعلانات، أدوات
          </div>
        </div>

        {/* Total Payroll */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">إجمالي مرتبات الموظفين</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">
            {financialKPIs.totalPayroll.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            لكل الفريق ({team.length} أفراد)
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">صافي الأرباح التشغيلية</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg font-black mt-1 ${financialKPIs.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {financialKPIs.netProfit.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">
            بعد خصم المصاريف والرواتب
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white p-1 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>العقود وباقي دفع العملاء ({clientFinancialContracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>المصروفات التشغيلية ({companyExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>سجل المدفوعات والتحصيلات ({allClientPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>مرتبات الموظفين كاملة ({team.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: CONTRACTS & REMAINING BALANCES ================= */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          {/* Search bar & count */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث باسم العميل، الشركة، الخدمة..."
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-xs font-bold text-slate-500">
              إجمالي العقود النشطة: <strong className="text-slate-900">{filteredContracts.length}</strong>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">العميل والشركة</th>
                    <th className="py-3 px-3">الخدمة / الباقة</th>
                    <th className="py-3 px-3">قيمة العقد</th>
                    <th className="py-3 px-3">المدفوع حتى الآن</th>
                    <th className="py-3 px-3">المتبقي على العميل</th>
                    <th className="py-3 px-3">موعد الدفعة القادمة</th>
                    <th className="py-3 px-3">حالة السداد</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredContracts.map(contract => (
                    <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Client Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900">{contract.clientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{contract.companyName}</span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">{contract.serviceTitle}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          نظام السداد: {contract.paymentPlan}
                        </div>
                      </td>

                      {/* Contract Value */}
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {contract.contractTotalValue.toLocaleString()} {contract.currency}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-3 font-bold text-emerald-600">
                        {contract.totalPaidAmount.toLocaleString()} {contract.currency}
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-black text-sm ${
                            contract.remainingBalance > 0 ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          {contract.remainingBalance.toLocaleString()} {contract.currency}
                        </span>
                      </td>

                      {/* Next Due Date */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contract.nextPaymentDueDate || 'غير محدد'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {contract.paymentStatus === 'خالص بالكامل' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>خالص بالكامل</span>
                          </span>
                        ) : contract.paymentStatus === 'متأخر في السداد' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 rounded-lg text-[10px] font-bold animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            <span>متأخر في السداد</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>متبقي دفعات</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Record Payment Button */}
                          <button
                            onClick={() => {
                              setSelectedContractForPayment(contract);
                              setPaymentForm(prev => ({
                                ...prev,
                                amount: contract.remainingBalance > 0 ? Math.min(contract.remainingBalance, 10000) : 5000
                              }));
                              setIsRecordPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="تسجيل استلام دفعة جديدة من العميل"
                          >
                            <Plus className="w-3 h-3" />
                            <span>دفعة</span>
                          </button>

                          {/* WhatsApp Reminder Button */}
                          {contract.remainingBalance > 0 && (
                            <button
                              onClick={() => sendWhatsAppReminder(contract)}
                              className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
                              title="إرسال تذكير بالباقي عبر واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Payments History */}
                          <button
                            onClick={() => setViewingContractPayments(contract)}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="عرض سجل الدفعات السابقة للعقد"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: COMPANY EXPENSES ================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث في بنود وتصنيفات المصروفات..."
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مصروف جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">بند المصروف</th>
                  <th className="py-3 px-3">التصنيف</th>
                  <th className="py-3 px-3">المبلغ</th>
                  <th className="py-3 px-3">التاريخ</th>
                  <th className="py-3 px-3">الملاحظات</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{expense.title}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-black text-rose-600 text-sm">
                      {expense.amount.toLocaleString()} {expense.currency}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-semibold">{expense.date}</td>
                    <td className="py-3.5 px-3 text-slate-500">{expense.notes || '-'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => deleteCompanyExpense(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف المصروف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CLIENT PAYMENTS LOG ================= */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>سجل التحصيلات والدفعات المستلمة من العملاء</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">
              إجمالي المبالغ المستلمة: <strong className="text-emerald-600">{financialKPIs.totalCollected.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}</strong>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">اسم العميل</th>
                  <th className="py-3 px-3">المبلغ المستلم</th>
                  <th className="py-3 px-3">تاريخ الدفعة</th>
                  <th className="py-3 px-3">طريقة الدفع</th>
                  <th className="py-3 px-3">رقم الحوالة / الإيصال</th>
                  <th className="py-3 px-3">المستلم</th>
                  <th className="py-3 px-3">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {allClientPayments.map((payment, idx) => (
                  <tr key={payment.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{payment.clientName}</td>
                    <td className="py-3.5 px-3 font-black text-emerald-600 text-sm">
                      +{payment.amount.toLocaleString()} {payment.currency}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{payment.paymentDate}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-bold text-[10px]">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{payment.referenceNumber || '-'}</td>
                    <td className="py-3.5 px-3 text-slate-600">{payment.receivedBy || 'المدير'}</td>
                    <td className="py-3.5 px-3 text-slate-500">{payment.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: FULL EMPLOYEE PAYROLL ================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>مسير مرتبات موظفي الشركة - شهر {selectedMonth}</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                الراتب الأساسي، البدلات، المكافآت، الخصومات، وصافي المستحق لكل موظف مع إمكانية الصرف بنقرة واحدة
              </p>
            </div>

            <div className="text-xs font-bold text-slate-700">
              إجمالي رواتب الفريق: <strong className="text-blue-600 text-sm">{financialKPIs.totalPayroll.toLocaleString()} {brandConfig?.systemCurrency || 'ج.م'}</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">الموظف</th>
                  <th className="py-3 px-3">المسمى والقسم</th>
                  <th className="py-3 px-3">الراتب الأساسي</th>
                  <th className="py-3 px-3">البدلات والمكافآت</th>
                  <th className="py-3 px-3">الخصومات</th>
                  <th className="py-3 px-3">صافي الراتب</th>
                  <th className="py-3 px-3">حالة الصرف</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {team.map(member => {
                  const base = member.salary || 0;
                  const allow = member.allowances || 0;
                  const net = base + allow;
                  const isPaid = member.id === 'user-1' ? true : false; // sample state

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-black text-slate-900">{member.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{member.employeeCode}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">{member.role || 'عضو فريق'}</div>
                        <div className="text-[10px] text-slate-400">{member.department}</div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {base.toLocaleString()} {member.salaryCurrency || 'ج.م'}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-emerald-600">
                        +{allow.toLocaleString()} {member.salaryCurrency || 'ج.م'}
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 font-semibold">0 ج.م</td>

                      <td className="py-3.5 px-3 font-black text-sm text-slate-900">
                        {net.toLocaleString()} {member.salaryCurrency || 'ج.م'}
                      </td>

                      <td className="py-3.5 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم التحويل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>معتمد للصرف</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => sharePayslipWhatsApp(member)}
                            className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
                            title="إرسال مفردات الراتب عبر واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedMemberForPayslip(member)}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="عرض وطباعة مفردات المرتب الرسمية"
                          >
                            <Printer className="w-3.5 h-3.5" />
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

      {/* ================= MODAL: RECORD PAYMENT ================= */}
      {isRecordPaymentModalOpen && selectedContractForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">تسجيل دفعة مستلمة من العميل</h3>
                <p className="text-[11px] text-slate-500">{selectedContractForPayment.clientName} - {selectedContractForPayment.companyName}</p>
              </div>
              <button
                onClick={() => setIsRecordPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200/60 rounded-xl text-blue-900 flex items-center justify-between">
                <span>المبلغ المتبقي على العميل حالياً:</span>
                <strong className="text-sm font-black">
                  {selectedContractForPayment.remainingBalance.toLocaleString()} {selectedContractForPayment.currency}
                </strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المدفوع الآن ({selectedContractForPayment.currency}) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="فودافون كاش">فودافون كاش</option>
                    <option value="كاش نقدياً">كاش نقدياً</option>
                    <option value="فيزا / بطاقة">فيزا / بطاقة</option>
                    <option value="شيك بنكي">شيك بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستلام</label>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الحوالة أو الإيصال</label>
                <input
                  type="text"
                  value={paymentForm.referenceNumber}
                  onChange={e => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  placeholder="مثال: TRX-992182 أو رقم العملية"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات التحصيل</label>
                <textarea
                  rows={2}
                  value={paymentForm.note}
                  onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  placeholder="الدفعة الثانية، سداد جزئي، إشعار سداد..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  تأكيد استلام الدفعة وتحديث الباقي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CONTRACT ================= */}
      {isAddContractModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">تسجيل عقد جديد وحساب باقي الدفعات</h3>
                <p className="text-[11px] text-slate-500">سجل عقد عميل جديد لتتبع الدفعات والمبالغ المتبقية</p>
              </div>
              <button
                onClick={() => setIsAddContractModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContractSubmit} className="p-4 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={newContractForm.clientName}
                    onChange={e => setNewContractForm({ ...newContractForm, clientName: e.target.value })}
                    placeholder="مثال: د. ماجد السعيد"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الشركة أو النشاط</label>
                  <input
                    type="text"
                    value={newContractForm.companyName}
                    onChange={e => setNewContractForm({ ...newContractForm, companyName: e.target.value })}
                    placeholder="مثال: مجمع السعيد الطبي"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الخدمة أو الباقة التعاقدية *</label>
                <input
                  type="text"
                  required
                  value={newContractForm.serviceTitle}
                  onChange={e => setNewContractForm({ ...newContractForm, serviceTitle: e.target.value })}
                  placeholder="باقة سيو جيو، نظام CRM، إدارة إعلانات..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">إجمالي قيمة التعاقد *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newContractForm.contractTotalValue}
                    onChange={e => setNewContractForm({ ...newContractForm, contractTotalValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ المدفوع كمقدم</label>
                  <input
                    type="number"
                    min={0}
                    value={newContractForm.totalPaidAmount}
                    onChange={e => setNewContractForm({ ...newContractForm, totalPaidAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-emerald-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-900 flex items-center justify-between">
                <span>المبلغ المتبقي على العميل:</span>
                <strong className="text-sm font-black">
                  {Math.max(0, newContractForm.contractTotalValue - newContractForm.totalPaidAmount).toLocaleString()} {newContractForm.currency}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ بداية العقد</label>
                  <input
                    type="date"
                    value={newContractForm.contractStartDate}
                    onChange={e => setNewContractForm({ ...newContractForm, contractStartDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">موعد استحقاق الدفعة القادمة</label>
                  <input
                    type="date"
                    value={newContractForm.nextPaymentDueDate}
                    onChange={e => setNewContractForm({ ...newContractForm, nextPaymentDueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب / الهاتف</label>
                  <input
                    type="text"
                    value={newContractForm.whatsappNumber}
                    onChange={e => setNewContractForm({ ...newContractForm, whatsappNumber: e.target.value })}
                    placeholder="+2010..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نظام السداد</label>
                  <select
                    value={newContractForm.paymentPlan}
                    onChange={e => setNewContractForm({ ...newContractForm, paymentPlan: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="دفعة واحدة">دفعة واحدة</option>
                    <option value="دفعتين">دفعتين (مقدم وباقي)</option>
                    <option value="أقساط شهرية">أقساط شهرية</option>
                    <option value="اشتراك ربع سنوي">اشتراك ربع سنوي</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddContractModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ العقد وبدء التتبع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW PAYMENTS HISTORY ================= */}
      {viewingContractPayments && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">سجل دفعات العقد</h3>
                <p className="text-[11px] text-slate-500">{viewingContractPayments.clientName} - {viewingContractPayments.serviceTitle}</p>
              </div>
              <button
                onClick={() => setViewingContractPayments(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {(!viewingContractPayments.payments || viewingContractPayments.payments.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">لا توجد دفعات مسجلة بعد.</div>
              ) : (
                viewingContractPayments.payments.map((p, i) => (
                  <div key={p.id || i} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{p.paymentMethod}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p.paymentDate} | المستلم: {p.receivedBy || 'المدير'}
                      </div>
                      {p.referenceNumber && <div className="text-[10px] font-mono text-slate-400">رقم الإيصال: {p.referenceNumber}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-600">
                        +{p.amount.toLocaleString()} {p.currency}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700">
                المتبقي: <strong className="text-amber-600">{viewingContractPayments.remainingBalance.toLocaleString()} {viewingContractPayments.currency}</strong>
              </div>
              <button
                onClick={() => setViewingContractPayments(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD EXPENSE ================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">تسجيل مصروف تشغيلي جديد</h3>
                <p className="text-[11px] text-slate-500">إضافة بند مصروف لاحتسابه في تكاليف وأرباح الشركة</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newExpense.title.trim() || newExpense.amount <= 0) return;
                addCompanyExpense(newExpense);
                setIsExpenseModalOpen(false);
                setNewExpense({
                  title: '',
                  amount: 1500,
                  currency: brandConfig?.systemCurrency || 'ج.م',
                  category: 'تسويق وإعلانات',
                  date: new Date().toISOString().split('T')[0],
                  notes: ''
                });
              }}
              className="p-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">بند المصروف *</label>
                <input
                  type="text"
                  required
                  value={newExpense.title}
                  onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="مثال: تجديد اشتراك ChatGPT Team وسيرفرات AWS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ ({newExpense.currency}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="تسويق وإعلانات">تسويق وإعلانات</option>
                    <option value="سيرفرات وأدوات تقنية">سيرفرات وأدوات تقنية</option>
                    <option value="إيجار ومقر">إيجار ومقر</option>
                    <option value="استشارات وقانونية">استشارات وقانونية</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ المصروف</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات</label>
                <textarea
                  rows={2}
                  value={newExpense.notes}
                  onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="ملاحظات وتفاصيل الفاتورة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT PAYSLIP ================= */}
      {selectedMemberForPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">مفردات الراتب الرسمية</h3>
              <button
                onClick={() => setSelectedMemberForPayslip(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs" id="printable-payslip">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div>
                  <div className="text-base font-black text-slate-900">{brandConfig?.brandName || 'سويفت مايند'}</div>
                  <div className="text-[11px] text-slate-500">إشعار صرف مستحقات شهر {selectedMonth}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800">{selectedMemberForPayslip.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selectedMemberForPayslip.employeeCode}</div>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">المسمى الوظيفي:</span>
                  <span className="font-bold text-slate-800">{selectedMemberForPayslip.role || selectedMemberForPayslip.department}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">الراتب الشهري الأساسي:</span>
                  <span className="font-bold text-slate-900">{(selectedMemberForPayslip.salary || 0).toLocaleString()} {selectedMemberForPayslip.salaryCurrency || 'ج.م'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">البدلات والمكافآت:</span>
                  <span className="font-bold text-emerald-600">+{(selectedMemberForPayslip.allowances || 0).toLocaleString()} {selectedMemberForPayslip.salaryCurrency || 'ج.م'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">الخصومات والغياب:</span>
                  <span className="font-bold text-slate-400">0 ج.م</span>
                </div>
                <div className="flex justify-between py-2.5 bg-slate-50 px-3 rounded-xl">
                  <span className="font-bold text-slate-800">صافي المستحق للصرف:</span>
                  <span className="text-base font-black text-blue-700">
                    {((selectedMemberForPayslip.salary || 0) + (selectedMemberForPayslip.allowances || 0)).toLocaleString()} {selectedMemberForPayslip.salaryCurrency || 'ج.م'}
                  </span>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                تم اعتماد هذا المستند إلكترونياً من الإدارة المالية لمنظومة {brandConfig?.brandName || 'سويفت مايند'}.
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => sharePayslipWhatsApp(selectedMemberForPayslip)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال عبر واتساب</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
