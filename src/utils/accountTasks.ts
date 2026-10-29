import { AccountMonthlyTask, ClientRenewal } from '../types/crm';

export interface TaskProgressResult {
  total: number;
  completed: number;
  remaining: number;
  progressPercent: number;
  isAllCompleted: boolean;
}

export interface DeliveryCountdownResult {
  daysRemaining: number;
  label: string;
  status: 'overdue' | 'due_today' | 'due_tomorrow' | 'due_soon' | 'normal';
  badgeClass: string;
}

export interface AccountManagerMetricsResult {
  managedAccountsCount: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  overallProgressPercent: number;
  urgentAccountsCount: number;
}

/**
 * Calculates completion rate, count of finished tasks, and remaining tasks for an account.
 */
export function calculateAccountTaskProgress(tasks?: AccountMonthlyTask[]): TaskProgressResult {
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      remaining: 0,
      progressPercent: 0,
      isAllCompleted: false
    };
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const remaining = total - completed;
  const progressPercent = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    remaining,
    progressPercent,
    isAllCompleted: total > 0 && remaining === 0
  };
}

/**
 * Computes days remaining before monthly delivery or renewal deadline.
 */
export function getDeliveryCountdown(deliveryDate?: string, referenceDateStr?: string): DeliveryCountdownResult {
  if (!deliveryDate) {
    return {
      daysRemaining: 999,
      label: 'غير محدد',
      status: 'normal',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200'
    };
  }

  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  ref.setHours(0, 0, 0, 0);

  const target = new Date(deliveryDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - ref.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      daysRemaining: days,
      label: `متأخر بمقدار ${overdueDays} يوم`,
      status: 'overdue',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold'
    };
  }

  if (days === 0) {
    return {
      daysRemaining: 0,
      label: 'مستحق اليوم!',
      status: 'due_today',
      badgeClass: 'bg-red-500 text-white border-red-600 font-black shadow-2xs animate-pulse'
    };
  }

  if (days === 1) {
    return {
      daysRemaining: 1,
      label: 'مستحق غداً!',
      status: 'due_tomorrow',
      badgeClass: 'bg-amber-500 text-white border-amber-600 font-bold'
    };
  }

  if (days <= 4) {
    return {
      daysRemaining: days,
      label: `متبقي ${days} أيام للتسليم`,
      status: 'due_soon',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
    };
  }

  return {
    daysRemaining: days,
    label: `متبقي ${days} يوم`,
    status: 'normal',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  };
}

/**
 * Filters account tasks by completion status and month.
 */
export function filterAccountTasks(
  tasks?: AccountMonthlyTask[],
  filter: 'all' | 'pending' | 'completed' | 'overdue' = 'all',
  month?: string
): AccountMonthlyTask[] {
  if (!tasks || !Array.isArray(tasks)) return [];

  return tasks.filter(task => {
    // Month filter
    if (month && task.month && task.month !== month) {
      return false;
    }

    // Status filter
    if (filter === 'completed') {
      return task.completed === true;
    }

    if (filter === 'pending') {
      return task.completed !== true;
    }

    if (filter === 'overdue') {
      if (task.completed) return false;
      if (!task.dueDate) return false;
      const days = getDeliveryCountdown(task.dueDate).daysRemaining;
      return days < 0;
    }

    return true;
  });
}

/**
 * Calculates aggregated KPIs for accounts managed by a specific Account Manager.
 */
export function getAccountManagerMetrics(
  clients: ClientRenewal[],
  managerIdentifier?: string
): AccountManagerMetricsResult {
  const activeClients = (clients || []).filter(c => c.status !== 'suspended');

  const filtered = managerIdentifier && managerIdentifier !== 'all'
    ? activeClients.filter(c => {
        const idMatch = c.accountManagerId && c.accountManagerId.toLowerCase() === managerIdentifier.toLowerCase();
        const nameMatch = c.accountManagerName && c.accountManagerName.toLowerCase().includes(managerIdentifier.toLowerCase());
        const managedByMatch = c.managedBy && c.managedBy.toLowerCase().includes(managerIdentifier.toLowerCase());
        return idMatch || nameMatch || managedByMatch;
      })
    : activeClients;

  let totalTasks = 0;
  let completedTasks = 0;
  let urgentAccountsCount = 0;

  filtered.forEach(client => {
    const tasks = client.monthlyTasks || [];
    totalTasks += tasks.length;
    completedTasks += tasks.filter(t => t.completed).length;

    const remaining = tasks.filter(t => !t.completed).length;
    const targetDate = client.monthlyDeliveryDate || client.renewalDate;
    const countdown = getDeliveryCountdown(targetDate);

    // Urgent: Has pending deliverables AND countdown is <= 4 days (or overdue)
    if (remaining > 0 && countdown.daysRemaining <= 4) {
      urgentAccountsCount++;
    }
  });

  const remainingTasks = totalTasks - completedTasks;
  const overallProgressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    managedAccountsCount: filtered.length,
    totalTasks,
    completedTasks,
    remainingTasks,
    overallProgressPercent,
    urgentAccountsCount
  };
}
