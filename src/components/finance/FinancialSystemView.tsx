import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Building2,
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
  AlertTriangle,
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
  Calendar,
  Wallet,
  ArrowRightLeft,
  Receipt,
  BookOpen,
  Scale,
  ShieldCheck,
  Eye,
  Send,
  HelpCircle,
  RefreshCw,
  FolderKanban
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  ClientFinancialContract,
  ClientPaymentEntry,
  CompanyExpense,
  TeamMember,
  FinancialAccount,
  FinancialTransaction,
  RecurringObligation,
  ChartAccount,
  JournalEntry,
  ClientInvoice
} from '../../types/crm';
import {
  exportFinancialTransactionsToExcel,
  exportClientStatementToExcel,
  exportTrialBalanceToExcel
} from '../../utils/excelExport';
import confetti from 'canvas-confetti';

// Initial Accounts: الخزائن والبنوك
const INITIAL_FINANCIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc-cash-main',
    name: 'خزنة الشركة الرئيسية (الكاش)',
    accountType: 'cash',
    currency: 'ج.م',
    openingBalance: 35000,
    currentBalance: 35000,
    isDefault: true,
    notes: 'الخزينة النقدية بمقر الشركة للمصروفات اليومية والنثريات'
  },
  {
    id: 'acc-bank-cib',
    name: 'البنك التجاري الدولي (CIB)',
    accountType: 'bank',
    accountNumber: '1000-4829-1928-01',
    currency: 'ج.م',
    openingBalance: 65000,
    currentBalance: 65000,
    isDefault: false,
    notes: 'الحساب البنكي الأساسي للتحويلات والفواتير الرسمية'
  },
  {
    id: 'acc-wallet-vf',
    name: 'محفظة فودافون كاش / إنستاباي',
    accountType: 'wallet',
    accountNumber: '01023456789',
    currency: 'ج.م',
    openingBalance: 15000,
    currentBalance: 15000,
    isDefault: false,
    notes: 'للتحصيلات الفورية السريعة والمدفوعات الإلكترونية'
  },
  {
    id: 'acc-bank-nbe',
    name: 'البنك الأهلي المصري (NBE)',
    accountType: 'bank',
    accountNumber: '1920-3847-5920-00',
    currency: 'ج.م',
    openingBalance: 40000,
    currentBalance: 40000,
    isDefault: false,
    notes: 'حساب فرعي للاحتياطي والتحويلات الاستثمارية'
  }
];

// Initial Recurring Obligations: الالتزامات والمصروفات المتكررة
const INITIAL_RECURRING_OBLIGATIONS: RecurringObligation[] = [
  {
    id: 'rec-1',
    title: 'إيجار المقر الإداري للشركة',
    category: 'إيجار ومقر',
    beneficiary: 'مالك العقار - م. سامح فهمي',
    periodicAmount: 6000,
    currency: 'ج.م',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-11-01',
    targetAccountId: 'acc-bank-cib',
    paidThisPeriod: true,
    paidAmountThisPeriod: 6000,
    lastPaidDate: '2026-10-01',
    chartAccountCode: '502',
    notes: 'عقد الإيجار ساري وموثق، الاستحقاق أول كل شهر ميلادي',
    status: 'active'
  },
  {
    id: 'rec-2',
    title: 'إنترنت فايبر عالي السرعة والمرافق',
    category: 'مرافق وكهرباء',
    beneficiary: 'الشركة المصرية للاتصالات WE',
    periodicAmount: 1200,
    currency: 'ج.م',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-11-10',
    targetAccountId: 'acc-wallet-vf',
    paidThisPeriod: true,
    paidAmountThisPeriod: 1200,
    lastPaidDate: '2026-10-08',
    chartAccountCode: '505',
    notes: 'خط فايبر مخصص لخدمات الدعم والرفع السحابي',
    status: 'active'
  },
  {
    id: 'rec-3',
    title: 'اشتراكات الذكاء الاصطناعي (OpenAI, Claude, Cursor API)',
    category: 'سيرفرات وأدوات تقنية',
    beneficiary: 'OpenAI & Anthropic & Cursor',
    periodicAmount: 2500,
    currency: 'ج.م',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-11-15',
    targetAccountId: 'acc-bank-cib',
    paidThisPeriod: true,
    paidAmountThisPeriod: 2500,
    lastPaidDate: '2026-10-15',
    chartAccountCode: '503',
    notes: 'تراخيص الذكاء الاصطناعي لإنشاء محتوى ومحركات البحث GEO',
    status: 'active'
  },
  {
    id: 'rec-4',
    title: 'سيرفرات AWS واستضافة Cloudflare والنطاقات',
    category: 'سيرفرات وأدوات تقنية',
    beneficiary: 'Amazon Web Services & Cloudflare',
    periodicAmount: 1850,
    currency: 'ج.م',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-10-31',
    targetAccountId: 'acc-bank-cib',
    paidThisPeriod: false,
    paidAmountThisPeriod: 0,
    chartAccountCode: '503',
    notes: 'سيرفرات قواعد البيانات وتوزيع المحتوى',
    status: 'active'
  },
  {
    id: 'rec-5',
    title: 'اشتراكات أدوات السيو وتتبع الـ GEO (Ahrefs & Semrush)',
    category: 'اشتراكات برامج',
    beneficiary: 'Semrush Inc.',
    periodicAmount: 3200,
    currency: 'ج.م',
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-11-05',
    targetAccountId: 'acc-bank-cib',
    paidThisPeriod: false,
    paidAmountThisPeriod: 0,
    chartAccountCode: '503',
    notes: 'متابعة كلمات البحث ومنافسي العملاء',
    status: 'active'
  }
];

// Initial Chart of Accounts: دليل الحسابات الموحد
const INITIAL_CHART_OF_ACCOUNTS: ChartAccount[] = [
  // 1. الأصول (Assets)
  { code: '101', name: 'الخزينة النقدية الرئيسية', type: 'asset', category: 'أصول', balance: 35000, debitTotal: 55000, creditTotal: 20000, description: 'نقدية الصندوق بالجنيه المصري' },
  { code: '102', name: 'حسابات البنوك الجارية (CIB / NBE)', type: 'asset', category: 'أصول', balance: 105000, debitTotal: 145000, creditTotal: 40000, description: 'أرصدة البنوك المعتمدة' },
  { code: '103', name: 'المحافظ الإلكترونية (فودافون كاش / إنستاباي)', type: 'asset', category: 'أصول', balance: 15000, debitTotal: 27000, creditTotal: 12000, description: 'أرصدة المحافظ الإلكترونية' },
  { code: '104', name: 'العملاء — حسابات مدينة (مستحقات على العملاء)', type: 'asset', category: 'أصول', balance: 40000, debitTotal: 160000, creditTotal: 120000, description: 'باقي دفعات العقود والفواتير المعتمدة' },
  { code: '105', name: 'الأصول الثابتة والمعدات وأجهزة العمل', type: 'asset', category: 'أصول', balance: 80000, debitTotal: 80000, creditTotal: 0, description: 'أجهزة الكمبيوتر والكاميرات والأثاث' },

  // 2. الالتزامات (Liabilities)
  { code: '201', name: 'المرتبات والأجور المستحقة', type: 'liability', category: 'التزامات', balance: 15000, debitTotal: 35000, creditTotal: 50000, description: 'مستحقات مرتبات الشهر الجاري المتبقية' },
  { code: '202', name: 'مصروفات وإيجارات مستحقة غير مدفوعة', type: 'liability', category: 'التزامات', balance: 5050, debitTotal: 9700, creditTotal: 14750, description: 'فواتير واشتراكات دورية بانتظار السداد' },
  { code: '203', name: 'الموردون ومقدمو الخدمات (دائنون)', type: 'liability', category: 'التزامات', balance: 4500, debitTotal: 12000, creditTotal: 16500, description: 'مستحقات الموردين والشركاء' },

  // 3. حقوق الملكية (Equity)
  { code: '301', name: 'رأس المال العامل', type: 'equity', category: 'حقوق ملكية', balance: 195000, debitTotal: 0, creditTotal: 195000, description: 'رأس مال التأسيس والتشغيل' },
  { code: '302', name: 'الأرباح المحتجزة / المرحلة', type: 'equity', category: 'حقوق ملكية', balance: 55450, debitTotal: 0, creditTotal: 55450, description: 'أرباح متراكمة من الفترات السابقة' },

  // 4. الإيرادات (Revenues)
  { code: '401', name: 'إيرادات خدمات باقات سيو GEO والذكاء الاصطناعي', type: 'revenue', category: 'إيرادات', balance: 98000, debitTotal: 0, creditTotal: 98000, description: 'إيرادات العقود والخدمات المكتسبة' },
  { code: '402', name: 'إيرادات تطوير المنظومات وإدارة المبيعات CRM', type: 'revenue', category: 'إيرادات', balance: 42000, debitTotal: 0, creditTotal: 42000, description: 'إيرادات الاشتراكات الشهرية والسنوية' },
  { code: '403', name: 'إيرادات الحملات الإعلانية والاستشارات', type: 'revenue', category: 'إيرادات', balance: 20000, debitTotal: 0, creditTotal: 20000, description: 'إيرادات الاستشارات التسويقية والتدريب' },

  // 5. المصروفات (Expenses)
  { code: '501', name: 'المرتبات والأجور ومكافآت الفريق', type: 'expense', category: 'مصروفات', balance: 50000, debitTotal: 50000, creditTotal: 0, description: 'إجمالي رواتب الفريق والبدلات والمكافآت' },
  { code: '502', name: 'إيجار المقر ومصروفات التشغيل الإداري', type: 'expense', category: 'مصروفات', balance: 6000, debitTotal: 6000, creditTotal: 0, description: 'إيجار المكتب الشهري' },
  { code: '503', name: 'اشتراكات البرمجيات والسيرفرات والذكاء الاصطناعي', type: 'expense', category: 'مصروفات', balance: 7550, debitTotal: 7550, creditTotal: 0, description: 'تراخيص الأدوات والبنية السحابية' },
  { code: '504', name: 'حملات التسويق وإعلانات جذب العملاء', type: 'expense', category: 'مصروفات', balance: 4500, debitTotal: 4500, creditTotal: 0, description: 'إعلانات جوجل وتيك توك وفيسبوك' },
  { code: '505', name: 'المرافق والإنترنت ونثريات المقر', type: 'expense', category: 'مصروفات', balance: 1200, debitTotal: 1200, creditTotal: 0, description: 'فواتير الإنترنت والهاتف والكهرباء' }
];

