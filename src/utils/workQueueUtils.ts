import { Task, TeamMember, ClientRenewal } from '../types/crm';

/**
 * Utilities for Work Queue (قائمة انتظار العمل)
 * Filters out demo / template placeholder data while preserving all real system data,
 * and derives real waiting clients dynamically from actual team tasks.
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

  // Meeting template IDs: meet-1 .. meet-999
  if (/^meet-[0-9]{1,3}$/.test(normId)) {
    return true;
  }

  // Call template IDs: call-1 .. call-999
  if (/^call-[0-9]{1,3}$/.test(normId)) {
    return true;
  }

  // Lead template IDs: lead-1 .. lead-999 (e.g. lead-1..10, lead-301..305)
  if (/^lead-(?:[0-9]{1,4}|demo)/.test(normId)) {
    return true;
  }

  // Deal template IDs: deal-1 .. deal-999 (e.g. deal-1..10, deal-201..210)
  if (/^deal-(?:[0-9]{1,4}|demo)/.test(normId)) {
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
    'تسليم تقرير الحملة',
    'مجموعة المدى',
    'مستشفيات رعاية النخبة',
    'شركة ركائز الخليج',
    'سلسلة متاجر لومير',
    'منصة وتطبيق تموين',
    'سلطان بن عبدالعزيز',
    'نورة الشامسي',
    'راشد الهاجري',
    'ابتسام الحربي',
    'سعد الشهري',
    'راشد السعيد'
  ];

  for (const kw of demoKeywords) {
    const normKw = kw.toLowerCase();
    if (normTitle.includes(normKw) || normClient.includes(normKw)) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts or detects client name from a task using its client field or title keywords.
 */
