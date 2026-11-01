/**
 * Utility functions for task descriptions, quality enforcement,
 * and structured role breakdowns.
 *
 * Ensures tasks never have missing or meaningless boilerplate descriptions
 * like "مهمة مضافة عبر بورد وقائمة الفريق" and helps team members understand
 * exactly what is required from each person (e.g. who designs/delivers vs who reviews/coordinates).
 */

export const DEFAULT_BOILERPLATE_DESCRIPTION = 'مهمة مضافة عبر بورد وقائمة الفريق';

/**
 * Checks if a task description is empty, boilerplate, or too vague.
 */
export function isTaskDescriptionVague(description?: string | null): boolean {
  if (!description) return true;
  const trimmed = description.trim();
  if (trimmed.length < 15) return true;
  if (trimmed === DEFAULT_BOILERPLATE_DESCRIPTION) return true;
  if (trimmed.startsWith(DEFAULT_BOILERPLATE_DESCRIPTION)) {
    // If it only has boilerplate with minor suffix
    const remaining = trimmed.replace(DEFAULT_BOILERPLATE_DESCRIPTION, '').trim();
    if (remaining.length < 10) return true;
  }
  const lower = trimmed.toLowerCase();
  const vaguePhrases = [
    'مهمة جديدة',
    'بدون وصف',
    'لا يوجد وصف',
    'تاسك جديد',
    'مهمة سريعة',
    'تاسك سريع'
  ];
  if (vaguePhrases.includes(trimmed)) return true;
  return false;
}

export interface TaskTemplateOptions {
  title?: string;
  assigneeName?: string;
  reviewerName?: string;
  clientName?: string;
  company?: string;
}

/**
 * Generates a structured task description template with specific role distribution.
 */
export function generateStructuredTaskTemplate(options: TaskTemplateOptions = {}): string {
  const { title, assigneeName, reviewerName, clientName, company } = options;
  const clientRef = company || clientName;

  const lines: string[] = [];
  lines.push('📌 المطلوب بالتحديد:');
  if (title) {
    lines.push(`- تنفيذ متطلبات: ${title}${clientRef ? ` لصالح عميل (${clientRef})` : ''}`);
  } else {
    lines.push(`- توضيح المخرجات والنتائج المطلوبة بدقة${clientRef ? ` لعميل (${clientRef})` : ''}.`);
  }
  lines.push('- تجهيز كافة المتطلبات والملفات المطلوبة وفق أعلى معايير الجودة.');
  lines.push('');
  lines.push('👥 توزيع الأدوار والمسؤوليات المحددة:');
  lines.push(`• دور المكلف بالتنفيذ${assigneeName ? ` (${assigneeName})` : ''}:`);
  lines.push('  - استلام المتطلبات والبدء في تنفيذ المهام الموكلة إليه مباشرة.');
  lines.push('  - تسليم البروفات والنسخة الأولية في الموعد المحدد للمراجعة الفنية.');
  lines.push('');
  lines.push(`• دور المراجع / المنسق${reviewerName ? ` (${reviewerName})` : ''}:`);
  lines.push('  - التدقيق الشامل ومراجعة المخرجات والتأكد من خلوها من الأخطاء.');
  lines.push('  - التنسيق مع العميل أو الأكاونت مانجر واعتماد النسخة النهائية وتوثيق التسليم.');
  lines.push('');
  lines.push('🎯 معايير الجودة وموعد التسليم:');
  lines.push('- استيفاء المعايير الفنية المعتمدة بنسبة 100%.');
  lines.push('- التسليم في الوقت المحدد وتوثيق ساعات العمل بدقة.');

  return lines.join('\n');
}

/**
 * Specifically tailored clear description for Golden covers delivery and review.
 */
export const GOLDEN_TASK_YOMNA_DESC = `📌 المطلوب بالتحديد:
متابعة وإدارة دورة تسليم كفرات وتصميمات السوشيال ميديا الخاصة بعميل "شركة جولدن للأغذية" (ا/إسلام) تحت إشراف الأكاونت مانجر Amira.

👥 توزيع الأدوار والمسؤوليات المحددة:
• دور آية (Aya):
  - استلام متطلبات الهوية وتصميم وتجهيز كفرات وتصميمات جولدن بجودة عالية وبالمقاسات المعتمدة للمنصات.
  - تسليم ملفات التصميم والبروفات في الموعد المحدد لمرحلة المراجعة.

• دور يمنى (Yomna):
  - مراجعة الكفرات والتأكد من مطابقتها لهوية عميل جولدن وخلوها من أي ملاحظات فنية أو إملائية.
  - التنسيق المباشر مع الأكاونت مانجر (أميرة - Amira) وعميل جولدن (ا/إسلام).
  - إرسال البروفات للعميل وتلقي ملاحظات التعديل والتوجيهات ومتابعة الاعتماد والموافقة النهائية.
  - تسجيل وتوثيق ساعات المتابعة والتنسيق وإدارة دورة تسليم التصميمات.

🎯 معايير الجودة وموعد التسليم:
- مقاسات متوافقة بنسبة 100% مع منصات النشر ومطبقة لباليت الألوان والشعار المعتمد.
- اعتماد العميل دون تأخير وإتمام التسليم في الموعد النهائي المحدد.`;

export const GOLDEN_TASK_AYA_DESC = `📌 المطلوب بالتحديد:
تصميم وتجهيز كفرات السوشيال ميديا لشركة جولدن بجودة احترافية متوافقة مع الهوية البصرية المعتمدة.

👥 توزيع الأدوار والمسؤوليات المحددة:
• دور آية (Aya):
  - تنفيذ وتصميم الكفرات وتسليم الملفات المفتوحة وصيغ العرض عالية الجودة في الموعد المحدد لمرحلة المراجعة.

• دور يمنى (Yomna) والأكاونت مانجر (Amira):
  - المراجعة الفنية، التواصل مع العميل، وتدوين الملاحظات وإدارة الموافقة والاعتماد النهائي.

🎯 معايير الجودة وموعد التسليم:
- جودة تصميم عالية ودقة ألوان متوافقة مع هوية شركة جولدن.`;
