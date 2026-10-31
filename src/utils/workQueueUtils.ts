/**
 * Utilities for Work Queue (قائمة انتظار العمل)
 * Filters out demo / template placeholder data while preserving all real system data.
 */

export function isDemoWorkItem(
  id: string = '',
  title: string = '',
  clientOrProject: string = ''
): boolean {
  const normId = (id || '').toLowerCase().trim();
  const normTitle = (title || '').toLowerCase();
  const normClient = (clientOrProject || '').toLowerCase();

  // 1. Template short IDs
  // Task template IDs: task-101 .. task-120, task-1 .. task-10, task-mgr-private-1
  if (
    /^task-(10[1-9]|11[0-9]|120|[1-9])$/.test(normId) ||
    normId === 'task-mgr-private-1'
  ) {
    return true;
  }

  // Meeting template IDs: meet-1 .. meet-10
  if (/^meet-[0-9]{1,2}$/.test(normId)) {
    return true;
  }

  // Call template IDs: call-1 .. call-10
  if (/^call-[0-9]{1,2}$/.test(normId)) {
    return true;
  }

  // Lead template IDs: lead-1 .. lead-10
  if (/^lead-[0-9]{1,2}$/.test(normId)) {
    return true;
  }

  // Deal template IDs: deal-1 .. deal-10, deal-201 .. deal-210
  if (/^deal-([0-9]{1,2}|20[0-9]|210)$/.test(normId)) {
    return true;
  }

  // 2. Demo company / client names and sample keywords from initial templates
  const demoKeywords = [
    'بنك الرياض',
    'إعمار المستقبل',
    'بوابة الأعمال',
    'أفق السحاب',
    'الحلول الذكية للتجارة',
    'الحلول الذكية',
    'مستشفى النور',
    'مجموعة الأفق العالمية',
    'شركة تقنية الغد',
    'شركة مدار الخليج',
    'جاسم الصباح',
    'عبدالعزيز العتيبي',
    'سعود المنصور',
    'فهد الدوسري',
    'خالد ناصر الجاسم',
    'م. أحمد كمال',
    'إعداد عرض سعر للعميل',
    'متابعة شركة جديدة',
    'اجتماع مراجعة المشروع',
    'تسليم تقرير الحملة'
  ];

  for (const kw of demoKeywords) {
    const normKw = kw.toLowerCase();
    if (normTitle.includes(normKw) || normClient.includes(normKw)) {
      return true;
    }
  }

  return false;
}
