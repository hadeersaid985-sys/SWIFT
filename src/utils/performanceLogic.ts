import {
  Task,
  DelayRecord,
  PerformanceEvaluationRecord,
  RuleViolationRecord,
  DelayRangeCategory
} from '../types/crm';

/**
 * حساب دقائق التأخير بين الموعد المحدد ووقت الحضور الفعلي
 * مثال: scheduled = "09:00", actual = "09:25" => 25 دقيقة
 * لو حضر مبكراً أو في الموعد => 0 دقيقة
 */
export function calculateDelayMinutes(scheduledTime: string, actualTime: string): number {
  if (!scheduledTime || !actualTime) return 0;

  const [sHours, sMinutes] = scheduledTime.split(':').map(n => parseInt(n, 10));
  const [aHours, aMinutes] = actualTime.split(':').map(n => parseInt(n, 10));

  if (isNaN(sHours) || isNaN(sMinutes) || isNaN(aHours) || isNaN(aMinutes)) {
    return 0;
  }

  const scheduledTotalMinutes = sHours * 60 + sMinutes;
  const actualTotalMinutes = aHours * 60 + aMinutes;

  const diff = actualTotalMinutes - scheduledTotalMinutes;
  return diff > 0 ? diff : 0;
}

/**
 * تصنيف مدة التأخير وفق فئات السيستم:
 * - من 1 إلى 5 دقائق: '1-5'
 * - من 6 إلى 15 دقيقة: '6-15'
 * - من 16 إلى 30 دقيقة: '16-30'
 * - أكثر من 30 دقيقة: '30+'
 */
export function getDelayRangeCategory(minutes: number): DelayRangeCategory {
  if (minutes <= 5) return '1-5';
  if (minutes <= 15) return '6-15';
  if (minutes <= 30) return '16-30';
  return '30+';
}

/**
 * تحويل تقييم الجودة إلى رقم من 1 إلى 5
 */
export function qualityRatingToScore(rating?: string): number {
  switch (rating) {
    case 'excellent':
      return 5;
    case 'very_good':
      return 4;
    case 'good':
      return 3;
    case 'needs_work':
      return 2;
    case 'unacceptable':
      return 1;
    default:
      return 0;
  }
}

/**
 * فحص هل تم تسليم المهمة في موعدها المحدد أم متأخرة
 */
export function isTaskDeliveredOnTime(task: Task): boolean {
  if (task.status !== 'completed') return false;
  
  const deliveryDate = task.actualCompletionDate || task.completedAt?.split('T')[0];
  if (!deliveryDate || !task.dueDate) return true; // لو مفيش تاريخ تسليم يعتبر في الموعد

  // مقارنة التواريخ
  return deliveryDate <= task.dueDate;
}

export interface CalculatedEmployeeKPIs {
  totalTasks: number;
  completedTasks: number;
  tasksCompletionRate: number; // %
  onTimeDeliveries: number;
  onTimeDeliveryRate: number; // %
  averageQualityScore: number; // من 5
  revisionsRequestedCount: number;
  delayedTasksCount: number;

  delaysCount: number;
  totalDelayMinutes: number;
  excusedDelaysCount: number;
  unexcusedDelaysCount: number;

  positiveNotesCount: number;
  negativeNotesCount: number;
  extraWorkCount: number;
  improvementCount: number;
  violationsCount: number;

  // درجات التقييم الموزونة (إجمالي 100)
  qualityWeightedScore: number; // 30%
  punctualityWeightedScore: number; // 25%
  taskCompletionWeightedScore: number; // 25%
  initiativeWeightedScore: number; // 20%
  overallScore: number; // 0 - 100
  ratingText: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج تحسين' | 'غير مرضٍ';
}

/**
 * حساب مؤشرات أداء الموظف الشاملة لشهر معين أو فترة زمنية
 */
