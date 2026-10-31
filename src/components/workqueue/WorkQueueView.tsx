import React, { useState, useMemo } from 'react';
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Calendar,
  PhoneCall,
  Users,
  Building,
  Briefcase,
  ArrowRight,
  Filter,
  Search,
  Plus,
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowUpDown,
  Tag,
  ExternalLink,
  ShieldAlert,
  Flame,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  UserCheck,
  Award,
  Send,
  SlidersHorizontal,
  X,
  FileText,
  HelpCircle,
  Share2,
  PhoneOutgoing,
  PhoneIncoming,
  Hourglass,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../../context/CRMContext';
import { Task, TaskPriority, TaskStatus, Meeting, CallLog, Lead, Deal, TeamMember } from '../../types/crm';
import { isDemoWorkItem } from '../../utils/workQueueUtils';

// Unified Work Item definition for the Work Queue
export type WorkItemType = 'task' | 'meeting' | 'call' | 'lead' | 'deal' | 'approval';

export interface WorkQueueItem {
  id: string;
  originalId: string;
  title: string;
  type: WorkItemType;
  typeLabel: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  clientOrProjectName?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  createdAt: string;
  dueDate: string;
  dueTime?: string;
  status: 'new' | 'in_progress' | 'waiting' | 'completed' | 'stalled';
  statusLabel: string;
  progressPercent: number;
  notes?: string;
  source: 'مهمة' | 'اجتماع' | 'مكالمة' | 'عميل' | 'صفقة' | 'مدير' | 'يدوي';
  rawObject?: Task | Meeting | CallLog | Lead | Deal | any;
  isOverdue: boolean;
  isDueToday: boolean;
  overdueDays?: number;
  needsIntervention?: boolean;
  interventionReason?: string;
  isPendingApproval?: boolean;
}

