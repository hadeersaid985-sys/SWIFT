import React, { useState, useMemo } from 'react';
import {
  ListFilter,
  CheckSquare,
  Calendar,
  PhoneCall,
  Layout,
  Users,
  Briefcase,
  Megaphone,
  UserCheck,
  Plus,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  FolderClock,
  ArrowUpRight
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser } from '../../context/CRMContext';
import { Task, Lead, Deal, Meeting } from '../../types/crm';

// Work Queue Item interface that unifies activities for the queue view
export interface WorkQueueItem {
  id: string;
  type: 'task' | 'meeting' | 'call' | 'lead' | 'deal' | 'contact';
  subject: string;
  dueDateText: string;
  dueDateCategory: 'yesterday' | 'overdue_3' | 'overdue_2' | 'today' | 'tomorrow' | 'upcoming';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Scheduled';
  priority: 'Highest' | 'High' | 'Normal' | 'Low';
  relatedName?: string;
  assigneeName: string;
  assigneeAvatar?: string;
  isTimerRunning?: boolean;
  rawDate?: string;
}

export const WorkQueueView: React.FC = () => {
  const {
    tasks,
    team,
    currentUser,
    leads,
    deals,
    meetings,
    startTaskTimer,
    stopTaskTimer,
    changeTaskStatus,
    deleteTask,
    addTask,
    setActiveTab
  } = useCRM();

  // Active Category / Queue
  const [activeQueue, setActiveQueue] = useState<string>('tasks');
  // Top filter: 'all_open', 'today_overdue', 'today_only', 'overdue_only'
  const [timeFilter, setTimeFilter] = useState<'today_overdue' | 'today' | 'overdue' | 'all'>('today_overdue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Deletion States (إمكانية حذف العناصر المحددة من طابور العمل)
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('swiftmynd_deleted_queue_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    ids: string[];
    title: string;
    message: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3000);
  };

  // New item modal form state
  const [newItemSubject, setNewItemSubject] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'Highest' | 'High' | 'Normal' | 'Low'>('Normal');
  const [newItemDueDate, setNewItemDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Seed default queue items matching the user's screenshot
  const initialDefaultItems: WorkQueueItem[] = useMemo(() => [
    {
      id: 'wq-1',
      type: 'task',
      subject: 'Register for upcoming CRM Webinars',
      dueDateText: 'أمس',
      dueDateCategory: 'yesterday',
      status: 'Not Started',
      priority: 'Low',
      relatedName: 'SwiftMynd Marketing',
      assigneeName: 'هدير سعيد',
      assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'wq-2',
      type: 'task',
      subject: 'Competitor Comparison Document',
      dueDateText: 'متأخر لمدة 3 أيام',
      dueDateCategory: 'overdue_3',
      status: 'Not Started',
      priority: 'Highest',
      relatedName: 'Enterprise Client Service',
      assigneeName: 'أحمد الشريف',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'wq-3',
      type: 'task',
      subject: 'Get Approval from Manager',
      dueDateText: 'متأخر لمدة 2 أيام',
      dueDateCategory: 'overdue_2',
      status: 'Not Started',
      priority: 'Low',
      relatedName: 'Budget Approval Plan',
      assigneeName: 'سارة المنصوري',
      assigneeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'wq-4',
      type: 'task',
      subject: 'Get Approval from Manager',
      dueDateText: 'اليوم',
      dueDateCategory: 'today',
      status: 'In Progress',
      priority: 'Normal',
      relatedName: 'Sales Process Deal',
      assigneeName: 'طارق القحطاني',
      assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'wq-5',
      type: 'task',
      subject: 'Get Approval from Manager',
      dueDateText: 'اليوم',
      dueDateCategory: 'today',
      status: 'In Progress',
      priority: 'High',
      relatedName: 'Schedule Review',
      assigneeName: 'هدير سعيد',
      assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'wq-6',
      type: 'task',
      subject: 'Customize CRM to your needs',
      dueDateText: 'اليوم',
      dueDateCategory: 'today',
      status: 'In Progress',
      priority: 'Normal',
      relatedName: 'Platform Integration',
      assigneeName: 'هدير سعيد',
      assigneeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  ], []);

  const isManager =
    currentUser.accessLevel === 'admin' ||
    currentUser.accessLevel === 'manager' ||
    currentUser.id === 'user-1';

  // Map real CRM tasks into queue items
  const mappedCrmTasks: WorkQueueItem[] = useMemo(() => {
    return tasks
      .filter(t => {
        if (t.status === 'completed' && activeQueue !== 'completed') return false;
        if (!isManager && !isTaskAssignedToUser(t, currentUser)) return false;
        if (t.isPrivate && !isManager) return false;
        return true;
      })
      .map(t => {
        const assignee = team.find(m => m.id === t.assignedToId) || currentUser;
        const todayStr = new Date().toISOString().split('T')[0];
        let category: WorkQueueItem['dueDateCategory'] = 'upcoming';
        let text = t.dueDate || 'اليوم';

        if (t.dueDate === todayStr) {
          category = 'today';
          text = 'اليوم';
        } else if (t.dueDate < todayStr) {
          category = 'overdue_2';
          text = 'متأخر';
        }

        let pri: WorkQueueItem['priority'] = 'Normal';
        if (t.priority === 'urgent') pri = 'Highest';
        else if (t.priority === 'high') pri = 'High';
        else if (t.priority === 'low') pri = 'Low';

        return {
          id: t.id,
          type: 'task',
          subject: t.title,
          dueDateText: text,
          dueDateCategory: category,
          status: t.status === 'in_progress' ? 'In Progress' : 'Not Started',
          priority: pri,
          relatedName: t.category,
          assigneeName: assignee.name,
          assigneeAvatar: assignee.avatar,
          isTimerRunning: t.isTimerRunning,
          rawDate: t.dueDate
        };
      });
  }, [tasks, team, currentUser, activeQueue, isManager]);

  // Combined tasks queue
  const [customQueueItems, setCustomQueueItems] = useState<WorkQueueItem[]>([]);

  // Compute displayed list based on active queue tab
  const queueData = useMemo(() => {
    if (activeQueue === 'tasks') {
      // Merge initial screenshot tasks with CRM tasks (ensuring no duplicates)
      const combined = [
        ...(isManager ? initialDefaultItems : initialDefaultItems.filter(i => i.assigneeName === currentUser.name)),
        ...customQueueItems,
        ...mappedCrmTasks
      ];
      const seen = new Set<string>();
      return combined.filter(item => {
        if (deletedItemIds.includes(item.id)) return false;
        if (!isManager && item.assigneeName !== currentUser.name) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    }

    if (activeQueue === 'meetings') {
      return meetings.filter(m => !deletedItemIds.includes(m.id)).map(m => ({
        id: m.id,
        type: 'meeting' as const,
        subject: m.title,
        dueDateText: m.date || 'اليوم',
        dueDateCategory: (m.date === new Date().toISOString().split('T')[0] ? 'today' : 'upcoming') as WorkQueueItem['dueDateCategory'],
        status: (m.status === 'مكتمل' ? 'Completed' : 'Scheduled') as WorkQueueItem['status'],
        priority: 'High' as const,
        relatedName: m.attendees.join(', '),
        assigneeName: currentUser.name,
        assigneeAvatar: currentUser.avatar
      }));
    }

    if (activeQueue === 'calls') {
      return [
        {
          id: 'call-1',
          type: 'call' as const,
          subject: 'مكالمة متابعة عرض أسعار مع شركة المدار',
          dueDateText: 'اليوم',
          dueDateCategory: 'today' as const,
          status: 'Not Started' as const,
          priority: 'High' as const,
          relatedName: 'المدار القابضة',
          assigneeName: 'هدير سعيد',
          assigneeAvatar: currentUser.avatar
        }
      ].filter(c => !deletedItemIds.includes(c.id));
    }

    if (activeQueue === 'leads_my') {
      return leads.filter(l => !deletedItemIds.includes(l.id)).map(l => ({
        id: l.id,
        type: 'lead' as const,
        subject: `${l.name} - ${l.company}`,
        dueDateText: 'اليوم',
        dueDateCategory: 'today' as const,
        status: (l.status === 'مؤهل' ? 'In Progress' : 'Not Started') as WorkQueueItem['status'],
        priority: (l.status === 'تم التواصل' ? 'High' : 'Normal') as WorkQueueItem['priority'],
        relatedName: l.email,
        assigneeName: currentUser.name,
        assigneeAvatar: currentUser.avatar
      }));
    }

    if (activeQueue === 'deals_my') {
      return deals.filter(d => !deletedItemIds.includes(d.id)).map(d => ({
        id: d.id,
        type: 'deal' as const,
        subject: `${d.title} (${d.value.toLocaleString('ar-EG')} ر.س)`,
        dueDateText: d.expectedCloseDate || 'نهاية الشهر',
        dueDateCategory: 'upcoming' as const,
        status: (d.stage === 'مغلقة ناجحة' ? 'Completed' : 'In Progress') as WorkQueueItem['status'],
        priority: (d.value > 100000 ? 'Highest' : 'Normal') as WorkQueueItem['priority'],
        relatedName: d.company || d.contactName,
        assigneeName: currentUser.name,
        assigneeAvatar: currentUser.avatar
      }));
    }

    if (activeQueue === 'contacts_my') {
      return leads.slice(0, 10).map((l, idx) => ({
        id: `contact-${idx}`,
        type: 'contact' as const,
        subject: `${l.name} - مسؤول مشتريات`,
        dueDateText: 'اليوم',
        dueDateCategory: 'today' as const,
        status: 'In Progress' as const,
        priority: 'Normal' as const,
        relatedName: l.phone,
        assigneeName: currentUser.name,
        assigneeAvatar: currentUser.avatar
      })).filter(c => !deletedItemIds.includes(c.id));
    }

    return [];
  }, [activeQueue, initialDefaultItems, customQueueItems, mappedCrmTasks, meetings, leads, deals, currentUser, deletedItemIds]);

  // Filter queueData by timeFilter and search
  const filteredQueue = useMemo(() => {
    return queueData.filter(item => {
      // Time filter
      if (timeFilter === 'today_overdue') {
        const isMatch = ['yesterday', 'overdue_3', 'overdue_2', 'today'].includes(item.dueDateCategory);
        if (!isMatch) return false;
      } else if (timeFilter === 'today') {
        if (item.dueDateCategory !== 'today') return false;
      } else if (timeFilter === 'overdue') {
        if (!['yesterday', 'overdue_3', 'overdue_2'].includes(item.dueDateCategory)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.subject.toLowerCase().includes(q) ||
          item.assigneeName.toLowerCase().includes(q) ||
          (item.relatedName && item.relatedName.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [queueData, timeFilter, searchQuery]);

  // Handle refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Toggle item status
  const handleToggleStatus = (item: WorkQueueItem) => {
    if (item.type === 'task') {
      const realTask = tasks.find(t => t.id === item.id);
      if (realTask) {
        changeTaskStatus(item.id, realTask.status === 'completed' ? 'in_progress' : 'completed');
      } else {
        // Update local item
        setCustomQueueItems(prev => {
          const exists = prev.find(x => x.id === item.id);
          const nextStatus = item.status === 'Completed' ? 'In Progress' : 'Completed';
          if (exists) {
            return prev.map(x => x.id === item.id ? { ...x, status: nextStatus } : x);
          }
          return [...prev, { ...item, status: nextStatus }];
        });
      }
    }
  };

  // Add new item to queue
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemSubject.trim()) return;

    // Add to CRM tasks as well so it's persisted and linked everywhere
    addTask({
      title: newItemSubject,
      description: 'مهمة مضافة عبر قائمة انتظار العمل (Work Queue)',
      assignedToId: currentUser.id,
      priority: newItemPriority === 'Highest' ? 'urgent' : newItemPriority === 'High' ? 'high' : 'medium',
      status: 'todo',
      dueDate: newItemDueDate,
      category: 'إداري',
      subtasks: [],
      timeLogs: []
    });

    const newItem: WorkQueueItem = {
      id: 'wq-' + Date.now(),
      type: 'task',
      subject: newItemSubject,
      dueDateText: newItemDueDate === new Date().toISOString().split('T')[0] ? 'اليوم' : newItemDueDate,
      dueDateCategory: newItemDueDate === new Date().toISOString().split('T')[0] ? 'today' : 'upcoming',
      status: 'Not Started',
      priority: newItemPriority,
      relatedName: 'قائمة الانتظار',
      assigneeName: currentUser.name,
      assigneeAvatar: currentUser.avatar
    };

    setCustomQueueItems(prev => [newItem, ...prev]);
    setNewItemSubject('');
    setShowAddModal(false);
  };

  // Select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredQueue.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Deletion operations (حذف المهام المحددة من قائمة الانتظار)
  const executeDeleteItems = (idsToDelete: string[]) => {
    if (!idsToDelete || idsToDelete.length === 0) return;

    // 1. Delete matching tasks from CRMContext if any
    idsToDelete.forEach(id => {
      deleteTask(id);
    });

    // 2. Remove from customQueueItems
    setCustomQueueItems(prev => prev.filter(x => !idsToDelete.includes(x.id)));

    // 3. Save to deletedItemIds in state and localStorage
    setDeletedItemIds(prev => {
      const next = Array.from(new Set([...prev, ...idsToDelete]));
      try {
        localStorage.setItem('swiftmynd_deleted_queue_items', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 4. Remove from selectedIds
    setSelectedIds(prev => prev.filter(id => !idsToDelete.includes(id)));

    // 5. Show toast
    showToast(`تم حذف ${idsToDelete.length} عنصر بنجاح من قائمة الانتظار 🗑️`);
    setDeleteConfirmModal(null);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmModal({
      ids: selectedIds,
      title: `حذف ${selectedIds.length} عنصر من قائمة الانتظار`,
      message: `هل أنت متأكد من رغبتك في حذف ${selectedIds.length} عنصر محدد نهائياً من قائمة الانتظار؟`
    });
  };

  const handleDeleteSingle = (item: WorkQueueItem) => {
    setDeleteConfirmModal({
      ids: [item.id],
      title: 'حذف عنصر من قائمة الانتظار',
      message: `هل أنت متأكد من حذف المهمة "${item.subject}" من قائمة الانتظار؟`
    });
  };

  // Badge counts
  const tasksBadgeCount = filteredQueue.length;
  const meetingsBadgeCount = meetings.length;
  const callsBadgeCount = 1;
  const leadsBadgeCount = leads.length;
  const dealsBadgeCount = deals.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col min-h-[calc(100vh-120px)] text-xs">
      {/* Top Banner / Breadcrumb */}
      <div className="p-3.5 bg-slate-50/70 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl text-white shadow-2xs">
            <FolderClock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                قائمة انتظار العمل (Work Queue)
              </h1>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold text-[10px]">
                Zoho CRM Queue
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              متابعة طابور المهام العاجلة، المكالمات، الاجتماعات، والأنشطة المتأخرة والمستحقة اليوم
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* 🗑️ زر حذف المحدد من فوق عند تحديد أي مهمة */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-xs transition-all cursor-pointer text-xs animate-in fade-in"
              title="حذف المهام المحددة من طابور العمل"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف المحدد ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            className={`p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs ${
              isRefreshing ? 'animate-spin text-blue-600' : ''
            }`}
            title="تحديث قائمة الانتظار"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-2xs transition-all cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>إضافة لقائمة الانتظار</span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Split Layout (Matching Screenshot) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* RIGHT PANEL (In RTL): Queues & Categories Navigator */}
        <div className="w-full lg:w-72 bg-slate-50/90 border-b lg:border-b-0 lg:border-l border-slate-200/90 p-3.5 space-y-4 overflow-y-auto shrink-0">
          {/* Section 1: الأنشطة المفتوحة (الخاصة بي نشاط مفتوح) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-700 font-extrabold text-xs px-1">
              <span>الخاصة بي نشاط مفتوح</span>
            </div>

            {/* Filter Dropdown (اليوم & متأخر) */}
            <div className="relative">
              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value as any)}
                className="w-full appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-3 pl-8 text-xs font-bold text-slate-800 shadow-2xs cursor-pointer focus:outline-none focus:border-blue-500"
              >
                <option value="today_overdue">اليوم & متأخر</option>
                <option value="today">اليوم فقط</option>
                <option value="overdue">متأخر فقط</option>
                <option value="all">كافة الأنشطة (الكل)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Activities List */}
            <div className="space-y-1 pt-1">
              {/* Item: المهام */}
              <button
                type="button"
                onClick={() => setActiveQueue('tasks')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  activeQueue === 'tasks'
                    ? 'bg-blue-50 text-blue-900 font-black border-2 border-blue-500 shadow-2xs'
                    : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[11px] font-mono">
                  {tasksBadgeCount}
                </span>
                <div className="flex items-center gap-2">
                  <span>المهام</span>
                  <CheckSquare className={`w-4 h-4 ${activeQueue === 'tasks' ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </button>

              {/* Item: الاجتماعات */}
              <button
                type="button"
                onClick={() => setActiveQueue('meetings')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  activeQueue === 'meetings'
                    ? 'bg-blue-50 text-blue-900 font-black border-2 border-blue-500 shadow-2xs'
                    : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[11px] font-mono">
                  {meetingsBadgeCount}
                </span>
                <div className="flex items-center gap-2">
                  <span>الاجتماعات</span>
                  <Calendar className={`w-4 h-4 ${activeQueue === 'meetings' ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </button>

              {/* Item: المكالمات */}
              <button
                type="button"
                onClick={() => setActiveQueue('calls')}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  activeQueue === 'calls'
                    ? 'bg-blue-50 text-blue-900 font-black border-2 border-blue-500 shadow-2xs'
                    : 'bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200/60 font-semibold'
                }`}
              >
                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[11px] font-mono">
                  {callsBadgeCount}
                </span>
                <div className="flex items-center gap-2">
                  <span>المكالمات</span>
                  <PhoneCall className={`w-4 h-4 ${activeQueue === 'calls' ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: الخاصة بي الوظائف */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <div className="text-slate-700 font-extrabold text-xs px-1">
              الخاصة بي الوظائف
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="w-full flex items-center justify-between p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 rounded-xl font-semibold cursor-pointer"
            >
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-mono">
                0
              </span>
              <div className="flex items-center gap-2">
                <span>المخطط</span>
                <Layout className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>

          {/* Section 3: الخاصة بي قائمة انتظار العمل (My Work Queues) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="hover:text-blue-600 p-0.5 rounded cursor-pointer"
                  title="إضافة قائمة"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => alert('إعدادات وتخصيص طوابير العمل التلقائية')}
                  className="hover:text-slate-800 p-0.5 rounded cursor-pointer"
                  title="إعدادات طابور العمل"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-slate-800 font-extrabold text-xs">
                الخاصة بي قائمة انتظار العمل
              </span>
            </div>

            {/* Subgroups */}
            <div className="space-y-3 pt-1">
              {/* Subgroup: العملاء المحتملون */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 px-1">العملاء المحتملون</div>
                <button
                  type="button"
                  onClick={() => setActiveQueue('leads_my')}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeQueue === 'leads_my'
                      ? 'bg-blue-50 text-blue-900 font-black border-2 border-blue-500 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                  }`}
                >
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[10px] font-mono">
                    {leadsBadgeCount}
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">العملاء المحتملون الخاص بي</span>
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveQueue('leads_my')}
                  className="w-full flex items-center justify-between p-1.5 text-[11px] text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <span className="font-mono text-[10px]">0</span>
                  <span className="truncate">تم تعيين: العملاء المحتملون في آ...</span>
                </button>
              </div>

              {/* Subgroup: جهات اتصال */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 px-1">جهات اتصال</div>
                <button
                  type="button"
                  onClick={() => setActiveQueue('contacts_my')}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeQueue === 'contacts_my'
                      ? 'bg-blue-50 text-blue-900 font-black border-2 border-blue-500 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                  }`}
                >
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[10px] font-mono">
                    10
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">جهات اتصال الخاص بي</span>
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </button>
              </div>

              {/* Subgroup: صفقات */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 px-1">صفقات</div>
                <button
                  type="button"
                  onClick={() => setActiveQueue('deals_my')}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeQueue === 'deals_my'
                      ? 'bg-blue-50 text-blue-900 font-black border-2 border-blue-500 shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold'
                  }`}
                >
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[10px] font-mono">
                    {dealsBadgeCount}
                  </span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="truncate">صفقات الخاص بي</span>
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveQueue('deals_my')}
                  className="w-full flex items-center justify-between p-1.5 text-[11px] text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <span className="font-mono text-[10px]">{dealsBadgeCount}</span>
                  <span className="truncate">تم إغلاق: صفقات هذا الشهر</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LEFT / CENTER PANEL: The Main Queue Table */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Table Header Bar */}
          <div className="p-3 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>
                  {activeQueue === 'tasks' && 'المهام'}
                  {activeQueue === 'meetings' && 'الاجتماعات'}
                  {activeQueue === 'calls' && 'المكالمات'}
                  {activeQueue === 'leads_my' && 'العملاء المحتملون'}
                  {activeQueue === 'deals_my' && 'الصفقات'}
                  {activeQueue === 'contacts_my' && 'جهات الاتصال'}
                </span>
                <button
                  onClick={handleRefresh}
                  className="hover:text-blue-600 p-0.5 rounded cursor-pointer transition-colors"
                  title="تحديث"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
                </button>
              </h2>
              <span className="text-slate-400 text-xs">({filteredQueue.length})</span>
            </div>

            {/* Selected items delete action badge (حذف المهام المحددة) */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-in fade-in">
                <span className="text-xs font-black text-rose-800 flex items-center gap-1">
                  <span>تم تحديد</span>
                  <span className="bg-rose-600 text-white font-mono px-1.5 py-0.2 rounded-md text-[11px]">
                    {selectedIds.length}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-102"
                  title="حذف العناصر المحددة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف المحدد</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer px-1"
                >
                  إلغاء التحديد
                </button>
              </div>
            )}

            {/* Filter Search Input */}
            <div className="flex items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="البحث في قائمة الانتظار..."
                  className="w-full p-1.5 pr-3 pl-8 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => setTimeFilter(prev => prev === 'all' ? 'today_overdue' : 'all')}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                title="تطبيق عامل التصفية"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>عامل التصفية</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredQueue.length && filteredQueue.length > 0}
                      onChange={handleSelectAll}
                      className="rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-4 font-bold text-slate-700">الموضوع</th>
                  <th className="py-2.5 px-4 font-bold text-slate-700">تاريخ الاستحقاق</th>
                  <th className="py-2.5 px-4 font-bold text-slate-700">الحالة</th>
                  <th className="py-2.5 px-4 font-bold text-slate-700">الأولوية</th>
                  <th className="py-2.5 px-4 font-bold text-slate-700">المسؤول / المرتبط</th>
                  <th className="py-2.5 px-4 font-bold text-slate-700 text-center">بدء / إنهاء العمل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 bg-white">
                      <FolderClock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-600">لا توجد عناصر مطابقة في قائمة الانتظار</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        يمكنك تغيير فلتر التصفية (اليوم & متأخر) أو إضافة مهمة جديدة لطابور العمل.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(item => {
                    const isSelected = selectedIds.includes(item.id);

                    // Badge styling based on due date (Matching screenshot exactly)
                    let dueDateBadge = 'text-slate-600 font-medium';
                    if (item.dueDateCategory === 'yesterday') {
                      dueDateBadge = 'text-rose-600 font-extrabold';
                    } else if (item.dueDateCategory === 'overdue_3' || item.dueDateCategory === 'overdue_2') {
                      dueDateBadge = 'text-rose-600 font-extrabold';
                    } else if (item.dueDateCategory === 'today') {
                      dueDateBadge = 'text-slate-800 font-bold';
                    }

                    // Priority color
                    let prioColor = 'text-slate-600';
                    if (item.priority === 'Highest') prioColor = 'text-rose-600 font-black';
                    else if (item.priority === 'High') prioColor = 'text-amber-600 font-black';
                    else if (item.priority === 'Normal') prioColor = 'text-blue-600 font-bold';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(item.id)}
                            className="rounded text-blue-600 cursor-pointer"
                          />
                        </td>

                        {/* Subject (الموضوع) */}
                        <td className="py-3 px-4 font-bold text-slate-900 max-w-xs md:max-w-sm truncate">
                          <div className="flex items-center gap-2">
                            <span className="truncate hover:text-blue-600 cursor-pointer" title={item.subject}>
                              {item.subject}
                            </span>
                          </div>
                        </td>

                        {/* Due Date (تاريخ الاستحقاق) - Color coded */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={dueDateBadge}>
                            {item.dueDateText}
                          </span>
                        </td>

                        {/* Status (الحالة) */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 ${
                              item.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            <span>{item.status}</span>
                          </span>
                        </td>

                        {/* Priority (الأولوية) */}
                        <td className={`py-3 px-4 whitespace-nowrap ${prioColor}`}>
                          {item.priority}
                        </td>

                        {/* Assignee / Related */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {item.assigneeAvatar ? (
                              <img
                                src={item.assigneeAvatar}
                                alt={item.assigneeName}
                                className="w-5 h-5 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                {item.assigneeName.charAt(0)}
                              </div>
                            )}
                            <span className="text-[11px] font-medium text-slate-700">
                              {item.assigneeName}
                            </span>
                            {item.relatedName && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                ({item.relatedName})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons: Timer / Complete */}
                        <td className="py-3 px-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.type === 'task' ? (
                              <>
                                {item.isTimerRunning ? (
                                  <button
                                    type="button"
                                    onClick={() => stopTaskTimer(item.id, 'تمت عبر قائمة انتظار العمل', false)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer animate-pulse"
                                    title="إيقاف المؤقت وحساب الوقت"
                                  >
                                    <Square className="w-3 h-3 fill-current" />
                                    <span>إنهاء (End)</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => startTaskTimer(item.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                    title="بدء مؤقت العمل الفعلي"
                                  >
                                    <Play className="w-3 h-3 fill-current" />
                                    <span>بدء (Start)</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(item)}
                                  className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                                    item.status === 'Completed'
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                                      : 'hover:bg-slate-100 text-slate-400 border-slate-200'
                                  }`}
                                  title="تعليم كمكتمل"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>

                                {/* زر حذف المهمة من الصف مباشرة */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingle(item)}
                                  className="p-1 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="حذف هذه المهمة من طابور العمل"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveTab(item.type === 'meeting' ? 'meetings' : item.type === 'lead' ? 'leads' : 'deals')}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>عرض</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingle(item)}
                                  className="p-1 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="حذف من قائمة الانتظار"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with exact pagination matching screenshot */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-slate-600 text-xs">
            <div className="font-extrabold text-slate-800">
              السجلات الكلية: {filteredQueue.length}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-500">
                1 إلى {filteredQueue.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  className="p-1 rounded bg-white border border-slate-200 text-slate-300 cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled
                  className="p-1 rounded bg-white border border-slate-200 text-slate-300 cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
          <form
            onSubmit={handleAddItem}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderClock className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm">إضافة عنصر جديد لقائمة انتظار العمل</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الموضوع / عنوان العمل:</label>
                <input
                  type="text"
                  required
                  value={newItemSubject}
                  onChange={e => setNewItemSubject(e.target.value)}
                  placeholder="مثال: Register for upcoming CRM Webinars أو مراجعة العقد"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأولوية:</label>
                  <select
                    value={newItemPriority}
                    onChange={e => setNewItemPriority(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Highest">Highest (أعلى أولوية 🔴)</option>
                    <option value="High">High (عالية 🟠)</option>
                    <option value="Normal">Normal (متوسطة 🔵)</option>
                    <option value="Low">Low (منخفضة ⚪)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاستحقاق:</label>
                  <input
                    type="date"
                    value={newItemDueDate}
                    onChange={e => setNewItemDueDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-2xs"
              >
                إضافة للقائمة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal (تأكيد حذف المهام) */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-black text-sm text-slate-900">{deleteConfirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {deleteConfirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => executeDeleteItems(deleteConfirmModal.ids)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-all hover:scale-102"
              >
                تأكيد الحذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