export function calculateEmployeeKPIs(
  employeeId: string,
  tasks: Task[],
  delays: DelayRecord[],
  evaluations: PerformanceEvaluationRecord[],
  violations: RuleViolationRecord[],
  monthFilter?: string // YYYY-MM
): CalculatedEmployeeKPIs {
  // تصفية التاسكات الخاصة بالموظف
  const empTasks = tasks.filter(t => {
    const isAssigned = (t.assignedToId || '').toLowerCase() === employeeId.toLowerCase();
    if (!isAssigned) return false;
    if (monthFilter) {
      const taskDate = t.actualCompletionDate || t.dueDate || t.createdAt;
      return taskDate.startsWith(monthFilter);
    }
    return true;
  });

  const totalTasks = empTasks.length;
  const completedTasks = empTasks.filter(t => t.status === 'completed').length;
  const tasksCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const onTimeTasks = empTasks.filter(t => t.status === 'completed' && isTaskDeliveredOnTime(t));
  const onTimeDeliveries = onTimeTasks.length;
  const onTimeDeliveryRate = completedTasks > 0 ? Math.round((onTimeDeliveries / completedTasks) * 100) : 100;

  // احتساب الجودة والتعديلات
  const ratedTasks = empTasks.filter(t => t.qualityRating);
  const totalQuality = ratedTasks.reduce((acc, t) => acc + qualityRatingToScore(t.qualityRating), 0);
  const averageQualityScore = ratedTasks.length > 0 ? parseFloat((totalQuality / ratedTasks.length).toFixed(1)) : 4.5;

  const revisionsRequestedCount = empTasks.reduce((acc, t) => acc + (t.revisionsCount || (t.reviewOutcome === 'revisions_requested' ? 1 : 0)), 0);
  const delayedTasksCount = empTasks.filter(t => !isTaskDeliveredOnTime(t) && (t.status === 'completed' || new Date(t.dueDate) < new Date())).length;

  // التأخيرات
  const empDelays = delays.filter(d => {
    const matchesEmp = (d.employeeId || '').toLowerCase() === employeeId.toLowerCase();
    if (!matchesEmp) return false;
    if (monthFilter) {
      return d.date.startsWith(monthFilter);
    }
    return true;
  });

  const delaysCount = empDelays.length;
  const totalDelayMinutes = empDelays.reduce((acc, d) => acc + (d.delayMinutes || 0), 0);
  const excusedDelaysCount = empDelays.filter(d => d.reviewStatus === 'excused').length;
  const unexcusedDelaysCount = empDelays.filter(d => d.reviewStatus === 'unexcused').length;

  // الملاحظات والتقييمات
  const empEvals = evaluations.filter(e => {
    const matchesEmp = (e.employeeId || '').toLowerCase() === employeeId.toLowerCase();
    if (!matchesEmp) return false;
    if (monthFilter) {
      return e.date.startsWith(monthFilter);
    }
    return true;
  });

  const positiveNotesCount = empEvals.filter(e => e.type === 'positive' && e.status === 'approved').length;
  const negativeNotesCount = empEvals.filter(e => e.type === 'negative' && e.status === 'approved').length;
  const extraWorkCount = empEvals.filter(e => e.type === 'extra_work' && e.status === 'approved').length;
  const improvementCount = empEvals.filter(e => e.type === 'improvement').length;

  // المخالفات المؤكدة
  const empViolations = violations.filter(v => {
    const matchesEmp = (v.employeeId || '').toLowerCase() === employeeId.toLowerCase();
    if (!matchesEmp) return false;
    if (monthFilter) {
      return v.incidentDate.startsWith(monthFilter);
    }
    return true;
  });
  const violationsCount = empViolations.filter(v => v.reviewStatus === 'confirmed').length;

  // الحساب الموزون العادل للتقييم:
  // 1. جودة الشغل (30%): متوسط الجودة من 5 محول إلى 30
  const qualityWeightedScore = Math.min(30, Math.round((averageQualityScore / 5) * 30));

  // 2. الالتزام بالمواعيد والحضور (25%): خصم نقاط فقط للتأخيرات غير المعتمدة والمخالفات المؤكدة (لا خصم للأعذار المعتمدة)
  let punctualityBase = 25;
  punctualityBase -= unexcusedDelaysCount * 3;
  punctualityBase -= violationsCount * 4;
  const punctualityWeightedScore = Math.max(0, Math.min(25, punctualityBase));

  // 3. إنجاز التاسكات والتسليم في الموعد (25%):
  const taskCompletionWeightedScore = Math.round(
    ((tasksCompletionRate * 0.5 + onTimeDeliveryRate * 0.5) / 100) * 25
  );

  // 4. التعاون والمبادرة والشغل الإضافي (20%):
  let initiativeBase = 15; // نقطة انطلاق أساسية جيدة
  initiativeBase += positiveNotesCount * 2;
  initiativeBase += extraWorkCount * 3;
  initiativeBase -= negativeNotesCount * 3;
  const initiativeWeightedScore = Math.max(0, Math.min(20, initiativeBase));

  const overallScore = Math.min(100, Math.max(0, qualityWeightedScore + punctualityWeightedScore + taskCompletionWeightedScore + initiativeWeightedScore));

  let ratingText: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج تحسين' | 'غير مرضٍ' = 'جيد';
  if (overallScore >= 90) ratingText = 'ممتاز';
  else if (overallScore >= 80) ratingText = 'جيد جداً';
  else if (overallScore >= 65) ratingText = 'جيد';
  else if (overallScore >= 50) ratingText = 'يحتاج تحسين';
  else ratingText = 'غير مرضٍ';

  return {
    totalTasks,
    completedTasks,
    tasksCompletionRate,
    onTimeDeliveries,
    onTimeDeliveryRate,
    averageQualityScore,
    revisionsRequestedCount,
    delayedTasksCount,
    delaysCount,
    totalDelayMinutes,
    excusedDelaysCount,
    unexcusedDelaysCount,
    positiveNotesCount,
    negativeNotesCount,
    extraWorkCount,
    improvementCount,
    violationsCount,
    qualityWeightedScore,
    punctualityWeightedScore,
    taskCompletionWeightedScore,
    initiativeWeightedScore,
    overallScore,
    ratingText
  };
}