export const WorkQueueView: React.FC = () => {
  const {
    tasks,
    meetings,
    calls,
    leads,
    deals,
    team,
    currentUser,
    isManager,
    addTask,
    updateTask,
    changeTaskStatus,
    startTaskTimer,
    updateMeeting,
    updateCallLog,
    createTaskFromActionItem,
    setActiveTab
  } = useCRM();

  // Active top-level section
  // 1. overview (نظرة عامة)
  // 2. tasks (المهام)
  // 3. meetings_calls (الاجتماعات والمكالمات)
  // 4. clients_deals (متابعة العملاء والصفقات)
  // 5. intervention (الأعمال التي تحتاج تدخل)
  // 6. manager_metrics (لوحة المدير للمتابعة وحجم العمل)
  const [activeSection, setActiveSection] = useState<'overview' | 'tasks' | 'meetings_calls' | 'clients_deals' | 'intervention' | 'manager_metrics'>('overview');

  // Filters
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'today' | 'upcoming' | 'waiting'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | WorkItemType>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isAddWorkModalOpen, setIsAddWorkModalOpen] = useState(false);
  const [convertModalData, setConvertModalData] = useState<{
    isOpen: boolean;
    sourceType: 'meeting' | 'call' | 'lead' | 'deal';
    sourceTitle: string;
    sourceId: string;
    clientId?: string;
    clientName?: string;
    defaultAssigneeId?: string;
  }>({
    isOpen: false,
    sourceType: 'meeting',
    sourceTitle: '',
    sourceId: ''
  });

  // Convert to task form state
  const [newConvertedTaskTitle, setNewConvertedTaskTitle] = useState('');
  const [newConvertedTaskDesc, setNewConvertedTaskDesc] = useState('');
  const [newConvertedTaskAssignee, setNewConvertedTaskAssignee] = useState(currentUser?.id || 'user-1');
  const [newConvertedTaskDueDate, setNewConvertedTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newConvertedTaskPriority, setNewConvertedTaskPriority] = useState<TaskPriority>('high');

  // New Work item modal state
  const [manualTitle, setManualTitle] = useState('');
  const [manualType, setManualType] = useState<WorkItemType>('task');
  const [manualAssignee, setManualAssignee] = useState(currentUser?.id || 'user-1');
  const [manualPriority, setManualPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');
  const [manualClientProject, setManualClientProject] = useState('');
  const [manualDueDate, setManualDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualNotes, setManualNotes] = useState('');

  // Current system reference date (normalized to midnight)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper: map a date to overdue / today status
  const evaluateDateStatus = (dateStr: string) => {
    if (!dateStr) return { isOverdue: false, isDueToday: false, diffDays: 0 };
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      isOverdue: diffDays < 0,
      isDueToday: diffDays === 0,
      diffDays
    };
  };

  // Build unified items from all CRM sources
  const allUnifiedItems = useMemo<WorkQueueItem[]>(() => {
    const items: WorkQueueItem[] = [];

    // 1. Tasks (Excluding any demo template tasks)
    tasks.forEach(t => {
      // Exclude demo tasks from work queue
      if (isDemoWorkItem(t.id, t.title, t.clientName || t.relatedTo?.name)) return;
      // Exclude private tasks if not manager and not mine
      if (t.isPrivate && !isManager) return;

      const dateStatus = evaluateDateStatus(t.dueDate);
      const isCompleted = t.status === 'completed';
      const isOverdue = !isCompleted && dateStatus.isOverdue;
      const isDueToday = !isCompleted && dateStatus.isDueToday;
      const assignee = team.find(m => m.id === t.assignedToId);

      let queueStatus: WorkQueueItem['status'] = 'in_progress';
      let statusLabel = 'قيد التنفيذ';

      if (isCompleted) {
        queueStatus = 'completed';
        statusLabel = 'مكتمل';
      } else if (t.status === 'todo') {
        queueStatus = 'new';
        statusLabel = 'جديد';
      } else if (t.reviewOutcome === 'under_review' || t.status === 'review') {
        queueStatus = 'waiting';
        statusLabel = 'بانتظار الاعتماد';
      } else if (t.delayReason || t.isTimerPaused) {
        queueStatus = 'stalled';
        statusLabel = 'متوقف';
      }

      // Check if task needs intervention
      const needsIntervention =
        isOverdue ||
        Boolean(t.delayReason) ||
        t.reviewOutcome === 'revisions_requested' ||
        t.reviewOutcome === 'under_review';

      let interventionReason = '';
      if (isOverdue) interventionReason = `تجاوزت الموعد بـ ${Math.abs(dateStatus.diffDays)} يوم`;
      else if (t.delayReason) interventionReason = `متوقفة: ${t.delayReason}`;
      else if (t.reviewOutcome === 'under_review') interventionReason = 'تنتظر اعتماد المدير';
      else if (t.reviewOutcome === 'revisions_requested') interventionReason = 'مطلوب تعديلات من الموظف';

      // Calculate progress %
      let progressPercent = 0;
      if (isCompleted) progressPercent = 100;
      else if (t.subtasks && t.subtasks.length > 0) {
        const done = t.subtasks.filter(s => s.completed).length;
        progressPercent = Math.round((done / t.subtasks.length) * 100);
      } else if (t.status === 'in_progress') {
        progressPercent = 50;
      }

      items.push({
        id: `task-${t.id}`,
        originalId: t.id,
        title: t.title,
        type: 'task',
        typeLabel: 'مهمة',
        assigneeId: t.assignedToId,
        assigneeName: assignee ? assignee.name : (t.assignedToId || 'غير محدد'),
        assigneeAvatar: assignee?.avatar,
        clientOrProjectName: t.clientName || t.relatedTo?.name || t.category || 'مشروع داخلي',
        priority: t.priority,
        createdAt: t.createdAt,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        status: queueStatus,
        statusLabel,
        progressPercent,
        notes: t.description || t.delayReason,
        source: t.meetingId ? 'اجتماع' : t.callId ? 'مكالمة' : 'مهمة',
        rawObject: t,
        isOverdue,
        isDueToday,
        overdueDays: isOverdue ? Math.abs(dateStatus.diffDays) : undefined,
        needsIntervention,
        interventionReason,
        isPendingApproval: t.reviewOutcome === 'under_review' || t.status === 'review'
      });
    });

    // 2. Meetings (Scheduled / Upcoming / Today - Excluding demo meetings)
    meetings.forEach(m => {
      if (isDemoWorkItem(m.id, m.title, m.clientName || m.companyName)) return;

      const dateStatus = evaluateDateStatus(m.date);
      const isCompleted = m.status === 'مكتمل' || m.status === 'completed';
      const isCancelled = m.status === 'ملغي' || m.status === 'cancelled';
      if (isCancelled) return;

      const host = team.find(t => t.id === m.hostId);
      const isOverdue = !isCompleted && dateStatus.isOverdue;
      const isDueToday = !isCompleted && dateStatus.isDueToday;

      items.push({
        id: `meeting-${m.id}`,
        originalId: m.id,
        title: m.title,
        type: 'meeting',
        typeLabel: 'اجتماع',
        assigneeId: m.hostId || m.attendees?.[0] || 'user-1',
        assigneeName: host ? host.name : (m.hostName || 'فريق الاجتماعات'),
        assigneeAvatar: host?.avatar,
        clientOrProjectName: m.clientName || m.companyName || m.location || 'داخلي',
        priority: m.isVip ? 'urgent' : isDueToday ? 'high' : 'medium',
        createdAt: m.createdAt || m.date,
        dueDate: m.date,
        dueTime: m.time || m.startTime,
        status: isCompleted ? 'completed' : isDueToday ? 'in_progress' : 'new',
        statusLabel: isCompleted ? 'تم الاجتماع' : isDueToday ? 'اليوم' : 'مجدول',
        progressPercent: isCompleted ? 100 : 25,
        notes: m.summary || m.agenda ? (typeof m.agenda === 'string' ? m.agenda : (m.agenda || []).join(' - ')) : undefined,
        source: 'اجتماع',
        rawObject: m,
        isOverdue,
        isDueToday,
        overdueDays: isOverdue ? Math.abs(dateStatus.diffDays) : undefined,
        needsIntervention: !isCompleted && isOverdue,
        interventionReason: !isCompleted && isOverdue ? 'فات موعد الاجتماع دون تسجيل النتائج' : undefined
      });
    });

    // 3. Calls needing follow-up (Excluding demo calls)
    calls.forEach(c => {
      if (isDemoWorkItem(c.id, c.clientName, c.companyName || c.purpose)) return;

      const callDateStatus = evaluateDateStatus(c.nextFollowUpDate || c.date);
      const caller = team.find(t => t.id === c.employeeId);
      const isDone = c.outcome === 'deal_agreed' || c.outcome === 'agreed' || (c.outcome === 'connected' && !c.nextFollowUpDate);
      const isOverdue = !isDone && callDateStatus.isOverdue;
      const isDueToday = !isDone && callDateStatus.isDueToday;

      items.push({
        id: `call-${c.id}`,
        originalId: c.id,
        title: `مكالمة: ${c.clientName} (${c.purpose || 'متابعة'})`,
        type: 'call',
        typeLabel: 'مكالمة',
        assigneeId: c.employeeId,
        assigneeName: caller ? caller.name : c.employeeName,
        assigneeAvatar: caller?.avatar || c.employeeAvatar,
        clientOrProjectName: c.clientName,
        priority: c.outcome === 'needs_follow_up' ? 'high' : 'medium',
        createdAt: c.date,
        dueDate: c.nextFollowUpDate || c.date,
        dueTime: c.nextFollowUpTime || c.time,
        status: isDone ? 'completed' : c.nextFollowUpDate ? 'waiting' : 'new',
        statusLabel: isDone ? 'تم التواصل' : c.nextFollowUpDate ? 'بانتظار المتابعة' : 'مطلوب اتصال',
        progressPercent: isDone ? 100 : 40,
        notes: c.summary || c.followUpNotes,
        source: 'مكالمة',
        rawObject: c,
        isOverdue,
        isDueToday,
        overdueDays: isOverdue ? Math.abs(callDateStatus.diffDays) : undefined,
        needsIntervention: isOverdue,
        interventionReason: isOverdue ? 'مكالمة متابعة متأخرة' : undefined
      });
    });

    // 4. Leads requiring action (Excluding demo leads)
    leads.forEach(l => {
      if (isDemoWorkItem(l.id, l.name, l.company)) return;
      if (l.isConvertedToClient || l.status === 'غير مؤهل' || l.status === 'صفقة ناجحة (Won)') return;

      const dateStatus = evaluateDateStatus(l.followUpDate || l.createdAt);
      const rep = team.find(t => t.id === l.assignedToId);
      const isNew = l.status === 'جديد';
      const isOverdue = Boolean(l.followUpDate) && dateStatus.isOverdue;
      const isDueToday = Boolean(l.followUpDate) && dateStatus.isDueToday;

      items.push({
        id: `lead-${l.id}`,
        originalId: l.id,
        title: `عميل محتمل: ${l.name} (${l.company || 'شركة'})`,
        type: 'lead',
        typeLabel: 'عميل محتمل',
        assigneeId: l.assignedToId,
        assigneeName: rep ? rep.name : 'فريق المبيعات',
        assigneeAvatar: rep?.avatar,
        clientOrProjectName: l.company || l.name,
        priority: isNew || l.leadScore >= 80 ? 'urgent' : 'high',
        createdAt: l.createdAt,
        dueDate: l.followUpDate || l.createdAt,
        dueTime: l.followUpTime,
        status: isNew ? 'new' : 'in_progress',
        statusLabel: l.status,
        progressPercent: l.status === 'مهتم' ? 60 : l.status === 'مؤهل' ? 80 : 20,
        notes: l.notes || l.detailedDescription,
        source: 'عميل',
        rawObject: l,
        isOverdue,
        isDueToday,
        overdueDays: isOverdue ? Math.abs(dateStatus.diffDays) : undefined,
        needsIntervention: isNew || isOverdue,
        interventionReason: isNew ? 'عميل جديد لم يتم التواصل معه بعد' : isOverdue ? 'موعد متابعة العميل متأخر' : undefined
      });
    });

    // 5. Deals in negotiation / awaiting approval (Excluding demo deals)
    deals.forEach(d => {
      if (isDemoWorkItem(d.id, d.title, d.company)) return;
      if (d.stage === 'مغلقة ناجحة' || d.stage === 'ملغاة') return;

      const dateStatus = evaluateDateStatus(d.expectedCloseDate);
      const rep = team.find(t => t.id === d.assignedToId);
      const isOverdue = dateStatus.isOverdue;
      const isDueToday = dateStatus.isDueToday;
      const isAwaitingApproval = d.stage === 'عرض سعر' || d.stage === 'تفاوض';

      items.push({
        id: `deal-${d.id}`,
        originalId: d.id,
        title: `صفقة: ${d.title} (${d.value.toLocaleString('ar-EG')} ${d.currency})`,
        type: 'deal',
        typeLabel: 'صفقة مبيعات',
        assigneeId: d.assignedToId,
        assigneeName: rep ? rep.name : 'فريق المبيعات',
        assigneeAvatar: rep?.avatar,
        clientOrProjectName: d.company || d.contactName,
        priority: d.value >= 50000 ? 'urgent' : 'high',
        createdAt: d.createdAt,
        dueDate: d.expectedCloseDate,
        status: isAwaitingApproval ? 'waiting' : 'in_progress',
        statusLabel: d.stage,
        progressPercent: d.probability || 50,
        notes: d.notes,
        source: 'صفقة',
        rawObject: d,
        isOverdue,
        isDueToday,
        overdueDays: isOverdue ? Math.abs(dateStatus.diffDays) : undefined,
        needsIntervention: isOverdue,
        interventionReason: isOverdue ? 'صفقة تجاوزت الموعد المتوقع للإغلاق' : undefined
      });
    });

    // Sort: Urgent & overdue first, then due today, then by dueDate ascending
    return items.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isDueToday && !b.isDueToday) return -1;
      if (!a.isDueToday && b.isDueToday) return 1;
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, meetings, calls, leads, deals, team, isManager]);

  // Role filtering: non-manager employees only see items assigned to them or their scope
  const userQueueItems = useMemo(() => {
    if (isManager) return allUnifiedItems;
    return allUnifiedItems.filter(item => {
      if (item.assigneeId === currentUser?.id) return true;
      if (item.rawObject && typeof isTaskAssignedToUser === 'function') {
        if (item.type === 'task') {
          return isTaskAssignedToUser(item.rawObject, currentUser) || isUserMentionedInTask(item.rawObject, currentUser);
        }
      }
      return false;
    });
  }, [allUnifiedItems, isManager, currentUser]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = userQueueItems.length;
    const overdue = userQueueItems.filter(i => i.isOverdue && i.status !== 'completed').length;
    const completed = userQueueItems.filter(i => i.status === 'completed').length;
    const inProgress = userQueueItems.filter(i => i.status === 'in_progress' || i.status === 'new').length;
    const waiting = userQueueItems.filter(i => i.status === 'waiting' || i.status === 'stalled' || i.isPendingApproval).length;
    const needsIntervention = userQueueItems.filter(i => i.needsIntervention && i.status !== 'completed').length;

    return {
      total,
      overdue,
      completed,
      inProgress,
      waiting,
      needsIntervention
    };
  }, [userQueueItems]);

  // Filter items based on active section and selected filters
  const filteredItems = useMemo(() => {
    return userQueueItems.filter(item => {
      // 1. Section filtering
      if (activeSection === 'tasks' && item.type !== 'task') return false;
      if (activeSection === 'meetings_calls' && item.type !== 'meeting' && item.type !== 'call') return false;
      if (activeSection === 'clients_deals' && item.type !== 'lead' && item.type !== 'deal') return false;
      if (activeSection === 'intervention') {
        if (!item.needsIntervention || item.status === 'completed') return false;
      }

      // 2. Priority / Timing Filter
      if (priorityFilter === 'urgent') {
        if (!item.isOverdue && item.priority !== 'urgent') return false;
      } else if (priorityFilter === 'today') {
        if (!item.isDueToday) return false;
      } else if (priorityFilter === 'upcoming') {
        if (item.isOverdue || item.isDueToday || item.status === 'completed') return false;
      } else if (priorityFilter === 'waiting') {
        if (item.status !== 'waiting' && item.status !== 'stalled' && !item.isPendingApproval) return false;
      }

      // 3. Type Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // 4. Team Member Filter
      if (memberFilter !== 'all' && item.assigneeId !== memberFilter) return false;

      // 5. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAssignee = item.assigneeName.toLowerCase().includes(q);
        const matchClient = (item.clientOrProjectName || '').toLowerCase().includes(q);
        const matchNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchAssignee && !matchClient && !matchNotes) return false;
      }

      return true;
    });
  }, [userQueueItems, activeSection, priorityFilter, typeFilter, memberFilter, searchQuery]);

  // Executive workload calculation for manager
  const workloadByMember = useMemo(() => {
    const map = new Map<string, { member: TeamMember; total: number; overdue: number; completed: number; stalled: number }>();

    team.forEach(m => {
      map.set(m.id, { member: m, total: 0, overdue: 0, completed: 0, stalled: 0 });
    });

    allUnifiedItems.forEach(item => {
      const entry = map.get(item.assigneeId);
      if (entry) {
        entry.total += 1;
        if (item.status === 'completed') entry.completed += 1;
        else if (item.isOverdue) entry.overdue += 1;
        else if (item.status === 'stalled') entry.stalled += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [team, allUnifiedItems]);

  // Convert communication to task handler
  const handleOpenConvertModal = (
    type: 'meeting' | 'call' | 'lead' | 'deal',
    title: string,
    id: string,
    clientId?: string,
    clientName?: string,
    defaultAssigneeId?: string
  ) => {
    setConvertModalData({
      isOpen: true,
      sourceType: type,
      sourceTitle: title,
      sourceId: id,
      clientId,
      clientName,
      defaultAssigneeId: defaultAssigneeId || currentUser?.id || 'user-1'
    });
    setNewConvertedTaskTitle(`متابعة: ${title}`);
    setNewConvertedTaskDesc(`مهمة مكلفة تلقائياً من ${type === 'meeting' ? 'نتائج الاجتماع' : type === 'call' ? 'مكالمة هاتفية' : 'بيانات العميل'}`);
    setNewConvertedTaskAssignee(defaultAssigneeId || currentUser?.id || 'user-1');
  };

  const handleExecuteConvert = () => {
    if (!newConvertedTaskTitle.trim()) return;

    createTaskFromActionItem({
      title: newConvertedTaskTitle.trim(),
      description: newConvertedTaskDesc.trim(),
      assignedToId: newConvertedTaskAssignee,
      dueDate: newConvertedTaskDueDate,
      priority: newConvertedTaskPriority,
      category: 'مبيعات',
      clientId: convertModalData.clientId,
      clientName: convertModalData.clientName,
      meetingId: convertModalData.sourceType === 'meeting' ? convertModalData.sourceId : undefined,
      callId: convertModalData.sourceType === 'call' ? convertModalData.sourceId : undefined
    });

    setConvertModalData(prev => ({ ...prev, isOpen: false }));
  };

  // Quick Action: Complete an item
  const handleToggleCompleteItem = (item: WorkQueueItem) => {
    if (item.type === 'task') {
      const newStatus = item.status === 'completed' ? 'in_progress' : 'completed';
      changeTaskStatus(item.originalId, newStatus as TaskStatus);
    } else if (item.type === 'meeting') {
      updateMeeting(item.originalId, {
        status: item.status === 'completed' ? 'قادم' : 'مكتمل'
      });
    } else if (item.type === 'call') {
      updateCallLog(item.originalId, {
        outcome: item.status === 'completed' ? 'needs_follow_up' : 'connected'
      });
    }
  };

  // Quick Action: Approve a task
  const handleApproveTask = (taskId: string) => {
    updateTask(taskId, {
      reviewOutcome: 'approved',
      status: 'completed',
      actualCompletionDate: new Date().toISOString().split('T')[0]
    });
  };

  // Quick Action: Request revisions on a task
  const handleRequestRevisions = (taskId: string) => {
    const reason = prompt('يرجى كتابة ملاحظات التعديل المطلوب من الموظف:');
    if (reason) {
      updateTask(taskId, {
        reviewOutcome: 'revisions_requested',
        delayReason: reason,
        status: 'in_progress'
      });
    }
  };

  // Create manual work item
  const handleCreateManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    addTask({
      title: manualTitle.trim(),
      description: manualNotes.trim() || 'تمت الإضافة من قائمة انتظار العمل',
      assignedToId: manualAssignee,
      priority: manualPriority,
      status: 'todo',
      dueDate: manualDueDate,
      category: 'إداري',
      subtasks: [],
      timeLogs: [],
      clientName: manualClientProject
    });

    setManualTitle('');
    setManualNotes('');
    setManualClientProject('');
    setIsAddWorkModalOpen(false);
  };

  return (
    <div className="w-full space-y-4 pb-12 select-none" dir="rtl">
      {/* 1. Header Banner & Title */}
      <div className="bg-gradient-to-r from-[#182642] via-[#1e3256] to-[#243c68] text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 shadow-inner shrink-0">
            <Inbox className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                قائمة انتظار العمل (Work Queue)
              </h1>
              <span className="bg-orange-500/30 text-orange-300 border border-orange-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold font-mono">
                {metrics.total} عمل
              </span>
              {metrics.overdue > 0 && (
                <span className="bg-rose-500/30 text-rose-300 border border-rose-400/50 text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {metrics.overdue} متأخرة
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              مركز المتابعة والتشغيل الموحد لمهام واجتماعات ومكالمات ومتابعات الفريق والعملاء.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
          <button
            onClick={() => setIsAddWorkModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عمل جديد</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (5 Cards as proposed) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {/* Card 1: إجمالي الأعمال */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('overview');
            setPriorityFilter('all');
          }}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden touch-manipulation active:scale-98 ${
            activeSection === 'overview' && priorityFilter === 'all'
              ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">إجمالي الأعمال</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-slate-800 mt-1.5 sm:mt-2 font-mono">
            {metrics.total}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">كافة الأعمال والمهام</div>
        </button>

        {/* Card 2: متأخرة */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('intervention');
            setPriorityFilter('urgent');
          }}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden touch-manipulation active:scale-98 ${
            priorityFilter === 'urgent'
              ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-rose-600">متأخرة</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-rose-600 mt-1.5 sm:mt-2 font-mono">
            {metrics.overdue}
          </div>
          <div className="text-[10px] sm:text-[11px] text-rose-600/80 mt-0.5 font-semibold truncate">تجاوزت الاستحقاق</div>
        </button>

        {/* Card 3: قيد التنفيذ */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('overview');
            setPriorityFilter('all');
          }}
          className="p-2.5 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs text-right transition-all cursor-pointer touch-manipulation active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-amber-600">قيد التنفيذ</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-600 mt-1.5 sm:mt-2 font-mono">
            {metrics.inProgress}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">جاري العمل عليها</div>
        </button>

        {/* Card 4: بانتظار رد / اعتماد */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('intervention');
            setPriorityFilter('waiting');
          }}
          className={`p-2.5 sm:p-3.5 rounded-xl border text-right transition-all cursor-pointer touch-manipulation active:scale-98 ${
            priorityFilter === 'waiting'
              ? 'bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-purple-600">بانتظار رد</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-purple-600 mt-1.5 sm:mt-2 font-mono">
            {metrics.waiting}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">متوقفة على موافقة</div>
        </button>

        {/* Card 5: مكتملة (Spans 2 columns on mobile for balanced layout) */}
        <button
          type="button"
          onClick={() => {
            setActiveSection('overview');
            setPriorityFilter('all');
          }}
          className="col-span-2 sm:col-span-1 p-2.5 sm:p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs text-right transition-all cursor-pointer touch-manipulation active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600">مكتملة</span>
            <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-600 mt-1.5 sm:mt-2 font-mono">
            {metrics.completed}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">تم إنجازها بنجاح</div>
        </button>
      </div>

      {/* 3. Main Navigation Sub-Tabs (The 5 Sections + Manager Dashboard) */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {/* Section 1: نظرة عامة */}
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
              activeSection === 'overview'
                ? 'bg-[#182642] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>نظرة عامة</span>
            <span className="text-[10px] bg-slate-200/50 px-1.5 py-0.2 rounded-full font-mono">
              {metrics.total}
            </span>
          </button>

          {/* Section 2: المهام */}
          <button
            type="button"
            onClick={() => setActiveSection('tasks')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
              activeSection === 'tasks'
                ? 'bg-[#182642] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>المهام اليومية والمشروعات</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {tasks.filter(t => t.status !== 'completed').length}
            </span>
          </button>

          {/* Section 3: الاجتماعات والمكالمات */}
          <button
            type="button"
            onClick={() => setActiveSection('meetings_calls')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
              activeSection === 'meetings_calls'
                ? 'bg-[#182642] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>الاجتماعات والمكالمات</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {meetings.length + calls.length}
            </span>
          </button>

          {/* Section 4: متابعة العملاء والصفقات */}
          <button
            type="button"
            onClick={() => setActiveSection('clients_deals')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
              activeSection === 'clients_deals'
                ? 'bg-[#182642] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>متابعة العملاء والصفقات</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-mono font-bold">
              {leads.filter(l => !l.isConvertedToClient).length + deals.filter(d => d.stage !== 'مغلقة ناجحة').length}
            </span>
          </button>

          {/* Section 5: الأعمال التي تحتاج تدخل */}
          <button
            type="button"
            onClick={() => setActiveSection('intervention')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
              activeSection === 'intervention'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تحتاج تدخل واعتمادات</span>
            {metrics.needsIntervention > 0 && (
              <span className="text-[10px] bg-rose-900 text-rose-100 px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                {metrics.needsIntervention}
              </span>
            )}
          </button>

          {/* Section 6: لوحة المدير (خاصة بالمدير) */}
          {isManager && (
            <button
              type="button"
              onClick={() => setActiveSection('manager_metrics')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 ${
                activeSection === 'manager_metrics'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>لوحة المدير وتوزيع الأحمال</span>
            </button>
          )}
        </div>

        {/* View Mode Toggle: Cards vs Table */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="عرض البطاقات"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="عرض الجدول المفصل"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Filter Toolbar: Timing pills + Member + Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Timing & Priority Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">التصنيف:</span>

            <button
              type="button"
              onClick={() => setPriorityFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                priorityFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({userQueueItems.length})
            </button>

            <button
              type="button"
              onClick={() => setPriorityFilter('urgent')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 touch-manipulation active:scale-95 ${
                priorityFilter === 'urgent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>متأخرة وعاجلة ({metrics.overdue})</span>
            </button>

            <button
              type="button"
              onClick={() => setPriorityFilter('today')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 touch-manipulation active:scale-95 ${
                priorityFilter === 'today'
                  ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>مطلوب اليوم ({userQueueItems.filter(i => i.isDueToday).length})</span>
            </button>

            <button
              type="button"
              onClick={() => setPriorityFilter('waiting')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 touch-manipulation active:scale-95 ${
                priorityFilter === 'waiting'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>بانتظار رد / اعتماد ({metrics.waiting})</span>
            </button>

            <button
              type="button"
              onClick={() => setPriorityFilter('upcoming')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95 ${
                priorityFilter === 'upcoming'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              القادمة ({userQueueItems.filter(i => !i.isOverdue && !i.isDueToday && i.status !== 'completed').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في قائمة الانتظار..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filters: Type & Team Member */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500">نوع العمل:</span>
            {(['all', 'task', 'meeting', 'call', 'lead', 'deal'] as const).map(t => {
              const labels: Record<string, string> = {
                all: 'جميع الأنواع',
                task: 'مهام',
                meeting: 'اجتماعات',
                call: 'مكالمات',
                lead: 'عملاء محتملون',
                deal: 'صفقات'
              };
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    typeFilter === t
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>

          {/* Member Filter (for manager or filtering assignments) */}
          {isManager && (
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">المسؤول:</span>
              <select
                value={memberFilter}
                onChange={e => setMemberFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">كل أعضاء الفريق ({team.length})</option>
                {team.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.employeeCode || m.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 5. Special View: Manager Workload & Intervention Center */}
      {activeSection === 'manager_metrics' && isManager && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>لوحة متابعة المدير وتوزيع حجم العمل</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                توزيع المهام والأعمال على الموظفين، نسب الإنجاز، المتأخرات، ومراقبة الاختناقات.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('intervention')}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>عرض الأعمال المتوقفة والمشكلات ({metrics.needsIntervention})</span>
            </button>
          </div>

          {/* Grid of Team Members Workload */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {workloadByMember.map(({ member, total, overdue, completed, stalled }) => {
              const activeCount = total - completed;
              const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-xl border transition-all ${
                    overdue > 0
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full border border-slate-300 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{member.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{member.role}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMemberFilter(member.id);
                        setActiveSection('overview');
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                      title="عرض أعمال هذا الموظف فقط"
                    >
                      تصفية
                    </button>
                  </div>

                  {/* Counters */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-1.5 rounded">
                      <div className="text-[10px] text-slate-500">الإجمالي</div>
                      <div className="font-bold text-slate-800 text-xs font-mono">{total}</div>
                    </div>
                    <div className="bg-amber-50 p-1.5 rounded">
                      <div className="text-[10px] text-amber-700">نشط</div>
                      <div className="font-bold text-amber-800 text-xs font-mono">{activeCount}</div>
                    </div>
                    <div className={`p-1.5 rounded ${overdue > 0 ? 'bg-rose-100 text-rose-900' : 'bg-slate-50'}`}>
                      <div className="text-[10px] text-rose-700">متأخر</div>
                      <div className="font-bold text-rose-800 text-xs font-mono">{overdue}</div>
                    </div>
                    <div className="bg-emerald-50 p-1.5 rounded">
                      <div className="text-[10px] text-emerald-700">مكتمل</div>
                      <div className="font-bold text-emerald-800 text-xs font-mono">{completed}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>نسبة الإنجاز</span>
                      <span className="font-bold font-mono">{completionRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          overdue > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Main List Area: Cards vs Table View */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد أعمال تطابق الفلاتر المحددة</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            جميع الأعمال في هذه الفئة منجزة أو لا توجد عناصر حالياً. يمكنك تغيير الفلاتر أو إضافة عمل جديد للقائمة.
          </p>
          <button
            onClick={() => {
              setPriorityFilter('all');
              setTypeFilter('all');
              setMemberFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة ضبط جميع الفلاتر</span>
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* ================= CARDS VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map(item => {
            const isCompleted = item.status === 'completed';
            const isOverdue = item.isOverdue && !isCompleted;
            const isToday = item.isDueToday && !isCompleted;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : isOverdue
                    ? 'bg-rose-50/30 border-rose-300 shadow-xs ring-1 ring-rose-200'
                    : isToday
                    ? 'bg-amber-50/30 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Card Top: Badges & Due Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    {/* Type Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                        item.type === 'task'
                          ? 'bg-blue-100 text-blue-700'
                          : item.type === 'meeting'
                          ? 'bg-purple-100 text-purple-700'
                          : item.type === 'call'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.type === 'lead'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {item.type === 'task' && <CheckCircle2 className="w-3 h-3" />}
                      {item.type === 'meeting' && <Calendar className="w-3 h-3" />}
                      {item.type === 'call' && <PhoneCall className="w-3 h-3" />}
                      {item.type === 'lead' && <Users className="w-3 h-3" />}
                      {item.type === 'deal' && <Briefcase className="w-3 h-3" />}
                      <span>{item.typeLabel}</span>
                    </span>

                    {/* Deadline status badge */}
                    {isOverdue ? (
                      <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Flame className="w-3 h-3" />
                        <span>متأخرة {item.overdueDays ? `${item.overdueDays} يوم` : ''}</span>
                      </span>
                    ) : isToday ? (
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>مطلوب اليوم</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>مكتمل</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.dueDate}
                      </span>
                    )}
                  </div>

                  {/* Card Title */}
                  <h4
                    className={`font-bold text-sm leading-snug line-clamp-2 ${
                      isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {item.title}
                  </h4>

                  {/* Client / Project & Notes */}
                  {item.clientOrProjectName && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1.5 truncate">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.clientOrProjectName}</span>
                    </div>
                  )}

                  {/* Intervention reason alert */}
                  {item.needsIntervention && item.interventionReason && !isCompleted && (
                    <div className="mt-2 p-1.5 rounded-lg bg-rose-100/70 border border-rose-200 text-rose-800 text-[10px] font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">{item.interventionReason}</span>
                    </div>
                  )}

                  {/* Notes snippet */}
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Assignee, Priority, Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Assignee */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.assigneeAvatar ? (
                        <img
                          src={item.assigneeAvatar}
                          alt={item.assigneeName}
                          className="w-5 h-5 rounded-full border border-slate-300 object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {item.assigneeName.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs text-slate-700 font-medium truncate">
                        {item.assigneeName}
                      </span>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700 font-black'
                          : item.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : item.priority === 'medium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.priority === 'urgent'
                        ? 'عاجل'
                        : item.priority === 'high'
                        ? 'عالية'
                        : item.priority === 'medium'
                        ? 'متوسطة'
                        : 'منخفضة'}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {/* Complete button */}
                    <button
                      type="button"
                      onClick={() => handleToggleCompleteItem(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer touch-manipulation active:scale-95 ${
                        isCompleted
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'إعادة فتح' : 'إتمام'}</span>
                    </button>

                    {/* Convert Meeting / Call to Task */}
                    {(item.type === 'meeting' || item.type === 'call') && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenConvertModal(
                            item.type as 'meeting' | 'call',
                            item.title,
                            item.originalId,
                            item.rawObject?.clientId,
                            item.rawObject?.clientName,
                            item.assigneeId
                          )
                        }
                        className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all touch-manipulation active:scale-95"
                        title="إنشاء مهمة عمل من مخرجات التواصل"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>تحويل لمهمة</span>
                      </button>
                    )}

                    {/* Approval buttons for Manager if pending approval */}
                    {isManager && item.isPendingApproval && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApproveTask(item.originalId)}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          title="اعتماد المهمة"
                        >
                          اعتماد ✅
                        </button>
                        <button
                          onClick={() => handleRequestRevisions(item.originalId)}
                          className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[11px] font-bold cursor-pointer transition-colors"
                          title="طلب تعديل"
                        >
                          تعديل 🔄
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">عنوان العمل</th>
                  <th className="py-3 px-3">النوع</th>
                  <th className="py-3 px-3">المسؤول</th>
                  <th className="py-3 px-3">العميل / المشروع</th>
                  <th className="py-3 px-3">الأولوية</th>
                  <th className="py-3 px-3">الموعد</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const isCompleted = item.status === 'completed';
                  const isOverdue = item.isOverdue && !isCompleted;
                  const isToday = item.isDueToday && !isCompleted;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? 'bg-rose-50/20' : isToday ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                        {item.interventionReason && !isCompleted && (
                          <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                            ⚠️ {item.interventionReason}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                          {item.typeLabel}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {item.assigneeAvatar ? (
                            <img
                              src={item.assigneeAvatar}
                              alt={item.assigneeName}
                              className="w-5 h-5 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] flex items-center justify-center font-bold">
                              {item.assigneeName.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-slate-800 truncate">{item.assigneeName}</span>
                        </div>
                      </td>

                      {/* Client / Project */}
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[150px]">
                        {item.clientOrProjectName || '-'}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-700 font-black'
                              : item.priority === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : item.priority === 'medium'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.priority === 'urgent' ? 'عاجل' : item.priority === 'high' ? 'عالية' : 'متوسطة'}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-3 font-mono">
                        {isOverdue ? (
                          <span className="text-rose-600 font-bold">
                            {item.dueDate} (متأخرة)
                          </span>
                        ) : isToday ? (
                          <span className="text-amber-700 font-bold">
                            اليوم {item.dueTime ? `(${item.dueTime})` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-600">{item.dueDate}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'waiting'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleCompleteItem(item)}
                            className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              isCompleted
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                            title={isCompleted ? 'إعادة فتح' : 'إتمام'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          {(item.type === 'meeting' || item.type === 'call') && (
                            <button
                              onClick={() =>
                                handleOpenConvertModal(
                                  item.type as 'meeting' | 'call',
                                  item.title,
                                  item.originalId,
                                  item.rawObject?.clientId,
                                  item.rawObject?.clientName,
                                  item.assigneeId
                                )
                              }
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                              title="تحويل لمهمة"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
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
      )}

      {/* ================= MODAL: إضافة عمل جديد للقائمة ================= */}
      {isAddWorkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>إضافة عمل جديد لقائمة انتظار العمل</span>
              </h3>
              <button
                onClick={() => setIsAddWorkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualItem} className="space-y-3.5 mt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان العمل المطلوب *</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="مثال: إعداد ومراجعة عرض السعر للعميل الجديد..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسؤول المكلف *</label>
                  <select
                    value={manualAssignee}
                    onChange={e => setManualAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {team.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأولوية *</label>
                  <select
                    value={manualPriority}
                    onChange={e => setManualPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="urgent">عاجل جداً</option>
                    <option value="high">أولوية عالية</option>
                    <option value="medium">أولوية متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">العميل / المشروع المرتبط</label>
                  <input
                    type="text"
                    value={manualClientProject}
                    onChange={e => setManualClientProject(e.target.value)}
                    placeholder="اسم العميل أو اسم المشروع"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق *</label>
                  <input
                    type="date"
                    required
                    value={manualDueDate}
                    onChange={e => setManualDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الملاحظات والتفاصيل</label>
                <textarea
                  rows={3}
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  placeholder="اكتب التوجيهات والتفاصيل المطلوبة..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWorkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer"
                >
                  حفظ العمل بالقائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: تحويل التواصل إلى مهمة ================= */}
      {convertModalData.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>تحويل نتيجة التواصل إلى مهمة عمل</span>
              </h3>
              <button
                onClick={() => setConvertModalData(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 my-3 text-xs text-amber-900 leading-relaxed">
              <strong>مصدر التواصل:</strong> {convertModalData.sourceTitle}
              <div className="text-[11px] text-amber-800 mt-1">
                سيتم إنشاء مهمة مكلفة مباشرة للموظف مع ربطها بالسجل الأصلي وإضافتها في بورد المهام وقائمة انتظار العمل.
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان المهمة الناتجة *</label>
                <input
                  type="text"
                  value={newConvertedTaskTitle}
                  onChange={e => setNewConvertedTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف المكلف بالتنفيذ *</label>
                <select
                  value={newConvertedTaskAssignee}
                  onChange={e => setNewConvertedTaskAssignee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {team.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق *</label>
                  <input
                    type="date"
                    value={newConvertedTaskDueDate}
                    onChange={e => setNewConvertedTaskDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأولوية</label>
                  <select
                    value={newConvertedTaskPriority}
                    onChange={e => setNewConvertedTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="urgent">عاجل</option>
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التفاصيل والقرارات</label>
                <textarea
                  rows={2}
                  value={newConvertedTaskDesc}
                  onChange={e => setNewConvertedTaskDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConvertModalData(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleExecuteConvert}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>إنشاء المهمة وتكليف الموظف</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