export function extractClientFromTask(task: {
  title?: string;
  clientName?: string;
  relatedTo?: { name?: string };
}): string | undefined {
  if (task.clientName && task.clientName.trim()) {
    return task.clientName.trim();
  }
  if (task.relatedTo?.name && task.relatedTo.name.trim()) {
    return task.relatedTo.name.trim();
  }

  const title = (task.title || '').trim();
  if (!title) return undefined;

  const normTitle = title.toLowerCase();

  // Known company clients from real team operations
  const knownClients = [
    {
      match: () =>
        normTitle.includes('gx') ||
        normTitle.includes('جي أكس') ||
        normTitle.includes('جي اكس'),
      name: 'موقع GX'
    },
    {
      match: () => normTitle.includes('جولدن') || /golden/i.test(title),
      name: 'جولدن (Golden)'
    },
    {
      match: () => normTitle.includes('باورتك') || /powertech/i.test(title),
      name: 'شركة باورتك'
    },
    {
      match: () => normTitle.includes('الكشفيه') || normTitle.includes('الكشفية'),
      name: 'موقع الكشفية'
    },
    {
      match: () => normTitle.includes('الدرب'),
      name: 'موقع الدرب'
    },
    {
      match: () => normTitle.includes('صيدل'),
      name: 'عميل الصيدلية'
    },
    {
      match: () =>
        normTitle.includes('التدريس') ||
        normTitle.includes('عماره') ||
        normTitle.includes('عمارة'),
      name: 'مدرسة التدريس للعمارة'
    },
    {
      match: () => normTitle.includes('ساوث كوست') || /south\s*coast/i.test(title),
      name: 'ساوث كوست'
    },
    {
      match: () => normTitle.includes('بيوشار') || /biochar/i.test(title),
      name: 'موقع بيوشار'
    },
    {
      match: () => normTitle.includes('cafm') || normTitle.includes('كافم'),
      name: 'موقع CAFM'
    },
    {
      match: () =>
        normTitle.includes('سويفتورا') ||
        normTitle.includes('swiftura') ||
        normTitle.includes('سويفت') ||
        /swift/i.test(title),
      name: 'سويفت (Swift)'
    },
    {
      match: () => normTitle.includes('دكتور عماد') || normTitle.includes('د. عماد'),
      name: 'دكتور عماد'
    },
    {
      match: () => normTitle.includes('محمد الخميس') || normTitle.includes('الخميس'),
      name: 'أ/ محمد الخميس'
    },
    {
      match: () =>
        /(?:^|[\s_،,.-])(?:ا\/|أ\/)?(?:اسلام|إسلام)(?:$|[\s_،,.-])/.test(title),
      name: 'أ/ إسلام'
    },
    {
      match: () =>
        /(?:^|[\s_،,.-])(?:عمر)(?:$|[\s_،,.-])/.test(title),
      name: 'عمر'
    }
  ];

  for (const client of knownClients) {
    if (client.match()) {
      return client.name;
    }
  }

  // Match phrases like "عميل كذا" or "موقع كذا"
  const match = title.match(/(?:عميل|شركة|موقع|أكونت|حساب|مشروع)\s+([^\s,،–-]+(?:\s+[^\s,،–-]+)?)/i);
  if (match && match[1]) {
    const candidate = match[1].trim();
    if (!['الجديد', 'القديم', 'الحالي', 'كامل', 'التيم', 'سويفت'].includes(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export interface WaitingClientGroup {
  clientName: string;
  totalTasks: number;
  pendingTasksCount: number; // todo
  inProgressTasksCount: number; // in_progress
  reviewTasksCount: number; // review
  completedTasksCount: number; // completed
  activeTasks: Task[];
  allTasks: Task[];
  assigneeIds: string[];
  assignees: { id: string; name: string; avatar?: string; role?: string }[];
  primaryAssignee?: { id: string; name: string; avatar?: string };
  highestPriority: 'urgent' | 'high' | 'medium' | 'low';
  earliestDueDate: string;
  isOverdue: boolean;
  isDueToday: boolean;
  progressPercent: number;
  status: 'waiting' | 'in_progress' | 'completed' | 'stalled';
  statusLabel: string;
  taskTitlesSnippet: string;
}

/**
 * Builds real waiting client groups dynamically from real team tasks.
 */
export function buildWaitingClientsFromTasks(
  tasks: Task[],
  team: TeamMember[],
  clientRenewals: ClientRenewal[] = []
): WaitingClientGroup[] {
  const groupsMap = new Map<string, Task[]>();

  // Filter out any template demo tasks
  const realTasks = (tasks || []).filter(t => !isDemoWorkItem(t.id, t.title, t.clientName || t.relatedTo?.name));

  // Group real tasks by client
  realTasks.forEach(t => {
    const client = extractClientFromTask(t);
    if (client) {
      const existing = groupsMap.get(client) || [];
      existing.push(t);
      groupsMap.set(client, existing);
    }
  });

  // Also include any real client renewals (if they don't have tasks yet, they still represent clients in waiting)
  (clientRenewals || []).forEach(r => {
    const name = (r?.clientName || '').trim();
    if (name && !groupsMap.has(name) && !isDemoWorkItem(r.id, r.clientName, r.serviceName)) {
      groupsMap.set(name, []);
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTime = new Date().setHours(0, 0, 0, 0);

  const result: WaitingClientGroup[] = [];

  groupsMap.forEach((clientTasks, clientName) => {
    const totalTasks = clientTasks.length;
    const activeTasks = clientTasks.filter(t => t.status !== 'completed');
    const completedTasks = clientTasks.filter(t => t.status === 'completed');
    const pendingTasks = clientTasks.filter(t => t.status === 'todo');
    const inProgressTasks = clientTasks.filter(t => t.status === 'in_progress');
    const reviewTasks = clientTasks.filter(t => t.status === 'review' || t.reviewOutcome === 'under_review');

    // Collect assignees
    const assigneeIdSet = new Set<string>();
    clientTasks.forEach(t => {
      if (t.assignedToId) assigneeIdSet.add(t.assignedToId);
    });

    const assignees = Array.from(assigneeIdSet).map(aid => {
      const member = team.find(m => m.id === aid);
      return {
        id: aid,
        name: member ? member.name : aid,
        avatar: member?.avatar,
        role: member?.role
      };
    });

    const primaryAssignee = assignees[0];

    // Priority: highest among active tasks, or default medium
    let highestPriority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
    if (clientTasks.some(t => t.priority === 'urgent')) highestPriority = 'urgent';
    else if (clientTasks.some(t => t.priority === 'high')) highestPriority = 'high';
    else if (clientTasks.some(t => t.priority === 'low') && !clientTasks.some(t => t.priority === 'medium')) highestPriority = 'low';

    // Due date: earliest active due date, or fallback today
    const dueDates = activeTasks
      .map(t => t.dueDate)
      .filter(Boolean)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const earliestDueDate = dueDates[0] || todayStr;

    // Check overdue & due today
    let isOverdue = false;
    let isDueToday = false;
    if (dueDates[0]) {
      const d = new Date(dueDates[0]);
      d.setHours(0, 0, 0, 0);
      isOverdue = d.getTime() < todayTime;
      isDueToday = d.getTime() === todayTime;
    }

    // Status:
    let status: 'waiting' | 'in_progress' | 'completed' | 'stalled' = 'waiting';
    let statusLabel = 'قيد الانتظار';

    if (totalTasks > 0 && activeTasks.length === 0) {
      status = 'completed';
      statusLabel = 'مكتمل بالكامل';
    } else if (inProgressTasks.length > 0) {
      status = 'in_progress';
      statusLabel = 'جاري التنفيذ';
    } else if (reviewTasks.length > 0) {
      status = 'waiting';
      statusLabel = 'بانتظار المراجعة';
    } else if (pendingTasks.length > 0) {
      status = 'waiting';
      statusLabel = 'بانتظار البدء';
    } else {
      status = 'waiting';
      statusLabel = 'بانتظار تكليف مهام';
    }

    const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    const taskTitlesSnippet = activeTasks.length > 0
      ? activeTasks.map(t => t.title).slice(0, 3).join(' • ')
      : clientTasks.map(t => t.title).slice(0, 2).join(' • ') || 'لا توجد مهام نشطة حالياً';

    result.push({
      clientName,
      totalTasks,
      pendingTasksCount: pendingTasks.length,
      inProgressTasksCount: inProgressTasks.length,
      reviewTasksCount: reviewTasks.length,
      completedTasksCount: completedTasks.length,
      activeTasks,
      allTasks: clientTasks,
      assigneeIds: Array.from(assigneeIdSet),
      assignees,
      primaryAssignee,
      highestPriority,
      earliestDueDate,
      isOverdue,
      isDueToday,
      progressPercent,
      status,
      statusLabel,
      taskTitlesSnippet
    });
  });

  // Sort: Clients with active/waiting tasks first, then overdue, then by total tasks descending
  return result.sort((a, b) => {
    if (a.activeTasks.length > 0 && b.activeTasks.length === 0) return -1;
    if (a.activeTasks.length === 0 && b.activeTasks.length > 0) return 1;
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return b.activeTasks.length - a.activeTasks.length;
  });
}