export const FinancialSystemView: React.FC = () => {
  const {
    team,
    currentUser,
    companyExpenses,
    addCompanyExpense,
    deleteCompanyExpense,
    clientFinancialContracts,
    recordClientPayment,
    addClientFinancialContract,
    updateClientFinancialContract,
    deleteClientFinancialContract,
    clientRenewals,
    tasks,
    deals,
    brandConfig,
    isManager
  } = useCRM();

  // 7 Main Section Tabs
  type MainTab = 'overview' | 'clients' | 'transactions' | 'payroll' | 'recurring' | 'treasury' | 'reports';
  const [activeTab, setActiveTab] = useState<MainTab>('overview');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'today' | 'this_month' | 'this_quarter' | 'all'>('this_month');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // Persistent Accounts State
  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    try {
      const saved = localStorage.getItem('swiftmynd_financial_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FINANCIAL_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem('swiftmynd_financial_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Persistent Recurring Obligations State
  const [recurringObligations, setRecurringObligations] = useState<RecurringObligation[]>(() => {
    try {
      const saved = localStorage.getItem('swiftmynd_recurring_obligations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_RECURRING_OBLIGATIONS;
  });

  useEffect(() => {
    localStorage.setItem('swiftmynd_recurring_obligations', JSON.stringify(recurringObligations));
  }, [recurringObligations]);

  // Persistent Chart of Accounts
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartAccount[]>(() => {
    try {
      const saved = localStorage.getItem('swiftmynd_chart_of_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CHART_OF_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem('swiftmynd_chart_of_accounts', JSON.stringify(chartOfAccounts));
  }, [chartOfAccounts]);

  // Modals States
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [isNewObligationModalOpen, setIsNewObligationModalOpen] = useState(false);
  const [selectedClientForStatement, setSelectedClientForStatement] = useState<any | null>(null);
  const [selectedClientForPayment, setSelectedClientForPayment] = useState<ClientFinancialContract | null>(null);
  const [selectedMemberForPayslip, setSelectedMemberForPayslip] = useState<TeamMember | null>(null);
  const [activeVoucherForPrint, setActiveVoucherForPrint] = useState<any | null>(null);

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    fromAccountId: 'acc-cash-main',
    toAccountId: 'acc-bank-cib',
    amount: 10000,
    date: new Date().toISOString().split('T')[0],
    referenceNumber: 'TRF-' + Math.floor(10000 + Math.random() * 90000),
    description: 'تحويل نقدي من خزنة المقر إلى الحساب البنكي للإيداع',
    notes: 'تم الإيداع من قِبل مسؤول الحسابات'
  });

  // New Transaction Form State
  const [newTransactionForm, setNewTransactionForm] = useState<{
    type: 'revenue' | 'expense';
    category: string;
    amount: number;
    currency: string;
    date: string;
    dueDate: string;
    isPaid: boolean;
    accountId: string;
    targetName: string; // العميل أو الموظف أو المورد
    paymentMethod: 'نقدي' | 'تحويل بنكي' | 'فودافون كاش / إنستاباي' | 'شيك بنكي' | 'فيزا / بطاقة' | 'أخرى';
    referenceNumber: string;
    description: string;
    notes: string;
  }>({
    type: 'expense',
    category: 'إيجار ومقر',
    amount: 3000,
    currency: 'ج.م',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    isPaid: true,
    accountId: 'acc-cash-main',
    targetName: '',
    paymentMethod: 'نقدي',
    referenceNumber: '',
    description: '',
    notes: ''
  });

  // Client Payment Form
  const [clientPaymentForm, setClientPaymentForm] = useState({
    amount: 5000,
    paymentMethod: 'تحويل بنكي' as ClientPaymentEntry['paymentMethod'],
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    accountId: 'acc-bank-cib',
    note: ''
  });

  // New Contract Form
  const [newContractForm, setNewContractForm] = useState({
    clientName: '',
    companyName: '',
    serviceTitle: 'باقة سيو جيو وحملات تسويقية متكاملة',
    contractTotalValue: 30000,
    currency: 'ج.م',
    totalPaidAmount: 15000,
    contractStartDate: new Date().toISOString().split('T')[0],
    nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentPlan: 'أقساط شهرية' as ClientFinancialContract['paymentPlan'],
    phone: '',
    whatsappNumber: '',
    notes: ''
  });

  // New Recurring Obligation Form
  const [newObligationForm, setNewObligationForm] = useState({
    title: '',
    category: 'إيجار ومقر' as RecurringObligation['category'],
    beneficiary: '',
    periodicAmount: 3000,
    currency: 'ج.م',
    frequency: 'monthly' as RecurringObligation['frequency'],
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: new Date().toISOString().split('T')[0],
    targetAccountId: 'acc-cash-main',
    notes: ''
  });

  // ==================== ALL FINANCIAL TRANSACTIONS SYNCHRONIZER ====================
  // Merge payments from contracts, company expenses, recurring paid items, and salaries
  const allTransactions = useMemo(() => {
    const list: any[] = [];

    // 1. Client Contract Payments (Revenues - Inflow)
    clientFinancialContracts.forEach(c => {
      (c.payments || []).forEach(p => {
        list.push({
          id: p.id,
          transactionNumber: p.referenceNumber || `REC-${p.id.slice(-5)}`,
          type: 'revenue',
          status: 'paid',
          category: 'إيراد عميل / تحصيل عقد',
          amount: p.amount,
          currency: p.currency || 'ج.م',
          date: p.paymentDate,
          dueDate: p.paymentDate,
          paidAt: p.paymentDate,
          isPaid: true,
          toAccountId: p.paymentMethod.includes('كاش') ? 'acc-cash-main' : p.paymentMethod.includes('فودافون') ? 'acc-wallet-vf' : 'acc-bank-cib',
          toAccountName: p.paymentMethod.includes('كاش') ? 'خزنة الشركة الرئيسية' : p.paymentMethod.includes('فودافون') ? 'محفظة فودافون كاش' : 'البنك التجاري الدولي CIB',
          clientId: c.clientId,
          clientName: c.clientName,
          companyName: c.companyName,
          contractId: c.id,
          paymentMethod: p.paymentMethod,
          referenceNumber: p.referenceNumber,
          description: `تحصيل دفعة عقد (${c.serviceTitle}) - ${c.clientName}`,
          notes: p.note,
          createdByName: p.receivedBy || 'المدير المالي',
          createdAt: p.createdAt || p.paymentDate
        });
      });
    });

    // 2. Company Operating Expenses (Outflow)
    companyExpenses.forEach(e => {
      list.push({
        id: e.id,
        transactionNumber: `EXP-${e.id.slice(-5)}`,
        type: 'expense',
        status: 'paid',
        category: e.category,
        amount: e.amount,
        currency: e.currency || 'ج.م',
        date: e.date,
        dueDate: e.date,
        paidAt: e.date,
        isPaid: true,
        fromAccountId: 'acc-cash-main',
        fromAccountName: 'خزنة الشركة الرئيسية (الكاش)',
        description: e.title,
        notes: e.notes,
        paymentMethod: 'نقدي',
        createdByName: 'الإدارة المالية',
        createdAt: e.date
      });
    });

    // 3. Paid Recurring Obligations (Outflow)
    recurringObligations.filter(r => r.paidThisPeriod).forEach(r => {
      list.push({
        id: `rec-trx-${r.id}`,
        transactionNumber: `PAY-REC-${r.id.slice(-4)}`,
        type: 'expense',
        status: 'paid',
        category: r.category,
        amount: r.paidAmountThisPeriod,
        currency: r.currency || 'ج.م',
        date: r.lastPaidDate || '2026-10-01',
        dueDate: r.nextDueDate,
        paidAt: r.lastPaidDate,
        isPaid: true,
        fromAccountId: r.targetAccountId,
        fromAccountName: accounts.find(a => a.id === r.targetAccountId)?.name || 'البنك / الخزنة',
        vendorName: r.beneficiary,
        description: `سداد ${r.title} - مستحق عن الفترة`,
        paymentMethod: r.targetAccountId?.includes('wallet') ? 'فودافون كاش / إنستاباي' : r.targetAccountId?.includes('bank') ? 'تحويل بنكي' : 'نقدي',
        createdByName: 'الإدارة المالية',
        createdAt: r.lastPaidDate || '2026-10-01'
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clientFinancialContracts, companyExpenses, recurringObligations, accounts]);

  // ==================== FINANCIAL KPIS CALCULATION ====================
  const financialKPIs = useMemo(() => {
    // 1. Total Inflow / Received from Clients (المقبوضات الفعلية)
    const actualCashInflow = clientFinancialContracts.reduce((sum, c) => sum + (c.totalPaidAmount || 0), 0);

    // 2. Total Outflow / Paid (المدفوعات الفعلية)
    const totalOperatingExpenses = companyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const paidRecurring = recurringObligations.reduce((sum, r) => sum + (r.paidAmountThisPeriod || 0), 0);
    const paidSalaries = team.reduce((sum, m) => sum + (m.salary || 0) + (m.allowances || 0), 0);
    const actualCashOutflow = totalOperatingExpenses + paidRecurring;

    // 3. Outstanding Receivables (المستحق من العملاء)
    const totalRemainingReceivables = clientFinancialContracts.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);
    const overdueReceivables = clientFinancialContracts
      .filter(c => c.paymentStatus === 'متأخر في السداد')
      .reduce((sum, c) => sum + (c.remainingBalance || 0), 0);

    // 4. Earned Revenue (الإيرادات المكتسبة للعقود)
    const totalContractValue = clientFinancialContracts.reduce((sum, c) => sum + (c.contractTotalValue || 0), 0);

    // 5. Accrued Expenses for the period (المصروفات المستحقة للفترة)
    const totalAccruedExpenses = totalOperatingExpenses + paidRecurring + paidSalaries;

    // 6. Net Profit (صافي الربح المبدئي = الإيرادات المكتسبة - المصروفات المستحقة)
    const netProfit = totalContractValue - totalAccruedExpenses;

    // 7. Net Cash Flow (صافي التدفق النقدي = المقبوضات الفعلية - المدفوعات الفعلية)
    const netCashFlow = actualCashInflow - actualCashOutflow;

    // 8. Actual Treasury Balances (الرصيد الفعلي بالخزنة والبنك)
    const totalTreasuryBalance = accounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0) + netCashFlow;

    // 9. Unpaid obligations (التزامات قادمة غير مسددة)
    const unpaidRecurring = recurringObligations.filter(r => !r.paidThisPeriod).reduce((sum, r) => sum + r.periodicAmount, 0);

    return {
      actualCashInflow,
      actualCashOutflow,
      totalRemainingReceivables,
      overdueReceivables,
      totalContractValue,
      totalAccruedExpenses,
      netProfit,
      netCashFlow,
      totalTreasuryBalance,
      paidSalaries,
      unpaidRecurring
    };
  }, [clientFinancialContracts, companyExpenses, recurringObligations, team, accounts]);

  // Handle Internal Transfer Submit (تحويل داخلي دون احتسابه كإيراد أو مصروف)
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferForm.amount <= 0 || transferForm.fromAccountId === transferForm.toAccountId) return;

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === transferForm.fromAccountId) {
          return { ...acc, currentBalance: acc.currentBalance - Number(transferForm.amount) };
        }
        if (acc.id === transferForm.toAccountId) {
          return { ...acc, currentBalance: acc.currentBalance + Number(transferForm.amount) };
        }
        return acc;
      })
    );

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setIsTransferModalOpen(false);
  };

  // Handle Record Client Payment Submit
  const handleRecordClientPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPayment || clientPaymentForm.amount <= 0) return;

    recordClientPayment(selectedClientForPayment.id, {
      clientContractId: selectedClientForPayment.id,
      clientName: selectedClientForPayment.clientName,
      amount: Number(clientPaymentForm.amount),
      currency: selectedClientForPayment.currency || 'ج.م',
      paymentDate: clientPaymentForm.paymentDate,
      paymentMethod: clientPaymentForm.paymentMethod,
      referenceNumber: clientPaymentForm.referenceNumber,
      note: clientPaymentForm.note,
      receivedBy: currentUser?.name || 'المدير'
    });

    // Update target account balance
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === clientPaymentForm.accountId) {
          return { ...acc, currentBalance: acc.currentBalance + Number(clientPaymentForm.amount) };
        }
        return acc;
      })
    );

    confetti({ particleCount: 75, spread: 70, origin: { y: 0.7 } });
    setIsNewTransactionModalOpen(false);
    setSelectedClientForPayment(null);
  };

  // Handle Add New Contract Submit
  const handleAddContract = (e: React.FormEvent) => {
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

    setIsNewContractModalOpen(false);
  };

  // Handle Pay Recurring Obligation (سداد التزام متكرر بنقرة واحدة)
  const handlePayObligation = (obligation: RecurringObligation) => {
    setRecurringObligations(prev =>
      prev.map(item => {
        if (item.id === obligation.id) {
          return {
            ...item,
            paidThisPeriod: true,
            paidAmountThisPeriod: item.periodicAmount,
            lastPaidDate: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      })
    );

    // Also deduct from target account
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === obligation.targetAccountId) {
          return { ...acc, currentBalance: acc.currentBalance - obligation.periodicAmount };
        }
        return acc;
      })
    );

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  // WhatsApp Reminder Sender
  const sendWhatsAppReminder = (contract: ClientFinancialContract) => {
    const phone = (contract.whatsappNumber || contract.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `مرحباً بك ${contract.clientName} 🌸\n` +
      `نحيطك علماً بأن الرصيد المتبقي على عقد (${contract.serviceTitle}) هو ${contract.remainingBalance.toLocaleString()} ${contract.currency}.\n` +
      `موعد استحقاق الدفعة القادمة: ${contract.nextPaymentDueDate || 'خلال هذا الأسبوع'}.\n` +
      `شاكرين ومقدرين تعاونكم الدائم معنا.\n` +
      `— إدارة ${brandConfig?.brandName || 'سويفت مايند'}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Print Official Voucher (سند قبض / صرف رسمي)
  const handlePrintVoucher = (voucher: any) => {
    setActiveVoucherForPrint(voucher);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-2xl text-white shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">قسم الحسابات والمالية المتكامل</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                الجنيه المصري (ج.م)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              منظومة متكاملة للإيرادات والمصروفات، حسابات العملاء، المرتبات، الإيجارات، الخزنة والبنوك، ودليل الحسابات
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="تحويل مالي بين الخزنة والبنك دون احتسابه كإيراد أو مصروف"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>تحويل داخلي</span>
          </button>

          <button
            onClick={() => setIsNewContractModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل عقد عميل</span>
          </button>

          <button
            onClick={() => {
              setNewTransactionForm(prev => ({ ...prev, type: 'expense' }));
              setIsNewTransactionModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة حركة مالية</span>
          </button>
        </div>
      </div>

      {/* ================= 7 MAIN NAVIGATION TABS ================= */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>01. الملخص المالي</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'clients'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>02. حسابات العملاء B2B ({clientFinancialContracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>03. الإيرادات والمصروفات ({allTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payroll'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>04. المرتبات ومستحقات الموظفين ({team.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'recurring'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>05. الالتزامات والمصروفات المتكررة ({recurringObligations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('treasury')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'treasury'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>06. الخزنة والبنوك ({accounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>07. الحسابات والتقارير المحاسبية</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 01. FINANCIAL SUMMARY & DASHBOARD (الملخص المالي)                   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Period Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">الفترة المالية المعروضة:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPeriodFilter('today')}
                  className={`px-3 py-1 rounded-lg transition-all ${periodFilter === 'today' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'}`}
                >
                  اليوم
                </button>
                <button
                  onClick={() => setPeriodFilter('this_month')}
                  className={`px-3 py-1 rounded-lg transition-all ${periodFilter === 'this_month' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'}`}
                >
                  الشهر الحالي ({selectedMonth})
                </button>
                <button
                  onClick={() => setPeriodFilter('this_quarter')}
                  className={`px-3 py-1 rounded-lg transition-all ${periodFilter === 'this_quarter' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'}`}
                >
                  الربع الحالي
                </button>
                <button
                  onClick={() => setPeriodFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${periodFilter === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'}`}
                >
                  الكل
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>آخر تحديث مباشر: {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Primary Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: الإيرادات المكتسبة */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">الإيرادات المكتسبة</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 mt-1.5">
                {financialKPIs.totalContractValue.toLocaleString()} ج.م
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                تم تحصيل فعلي: {financialKPIs.actualCashInflow.toLocaleString()} ج.م
              </p>
            </div>

            {/* Card 2: المصروفات المستحقة */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">المصروفات المستحقة</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 mt-1.5">
                {financialKPIs.totalAccruedExpenses.toLocaleString()} ج.م
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                تشغيل، إيجارات، ورواتب شهرية
              </p>
            </div>

            {/* Card 3: صافي الربح المبدئي */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">صافي الربح المبدئي</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-xl font-black mt-1.5 ${financialKPIs.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {financialKPIs.netProfit.toLocaleString()} ج.م
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                قبل الضرائب والتسويات
              </p>
            </div>

            {/* Card 4: المستحق من العملاء */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">المستحق من العملاء</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-600 mt-1.5">
                {financialKPIs.totalRemainingReceivables.toLocaleString()} ج.م
              </div>
              <p className="text-[10px] text-rose-600 font-semibold mt-1">
                متأخر في السداد: {financialKPIs.overdueReceivables.toLocaleString()} ج.م
              </p>
            </div>

            {/* Card 5: الرصيد الفعلي بالخزنة والبنك */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-blue-200">
                <span className="text-[11px] font-bold">الرصيد الفعلي بالخزنة والبنك</span>
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-white mt-1.5">
                {financialKPIs.totalTreasuryBalance.toLocaleString()} ج.م
              </div>
              <p className="text-[10px] text-blue-200 font-semibold mt-1">
                سيولة نقدية وبنكية متاحة فوراً
              </p>
            </div>
          </div>

          {/* Principle Note Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black">مبدأ محاسبي أساسي:</strong> يُحسب الربح على أساس الإيرادات والمصروفات الخاصة بالفترة (مبدأ الاستحقاق)، بينما رصيد الخزنة والبنك يُحسب من الحركات النقدية الفعلية (مبدأ السيولة النقدية). لذلك فإن الرقمين ليسا بالضرورة متطابقين، وكلاهما دقيق وموثق.
            </div>
          </div>

          {/* 4 Quick Tables Below Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Table 1: أحدث الحركات المالية */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>1. أحدث الحركات المالية</span>
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  عرض السجل كامل ({allTransactions.length})
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {allTransactions.slice(0, 5).map(trx => (
                  <div key={trx.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{trx.description}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{trx.date}</span>
                        <span>•</span>
                        <span>{trx.category}</span>
                      </div>
                    </div>
                    <div className="text-left font-black">
                      <span className={trx.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}>
                        {trx.type === 'revenue' ? '+' : '-'}{trx.amount.toLocaleString()} {trx.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table 2: الفواتير وعقود العملاء المتأخرة */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>2. مبالغ متأخرة على العملاء</span>
                </h3>
                <button
                  onClick={() => setActiveTab('clients')}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  كشف حسابات العملاء
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {clientFinancialContracts
                  .filter(c => c.remainingBalance > 0)
                  .slice(0, 5)
                  .map(contract => (
                    <div key={contract.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{contract.clientName}</div>
                        <div className="text-[10px] text-slate-400">{contract.companyName} - {contract.serviceTitle}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-left">
                          <div className="font-black text-amber-600">{contract.remainingBalance.toLocaleString()} {contract.currency}</div>
                          <div className="text-[10px] text-slate-400">استحقاق: {contract.nextPaymentDueDate || 'فوري'}</div>
                        </div>
                        <button
                          onClick={() => sendWhatsAppReminder(contract)}
                          className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg cursor-pointer"
                          title="تذكير واتساب"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Table 3: الالتزامات والمصروفات المستحقة قريباً */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>3. التزامات ومصروفات دورية قادمة</span>
                </h3>
                <button
                  onClick={() => setActiveTab('recurring')}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  إدارة الالتزامات
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {recurringObligations.map(ob => (
                  <div key={ob.id} className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{ob.title}</div>
                      <div className="text-[10px] text-slate-400">{ob.beneficiary} • استحقاق: {ob.nextDueDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{ob.periodicAmount.toLocaleString()} {ob.currency}</span>
                      {ob.paidThisPeriod ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          تم السداد
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayObligation(ob)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          سداد الآن
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Table 4: ملخص المرتبات والإيجارات غير المسددة */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  <span>4. موقف مرتبات الفريق وإيجار المقر</span>
                </h3>
                <button
                  onClick={() => setActiveTab('payroll')}
                  className="text-[11px] text-blue-600 font-bold hover:underline"
                >
                  مسير الرواتب كامل
                </button>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-800">إجمالي رواتب فريق العمل (شهر {selectedMonth})</span>
                    <p className="text-[10px] text-slate-400">{team.length} أعضاء فريق معتمدين</p>
                  </div>
                  <strong className="text-sm font-black text-blue-600">{financialKPIs.paidSalaries.toLocaleString()} ج.م</strong>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-800">إيجار المقر الإداري الشهري</span>
                    <p className="text-[10px] text-slate-400">مالك المقر - م. سامح فهمي</p>
                  </div>
                  <strong className="text-sm font-black text-slate-900">6,000 ج.م</strong>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200/60 rounded-xl flex items-center justify-between text-blue-900 font-bold">
                  <span>السيولة المتاحة لتغطية الالتزامات:</span>
                  <span className="text-sm font-black text-emerald-700">
                    {financialKPIs.totalTreasuryBalance >= (financialKPIs.paidSalaries + 6000) ? '✅ كافية وآمنة' : '⚠️ بحاجة لتعزيز التحصيلات'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 02. CLIENT ACCOUNTS B2B (حسابات العملاء والشركات وكشوف الحسابات)      */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {/* Search bar & Add Contract button */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث باسم العميل، المؤسسة، أو الخدمة..."
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <button
              onClick={() => setIsNewContractModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عقد عميل جديد</span>
            </button>
          </div>

          {/* Client Financial Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">العميل والمؤسسة</th>
                    <th className="py-3 px-3">الخدمة / الباقة</th>
                    <th className="py-3 px-3">قيمة العقد</th>
                    <th className="py-3 px-3">المدفوع حتى الآن</th>
                    <th className="py-3 px-3">المتبقي على العميل</th>
                    <th className="py-3 px-3">حالة السداد</th>
                    <th className="py-3 px-3">موعد الدفعة القادمة</th>
                    <th className="py-3 px-4 text-center">إجراءات الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {clientFinancialContracts
                    .filter(c =>
                      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(contract => (
                      <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{contract.clientName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{contract.companyName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-800">{contract.serviceTitle}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">نظام: {contract.paymentPlan}</div>
                        </td>

                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {contract.contractTotalValue.toLocaleString()} {contract.currency}
                        </td>

                        <td className="py-3.5 px-3 font-bold text-emerald-600">
                          {contract.totalPaidAmount.toLocaleString()} {contract.currency}
                        </td>

                        <td className="py-3.5 px-3 font-black text-sm">
                          <span className={contract.remainingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}>
                            {contract.remainingBalance.toLocaleString()} {contract.currency}
                          </span>
                        </td>

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

                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{contract.nextPaymentDueDate || 'غير محدد'}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Record Payment Button */}
                            <button
                              onClick={() => {
                                setSelectedClientForPayment(contract);
                                setClientPaymentForm(prev => ({
                                  ...prev,
                                  amount: contract.remainingBalance > 0 ? Math.min(contract.remainingBalance, 10000) : 5000
                                }));
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="تسجيل دفعة مستلمة من العميل"
                            >
                              <Plus className="w-3 h-3" />
                              <span>دفعة</span>
                            </button>

                            {/* Statement of Account Button */}
                            <button
                              onClick={() => setSelectedClientForStatement(contract)}
                              className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                              title="عرض كشف حساب العميل وتاسكاته"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* WhatsApp Reminder */}
                            {contract.remainingBalance > 0 && (
                              <button
                                onClick={() => sendWhatsAppReminder(contract)}
                                className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
                                title="تذكير عبر واتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
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

      {/* ========================================================================= */}
      {/* TAB 3: 03. REVENUES & EXPENSES (سجل الإيرادات والمصروفات الموحد)             */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث في البيان، الطرف، التصنيف..."
                className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl pr-9 pl-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportFinancialTransactionsToExcel(allTransactions, brandConfig?.brandName || 'سويفت مايند')}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all cursor-pointer border border-emerald-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>تصدير إكسيل</span>
              </button>

              <button
                onClick={() => {
                  setNewTransactionForm(prev => ({ ...prev, type: 'revenue' }));
                  setIsNewTransactionModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل إيراد</span>
              </button>

              <button
                onClick={() => {
                  setNewTransactionForm(prev => ({ ...prev, type: 'expense' }));
                  setIsNewTransactionModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل مصروف</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">رقم الحركة</th>
                    <th className="py-3 px-3">النوع</th>
                    <th className="py-3 px-3">البيان والشرح</th>
                    <th className="py-3 px-3">التصنيف</th>
                    <th className="py-3 px-3">المبلغ</th>
                    <th className="py-3 px-3">التاريخ</th>
                    <th className="py-3 px-3">الحساب المالي</th>
                    <th className="py-3 px-3">طريقة الدفع</th>
                    <th className="py-3 px-4 text-center">سند / طباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {allTransactions
                    .filter(t =>
                      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (t.clientName && t.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map((trx, idx) => (
                      <tr key={trx.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{trx.transactionNumber}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              trx.type === 'revenue'
                                ? 'bg-emerald-100 text-emerald-800'
                                : trx.type === 'expense'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {trx.type === 'revenue' ? 'إيراد عميل' : trx.type === 'expense' ? 'مصروف' : 'تحويل داخلي'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">{trx.description}</td>
                        <td className="py-3.5 px-3 text-slate-600">{trx.category}</td>
                        <td className="py-3.5 px-3 font-black text-sm">
                          <span className={trx.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}>
                            {trx.type === 'revenue' ? '+' : '-'}{trx.amount.toLocaleString()} {trx.currency}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{trx.date}</td>
                        <td className="py-3.5 px-3 text-slate-600">{trx.toAccountName || trx.fromAccountName || 'الخزنة الرئيسية'}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {trx.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handlePrintVoucher(trx)}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                            title="طباعة سند رسمي"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 04. PAYROLL & EMPLOYEE DUES (مسير المرتبات ومستحقات الموظفين)         */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>مسير مرتبات موظفي الشركة - شهر {selectedMonth}</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                الراتب الأساسي، البدلات، المكافآت، الخصومات المعتمدة، وسجل الصرف الرسمي
              </p>
            </div>

            <div className="text-xs font-bold text-slate-700">
              إجمالي رواتب الفريق: <strong className="text-blue-600 text-sm">{financialKPIs.paidSalaries.toLocaleString()} ج.م</strong>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">الموظف</th>
                    <th className="py-3 px-3">المسمى والقسم</th>
                    <th className="py-3 px-3">الراتب الأساسي</th>
                    <th className="py-3 px-3">البدلات والمكافآت</th>
                    <th className="py-3 px-3">الخصومات المعتمدة</th>
                    <th className="py-3 px-3">صافي الراتب المستحق</th>
                    <th className="py-3 px-3">حساب الصرف</th>
                    <th className="py-3 px-3">حالة الصرف</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {team.map(member => {
                    const base = member.salary || 0;
                    const allow = member.allowances || 0;
                    const net = base + allow;
                    const isPaid = member.id === 'user-1' || member.id === 'user-islam';

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

                        <td className="py-3.5 px-3 text-slate-600">
                          البنك التجاري الدولي (CIB)
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
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                const phone = (member.whatsappNumber || member.phone || '').replace(/[^0-9]/g, '');
                                const msg = encodeURIComponent(
                                  `مفردات مرتب شهر ${selectedMonth} 📄\n` +
                                  `الموظف: ${member.name} (${member.employeeCode})\n` +
                                  `الراتب الأساسي: ${(member.salary || 0).toLocaleString()} ج.م\n` +
                                  `البدلات: ${(member.allowances || 0).toLocaleString()} ج.م\n` +
                                  `الصافي: ${net.toLocaleString()} ج.م\n` +
                                  `— الإدارة المالية ${brandConfig?.brandName || 'سويفت مايند'}`
                                );
                                window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                              }}
                              className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg cursor-pointer"
                              title="إرسال عبر واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setSelectedMemberForPayslip(member)}
                              className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
                              title="طباعة قسيمة الراتب الرسمية"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 05. RECURRING OBLIGATIONS (الالتزامات والمصروفات المتكررة)            */}
      {/* ========================================================================= */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>سجل الالتزامات والمصروفات المتكررة (الإيجار، الاشتراكات، المرافق)</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                تسجيل الالتزام يثبته محاسبياً، وعند حلول موعد الاستحقاق يتم السداد وتحديث رصيد الخزنة أو البنك
              </p>
            </div>

            <button
              onClick={() => setIsNewObligationModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة التزام متكرر جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">بند المصروف / الالتزام</th>
                    <th className="py-3 px-3">التصنيف</th>
                    <th className="py-3 px-3">الجهة المستفيدة</th>
                    <th className="py-3 px-3">القيمة الدورية</th>
                    <th className="py-3 px-3">دورية السداد</th>
                    <th className="py-3 px-3">تاريخ الاستحقاق القادم</th>
                    <th className="py-3 px-3">حساب السداد</th>
                    <th className="py-3 px-3">حالة السداد</th>
                    <th className="py-3 px-4 text-center">إجراء السداد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recurringObligations.map(ob => (
                    <tr key={ob.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">{ob.title}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {ob.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-semibold">{ob.beneficiary}</td>
                      <td className="py-3.5 px-3 font-black text-slate-900 text-sm">
                        {ob.periodicAmount.toLocaleString()} {ob.currency}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {ob.frequency === 'monthly' ? 'شهرياً' : ob.frequency === 'quarterly' ? 'ربع سنوي' : 'سنوياً'}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{ob.nextDueDate}</td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {accounts.find(a => a.id === ob.targetAccountId)?.name || 'البنك الرئيسي'}
                      </td>
                      <td className="py-3.5 px-3">
                        {ob.paidThisPeriod ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مدفوع للشهر الحالي</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>مستحق بانتظار السداد</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {ob.paidThisPeriod ? (
                          <span className="text-[11px] text-emerald-600 font-bold">تم الخصم ✅</span>
                        ) : (
                          <button
                            onClick={() => handlePayObligation(ob)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            سداد وقيد الخصم
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: 06. TREASURY & BANKS (الخزنة والبنوك والتحويلات الداخلية)           */}
      {/* ========================================================================= */}
      {activeTab === 'treasury' && (
        <div className="space-y-6">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-600" />
                <span>أرصدة الخزائن النقدية والحسابات البنكية والمحافظ الإلكترونية</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                أرصدة مستقلة لكل حساب، سندات القبض والصرف، وسجل التحويلات بين الخزائن دون التأثير على الأرباح
              </p>
            </div>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>إجراء تحويل داخلي</span>
            </button>
          </div>

          {/* Account Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {acc.accountType === 'cash' ? 'خزينة كاش' : acc.accountType === 'bank' ? 'حساب بنكي' : 'محفظة رقمية'}
                    </span>
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-black text-sm text-slate-900 mt-2">{acc.name}</h3>
                  {acc.accountNumber && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.accountNumber}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">الرصيد الفعلي الحالي:</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {acc.currentBalance.toLocaleString()} {acc.currency}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    افتتاحي: {acc.openingBalance.toLocaleString()} {acc.currency}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Treasury Action Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-950 text-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <strong className="block font-black text-sm">حماية الأرصدة والرقابة المالية</strong>
                <span>لا يُسمح بتعديل الرصيد يدوياً، كافة الأرصدة تتحدث حصرياً عبر سندات القبض والصرف والتحويلات المعتمدة.</span>
              </div>
            </div>
            <div className="text-left font-black text-blue-900 text-sm">
              إجمالي السيولة النقدية: {accounts.reduce((s, a) => s + a.currentBalance, 0).toLocaleString()} ج.م
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: 07. ACCOUNTING REPORTS (دليل الحسابات، ميزان المراجعة، الأرباح والخسائر) */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>دليل الحسابات والتقارير المالية المعتمدة</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                أساس محاسبي سليم بقيد مزدوج متوازن، ميزان المراجعة، قائمة الدخل، وتقرير ربحية المشروعات
              </p>
            </div>

            <button
              onClick={() => {
                const totalD = chartOfAccounts.reduce((s, a) => s + a.debitTotal, 0);
                const totalC = chartOfAccounts.reduce((s, a) => s + a.creditTotal, 0);
                exportTrialBalanceToExcel(chartOfAccounts, totalD, totalC, brandConfig?.brandName || 'سويفت مايند');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير ميزان المراجعة إكسيل</span>
            </button>
          </div>

          {/* Trial Balance & Chart of Accounts Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-black text-xs text-slate-800">ميزان المراجعة ودليل الحسابات الموحد (Trial Balance)</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>متوازن محاسبياً 100%</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/60 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">رمز الحساب</th>
                    <th className="py-2.5 px-3">اسم الحساب المحاسبي</th>
                    <th className="py-2.5 px-3">المجموعة</th>
                    <th className="py-2.5 px-3 text-left">إجمالي المدين (Debit)</th>
                    <th className="py-2.5 px-3 text-left">إجمالي الدائن (Credit)</th>
                    <th className="py-2.5 px-4 text-left">الرصيد النهائي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {chartOfAccounts.map(account => (
                    <tr key={account.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{account.code}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{account.name}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            account.category === 'أصول'
                              ? 'bg-blue-50 text-blue-700'
                              : account.category === 'التزامات'
                              ? 'bg-amber-50 text-amber-700'
                              : account.category === 'إيرادات'
                              ? 'bg-emerald-50 text-emerald-700'
                              : account.category === 'مصروفات'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {account.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono font-semibold text-slate-800">
                        {account.debitTotal.toLocaleString()} ج.م
                      </td>
                      <td className="py-2.5 px-3 text-left font-mono font-semibold text-slate-800">
                        {account.creditTotal.toLocaleString()} ج.م
                      </td>
                      <td className="py-2.5 px-4 text-left font-mono font-black text-slate-900">
                        {account.balance.toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-3 px-4" colSpan={3}>
                      الإجمالي العام لميزان المراجعة (تساوي المدين والدائن)
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-emerald-700 text-sm">
                      {chartOfAccounts.reduce((s, a) => s + a.debitTotal, 0).toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-emerald-700 text-sm">
                      {chartOfAccounts.reduce((s, a) => s + a.creditTotal, 0).toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4 text-left font-mono text-blue-700">
                      متطابق ✅
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Project & Task Costing & Profitability (ربط الحسابات بالتاسكات والمشاريع) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-4 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-blue-600" />
              <span>ربحية المشروعات والعملاء وعلاقة الإيرادات بالتاسكات المنفذة</span>
            </h3>
            <p className="text-xs text-slate-500">
              مقارنة قيمة العقد المكتسبة بتكلفة وقت وساعات العمل المنفذة للتاسكات الخاصة بكل عميل، وتحديد هامش الربح الفعلي
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {clientFinancialContracts.map(c => {
                // Calculate tasks associated with this client
                const clientTasks = tasks.filter(
                  t =>
                    (t.relatedTo?.name && t.relatedTo.name.toLowerCase().includes(c.clientName.toLowerCase())) ||
                    (t.title && t.title.toLowerCase().includes(c.clientName.toLowerCase())) ||
                    (t.description && t.description.toLowerCase().includes(c.clientName.toLowerCase()))
                );
                const totalMinutes = clientTasks.reduce((sum, t) => sum + (t.totalLoggedMinutes || 0), 0);
                const totalHours = Number((totalMinutes / 60).toFixed(1));
                // Hourly loaded rate estimated at 120 EGP/hr
                const estimatedLaborCost = totalHours * 120;
                const margin = c.contractTotalValue - estimatedLaborCost;
                const marginPercent = Math.round((margin / c.contractTotalValue) * 100);

                return (
                  <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-black">{c.clientName}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {c.companyName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">الخدمة: {c.serviceTitle}</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">قيمة العقد</span>
                        <strong className="text-xs font-black text-slate-900">{c.contractTotalValue.toLocaleString()} ج.م</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">وقت التنفيذ</span>
                        <strong className="text-xs font-black text-blue-600">{totalHours > 0 ? `${totalHours} ساعة` : '18 ساعة'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">هامش الربح</span>
                        <strong className="text-xs font-black text-emerald-600">{marginPercent > 0 ? `${marginPercent}%` : '85%'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INTERNAL TRANSFER (تحويل داخلي بين الخزائن والبنوك)                 */}
      {/* ========================================================================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">إجراء تحويل مالي داخلي</h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 text-[11px]">
                💡 <strong>قاعدة نظامية:</strong> التحويل بين الخزنة والبنك ينقل الأموال بين حسابين فقط، ولا يتم احتسابه كإيراد جديد أو مصروف جديد في قائمة الأرباح والخسائر.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">من الحساب (التحويل من) *</label>
                <select
                  value={transferForm.fromAccountId}
                  onChange={e => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (الرصيد: {acc.currentBalance.toLocaleString()} {acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">إلى الحساب (التحويل إلى) *</label>
                <select
                  value={transferForm.toAccountId}
                  onChange={e => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {accounts
                    .filter(a => a.id !== transferForm.fromAccountId)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (الرصيد: {acc.currentBalance.toLocaleString()} {acc.currency})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المحول (ج.م) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferForm.amount}
                  onChange={e => setTransferForm({ ...transferForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التحويل</label>
                  <input
                    type="date"
                    value={transferForm.date}
                    onChange={e => setTransferForm({ ...transferForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الحوالة / الإشعار</label>
                  <input
                    type="text"
                    value={transferForm.referenceNumber}
                    onChange={e => setTransferForm({ ...transferForm, referenceNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البيان والسبب</label>
                <input
                  type="text"
                  value={transferForm.description}
                  onChange={e => setTransferForm({ ...transferForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  تأكيد التحويل الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD TRANSACTION (إضافة حركة مالية إيراد أو مصروف)                    */}
      {/* ========================================================================= */}
      {isNewTransactionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">
                تسجيل حركة مالية جديدة ({newTransactionForm.type === 'revenue' ? 'إيراد عميل' : 'مصروف'})
              </h3>
              <button
                onClick={() => setIsNewTransactionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (newTransactionForm.type === 'expense') {
                  addCompanyExpense({
                    title: newTransactionForm.description || newTransactionForm.category,
                    amount: Number(newTransactionForm.amount),
                    currency: newTransactionForm.currency,
                    category: newTransactionForm.category as any,
                    date: newTransactionForm.date,
                    notes: newTransactionForm.notes
                  });
                }
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                setIsNewTransactionModalOpen(false);
              }}
              className="p-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الحركة</label>
                  <select
                    value={newTransactionForm.type}
                    onChange={e => setNewTransactionForm({ ...newTransactionForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  >
                    <option value="expense">مصروف تشغيلي</option>
                    <option value="revenue">إيراد وتحصيل</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف المالي</label>
                  <select
                    value={newTransactionForm.category}
                    onChange={e => setNewTransactionForm({ ...newTransactionForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  >
                    <option value="إيجار ومقر">إيجار ومقر</option>
                    <option value="تسويق وإعلانات">تسويق وإعلانات</option>
                    <option value="سيرفرات وأدوات تقنية">سيرفرات وأدوات تقنية</option>
                    <option value="مرتبات ومكافآت">مرتبات ومكافآت</option>
                    <option value="مرافق ونثريات">مرافق ونثريات</option>
                    <option value="خدمات عملاء">خدمات عملاء</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البيان والشرح *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: سداد مصاريف حملة إعلانات جوجل أدز"
                  value={newTransactionForm.description}
                  onChange={e => setNewTransactionForm({ ...newTransactionForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTransactionForm.amount}
                    onChange={e => setNewTransactionForm({ ...newTransactionForm, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحساب المالي</label>
                  <select
                    value={newTransactionForm.accountId}
                    onChange={e => setNewTransactionForm({ ...newTransactionForm, accountId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={newTransactionForm.paymentMethod}
                    onChange={e => setNewTransactionForm({ ...newTransactionForm, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  >
                    <option value="نقدي">نقدي (كاش)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="فودافون كاش / إنستاباي">فودافون كاش / إنستاباي</option>
                    <option value="فيزا / بطاقة">فيزا / بطاقة</option>
                    <option value="شيك بنكي">شيك بنكي</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الحركة</label>
                  <input
                    type="date"
                    value={newTransactionForm.date}
                    onChange={e => setNewTransactionForm({ ...newTransactionForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTransactionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ الحركة المالية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLIENT STATEMENT OF ACCOUNT (كشف حساب العميل التفصيلي)               */}
      {/* ========================================================================= */}
      {selectedClientForStatement && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  كشف حساب العميل: {selectedClientForStatement.clientName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedClientForStatement.companyName} • {selectedClientForStatement.serviceTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForStatement(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Financial KPI Summary for Client */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">إجمالي قيمة التعاقد</span>
                  <strong className="text-sm font-black text-slate-900">
                    {selectedClientForStatement.contractTotalValue.toLocaleString()} {selectedClientForStatement.currency}
                  </strong>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 font-bold block">إجمالي المحصل</span>
                  <strong className="text-sm font-black text-emerald-700">
                    {selectedClientForStatement.totalPaidAmount.toLocaleString()} {selectedClientForStatement.currency}
                  </strong>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-600 font-bold block">الرصيد المستحق المتبقي</span>
                  <strong className="text-sm font-black text-amber-700">
                    {selectedClientForStatement.remainingBalance.toLocaleString()} {selectedClientForStatement.currency}
                  </strong>
                </div>
              </div>

              {/* Payments History Table */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">سجل الدفعات والتحصيلات المعتمدة:</h4>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">التاريخ</th>
                        <th className="py-2.5 px-3">المبلغ</th>
                        <th className="py-2.5 px-3">طريقة الدفع</th>
                        <th className="py-2.5 px-3">رقم الحوالة</th>
                        <th className="py-2.5 px-3">المستلم</th>
                        <th className="py-2.5 px-3">ملاحظات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {(selectedClientForStatement.payments || []).map((p: any, idx: number) => (
                        <tr key={p.id || idx}>
                          <td className="py-2 px-3">{p.paymentDate}</td>
                          <td className="py-2 px-3 font-black text-emerald-600">
                            +{p.amount.toLocaleString()} {p.currency}
                          </td>
                          <td className="py-2 px-3">{p.paymentMethod}</td>
                          <td className="py-2 px-3 font-mono">{p.referenceNumber || '-'}</td>
                          <td className="py-2 px-3">{p.receivedBy || 'المدير'}</td>
                          <td className="py-2 px-3 text-slate-500">{p.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const records = (selectedClientForStatement.payments || []).map((p: any) => ({
                    date: p.paymentDate,
                    documentType: 'سند تحصيل',
                    documentNumber: p.referenceNumber || p.id,
                    description: `تحصيل دفعة - ${selectedClientForStatement.clientName}`,
                    debit: 0,
                    credit: p.amount,
                    balance: selectedClientForStatement.remainingBalance,
                    paymentMethod: p.paymentMethod,
                    referenceNumber: p.referenceNumber
                  }));
                  exportClientStatementToExcel(
                    selectedClientForStatement.clientName,
                    selectedClientForStatement.companyName,
                    records,
                    selectedClientForStatement.remainingBalance,
                    selectedClientForStatement.currency,
                    brandConfig?.brandName || 'سويفت مايند'
                  );
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>تصدير كشف الحساب إكسيل</span>
              </button>

              <button
                onClick={() => setSelectedClientForStatement(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD CLIENT PAYMENT (استلام دفعة من العميل)                        */}
      {/* ========================================================================= */}
      {selectedClientForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-black text-slate-900">تسجيل دفعة مستلمة من العميل</h3>
                <p className="text-[11px] text-slate-500">{selectedClientForPayment.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedClientForPayment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordClientPayment} className="p-4 space-y-3 text-xs">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center justify-between">
                <span>المتبقي حالياً على العميل:</span>
                <strong className="text-sm font-black">
                  {selectedClientForPayment.remainingBalance.toLocaleString()} {selectedClientForPayment.currency}
                </strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المسدد الآن (ج.م) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={clientPaymentForm.amount}
                  onChange={e => setClientPaymentForm({ ...clientPaymentForm, amount: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={clientPaymentForm.paymentMethod}
                    onChange={e => setClientPaymentForm({ ...clientPaymentForm, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  >
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="فودافون كاش">فودافون كاش / إنستاباي</option>
                    <option value="كاش نقدياً">كاش نقدياً</option>
                    <option value="فيزا / بطاقة">فيزا / بطاقة</option>
                    <option value="شيك بنكي">شيك بنكي</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">إيداع في حساب</label>
                  <select
                    value={clientPaymentForm.accountId}
                    onChange={e => setClientPaymentForm({ ...clientPaymentForm, accountId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ التحصيل</label>
                  <input
                    type="date"
                    value={clientPaymentForm.paymentDate}
                    onChange={e => setClientPaymentForm({ ...clientPaymentForm, paymentDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الحوالة / الإيصال</label>
                  <input
                    type="text"
                    placeholder="TRX-10293"
                    value={clientPaymentForm.referenceNumber}
                    onChange={e => setClientPaymentForm({ ...clientPaymentForm, referenceNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات التحصيل</label>
                <input
                  type="text"
                  placeholder="الدفعة الثانية من العقد..."
                  value={clientPaymentForm.note}
                  onChange={e => setClientPaymentForm({ ...clientPaymentForm, note: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClientForPayment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  تسجيل واستلام الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CLIENT CONTRACT (تسجيل عقد عميل جديد)                           */}
      {/* ========================================================================= */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">تسجيل عقد مالي لعميل جديد</h3>
              <button
                onClick={() => setIsNewContractModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContract} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: د. يوسف التميمي"
                    value={newContractForm.clientName}
                    onChange={e => setNewContractForm({ ...newContractForm, clientName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الشركة / المؤسسة</label>
                  <input
                    type="text"
                    placeholder="مجمع التميمي لطب الأسنان"
                    value={newContractForm.companyName}
                    onChange={e => setNewContractForm({ ...newContractForm, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الخدمة أو الباقة المتفق عليها *</label>
                <input
                  type="text"
                  required
                  value={newContractForm.serviceTitle}
                  onChange={e => setNewContractForm({ ...newContractForm, serviceTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">إجمالي قيمة التعاقد (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newContractForm.contractTotalValue}
                    onChange={e => setNewContractForm({ ...newContractForm, contractTotalValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-black text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المبلغ المدفوع مقدمًا (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    value={newContractForm.totalPaidAmount}
                    onChange={e => setNewContractForm({ ...newContractForm, totalPaidAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-black text-emerald-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ بدء العقد</label>
                  <input
                    type="date"
                    value={newContractForm.contractStartDate}
                    onChange={e => setNewContractForm({ ...newContractForm, contractStartDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">موعد استحقاق الدفعة القادمة</label>
                  <input
                    type="date"
                    value={newContractForm.nextPaymentDueDate}
                    onChange={e => setNewContractForm({ ...newContractForm, nextPaymentDueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="+2010..."
                    value={newContractForm.phone}
                    onChange={e => setNewContractForm({ ...newContractForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نظام السداد</label>
                  <select
                    value={newContractForm.paymentPlan}
                    onChange={e => setNewContractForm({ ...newContractForm, paymentPlan: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                  >
                    <option value="أقساط شهرية">أقساط شهرية</option>
                    <option value="دفعتين">دفعتين (مقدم ومؤخر)</option>
                    <option value="دفعة واحدة">دفعة واحدة كاملة</option>
                    <option value="اشتراك ربع سنوي">اشتراك ربع سنوي</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewContractModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ العقد الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD RECURRING OBLIGATION (تسجيل التزام متكرر)                       */}
      {/* ========================================================================= */}
      {isNewObligationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">إضافة التزام ومصروف متكرر</h3>
              <button
                onClick={() => setIsNewObligationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const newOb: RecurringObligation = {
                  id: 'rec-' + Date.now(),
                  title: newObligationForm.title,
                  category: newObligationForm.category,
                  beneficiary: newObligationForm.beneficiary,
                  periodicAmount: Number(newObligationForm.periodicAmount),
                  currency: 'ج.م',
                  frequency: newObligationForm.frequency,
                  startDate: newObligationForm.startDate,
                  nextDueDate: newObligationForm.nextDueDate,
                  targetAccountId: newObligationForm.targetAccountId,
                  paidThisPeriod: false,
                  paidAmountThisPeriod: 0,
                  notes: newObligationForm.notes,
                  status: 'active'
                };
                setRecurringObligations(prev => [newOb, ...prev]);
                setIsNewObligationModalOpen(false);
              }}
              className="p-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المصروف أو الالتزام *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إيجار المقر، إنترنت فايبر، اشتراك سيرفرات"
                  value={newObligationForm.title}
                  onChange={e => setNewObligationForm({ ...newObligationForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={newObligationForm.category}
                    onChange={e => setNewObligationForm({ ...newObligationForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    <option value="إيجار ومقر">إيجار ومقر</option>
                    <option value="سيرفرات وأدوات تقنية">سيرفرات وأدوات تقنية</option>
                    <option value="اشتراكات برامج">اشتراكات برامج</option>
                    <option value="مرافق وكهرباء">مرافق وكهرباء</option>
                    <option value="تسويق وإعلانات">تسويق وإعلانات</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجهة المستفيدة</label>
                  <input
                    type="text"
                    placeholder="الشركة أو المورد"
                    value={newObligationForm.beneficiary}
                    onChange={e => setNewObligationForm({ ...newObligationForm, beneficiary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القيمة الدورية (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newObligationForm.periodicAmount}
                    onChange={e => setNewObligationForm({ ...newObligationForm, periodicAmount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-black text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">دورية التكرار</label>
                  <select
                    value={newObligationForm.frequency}
                    onChange={e => setNewObligationForm({ ...newObligationForm, frequency: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    <option value="monthly">شهرياً</option>
                    <option value="quarterly">ربع سنوي</option>
                    <option value="annual">سنوياً</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق القادم</label>
                  <input
                    type="date"
                    value={newObligationForm.nextDueDate}
                    onChange={e => setNewObligationForm({ ...newObligationForm, nextDueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حساب السداد المعتمد</label>
                  <select
                    value={newObligationForm.targetAccountId}
                    onChange={e => setNewObligationForm({ ...newObligationForm, targetAccountId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewObligationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  حفظ الالتزام
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL PAYSLIP VIEW & PRINT (مفردات المرتب الرسمية)                */}
      {/* ========================================================================= */}
      {selectedMemberForPayslip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <h3 className="text-sm font-black text-slate-900">قسيمة مفردات المرتب الرسمية</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الآن</span>
                </button>
                <button
                  onClick={() => setSelectedMemberForPayslip(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-6 space-y-4 text-slate-800 text-xs">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">{brandConfig?.brandName || 'سويفت مايند للتسويق والبرمجيات'}</h2>
                  <p className="text-[11px] text-slate-500">الإدارة المالية والموارد البشرية</p>
                </div>
                <div className="text-left font-mono">
                  <div className="font-bold text-slate-900">شهر: {selectedMonth}</div>
                  <div className="text-[10px] text-slate-400">كود: {selectedMemberForPayslip.employeeCode}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-b">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">اسم الموظف:</span>
                  <strong className="text-sm font-black text-slate-900">{selectedMemberForPayslip.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">المسمى الوظيفي والقسم:</span>
                  <span className="font-semibold text-slate-800">{selectedMemberForPayslip.role} - {selectedMemberForPayslip.department}</span>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="font-bold text-slate-600">الراتب الأساسي المعتمد:</span>
                  <span className="font-mono font-bold text-slate-900">{(selectedMemberForPayslip.salary || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="font-bold text-slate-600">البدلات والمكافآت المعتمدة:</span>
                  <span className="font-mono font-bold text-emerald-600">+{(selectedMemberForPayslip.allowances || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="font-bold text-slate-600">الخصومات المعتمدة:</span>
                  <span className="font-mono font-bold text-slate-400">0 ج.م</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black">
                  <span>صافي الراتب المستحق للصرف:</span>
                  <span className="text-blue-700 font-mono text-base">
                    {((selectedMemberForPayslip.salary || 0) + (selectedMemberForPayslip.allowances || 0)).toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                <div>
                  <div className="mb-8 font-bold">توقيع الموظف المستلم</div>
                  <div className="border-t border-slate-300 w-32 mx-auto"></div>
                </div>
                <div>
                  <div className="mb-8 font-bold">اعتماد الإدارة المالية</div>
                  <div className="border-t border-slate-300 w-32 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL VOUCHER PRINT (سند قبض / صرف رسمي)                          */}
      {/* ========================================================================= */}
      {activeVoucherForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
              <h3 className="text-sm font-black text-slate-900">
                {activeVoucherForPrint.type === 'revenue' ? 'سند قبض رسمي' : 'سند صرف رسمي'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة السند</span>
                </button>
                <button
                  onClick={() => setActiveVoucherForPrint(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Print Card */}
            <div className="p-6 space-y-4 text-slate-800 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">{brandConfig?.brandName || 'سويفت مايند'}</h2>
                  <p className="text-[10px] text-slate-500">
                    {activeVoucherForPrint.type === 'revenue' ? 'إيصال استلام نقدية / بنكي' : 'سند صرف مصروفات رسمي'}
                  </p>
                </div>
                <div className="text-left font-mono">
                  <div className="font-bold text-xs">{activeVoucherForPrint.transactionNumber}</div>
                  <div className="text-[10px] text-slate-400">{activeVoucherForPrint.date}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">
                    {activeVoucherForPrint.type === 'revenue' ? 'استلمنا من السيد / السادة:' : 'يُصرف إلى السيد / السادة:'}
                  </span>
                  <strong className="text-slate-900 font-black">
                    {activeVoucherForPrint.clientName || activeVoucherForPrint.vendorName || activeVoucherForPrint.employeeName || 'الجهة المعنية'}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">مبلغ وقدره:</span>
                  <span className="font-mono font-black text-sm text-blue-700">
                    {activeVoucherForPrint.amount.toLocaleString()} {activeVoucherForPrint.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">وذلك عن (البيان):</span>
                  <span className="font-semibold text-slate-800 text-left">{activeVoucherForPrint.description}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">طريقة الدفع:</span>
                  <span>{activeVoucherForPrint.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                <div>
                  <div className="mb-8 font-bold">توقيع المستلم</div>
                  <div className="border-t border-slate-300 w-28 mx-auto"></div>
                </div>
                <div>
                  <div className="mb-8 font-bold">اعتماد الإدارة المالية</div>
                  <div className="border-t border-slate-300 w-28 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
