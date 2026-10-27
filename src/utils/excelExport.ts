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

