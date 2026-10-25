import * as XLSX from 'xlsx';
import { ClientRenewal, Task, TeamMember } from '../types/crm';

/**
 * Export Client Renewals & Dossiers to Excel (.xlsx)
 */
export const exportClientsToExcel = (clients: ClientRenewal[]) => {
  const data = clients.map((c, index) => ({
    'م': index + 1,
    'اسم العميل': c.clientName,
    'الشركة / الجهة': c.company || '-',
    'رقم الهاتف': c.phone || '-',
    'البريد الإلكتروني': c.email || '-',
    'اسم باقة الخدمة': c.serviceName,
    'قيمة الاشتراك': c.amount,
    'العملة': c.currency,
    'دورة السداد': c.planCycle,
    'تاريخ البدء': c.firstSubscribedAt || c.createdAt || '-',
    'تاريخ التجديد المستحق': c.renewalDate,
    'حالة الاشتراك': c.status === 'active' ? 'ساري' : c.status === 'renewing_soon' ? 'مستحق قريباً' : c.status === 'overdue' ? 'متأخر' : c.status === 'renewed' ? 'تم التجديد' : 'ملغي',
    'المسؤول عن المتابعة': c.managedBy || 'هدير سعيد',
    'رابط شيت المتابعة': c.sheetUrl || '-',
    'ملاحظات': c.notes || '-'
  }));

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
