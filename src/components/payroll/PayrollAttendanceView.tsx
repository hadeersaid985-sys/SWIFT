import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building,
  UserCheck,
  UserX,
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
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  PieChart,
  Sliders,
  X
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { TeamMember, AttendanceRecord, AttendanceStatus, CompanyExpense, MonthlyPayrollRecord } from '../../types/crm';
import confetti from 'canvas-confetti';

export const PayrollAttendanceView: React.FC = () => {
  const {
    team,
    currentUser,
    isManager,
    deals,
    clientRenewals,
    attendanceRecords,
    recordAttendance,
    batchMarkAttendance,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    monthlyPayrolls,
    saveMonthlyPayroll,
    markPayrollPaid,
    companyExpenses,
    addCompanyExpense,
    updateCompanyExpense,
    deleteCompanyExpense,
    updateTeamMemberSalary,
    updateTeamMember,
    brandConfig,
    setGlobalCurrency
  } = useCRM();

  // Active module subtab
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'payroll' | 'calculator'>('overview');

  // Selected date for attendance view (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Selected month for payroll view
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Modals state
  const [selectedMemberForPayslip, setSelectedMemberForPayslip] = useState<TeamMember | null>(null);
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
    amount: 1000,
    currency: brandConfig?.systemCurrency || 'ج.م',
    category: 'تسويق وإعلانات',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Attendance Add & Edit Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingAttendanceRecord, setEditingAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [attendanceForm, setAttendanceForm] = useState({
    memberId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present' as AttendanceStatus,
    checkInTime: '09:00',
    checkOutTime: '17:00',
    lateMinutes: 0,
    isExcused: false,
    notes: ''
  });

  // Salary editing modal
  const [editingMemberSalary, setEditingMemberSalary] = useState<TeamMember | null>(null);
  const [salaryForm, setSalaryForm] = useState({
    salary: 0,
    salaryCurrency: brandConfig?.systemCurrency || 'ج.م',
    allowances: 0,
    contractType: 'دوام كامل' as TeamMember['contractType'],
    workingHours: '8 ساعات يومياً',
    joinedDate: '',
    bankIban: ''
  });

  // Interactive Calculator State
  const [calcSalary, setCalcSalary] = useState<number>(8000);
  const [calcAbsentDays, setCalcAbsentDays] = useState<number>(1);
  const [calcLateHours, setCalcLateHours] = useState<number>(2);
  const [calcAllowances, setCalcAllowances] = useState<number>(1000);

  // Copied indicator for WhatsApp payslip share
  const [copiedPayslip, setCopiedPayslip] = useState(false);

  // Search in tables
  const [searchQuery, setSearchQuery] = useState('');

  // 1. REVENUE CALCULATIONS (Real-time from Deals and Renewals)
  const dealsRevenue = useMemo(() => {
    return deals
      .filter(d => d.stage === 'مغلقة ناجحة' || d.stage === 'تفاوض')
      .reduce((sum, d) => sum + (d.value || 0), 0);
  }, [deals]);

  const renewalsRevenue = useMemo(() => {
    return clientRenewals
      .filter(r => r.status === 'renewed' || r.status === 'active')
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [clientRenewals]);

  const totalCompanyRevenue = dealsRevenue + renewalsRevenue;

  // 2. PAYROLL & ATTENDANCE CALCULATIONS FOR THE MONTH
  // Helper: compute monthly attendance stats for a member
  const getMemberMonthStats = (memberId: string, memberSalary = 7500) => {
    const records = attendanceRecords.filter(r => r.memberId === memberId);
    const presentCount = records.filter(r => r.status === 'present').length;
    const lateRecords = records.filter(r => r.status === 'late' && !r.isExcused);
    const lateMinutes = lateRecords.reduce((sum, r) => sum + (r.lateMinutes || 30), 0);
    const absentCount = records.filter(r => r.status === 'absent' && !r.isExcused).length;
    const leaveCount = records.filter(r => r.status === 'leave').length;

    // Daily rate based on 30 calendar days
    const dailyRate = Math.round((memberSalary || 7500) / 30);
    const hourlyRate = Math.round(dailyRate / 8);

    // Deductions
    const absenceDeduction = absentCount * dailyRate;
    const delayHours = Math.ceil(lateMinutes / 60);
    const delayDeduction = delayHours * hourlyRate;
    const totalDeductions = absenceDeduction + delayDeduction;

    return {
      presentCount,
      absentCount,
      lateMinutes,
      delayHours,
      leaveCount,
      dailyRate,
      hourlyRate,
      absenceDeduction,
      delayDeduction,
      totalDeductions
    };
  };

  // Total gross payroll (Base + Allowances)
  const totalGrossPayroll = useMemo(() => {
    return team.reduce((sum, m) => sum + (m.salary || 7000) + (m.allowances || 0), 0);
  }, [team]);

  // Total deductions recovered across team this month
  const totalTeamDeductions = useMemo(() => {
    return team.reduce((sum, m) => {
      const stats = getMemberMonthStats(m.id, m.salary || 7000);
      return sum + stats.totalDeductions;
    }, 0);
  }, [team, attendanceRecords]);

  // Net payroll payable by the company
  const totalNetPayroll = totalGrossPayroll - totalTeamDeductions;

  // 3. OPERATING EXPENSES
  const totalOperatingExpenses = useMemo(() => {
    return companyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [companyExpenses]);

  // 4. NET PROFIT & MARGIN
  const totalCompanyCosts = totalNetPayroll + totalOperatingExpenses;
  const netCompanyProfit = totalCompanyRevenue - totalCompanyCosts;
  const profitMarginPercent = totalCompanyRevenue > 0
    ? Math.round((netCompanyProfit / totalCompanyRevenue) * 100)
    : 0;

  // Filtered members by search
  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return team;
    const q = searchQuery.toLowerCase();
    return team.filter(
      m =>
        m.name.toLowerCase().includes(q) ||
        m.employeeCode.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [team, searchQuery]);

  // Today's attendance for the selected date
  const selectedDateAttendanceMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    attendanceRecords
      .filter(r => r.date === selectedDate)
      .forEach(r => {
        map[r.memberId] = r;
      });
    return map;
  }, [attendanceRecords, selectedDate]);

  // Handlers
  const handleQuickPresentAll = () => {
    const newRecords = team.map(m => ({
      memberId: m.id,
      memberName: m.name,
      date: selectedDate,
      status: 'present' as AttendanceStatus,
      checkInTime: '09:00',
      checkOutTime: '17:00'
    }));
    batchMarkAttendance(newRecords);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleSetMemberAttendance = (
    member: TeamMember,
    status: AttendanceStatus,
    lateMinutes = 0,
    notes = ''
  ) => {
    recordAttendance({
      memberId: member.id,
      memberName: member.name,
      date: selectedDate,
      status,
      checkInTime: status === 'present' ? '09:00' : status === 'late' ? '09:35' : undefined,
      checkOutTime: status === 'present' || status === 'late' ? '17:00' : undefined,
      lateMinutes: status === 'late' ? lateMinutes || 35 : 0,
      notes,
      isExcused: false
    });
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title.trim() || newExpense.amount <= 0) return;
    addCompanyExpense(newExpense);
    setIsExpenseModalOpen(false);
    setNewExpense({
      title: '',
      amount: 1000,
      currency: brandConfig?.systemCurrency || 'ج.م',
      category: 'تسويق وإعلانات',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleOpenEditExpense = (expense: CompanyExpense) => {
    setEditingExpense({ ...expense });
  };

  const handleSaveExpenseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editingExpense.title.trim()) return;
    updateCompanyExpense(editingExpense.id, editingExpense);
    setEditingExpense(null);
  };

  const handleOpenAddAttendance = (memberId?: string) => {
    setEditingAttendanceRecord(null);
    setAttendanceForm({
      memberId: memberId || team[0]?.id || '',
      date: selectedDate,
      status: 'present',
      checkInTime: '09:00',
      checkOutTime: '17:00',
      lateMinutes: 0,
      isExcused: false,
      notes: ''
    });
    setIsAttendanceModalOpen(true);
  };

  const handleOpenEditAttendance = (record: AttendanceRecord) => {
    setEditingAttendanceRecord(record);
    setAttendanceForm({
      memberId: record.memberId,
      date: record.date,
      status: record.status,
      checkInTime: record.checkInTime || '09:00',
      checkOutTime: record.checkOutTime || '17:00',
      lateMinutes: record.lateMinutes || 0,
      isExcused: !!record.isExcused,
      notes: record.notes || ''
    });
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = team.find(m => m.id === attendanceForm.memberId);
    if (!targetMember) return;

    if (editingAttendanceRecord) {
      updateAttendanceRecord(editingAttendanceRecord.id, {
        memberId: attendanceForm.memberId,
        memberName: targetMember.name,
        date: attendanceForm.date,
        status: attendanceForm.status,
        checkInTime: attendanceForm.checkInTime,
        checkOutTime: attendanceForm.checkOutTime,
        lateMinutes: Number(attendanceForm.lateMinutes),
        isExcused: attendanceForm.isExcused,
        notes: attendanceForm.notes
      });
    } else {
      recordAttendance({
        memberId: attendanceForm.memberId,
        memberName: targetMember.name,
        date: attendanceForm.date,
        status: attendanceForm.status,
        checkInTime: attendanceForm.checkInTime,
        checkOutTime: attendanceForm.checkOutTime,
        lateMinutes: Number(attendanceForm.lateMinutes),
        isExcused: attendanceForm.isExcused,
        notes: attendanceForm.notes
      });
    }
    setIsAttendanceModalOpen(false);
  };

  const handleDeleteAttendance = (recordId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف سجل الحضور هذا؟')) {
      deleteAttendanceRecord(recordId);
    }
  };

  const handleOpenSalaryEdit = (member: TeamMember) => {
    setEditingMemberSalary(member);
    setSalaryForm({
      salary: member.salary || 7000,
      salaryCurrency: member.salaryCurrency || brandConfig?.systemCurrency || 'ج.م',
      allowances: member.allowances || 0,
      contractType: member.contractType || 'دوام كامل',
      workingHours: member.workingHours || '8 ساعات يومياً',
      joinedDate: member.joinedDate || '2023-01-15',
      bankIban: member.bankIban || ''
    });
  };

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberSalary) return;
    updateTeamMemberSalary(
      editingMemberSalary.id,
      Number(salaryForm.salary),
      salaryForm.salaryCurrency,
      Number(salaryForm.allowances),
      salaryForm.contractType,
      salaryForm.joinedDate
    );
    if (salaryForm.bankIban || salaryForm.workingHours) {
      updateTeamMember(editingMemberSalary.id, {
        bankIban: salaryForm.bankIban,
        workingHours: salaryForm.workingHours
      });
    }
    setEditingMemberSalary(null);
  };

  const handleUnpaySalary = (memberId: string) => {
    const payId = `pay-${memberId}-${selectedMonth}`;
    saveMonthlyPayroll({
      id: payId,
      memberId,
      memberName: team.find(m => m.id === memberId)?.name || '',
      month: selectedMonth,
      baseSalary: 0,
      salaryCurrency: brandConfig?.systemCurrency || 'ج.م',
      allowances: 0,
      bonus: 0,
      attendedDays: 0,
      absentDays: 0,
      lateMinutes: 0,
      absenceDeduction: 0,
      delayDeduction: 0,
      otherDeductions: 0,
      totalDeductions: 0,
      netPayable: 0,
      paymentStatus: 'pending'
    });
  };

  const handlePaySalary = (member: TeamMember) => {
    const stats = getMemberMonthStats(member.id, member.salary || 7000);
    const baseSal = member.salary || 7000;
    const allowances = member.allowances || 0;
    const net = baseSal + allowances - stats.totalDeductions;

    const payrollRecord: MonthlyPayrollRecord = {
      id: `pay-${member.id}-${selectedMonth}`,
      memberId: member.id,
      memberName: member.name,
      month: selectedMonth,
      baseSalary: baseSal,
      salaryCurrency: member.salaryCurrency || brandConfig?.systemCurrency || 'ج.م',
      allowances: allowances,
      bonus: 0,
      attendedDays: stats.presentCount,
      absentDays: stats.absentCount,
      lateMinutes: stats.lateMinutes,
      absenceDeduction: stats.absenceDeduction,
      delayDeduction: stats.delayDeduction,
      otherDeductions: 0,
      totalDeductions: stats.totalDeductions,
      netPayable: net,
      paymentStatus: 'paid',
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: 'تحويل بنكي'
    };
    saveMonthlyPayroll(payrollRecord);
    markPayrollPaid(payrollRecord.id, 'تحويل بنكي');
  };

  const handlePayAllSalaries = () => {
    if (window.confirm('هل أنت متأكد من رغبتك في اعتماد وصرف رواتب شهر ' + selectedMonth + ' لجميع الموظفين؟')) {
      team.forEach(m => handlePaySalary(m));
      alert('تم اعتماد وصرف رواتب جميع الموظفين بنجاح!');
    }
  };

  // Payslip helper
  const renderPayslipModal = () => {
    if (!selectedMemberForPayslip) return null;
    const m = selectedMemberForPayslip;
    const stats = getMemberMonthStats(m.id, m.salary || 7000);
    const baseSal = m.salary || 7000;
    const allowances = m.allowances || 0;
    const net = baseSal + allowances - stats.totalDeductions;
    const currency = m.salaryCurrency || brandConfig?.systemCurrency || 'ج.م';

    const copyPayslipToWhatsApp = () => {
      const text = `📋 قسيمة الراتب الرسمية - شركة سويفت مايند
عزيزي/عزيزتي: ${m.name} (${m.employeeCode})
القسم: ${m.department} | المسمى: ${m.role}
عن شهر: ${selectedMonth}
━━━━━━━━━━━━━━━━━━
💰 الراتب الأساسي: ${baseSal.toLocaleString()} ${currency}
➕ البدلات والمكافآت: ${allowances.toLocaleString()} ${currency}
━━━━━━━━━━━━━━━━━━
🔻 أيام الغياب: ${stats.absentCount} يوم (خصم: ${stats.absenceDeduction.toLocaleString()} ${currency})
🔻 دقائق التأخير: ${stats.lateMinutes} دقيقة (خصم: ${stats.delayDeduction.toLocaleString()} ${currency})
🔻 إجمالي الاستقطاعات: ${stats.totalDeductions.toLocaleString()} ${currency}
━━━━━━━━━━━━━━━━━━
💵 صافي الراتب المستحق للصرف: ${net.toLocaleString()} ${currency}
الحساب البنكي / الآيبان: ${m.bankIban || 'SA--'}
حالة الصرف: معتمد ومصروف ✅
نشكركم على جهودكم المستمرة!`;

      navigator.clipboard.writeText(text);
      setCopiedPayslip(true);
      setTimeout(() => setCopiedPayslip(false), 2500);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 rounded-lg">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">
                  قسيمة الراتب الرقمية (Digital Payslip)
                </h3>
                <p className="text-[10px] text-slate-300">
                  {m.name} | كود: {m.employeeCode} | شهر {selectedMonth}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMemberForPayslip(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Payslip Content Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs" id="printable-payslip">
            {/* Company branding header inside payslip */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-black text-slate-900 tracking-wider text-sm">SWIFTMYND</span>
                <span className="text-[10px] text-slate-400 block">إدارة الشؤون المالية والموارد البشرية</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                  PAYSLIP APPROVED
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">تاريخ الإصدار: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Employee metadata */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block">اسم الموظف:</span>
                <span className="font-extrabold text-slate-800">{m.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">الكود الوظيفي:</span>
                <span className="font-mono font-bold text-blue-700">{m.employeeCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">القسم والمسمى:</span>
                <span className="font-medium text-slate-700">{m.department} - {m.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">نوع العقد:</span>
                <span className="font-medium text-slate-700">{m.contractType || 'دوام كامل'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">الآيبان البنكي (IBAN):</span>
                <span className="font-mono font-semibold text-slate-600 text-[11px] select-all">
                  {m.bankIban || 'SA4420000001234567890123'}
                </span>
              </div>
            </div>

            {/* Earnings Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50/70 px-3 py-1.5 font-bold text-emerald-900 border-b border-emerald-100 flex items-center justify-between">
                <span>1. الاستحقاقات المالية (Earnings)</span>
                <span className="text-[11px] font-mono">المبلغ ({currency})</span>
              </div>
              <div className="p-3 space-y-1.5 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">الراتب الأساسي الشهري:</span>
                  <span className="font-mono font-bold">{baseSal.toLocaleString()} {currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">البدلات والمكافآت المعتمدة:</span>
                  <span className="font-mono font-bold text-emerald-700">+{allowances.toLocaleString()} {currency}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold text-slate-800">
                  <span>إجمالي الاستحقاقات:</span>
                  <span className="font-mono text-emerald-800">{(baseSal + allowances).toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

            {/* Deductions Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50/70 px-3 py-1.5 font-bold text-rose-900 border-b border-rose-100 flex items-center justify-between">
                <span>2. الاستقطاعات والخصومات (Deductions)</span>
                <span className="text-[11px] font-mono">الخصم ({currency})</span>
              </div>
              <div className="p-3 space-y-1.5 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">خصم أيام الغياب ({stats.absentCount} يوم):</span>
                  <span className="font-mono font-bold text-rose-600">
                    {stats.absenceDeduction > 0 ? `-${stats.absenceDeduction.toLocaleString()}` : '0'} {currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">خصم دقائق وساعات التأخير ({stats.lateMinutes} دقيقة):</span>
                  <span className="font-mono font-bold text-rose-600">
                    {stats.delayDeduction > 0 ? `-${stats.delayDeduction.toLocaleString()}` : '0'} {currency}
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold text-slate-800">
                  <span>إجمالي الاستقطاعات:</span>
                  <span className="font-mono text-rose-700">-{stats.totalDeductions.toLocaleString()} {currency}</span>
                </div>
              </div>
            </div>

            {/* Net Total Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-emerald-100 block">صافي الراتب المستحق للصرف:</span>
                <span className="text-[10px] text-emerald-200">الاستحقاقات بعد خصم الغياب والتأخيرات</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono block">{net.toLocaleString()} {currency}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">معتمد للدفع</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={copyPayslipToWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedPayslip ? 'تم النسخ بنجاح! ✓' : 'نسخ لواتساب الموظف 💬'}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>طباعة</span>
              </button>
              <button
                onClick={() => setSelectedMemberForPayslip(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activeCurrency = brandConfig?.systemCurrency || 'ج.م';

  return (
    <div className="space-y-5 animate-in fade-in pb-12">
      {/* 1. Header Banner & Security Lock Notice */}
      <div className="bg-gradient-to-r from-[#111927] via-[#172338] to-[#1e293b] text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>نظام الرواتب، الحضور والغياب، وصافي الأرباح</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>للإدارة والمدير العام فقط 🔒</span>
                </span>
              </h1>
              <p className="text-xs text-slate-300">
                متابعة حضور وانصراف الموظفين، احتساب التأخيرات والغياب تلقائياً، إجمالي مسير الرواتب، وتتبع مكسب الشركة الصافي.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleQuickPresentAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            title="تسجيل حضور اليوم لجميع أعضاء الفريق بضغطة واحدة"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تحضير الكل اليوم ⚡</span>
          </button>

          <button
            onClick={() => handleOpenAddAttendance()}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            title="تسجيل حضور أو غياب يدوي لأي موظف"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل حضور يدوي</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>إضافة مصروف تشغيلي</span>
          </button>

          <button
            onClick={handlePayAllSalaries}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
            title="اعتماد وصرف كشف رواتب الشهر دفعة واحدة"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>صرف مسير الشهر</span>
          </button>
        </div>
      </div>

      {/* 2. Global Currency Switcher & Management Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
              <span>العملة المعتمدة للمنظومة والأرباح والرواتب:</span>
              <span className="font-mono bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-md font-bold">
                {activeCurrency}
              </span>
            </span>
            <span className="text-[10px] text-slate-400">
              انقر على أي عملة لتطبيقها فوراً على كافة الرواتب، المصروفات، وحساب الأرباح في الموقع كاملاً
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { code: 'ج.م', label: 'جنيه مصري (EGP)' },
            { code: 'ر.س', label: 'ريال سعودي (SAR)' },
            { code: '$', label: 'دولار أمريكي (USD)' },
            { code: 'د.إ', label: 'درهم إماراتي (AED)' },
            { code: '€', label: 'يورو (EUR)' },
            { code: 'د.ك', label: 'دينار كويتي (KWD)' }
          ].map(curr => {
            const isSelected = activeCurrency === curr.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => setGlobalCurrency(curr.code, true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={`اعتماد ${curr.label} للسيستم كاملاً`}
              >
                <span className="font-mono font-black">{curr.code}</span>
                <span className="text-[10px] opacity-90 hidden sm:inline">{curr.label.split(' ')[0]}</span>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TOP KPI CARDS: PROFIT, REVENUE, PAYROLL, DEDUCTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Net Profit & Margin */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-4 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
            <span>صافي مكسب الشركة (Net Profit)</span>
            <span className="p-1.5 bg-white/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-200" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono mt-2 tracking-tight">
            {netCompanyProfit > 0 ? `+${netCompanyProfit.toLocaleString()}` : netCompanyProfit.toLocaleString()} {activeCurrency}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/30 text-[10px]">
            <span className="text-emerald-100">هامش الربحية:</span>
            <span className="font-bold bg-white text-emerald-900 px-2 py-0.5 rounded-full font-mono">
              {profitMarginPercent}% ربح صافي 🚀
            </span>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>إجمالي إيرادات الشركة</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono mt-2 text-slate-900">
            {totalCompanyRevenue.toLocaleString()} {activeCurrency}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <span>صفقات المبيعات: {dealsRevenue.toLocaleString()} {activeCurrency}</span>
            <span>اشتراكات: {renewalsRevenue.toLocaleString()} {activeCurrency}</span>
          </div>
        </div>

        {/* Card 3: Net Payroll After Deductions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>صافي مسير الرواتب المستحق</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono mt-2 text-blue-600">
            {totalNetPayroll.toLocaleString()} {activeCurrency}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <span>إجمالي الرواتب: {totalGrossPayroll.toLocaleString()} {activeCurrency}</span>
            <span className="text-rose-600 font-bold">خصومات: -{totalTeamDeductions.toLocaleString()} {activeCurrency}</span>
          </div>
        </div>

        {/* Card 4: Operating Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>المصروفات التشغيلية للشركة</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono mt-2 text-rose-600">
            {totalOperatingExpenses.toLocaleString()} {activeCurrency}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <span>{companyExpenses.length} بنود مصروفات</span>
            <span className="font-bold text-slate-700">تسويق، سيرفرات، ومقر</span>
          </div>
        </div>
      </div>

      {/* 3. SUBTABS NAVIGATION */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl w-fit text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5 text-emerald-600" />
          <span>لوحة الأرباح والمكسب الشامل</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>سجل الحضور والغياب والتأخيرات</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
            {team.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          <span>كشف مسير رواتب الشهر والصرف</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-600" />
          <span>حاسبة وقواعد الخصومات الذكية</span>
        </button>
      </div>

      {/* 4. TAB 1: OVERVIEW & COMPANY PROFIT ANALYSIS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Profit Distribution Visualizer */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    تحليل الأرباح وميزانية الشركة (Cashflow Breakdown)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    مقارنة الإيرادات مقابل مصروفات الرواتب والتشغيل وصافي المكسب المتبقي
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  {selectedMonth}
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">توزيع التدفق المالي:</span>
                  <span className="text-emerald-700 font-mono">
                    صافي الربح: {netCompanyProfit.toLocaleString()} {activeCurrency} ({profitMarginPercent}%)
                  </span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${Math.min(100, Math.round((totalNetPayroll / (totalCompanyRevenue || 1)) * 100))}%` }}
                    className="bg-blue-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    title={`الرواتب: ${totalNetPayroll.toLocaleString()} ${activeCurrency}`}
                  >
                    الرواتب ({Math.round((totalNetPayroll / (totalCompanyRevenue || 1)) * 100)}%)
                  </div>
                  <div
                    style={{ width: `${Math.min(100, Math.round((totalOperatingExpenses / (totalCompanyRevenue || 1)) * 100))}%` }}
                    className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    title={`المصروفات: ${totalOperatingExpenses.toLocaleString()} ${activeCurrency}`}
                  >
                    تشغيل ({Math.round((totalOperatingExpenses / (totalCompanyRevenue || 1)) * 100)}%)
                  </div>
                  <div
                    style={{ width: `${Math.max(0, profitMarginPercent)}%` }}
                    className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
                    title={`الربح الصافي: ${netCompanyProfit.toLocaleString()} ${activeCurrency}`}
                  >
                    صافي المكسب ({profitMarginPercent}%)
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>الرواتب والبدلات ({totalNetPayroll.toLocaleString()} {activeCurrency})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>مصروفات تشغيلية ({totalOperatingExpenses.toLocaleString()} {activeCurrency})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-bold text-emerald-800">صافي المكسب ({netCompanyProfit.toLocaleString()} {activeCurrency})</span>
                  </div>
                </div>
              </div>

              {/* Department Payroll Breakdown */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2.5">
                  توزيع الرواتب بحسب الأقسام الإدارية:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {['المبيعات', 'التطوير والتقنية', 'التسويق'].map(dept => {
                    const deptMembers = team.filter(m => m.department === dept);
                    const deptCost = deptMembers.reduce((sum, m) => sum + (m.salary || 7000) + (m.allowances || 0), 0);
                    return (
                      <div key={dept} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">{dept}</span>
                        <span className="text-sm font-extrabold font-mono text-slate-900 block mt-0.5">
                          {deptCost.toLocaleString()} {activeCurrency}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{deptMembers.length} موظفين</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Operating Expenses Card with Add Button */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-xs text-slate-900">
                    المصروفات التشغيلية المعتمدة
                  </h3>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + إضافة مصروف
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-2">
                  {companyExpenses.map(exp => (
                    <div key={exp.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800 truncate max-w-[170px]">{exp.title}</div>
                        <div className="text-[10px] text-slate-400">{exp.category} • {exp.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-600">
                          {exp.amount.toLocaleString()} {exp.currency}
                        </span>
                        <button
                          onClick={() => handleOpenEditExpense(exp)}
                          className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
                          title="تعديل بيانات المصروف"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`هل أنت متأكد من رغبتك في حذف مصروف "${exp.title}"؟`)) {
                              deleteCompanyExpense(exp.id);
                            }
                          }}
                          className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                          title="حذف المصروف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">إجمالي المصروفات:</span>
                <span className="font-mono text-rose-600 text-sm">{totalOperatingExpenses.toLocaleString()} {activeCurrency}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: ATTENDANCE & DELAY TRACKER (سجل الحضور والغياب اليومي) */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-bold text-slate-700">تاريخ الحضور:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث عن موظف..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-2 pr-7 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2" />
              </div>

              <button
                onClick={handleQuickPresentAll}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                تحضير الكل اليوم ✓
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                    <th className="py-3 px-4">الموظف والكود</th>
                    <th className="py-3 px-3">القسم والوظيفة</th>
                    <th className="py-3 px-3 text-center">حالة اليوم ({selectedDate})</th>
                    <th className="py-3 px-3 text-center">وقت الحضور</th>
                    <th className="py-3 px-3 text-center">وقت الانصراف</th>
                    <th className="py-3 px-3 text-center">دقائق التأخير</th>
                    <th className="py-3 px-3">ملاحظات / عذر</th>
                    <th className="py-3 px-4 text-center">إجراءات الحضور السريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeam.map(member => {
                    const rec = selectedDateAttendanceMap[member.id];
                    const status = rec?.status || 'present';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Member */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900">{member.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">كود: {member.employeeCode}</div>
                            </div>
                          </div>
                        </td>

                        {/* Dept & Role */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{member.role}</div>
                          <div className="text-[10px] text-slate-500">{member.department}</div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 text-center">
                          {status === 'present' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>حاضر (Present)</span>
                            </span>
                          ) : status === 'late' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>متأخر ({rec?.lateMinutes || 30} د)</span>
                            </span>
                          ) : status === 'absent' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>غائب (خصم يوم)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                              <span>إجازة رسمية</span>
                            </span>
                          )}
                        </td>

                        {/* Check-in */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {rec?.checkInTime || (status === 'present' ? '09:00' : status === 'late' ? '09:35' : '--')}
                        </td>

                        {/* Check-out */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {rec?.checkOutTime || (status === 'present' || status === 'late' ? '17:00' : '--')}
                        </td>

                        {/* Late Minutes & Deduction */}
                        <td className="py-3 px-3 text-center">
                          {status === 'late' ? (
                            <div className="font-mono font-bold text-amber-700">
                              {rec?.lateMinutes || 30} دقيقة
                              {rec?.isExcused ? (
                                <span className="block text-[9px] text-emerald-600 font-sans">معفي من الخصم</span>
                              ) : (
                                <span className="block text-[9px] text-rose-600 font-sans">يُخصم من الراتب</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">-</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {rec?.notes || (status === 'absent' ? 'لم يحضر بدون إذن' : '-')}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSetMemberAttendance(member, 'present')}
                              className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                status === 'present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-emerald-100 text-emerald-800'
                              }`}
                              title="تسجيل حاضر"
                            >
                              حاضر ✓
                            </button>
                            <button
                              onClick={() => handleSetMemberAttendance(member, 'late', 40, 'تأخير')}
                              className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                status === 'late'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-100 hover:bg-amber-100 text-amber-800'
                              }`}
                              title="تسجيل متأخر"
                            >
                              تأخير ⏱️
                            </button>
                            <button
                              onClick={() => handleSetMemberAttendance(member, 'absent', 0, 'غياب بدون إذن')}
                              className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                                status === 'absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 hover:bg-rose-100 text-rose-800'
                              }`}
                              title="تسجيل غائب (خصم يوم)"
                            >
                              غياب ✕
                            </button>
                            {status === 'late' && (
                              <button
                                onClick={() => {
                                  if (rec) {
                                    updateAttendanceRecord(rec.id, { isExcused: !rec.isExcused });
                                  }
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-purple-100 text-purple-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                title="إعفاء الموظف من خصم التأخير لوجود عذر"
                              >
                                {rec?.isExcused ? 'ملغى الخصم ✓' : 'إعفاء'}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (rec) {
                                  handleOpenEditAttendance(rec);
                                } else {
                                  handleOpenAddAttendance(member.id);
                                }
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="تعديل وقت الحضور والانصراف والدقائق والملاحظات"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            {rec && (
                              <button
                                onClick={() => handleDeleteAttendance(rec.id)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold cursor-pointer"
                                title="حذف سجل الحضور لهذا اليوم"
                              >
                                <Trash2 className="w-3 h-3" />
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

      {/* 6. TAB 3: MONTHLY PAYROLL SHEET (كشف مسير الرواتب وصافي المستحقات) */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Month Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-700">شهر مسير الرواتب:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePayAllSalaries}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                صرف رواتب الشهر لجميع الموظفين 💸
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                    <th className="py-3 px-4">الموظف والكود</th>
                    <th className="py-3 px-3">العقد والوظيفة</th>
                    <th className="py-3 px-3 text-left">الراتب الأساسي</th>
                    <th className="py-3 px-3 text-left">البدلات</th>
                    <th className="py-3 px-3 text-center">أيام الغياب (خصم)</th>
                    <th className="py-3 px-3 text-center">ساعات التأخير (خصم)</th>
                    <th className="py-3 px-3 text-left">صافي الراتب المستحق</th>
                    <th className="py-3 px-3 text-center">حالة الصرف</th>
                    <th className="py-3 px-4 text-center">إجراءات المدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeam.map(member => {
                    const stats = getMemberMonthStats(member.id, member.salary || 7000);
                    const baseSal = member.salary || 7000;
                    const allowances = member.allowances || 0;
                    const net = baseSal + allowances - stats.totalDeductions;
                    const currency = member.salaryCurrency || 'ر.س';

                    const payrollRec = monthlyPayrolls.find(
                      p => p.memberId === member.id && p.month === selectedMonth
                    );
                    const isPaid = payrollRec?.paymentStatus === 'paid';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Member */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900">{member.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">كود: {member.employeeCode}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contract & Role */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{member.role}</div>
                          <div className="text-[10px] text-blue-600 font-semibold">{member.contractType || 'دوام كامل'}</div>
                        </td>

                        {/* Base Salary */}
                        <td className="py-3 px-3 text-left font-mono font-bold text-slate-800">
                          {baseSal.toLocaleString()} {currency}
                        </td>

                        {/* Allowances */}
                        <td className="py-3 px-3 text-left font-mono font-bold text-emerald-700">
                          +{allowances.toLocaleString()} {currency}
                        </td>

                        {/* Absence Deduction */}
                        <td className="py-3 px-3 text-center">
                          {stats.absentCount > 0 ? (
                            <span className="font-mono font-bold text-rose-600">
                              {stats.absentCount} يوم (-{stats.absenceDeduction.toLocaleString()})
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0 يوم (0)</span>
                          )}
                        </td>

                        {/* Delay Deduction */}
                        <td className="py-3 px-3 text-center">
                          {stats.lateMinutes > 0 ? (
                            <span className="font-mono font-bold text-amber-700">
                              {stats.lateMinutes} د (-{stats.delayDeduction.toLocaleString()})
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono">0 د (0)</span>
                          )}
                        </td>

                        {/* Net Salary Payable */}
                        <td className="py-3 px-3 text-left font-mono font-black text-emerald-800 text-sm">
                          {net.toLocaleString()} {currency}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <span>تم الصرف ✓</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              <span>معلق ⏳</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Pay Salary button */}
                            {!isPaid ? (
                              <button
                                onClick={() => handlePaySalary(member)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                title="صرف الراتب وتسجيله"
                              >
                                صرف 💸
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                                  مصروف ✓
                                </span>
                                <button
                                  onClick={() => handleUnpaySalary(member.id)}
                                  className="px-1.5 py-1 bg-slate-100 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold cursor-pointer"
                                  title="إلغاء حالة الصرف وإعادة الراتب كمعلق"
                                >
                                  إلغاء ↩️
                                </button>
                              </div>
                            )}

                            {/* Digital Payslip */}
                            <button
                              onClick={() => setSelectedMemberForPayslip(member)}
                              className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200 cursor-pointer flex items-center gap-1"
                              title="عرض وطباعة قسيمة الراتب الرقمية (Payslip)"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>القسيمة</span>
                            </button>

                            {/* Edit Salary & Allowances */}
                            <button
                              onClick={() => handleOpenSalaryEdit(member)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="تعديل الراتب والبدلات"
                            >
                              <Edit3 className="w-3 h-3" />
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
        </div>
      )}

      {/* 7. TAB 4: CALCULATOR & DEDUCTION RULES (حاسبة وقواعد الخصومات الذكية) */}
      {activeTab === 'calculator' && (
        <div className="space-y-4">
          {/* Policy Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>1. قاعدة احتساب خصم الغياب</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                يوم الغياب غير المصرح به يُخصم بالمعادلة المعتمدة:
                <br />
                <strong className="font-mono text-slate-900 block mt-1">
                  خصم اليوم = الراتب الأساسي ÷ 30 يوماً
                </strong>
                ولا يؤثر الغياب على البدلات إلا إذا نص العقد على ذلك.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Clock className="w-4 h-4" />
                <span>2. قاعدة احتساب خصم التأخيرات</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                تُحسب دقائق التأخير التراكمية خلال الشهر:
                <br />
                <strong className="font-mono text-slate-900 block mt-1">
                  قيمة الساعة = (الراتب الأساسي ÷ 30) ÷ 8 ساعات
                </strong>
                يُعفى الموظف من الخصم إذا تم تفعيل "عذر مقبول".
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>3. البدلات والمكافآت والبونص</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                تُضاف البدلات الثابتة تلقائياً للراتب، كما يمكن إضافة بونص فوري لفرق المبيعات عند إغلاق صفقات جديدة.
              </p>
            </div>
          </div>

          {/* Live Interactive Salary Calculator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>الحاسبة الفورية لتجربة خصومات الموظف وصافي الراتب المستحق</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الراتب الأساسي ({activeCurrency}):</label>
                <input
                  type="number"
                  step="100"
                  value={calcSalary}
                  onChange={e => setCalcSalary(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البدلات الإضافية ({activeCurrency}):</label>
                <input
                  type="number"
                  step="50"
                  value={calcAllowances}
                  onChange={e => setCalcAllowances(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد أيام الغياب:</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={calcAbsentDays}
                  onChange={e => setCalcAbsentDays(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ساعات التأخير التراكمية:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={calcLateHours}
                  onChange={e => setCalcLateHours(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                />
              </div>
            </div>

            {/* Result Display */}
            {(() => {
              const dayRate = Math.round(calcSalary / 30);
              const hourRate = Math.round(dayRate / 8);
              const absDeduct = calcAbsentDays * dayRate;
              const delayDeduct = calcLateHours * hourRate;
              const totalDeduct = absDeduct + delayDeduct;
              const netResult = calcSalary + calcAllowances - totalDeduct;

              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">قيمة يوم العمل:</span>
                    <span className="font-mono font-bold text-slate-700 text-sm">{dayRate} {activeCurrency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">قيمة ساعة العمل:</span>
                    <span className="font-mono font-bold text-slate-700 text-sm">{hourRate} {activeCurrency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">خصم الغياب:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">-{absDeduct} {activeCurrency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">خصم التأخير:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">-{delayDeduct} {activeCurrency}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 bg-emerald-100/70 p-2 rounded-lg">
                    <span className="text-[10px] text-emerald-800 font-bold block">صافي الراتب المستحق:</span>
                    <span className="font-mono font-black text-emerald-900 text-base">{netResult.toLocaleString()} {activeCurrency}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD COMPANY EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">إضافة مصروف تشغيلي للشركة</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم وبند المصروف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حملة إعلانات جوجل أدز، أو إيجار المكتب"
                  value={newExpense.title}
                  onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">العملة</label>
                  <select
                    value={newExpense.currency}
                    onChange={e => setNewExpense({ ...newExpense, currency: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="ج.م">ج.م (مصري)</option>
                    <option value="ر.س">ر.س (سعودي)</option>
                    <option value="د.ك">د.ك (كويتي)</option>
                    <option value="$">$ (دولار)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف المصروف</label>
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  <option value="تسويق وإعلانات">تسويق وإعلانات</option>
                  <option value="سيرفرات وأدوات تقنية">سيرفرات وأدوات تقنية</option>
                  <option value="إيجار ومقر">إيجار ومقر</option>
                  <option value="استشارات وقانونية">استشارات وقانونية</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ المصروف</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  إضافة المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SALARY & ALLOWANCES & TENURE */}
      {editingMemberSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">تعديل الراتب والبدلات والعقد: {editingMemberSalary.name}</h3>
                <p className="text-[10px] text-slate-400">كود: {editingMemberSalary.employeeCode} | {editingMemberSalary.role}</p>
              </div>
              <button
                onClick={() => setEditingMemberSalary(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSalary} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الأساسي *</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={salaryForm.salary}
                    onChange={e => setSalaryForm({ ...salaryForm, salary: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">العملة</label>
                  <select
                    value={salaryForm.salaryCurrency}
                    onChange={e => setSalaryForm({ ...salaryForm, salaryCurrency: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="ج.م">ج.م (مصري)</option>
                    <option value="ر.س">ر.س (سعودي)</option>
                    <option value="$">$ (دولار)</option>
                    <option value="د.إ">د.إ (إماراتي)</option>
                    <option value="€">€ (يورو)</option>
                    <option value="د.ك">د.ك (كويتي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البدلات والمكافآت الشهرية</label>
                <input
                  type="number"
                  step="50"
                  value={salaryForm.allowances}
                  onChange={e => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع العقد</label>
                  <select
                    value={salaryForm.contractType}
                    onChange={e => setSalaryForm({ ...salaryForm, contractType: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="دوام كامل">دوام كامل (Full Time)</option>
                    <option value="دوام جزئي">دوام جزئي (Part Time)</option>
                    <option value="عقد استشاري">عقد استشاري (Consultant)</option>
                    <option value="عقد فريلانس">عقد فريلانس (Freelance)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ بداية العمل بالشركة</label>
                  <input
                    type="date"
                    value={salaryForm.joinedDate}
                    onChange={e => setSalaryForm({ ...salaryForm, joinedDate: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ساعات العمل اليومية</label>
                  <input
                    type="text"
                    value={salaryForm.workingHours}
                    onChange={e => setSalaryForm({ ...salaryForm, workingHours: e.target.value })}
                    placeholder="مثال: 8 ساعات يومياً"
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الآيبان البنكي (IBAN)</label>
                  <input
                    type="text"
                    value={salaryForm.bankIban}
                    onChange={e => setSalaryForm({ ...salaryForm, bankIban: e.target.value })}
                    placeholder="مثال: SA44200000..."
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-bold flex items-center justify-between text-xs">
                <span>إجمالي الحزمة الشهرية الجديدة:</span>
                <span className="font-mono text-sm">{((salaryForm.salary || 0) + (salaryForm.allowances || 0)).toLocaleString()} {salaryForm.salaryCurrency}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMemberSalary(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT COMPANY EXPENSE */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">تعديل مصروف تشغيلي</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExpenseEdit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم وبند المصروف *</label>
                <input
                  type="text"
                  required
                  value={editingExpense.title}
                  onChange={e => setEditingExpense({ ...editingExpense, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingExpense.amount}
                    onChange={e => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">العملة</label>
                  <select
                    value={editingExpense.currency}
                    onChange={e => setEditingExpense({ ...editingExpense, currency: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="ج.م">ج.م (مصري)</option>
                    <option value="ر.س">ر.س (سعودي)</option>
                    <option value="$">$ (دولار)</option>
                    <option value="د.إ">د.إ (إماراتي)</option>
                    <option value="€">€ (يورو)</option>
                    <option value="د.ك">د.ك (كويتي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تصنيف المصروف</label>
                <select
                  value={editingExpense.category}
                  onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value as any })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                >
                  <option value="تسويق وإعلانات">تسويق وإعلانات</option>
                  <option value="سيرفرات وأدوات تقنية">سيرفرات وأدوات تقنية</option>
                  <option value="إيجار ومقر">إيجار ومقر</option>
                  <option value="استشارات وقانونية">استشارات وقانونية</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ المصروف</label>
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={e => setEditingExpense({ ...editingExpense, date: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD & EDIT ATTENDANCE RECORD */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">
                  {editingAttendanceRecord ? 'تعديل سجل حضور الموظف' : 'تسجيل حضور / غياب يدوي'}
                </h3>
                <p className="text-[10px] text-slate-400">تاريخ: {attendanceForm.date}</p>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAttendance} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف *</label>
                <select
                  value={attendanceForm.memberId}
                  onChange={e => setAttendanceForm({ ...attendanceForm, memberId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                  required
                >
                  {team.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.employeeCode}) - {m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={attendanceForm.date}
                    onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحالة *</label>
                  <select
                    value={attendanceForm.status}
                    onChange={e => setAttendanceForm({ ...attendanceForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="present">حاضر (Present)</option>
                    <option value="late">متأخر (Late)</option>
                    <option value="absent">غائب (Absent)</option>
                    <option value="leave">إجازة (Leave)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الحضور</label>
                  <input
                    type="time"
                    value={attendanceForm.checkInTime}
                    onChange={e => setAttendanceForm({ ...attendanceForm, checkInTime: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الانصراف</label>
                  <input
                    type="time"
                    value={attendanceForm.checkOutTime}
                    onChange={e => setAttendanceForm({ ...attendanceForm, checkOutTime: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {attendanceForm.status === 'late' && (
                <div className="grid grid-cols-2 gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">دقائق التأخير</label>
                    <input
                      type="number"
                      min="1"
                      value={attendanceForm.lateMinutes}
                      onChange={e => setAttendanceForm({ ...attendanceForm, lateMinutes: Number(e.target.value) })}
                      className="w-full p-2 border border-amber-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="excuseCheck"
                      checked={attendanceForm.isExcused}
                      onChange={e => setAttendanceForm({ ...attendanceForm, isExcused: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="excuseCheck" className="text-xs font-bold text-amber-900 cursor-pointer">
                      إعفاء من الخصم (عذر)
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات</label>
                <input
                  type="text"
                  placeholder="سبب التأخير، إذن مسبق، أو ملاحظة إدارية..."
                  value={attendanceForm.notes}
                  onChange={e => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  حفظ سجل الحضور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render Payslip Modal */}
      {renderPayslipModal()}
    </div>
  );
};
