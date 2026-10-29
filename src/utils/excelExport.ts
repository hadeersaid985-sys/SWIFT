import * as XLSX from 'xlsx';
import { ClientRenewal, Task, TeamMember } from '../types/crm';

/**
 * Export Client Renewals & Dossiers to Excel (.xlsx)
 */
export const exportClientsToExcel = (clients: ClientRenewal[], isManager: boolean = false) => {
  const data = clients.map((c, index) => {
    const row: Record<string, any> = {
      'م': index + 1,
      'اسم العميل': c.clientName,
      'الشركة / الجهة': c.company || '-',
      'رقم الهاتف': c.phone || '-',
      'البريد الإلكتروني': c.email || '-',
      'اسم باقة الخدمة': c.serviceName,
    };

    if (isManager) {
      row['سعر العقد (قيمة الاشتراك)'] = c.amount;
      row['العملة'] = c.currency;
    }

    row['دورة السداد'] = c.planCycle;
    row['تاريخ البدء'] = c.startDate || c.firstSubscribedAt || c.createdAt || '-';
    row['تاريخ التجديد المستحق'] = c.renewalDate;
    row['حالة الاشتراك'] = c.status === 'active' ? 'ساري' : c.status === 'renewing_soon' ? 'مستحق قريباً' : c.status === 'overdue' ? 'متأخر' : c.status === 'renewed' ? 'تم التجديد' : 'ملغي';
    row['المسؤول عن المتابعة'] = c.managedBy || 'هدير سعيد';
    row['رابط شيت المتابعة'] = c.sheetUrl || (c.googleSheets && c.googleSheets[0]?.url) || '-';
    row['ملاحظات'] = c.notes || '-';

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  // Set RTL on sheet
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ملفات واشتراكات العملاء');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `سويفت-مايند-كشف-العملاء-${dateStr}.xlsx`);
};

/**
 * Export Tasks to Excel (.xlsx)
 */
export const exportTasksToExcel = (tasks: Task[], team: TeamMember[]) => {
  const data = tasks.map((t, index) => {
    const assignee = team.find(m => m.id === t.assignedToId);
    return {
      'م': index + 1,
      'عنوان المهمة': t.title,
      'التفاصيل': t.description || '-',
      'الموظف المكلف': assignee?.name || 'غير محدد',
      'القسم': t.category,
      'الأولوية': t.priority === 'urgent' ? 'عاجلة جداً' : t.priority === 'high' ? 'عالية' : t.priority === 'medium' ? 'متوسطة' : 'منخفضة',
      'الحالة': t.status === 'completed' ? 'مكتملة' : t.status === 'in_progress' ? 'قيد التنفيذ' : t.status === 'review' ? 'قيد المراجعة' : 'قيد الانتظار',
      'تاريخ الاستحقاق': t.dueDate,
      'وقت الاستحقاق': t.dueTime || '-',
      'الساعات التقديرية': t.estimatedHours || 0,
      'إجمالي الدقائق المسجلة': t.totalLoggedMinutes || 0,
      'إجمالي الساعات المسجلة': Number(((t.totalLoggedMinutes || 0) / 60).toFixed(1)),
      'عدد المهام الفرعية': t.subtasks?.length || 0,
      'المهمة سرية للمدير': t.isPrivate ? 'نعم (خاصة)' : 'عامة'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'مهام الفريق');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `سويفت-مايند-كشف-المهام-${dateStr}.xlsx`);
};

/**
 * Export Suspended Contracts to Excel (.xlsx) with Reasons
 */
export const exportSuspendedContractsToExcel = (clients: ClientRenewal[]) => {
  const data = clients.map((c, index) => ({
    'م': index + 1,
    'اسم العميل': c.clientName,
    'الشركة / المنشأة': c.company || '-',
    'رقم الهاتف': c.phone || '-',
    'الباقة والخدمة': c.serviceName,
    'قيمة العقد': c.amount,
    'العملة': c.currency,
    'دورة الاشتراك': c.planCycle,
    'سبب الإيقاف': c.suspensionReason || 'غير محدد',
    'تصنيف سبب الإيقاف': c.suspensionCategory === 'financial' ? 'تعثر مالي / تأخر سداد' :
                        c.suspensionCategory === 'client_request' ? 'طلب العميل مؤقتاً' :
                        c.suspensionCategory === 'technical' ? 'أسباب فنية وتقنية' :
                        c.suspensionCategory === 'restructuring' ? 'إعادة هيكلة النشاط' :
                        c.suspensionCategory === 'project_done' ? 'انتهاء المشروع' : 'أسباب أخرى',
    'تاريخ الإيقاف': c.suspendedAt || '-',
    'تاريخ الاستئناف المتوقع': c.expectedResumeDate || '-',
    'ملاحظات وتفاصيل إضافية': c.suspensionNotes || c.notes || '-',
    'مسؤول المتابعة': c.managedBy || 'هدير سعيد'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'العقود الموقوفة وأسباب التوقف');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `سويفت-مايند-عقود-موقفة-وأسباب-التوقف-${dateStr}.xlsx`);
};

export interface DailyWorkReportExportRow {
  employeeName: string;
  employeeCode?: string;
  employeeRole?: string;
  taskTitle: string;
  taskCategory?: string;
  taskStatus?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  durationFormatted: string;
  note?: string;
}

/**
 * Export Consolidated Daily Tasks & Time Worked Report to Excel (.xlsx)
 */
export const exportDailyWorkReportToExcel = (
  selectedDate: string,
  records: DailyWorkReportExportRow[],
  brandName: string = 'سويفت مايند'
) => {
  const data = records.map((r, index) => ({
    'م': index + 1,
    'اسم الموظف': r.employeeName,
    'كود الموظف': r.employeeCode || '-',
    'المسمى الوظيفي': r.employeeRole || '-',
    'عنوان المهمة': r.taskTitle,
    'التصنيف': r.taskCategory || '-',
    'حالة المهمة': r.taskStatus || '-',
    'تاريخ العمل': r.date,
    'وقت البدء': r.startTime || '-',
    'وقت الانتهاء': r.endTime || '-',
    'المدة بالدقائق': r.durationMinutes,
    'وقت العمل المستغرق': r.durationFormatted,
    'ملاحظات فترة العمل والإنجاز': r.note || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `تقرير عمل ${selectedDate}`);

  XLSX.writeFile(workbook, `${brandName}-تقرير-إنجاز-المهام-اليومي-${selectedDate}.xlsx`);
};

/**
 * Export Financial Transactions to Excel (.xlsx)
 */
export const exportFinancialTransactionsToExcel = (
  transactions: any[],
  brandName: string = 'سويفت مايند'
) => {
  const data = transactions.map((t, index) => ({
    'م': index + 1,
    'رقم الحركة / السند': t.transactionNumber || '-',
    'النوع': t.type === 'revenue' ? 'إيراد / تحصيل' : t.type === 'expense' ? 'مصروف' : 'تحويل داخلي',
    'الحالة': t.status === 'approved' ? 'معتمدة' : t.status === 'paid' ? 'مدفوعة' : t.status === 'draft' ? 'مسودة' : 'ملغاة',
    'البيان': t.description,
    'التصنيف': t.category,
    'المبلغ': t.amount,
    'العملة': t.currency || 'ج.م',
    'حالة السداد': t.isPaid ? 'مدفوع فعلياً' : 'مستحق لم يسدد',
    'الجهة / الطرف': t.clientName || t.employeeName || t.vendorName || '-',
    'الحساب المالي': t.fromAccountName || t.toAccountName || '-',
    'طريقة الدفع': t.paymentMethod,
    'رقم الإيصال / الحوالة': t.referenceNumber || '-',
    'التاريخ': t.date,
    'تاريخ الاستحقاق': t.dueDate || '-',
    'المنشئ': t.createdByName,
    'المعتمد': t.approvedByName || '-',
    'ملاحظات': t.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الحركات المالية');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${brandName}-سجل-الحركات-المالية-${dateStr}.xlsx`);
};

/**
 * Export Client Statement of Account to Excel (.xlsx)
 */
export const exportClientStatementToExcel = (
  clientName: string,
  companyName: string,
  records: any[],
  currentBalance: number,
  currency: string = 'ج.م',
  brandName: string = 'سويفت مايند'
) => {
  const data = records.map((r, index) => ({
    'م': index + 1,
    'التاريخ': r.date,
    'المستند': r.documentType,
    'رقم المستند': r.documentNumber,
    'البيان': r.description,
    'مدين (مستحق عليه)': r.debit > 0 ? r.debit : '-',
    'دائن (مدفوع منه)': r.credit > 0 ? r.credit : '-',
    'الرصيد المتبقي': r.balance,
    'طريقة السداد / الحوالة': r.referenceNumber || r.paymentMethod || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'كشف الحساب');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${brandName}-كشف-حساب-${clientName.replace(/\s+/g, '_')}-${dateStr}.xlsx`);
};

/**
 * Export Trial Balance to Excel (.xlsx)
 */
export const exportTrialBalanceToExcel = (
  accounts: any[],
  totalDebit: number,
  totalCredit: number,
  brandName: string = 'سويفت مايند'
) => {
  const data = accounts.map((acc, idx) => ({
    'م': idx + 1,
    'رمز الحساب': acc.code,
    'اسم الحساب': acc.name,
    'المجموعة': acc.category,
    'إجمالي المدين': acc.debitTotal,
    'إجمالي الدائن': acc.creditTotal,
    'الرصيد النهائي': acc.balance,
    'طبيعة الرصيد': acc.debitTotal >= acc.creditTotal ? 'مدين' : 'دائن'
  }));

  // Add Totals row
  data.push({
    'م': 'الإجمالي' as any,
    'رمز الحساب': '-',
    'اسم الحساب': 'المجموع العام',
    'المجموعة': '-',
    'إجمالي المدين': totalDebit,
    'إجمالي الدائن': totalCredit,
    'الرصيد النهائي': 0,
    'طبيعة الرصيد': totalDebit === totalCredit ? 'متوازن 100%' : 'غير متوازن'
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  if (!worksheet['!views']) worksheet['!views'] = [];
  worksheet['!views'].push({ rightToLeft: true });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ميزان المراجعة');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${brandName}-ميزان-المراجعة-${dateStr}.xlsx`);
};

