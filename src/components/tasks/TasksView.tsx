import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  Play,
  Pause,
  Square,
  History,
  Calendar,
  Kanban,
  List,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  Search,
  User,
  Filter,
  ArrowUpDown,
  Tag,
  Star,
  Users,
  Timer,
  ChevronDown,
  X,
  FileText,
  AtSign,
  MessageSquare,
  Send,
  Radio,
  Eye,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Lock,
  Unlock,
  Check,
  LayoutGrid,
  Layers,
  Copy,
  Move,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../../context/CRMContext';
import { Task, TaskPriority, TaskStatus, TimeLogEntry, TeamMember } from '../../types/crm';
import { exportTasksToExcel } from '../../utils/excelExport';

export const TasksView: React.FC = () => {
  const {
    tasks,
    deletedTasks,
    team,
    currentUser,
    addTask,
    updateTask,
    deleteTask,
    restoreTaskFromTrash,
    emptyTasksTrash,
    permanentlyDeleteTask,
    toggleSubTask,
    changeTaskStatus,
    moveTaskToMember,
    reorderTask,
    getDeadlineStatus,
    startTaskTimer,
    pauseTaskTimer,
    resumeTaskTimer,
    stopTaskTimer,
    addManualTimeLog,
    deleteTimeLog,
    addTaskComment,
    setOpenQuickModal,
    setIsResetModalOpen
  } = useCRM();

  // Tasks Trash Modal state
  const [isTasksTrashModalOpen, setIsTasksTrashModalOpen] = useState(false);

  // Role Detection: Is current user Manager / Admin?
  const isManager =
    currentUser.accessLevel === 'admin' ||
    currentUser.accessLevel === 'manager' ||
    currentUser.id === 'user-1';

  // Manager Scope Switcher: 'all' (all team tasks) vs 'my' (only manager's own tasks)
  const [managerScope, setManagerScope] = useState<'all' | 'my'>('all');

  // Manager Privacy Filter: 'all' (all tasks) vs 'public_only' (team only) vs 'private_only' (manager only secret)
  const [managerPrivacyFilter, setManagerPrivacyFilter] = useState<'all' | 'public_only' | 'private_only'>('all');

  // Navigation view mode: team member lists (Trello), day lists (Trello), table, radar, etc.
  const [viewMode, setViewMode] = useState<'team_boards' | 'day_boards' | 'list' | 'radar' | 'time_logs' | 'kanban' | 'calendar'>('team_boards');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [taskSearch, setTaskSearch] = useState<string>('');
  const [starredTasks, setStarredTasks] = useState<string[]>(['task-101', 'task-103']);

  // Quick inline add task state for boards
  const [quickAddColumn, setQuickAddColumn] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState<string>('');
  const [quickAddDueDate, setQuickAddDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickAddPriority, setQuickAddPriority] = useState<TaskPriority>('medium');
  const [quickAddIsPrivate, setQuickAddIsPrivate] = useState<boolean>(false);

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [stopTimerTaskId, setStopTimerTaskId] = useState<string | null>(null);
  const [stopTimerNote, setStopTimerNote] = useState<string>('');
  const [stopTimerCustomMinutes, setStopTimerCustomMinutes] = useState<number | null>(null);

  // Manual time log modal state
  const [manualLogTaskId, setManualLogTaskId] = useState<string | null>(null);
  const [manualMemberId, setManualMemberId] = useState<string>(currentUser.id);
  const [manualStartDate, setManualStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState<string>('09:00');
  const [manualEndDate, setManualEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualEndTime, setManualEndTime] = useState<string>('12:00');
  const [manualDurationMins, setManualDurationMins] = useState<number>(180);
  const [manualNote, setManualNote] = useState<string>('');

  // Comment & Mention State in task details modal
  const [commentText, setCommentText] = useState('');
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);
  const [mentionSuccessToast, setMentionSuccessToast] = useState(false);

  // Task Editing, Copying & Moving States (تعديل التاسكات، نسخ الكلام، نقل بين الكروت والموظفين)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    description: string;
    assignedToId: string;
    category: Task['category'];
    priority: TaskPriority;
    startDate: string;
    dueDate: string;
    status: TaskStatus;
    isPrivate: boolean;
  }>({
    title: '',
    description: '',
    assignedToId: '',
    category: 'إداري',
    priority: 'medium',
    startDate: '',
    dueDate: '',
    status: 'todo',
    isPrivate: false
  });
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);
  const [moveDropdownTaskId, setMoveDropdownTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // 1-Click Copy Task Text (نسخ نص المهمة للحافظة)
  const handleCopyTaskText = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fullText = task.description
      ? `${task.title}\n\n${task.description}`
      : task.title;
    navigator.clipboard.writeText(fullText);
    setCopiedTaskId(task.id);
    showToast('تم نسخ نص المهمة إلى الحافظة بنجاح! 📋');
    setTimeout(() => setCopiedTaskId(null), 2500);
  };

  // Start Edit Task
  const handleStartEditTask = (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditFormData({
      title: task.title,
      description: task.description || '',
      assignedToId: task.assignedToId,
      category: task.category || 'إداري',
      priority: task.priority,
      startDate: task.startDate || '',
      dueDate: task.dueDate,
      status: task.status,
      isPrivate: !!task.isPrivate
    });
    setEditingTaskId(task.id);
  };

  // Save Edit Task
  const handleSaveTaskEdit = () => {
    if (!editingTaskId || !editFormData.title.trim()) {
      showToast('يرجى إدخال عنوان المهمة');
      return;
    }
    updateTask(editingTaskId, editFormData);
    showToast('تم حفظ وتعديل بيانات المهمة بنجاح! ✏️');
    setEditingTaskId(null);
  };

  // Move Task To Team Member (نقل المهمة لموظف آخر)
  const handleMoveTaskMember = (taskId: string, targetMemberId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    moveTaskToMember(taskId, targetMemberId);
    const target = team.find(m => m.id === targetMemberId);
    showToast(`تم نقل المهمة إلى: ${target?.name || 'عضو آخر'} 👤`);
    setMoveDropdownTaskId(null);
  };

  // Move Task To Status (نقل المهمة لمرحلة أخرى)
  const handleMoveTaskStatus = (taskId: string, newStatus: TaskStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    changeTaskStatus(taskId, newStatus);
    const statusTitles: Record<TaskStatus, string> = {
      todo: 'قيد الانتظار',
      in_progress: 'جاري العمل',
      review: 'قيد المراجعة',
      completed: 'مكتملة'
    };
    showToast(`تم نقل المهمة إلى: ${statusTitles[newStatus]} ➡️`);
  };

  // Reorder Task (تحريك لأعلى / لأسفل)
  const handleReorderTaskItem = (taskId: string, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    reorderTask(taskId, direction);
    showToast(direction === 'up' ? 'تم تحريك المهمة لأعلى ⬆️' : 'تم تحريك المهمة لأسفل ⬇️');
  };

  // Live timer tick ticker to update active elapsed seconds
  const [liveTicks, setLiveTicks] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTicks(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Base tasks for current user:
  // "اكسيس واكونتات التيم هيكون فيها التاسكات الخاصه بكل اكونت بس لوو معموله مننش والتاسكات ومواعيدها"
  // "يعني لما اضف عضو يظهر التاسكات والتايمر وشغله بس"
  const userBaseTasks = isManager
    ? tasks
    : tasks.filter(task => {
        if (task.isPrivate) return false;
        const isAssigned = isTaskAssignedToUser(task, currentUser);
        const isMentioned = isUserMentionedInTask(task, currentUser);
        return isAssigned || isMentioned;
      });

  // Filter tasks logic based on ROLE, Privacy, and user filters:
  const filteredTasks = userBaseTasks.filter(task => {
    // 0. Strict Private Task Isolation: If task is private and user is not manager, NEVER show it!
    if (task.isPrivate && !isManager) {
      return false;
    }

    if (!isManager) {
      // Employee-specific quick filters:
      const isAssigned = isTaskAssignedToUser(task, currentUser);
      const isMentioned = isUserMentionedInTask(task, currentUser);

      if (filterStatus === 'assigned_only' && !isAssigned) return false;
      if (filterStatus === 'mentions' && !isMentioned) return false;
    } else {
      // Manager view:
      if (managerScope === 'my' && task.assignedToId !== currentUser.id) {
        return false;
      }
      if (filterMember !== 'all' && task.assignedToId !== filterMember) {
        return false;
      }
      if (managerPrivacyFilter === 'private_only' && !task.isPrivate) return false;
      if (managerPrivacyFilter === 'public_only' && task.isPrivate) return false;
      if (filterStatus === 'mentions' && (!task.comments || task.comments.length === 0)) return false;
    }

    if (filterStatus === 'pending' && task.status === 'completed') return false;
    if (filterStatus === 'completed' && task.status !== 'completed') return false;
    if (filterStatus === 'running' && !task.isTimerRunning) return false;
    if (filterStatus === 'overdue') {
      const deadline = getDeadlineStatus(task.dueDate, task.dueTime, task.status);
      if (!deadline.isOverdue) return false;
    }
    if (filterStatus === 'today') {
      const deadline = getDeadlineStatus(task.dueDate, task.dueTime, task.status);
      if (!deadline.isToday) return false;
    }
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (taskSearch.trim()) {
      const q = taskSearch.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        (task.relatedTo && task.relatedTo.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate live running timers count for visible tasks
  const runningTimersCount = userBaseTasks.filter(t => t.isTimerRunning).length;

  // Calculate overdue count for visible tasks
  const overdueCount = userBaseTasks.filter(t => {
    const st = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return st.isOverdue;
  }).length;

  // Calculate total hours logged across visible tasks
  const totalLoggedMinutesAll = filteredTasks.reduce((sum, t) => sum + (t.totalLoggedMinutes || 0), 0);
  const totalLoggedHours = (totalLoggedMinutesAll / 60).toFixed(1);

  // Calculate tasks with mentions count for visible tasks
  const tasksWithMentionsCount = userBaseTasks.filter(t => isUserMentionedInTask(t, currentUser)).length;
  const assignedToMeCount = userBaseTasks.filter(t => isTaskAssignedToUser(t, currentUser)).length;

  // Selected task for detailed modal
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  // Helper calculate active worked seconds on a task (excluding pause intervals)
  const getTaskActiveElapsedSeconds = (task?: Task | null): number => {
    if (!task) return 0;
    let totalMs = task.timerAccumulatedMs || 0;
    if (task.isTimerRunning) {
      const sessionStart = task.timerLastResumedAt || task.timerStartedAt || liveTicks;
      totalMs += Math.max(0, liveTicks - sessionStart);
    }
    return Math.max(0, Math.floor(totalMs / 1000));
  };

  // Helper format elapsed timer (calculates actual active work, excluding pauses)
  const formatLiveTimer = (target?: Task | number | null) => {
    if (!target) return '00:00:00';
    let elapsedSeconds = 0;
    if (typeof target === 'object' && target !== null && 'id' in target) {
      elapsedSeconds = getTaskActiveElapsedSeconds(target);
    } else if (typeof target === 'number') {
      elapsedSeconds = Math.max(0, Math.floor((liveTicks - target) / 1000));
    }
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper format duration in Arabic
  const formatDurationMinutes = (mins: number = 0) => {
    if (mins < 60) return `${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hours} ساعة`;
    return `${hours} س و ${remainingMins} د`;
  };

  // Helper render comment text with styled mention pills (@name)
  const renderCommentWithMentions = (text: string) => {
    const parts = text.split(/(@[^\s]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 bg-blue-100 text-blue-800 rounded-md font-bold text-xs border border-blue-200"
          >
            <AtSign className="w-2.5 h-2.5 text-blue-600 inline" />
            <span>{part.substring(1)}</span>
          </span>
        );
      }
      return part;
    });
  };

  // Helper render task title with styled mention badges (@name)
  const renderTaskTitleWithMentions = (title: string) => {
    const parts = title.split(/(@[^\s]+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold text-[11px] border border-blue-200 shadow-2xs transition-colors"
          >
            <AtSign className="w-2.5 h-2.5 text-blue-600 inline" />
            <span>{part.substring(1)}</span>
          </span>
        );
      }
      return part;
    });
  };

  // Toggle task complete (يعلم عليها صح اللي خلصت)
  const toggleTaskComplete = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    const newStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
    changeTaskStatus(taskId, newStatus);
  };

  // Inline quick add task for Trello member columns and day columns
  // "وانا اقدر او هو يضيف التاكسات ديه"
  const handleInlineQuickAdd = (targetMemberId: string, customDueDate?: string) => {
    if (!quickAddTitle.trim()) return;
    addTask({
      title: quickAddTitle.trim(),
      description: 'مهمة مضافة عبر بورد وقائمة الفريق',
      assignedToId: targetMemberId,
      priority: quickAddPriority,
      status: 'todo',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: customDueDate || quickAddDueDate || new Date().toISOString().split('T')[0],
      dueTime: '18:00',
      category: 'إداري',
      estimatedHours: 2,
      timeLogs: [],
      subtasks: [],
      isPrivate: isManager ? quickAddIsPrivate : false
    });
    setQuickAddTitle('');
    setQuickAddColumn(null);
    setQuickAddIsPrivate(false);
  };

  // Toggle star
  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredTasks(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Submit manual time log
  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLogTaskId) return;

    const assignedMember = team.find(m => m.id === manualMemberId) || currentUser;

    addManualTimeLog(manualLogTaskId, {
      memberId: assignedMember.id,
      memberName: assignedMember.name,
      memberAvatar: assignedMember.avatar,
      startDate: manualStartDate,
      startTime: manualStartTime,
      endDate: manualEndDate,
      endTime: manualEndTime,
      durationMinutes: Number(manualDurationMins) || 60,
      note: manualNote || 'فترة عمل مسجلة يدوياً'
    });

    setManualLogTaskId(null);
    setManualNote('');
  };

  // Submit Task Comment & Mention
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;

    addTaskComment(selectedTask.id, commentText.trim(), selectedMentionIds);
    setCommentText('');
    setSelectedMentionIds([]);
    setMentionSuccessToast(true);
    setTimeout(() => setMentionSuccessToast(false), 3000);
  };

  const handleToggleMentionUser = (member: TeamMember) => {
    if (selectedMentionIds.includes(member.id)) {
      setSelectedMentionIds(prev => prev.filter(id => id !== member.id));
      // Remove tag from text if present
      setCommentText(prev => prev.replace(`@${member.name.replace(/\s+/g, '_')}`, '').trim());
    } else {
      setSelectedMentionIds(prev => [...prev, member.id]);
      const mentionTag = `@${member.name.replace(/\s+/g, '_')}`;
      setCommentText(prev => (prev ? `${prev} ${mentionTag} ` : `${mentionTag} `));
    }
  };

  // Flatten time logs for the time tracking view (filtered for members)
  const allTimeLogs: { task: Task; log: TimeLogEntry }[] = [];
  tasks.forEach(task => {
    // If regular member, only collect their own logs
    if (!isManager && !isTaskAssignedToUser(task, currentUser)) return;
    (task.timeLogs || []).forEach(log => {
      if (!isManager && log.memberId !== currentUser.id && !isTaskAssignedToUser({ id: 'dummy', title: '', assignedToId: log.memberId } as Task, currentUser)) return;
      allTimeLogs.push({ task, log });
    });
  });
  // Sort newest first
  allTimeLogs.sort((a, b) =>
    (b.log.startDate + b.log.startTime).localeCompare(a.log.startDate + a.log.startTime)
  );

  return (
    <div className="space-y-4 pb-12 animate-in fade-in text-xs">
      {/* ROLE BANNER & LIVE TIMER FOR EMPLOYEE */}
      {!isManager ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
              <span className="p-2 bg-white/20 rounded-xl shrink-0">
                <UserCheck className="w-5 h-5 text-white" />
              </span>
              <div className="min-w-0">
                <div className="font-black text-sm flex flex-wrap items-center gap-1.5">
                  <span>مرحباً بك، {currentUser.name}</span>
                  <span className="text-[10px] bg-white/20 text-blue-100 px-2 py-0.5 rounded-full font-bold">
                    واجهة الموظف: التاسكات والتايمر وشغلك بس
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  تظهر لك هنا فقط <strong>مهامك المكلف بها ({assignedToMeCount})</strong> والمهام التي <strong>معمول لك فيها منشن (@) ({tasksWithMentionsCount})</strong> ومؤقت العمل ومواعيد التسليم.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-bold">
                كود الموظف: {currentUser.employeeCode || 'SM-Emp'}
              </span>
            </div>
          </div>

          {/* EMPLOYEE LIVE TIMER & FOCUS WIDGET (التايمر وشغله ومواعيده مع ميزة الإيقاف المؤقت واستبعاد أوقات الراحة) */}
          {(() => {
            const activeRunningTask = userBaseTasks.find(t => t.isTimerRunning && t.assignedToId === currentUser.id);
            const activePausedTask = userBaseTasks.find(t => t.isTimerPaused && t.assignedToId === currentUser.id);
            const currentActiveTask = activeRunningTask || activePausedTask;
            const myPendingTasks = userBaseTasks.filter(t => t.status !== 'completed' && t.assignedToId === currentUser.id);

            return (
              <div className={`p-4 rounded-2xl border transition-all shadow-xs ${
                activeRunningTask
                  ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border-emerald-500/40 ring-2 ring-emerald-400/30'
                  : activePausedTask
                  ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white border-amber-500/40 ring-2 ring-amber-400/30'
                  : 'bg-white border-slate-200/90 text-slate-800'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Timer State */}
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl flex items-center justify-center ${
                      activeRunningTask
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : activePausedTask
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Timer className={`w-7 h-7 ${activeRunningTask ? 'animate-spin' : ''}`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          activeRunningTask
                            ? 'bg-emerald-500 text-slate-950 animate-pulse'
                            : activePausedTask
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {activeRunningTask
                            ? '⏱️ المؤقت يعمل الآن'
                            : activePausedTask
                            ? '⏸️ المؤقت متوقف مؤقتاً (استراحة)'
                            : '⏸️ المؤقت متوقف'}
                        </span>
                        {currentActiveTask && (
                          <span className={`text-xs font-mono font-black ${activeRunningTask ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {formatLiveTimer(currentActiveTask)}
                          </span>
                        )}
                        {activePausedTask && (
                          <span className="text-[10px] text-amber-300 font-bold hidden sm:inline">
                            (وقت الراحة لا يُحسب)
                          </span>
                        )}
                      </div>

                      <div className="font-extrabold text-sm mt-1">
                        {currentActiveTask ? (
                          <span className={activeRunningTask ? 'text-emerald-100 flex items-center gap-1.5' : 'text-amber-100 flex items-center gap-1.5'}>
                            <span>{activeRunningTask ? 'جاري تسجيل وقت العمل الفعلي على:' : 'متوقف مؤقتاً على:'}</span>
                            <span className="text-white underline">{currentActiveTask.title}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">
                            جاهز لبدء العمل؟ اختر مهمة واضغط على "بدء التايمر" لتسجيل وقت إنجازك.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Timer Controls & Daily Summary */}
                  <div className="flex flex-wrap items-center gap-2">
                    {activeRunningTask && (
                      <>
                        <button
                          type="button"
                          onClick={() => pauseTaskTimer(activeRunningTask.id)}
                          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          title="إيقاف مؤقت للاستراحة - لن يتم احتساب وقت التوقف"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>إيقاف مؤقت ⏸️</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStopTimerTaskId(activeRunningTask.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-102"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>⏹️ إنهاء وحساب الوقت</span>
                        </button>
                      </>
                    )}

                    {activePausedTask && (
                      <>
                        <button
                          type="button"
                          onClick={() => resumeTaskTimer(activePausedTask.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer animate-pulse"
                          title="استئناف مؤقت العمل"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>استئناف العمل ▶️</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStopTimerTaskId(activePausedTask.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>⏹️ إنهاء وحساب الوقت</span>
                        </button>
                      </>
                    )}

                    {!currentActiveTask && myPendingTasks.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startTaskTimer(myPendingTasks[0].id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-102"
                          title={`بدء التايمر على: ${myPendingTasks[0].title}`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>▶️ تشغيل التايمر على أول مهمة</span>
                        </button>
                      </div>
                    )}

                    <div className="bg-slate-500/10 px-3 py-1.5 rounded-xl border border-slate-500/20 text-center font-mono">
                      <span className="text-[10px] text-slate-400 block font-sans">إجمالي ساعاتك المسجلة</span>
                      <span className="font-extrabold text-xs">
                        {totalLoggedHours} ساعة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-white" />
            </span>
            <div>
              <div className="font-extrabold text-[13px] flex items-center gap-2">
                <span>لوحة تحكم المدير: متابعة مهام الفريق وأوقات العمل</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.2 rounded-full font-bold">
                  وصول شامل لكل الحسابات
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                يمكنك الاطلاع على مهام كل أعضاء الفريق، معرفة من يعمل على ماذا الآن ومؤقتاته النشطة، أو تصفية مهامك أنت فقط.
              </p>
            </div>
          </div>

          {/* Scope & Privacy Toggles for Manager */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Scope Toggle: All vs My */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => {
                  setManagerScope('all');
                  setFilterMember('all');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  managerScope === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                كل الفريق ({tasks.length})
              </button>
              <button
                onClick={() => {
                  setManagerScope('my');
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  managerScope === 'my'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                مهامي أنا ({tasks.filter(t => t.assignedToId === currentUser.id).length})
              </button>
            </div>

            {/* Privacy Toggle: Public Team Tasks vs Secret Manager Only Tasks */}
            {/* "وكمان انا كمدير اضيف مهاما للتيم ومهام ليا محدش يطلع عليها خالص" */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setManagerPrivacyFilter('all')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  managerPrivacyFilter === 'all'
                    ? 'bg-slate-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="عرض كل المهام العامة والسرية"
              >
                الكل
              </button>
              <button
                onClick={() => setManagerPrivacyFilter('public_only')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  managerPrivacyFilter === 'public_only'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="مهام الفريق العامة فقط"
              >
                <Users className="w-3 h-3" />
                <span>مهام التيم ({tasks.filter(t => !t.isPrivate).length})</span>
              </button>
              <button
                onClick={() => setManagerPrivacyFilter('private_only')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  managerPrivacyFilter === 'private_only'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                    : 'text-amber-400 hover:text-white'
                }`}
                title="مهام سرية خاصة بالمدير فقط لا يطلع عليها أحد من التيم"
              >
                <Lock className="w-3 h-3 text-amber-300" />
                <span>سرية للمدير فقط ({tasks.filter(t => t.isPrivate).length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Actions Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Timer className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>
                  {isManager && managerScope === 'all'
                    ? 'مهام وتاسكات الفريق وتتبع ساعات العمل'
                    : 'مهامي الشخصية ومؤقت الإنجاز'}
                </span>
                {managerPrivacyFilter === 'private_only' && (
                  <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>وضع المهام السرية للمدير فقط (مخفية 100%)</span>
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                متابعة المهام المحددة، التواريخ (من يوم إيه لإيه)، مؤقت العمل اللحظي، وإشعارات المنشن
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Add Task & Reset Data */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Prominent Reset Button - Admin Only */}
          {isManager && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs shadow-2xs"
              title="مسح البيانات المضافة أو استعادة ضبط المصنع"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>مسح الداتا / Reset</span>
            </button>
          )}

          {isManager && (
            <button
              onClick={() => setViewMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                viewMode === 'radar'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">رادار المباشر: مين شغال في إيه؟</span>
              <span className="sm:hidden">الرادار</span>
              {runningTimersCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => exportTasksToExcel(tasks, team)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-2xs hover:scale-102"
            title="تصدير كشف المهام والمسؤولين وتتبع الساعات لإكسيل (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>تصدير إكسيل (Excel) 📗</span>
          </button>

          <button
            onClick={() => setOpenQuickModal('task')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء مهمة عمل جديدة</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-md text-[10px] font-mono flex items-center gap-0.5">
              <AtSign className="w-2.5 h-2.5 inline" /> منشن
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Tasks, Running Timers, and Total Logged Hours */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">
            {isManager && managerScope === 'all' ? 'إجمالي مهام الفريق' : 'مهامي المكلف بها'}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{filteredTasks.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {filteredTasks.filter(t => t.status === 'completed').length} مكتملة بنجاح
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">المؤقتات الجارية حالياً</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-2">
            {runningTimersCount}
            {runningTimersCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-bold">
            {runningTimersCount > 0 ? 'أعضاء يعملون الآن ومؤقتهم نشط' : 'لا يوجد مؤقت نشط'}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">ساعات العمل المسجلة</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{totalLoggedHours} س</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            عبر {allTimeLogs.length} جلسة عمل مسجلة
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-slate-400 font-bold text-[11px]">مستحق اليوم / متأخر</div>
          <div className={`text-2xl font-black mt-1 ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueCount > 0 ? `${overdueCount} متأخرة!` : 'في المسار المحدد'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            تنبيهات المواعيد النهائية مفعلة
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Switcher Buttons */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold min-w-max gap-1">
          {/* Board by Team Member */}
          <button
            onClick={() => setViewMode('team_boards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'team_boards'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>بورد أعضاء الفريق (swiftmynd التيم)</span>
          </button>

          {/* Board by Days */}
          <button
            onClick={() => setViewMode('day_boards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'day_boards'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>بورد الأيام (swiftmynd بالأيام)</span>
          </button>

          {/* Table List View */}
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>جدول المهام والمؤقت</span>
          </button>

          {/* Kanban Status */}
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'kanban'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>لوحة كانبان</span>
          </button>

          {isManager && (
            <button
              onClick={() => setViewMode('radar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'radar'
                  ? 'bg-white text-emerald-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>متابعة التيم المباشرة</span>
            </button>
          )}

          <button
            onClick={() => setViewMode('time_logs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'time_logs'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>سجل فترات العمل</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {allTimeLogs.length}
            </span>
          </button>


          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white text-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>التقويم</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTasksTrashModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 shadow-2xs"
            title="سلة مهملات المهام (تفريغ واستعادة)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>سلة مهملات المهام</span>
            {deletedTasks.length > 0 && (
              <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded-full font-black">
                {deletedTasks.length}
              </span>
            )}
          </button>
          </div>
        </div>

        {/* Search & Member Filter (Only shown to Manager) */}
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-full md:max-w-lg justify-start md:justify-end">
          {isManager && managerScope === 'all' && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterMember}
                onChange={e => setFilterMember(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">كل أعضاء الفريق ({team.length})</option>
                {team.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({tasks.filter(t => t.assignedToId === m.id).length} تاسك)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search bar */}
          <div className="relative w-44 sm:w-56">
            <input
              type="text"
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              placeholder="البحث في التاسكات..."
              className="w-full bg-slate-50 pr-7 pl-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Quick Status & Mentions Filter Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold text-[11px] ml-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> تصفية سريعة:
          </span>

          {!isManager ? (
            <>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({userBaseTasks.length})
              </button>

              <button
                onClick={() => setFilterStatus('assigned_only')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'assigned_only'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>مهامي المكلفة ({assignedToMeCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus('mentions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'mentions'
                    ? 'bg-purple-600 text-white shadow-2xs ring-2 ring-purple-300'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
                title="المهام التي تم عمل منشن لي فيها (@)"
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>مهام معمول لي فيها منشن (@) ({tasksWithMentionsCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus('running')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'running'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>التايمر نشط الآن ({runningTimersCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus('today')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'today'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>مستحقة اليوم</span>
              </button>

              <button
                onClick={() => setFilterStatus('overdue')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'overdue'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>متأخرة ({overdueCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'completed'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                مكتملة ({userBaseTasks.filter(t => t.status === 'completed').length})
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({filteredTasks.length})
              </button>

              <button
                onClick={() => setFilterStatus('mentions')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'mentions'
                    ? 'bg-blue-600 text-white shadow-2xs ring-2 ring-blue-300'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
                title="عرض المهام التي تحتوي على تعليقات ومنشنات وتفاعل بين الفريق"
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>مهام بها منشنات وتفاعل (@)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-blue-800 font-black">
                  {tasksWithMentionsCount}
                </span>
              </button>

              <button
                onClick={() => setFilterStatus('running')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'running'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>المؤقت نشط الآن ({runningTimersCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                قيد الانتظار والعمل
              </button>

              <button
                onClick={() => setFilterStatus('overdue')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'overdue'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                متأخرة ({overdueCount})
              </button>

              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'completed'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                مكتملة
              </button>
            </>
          )}
        </div>

        {filterStatus !== 'all' && (
          <button
            onClick={() => setFilterStatus('all')}
            className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>عرض كل المهام</span>
          </button>
        )}
      </div>

      {/* VIEW 0: LIVE TEAM ACTIVITY RADAR (FOR MANAGER: كل واحد شغال في إيه دلوقتي؟) */}
      {viewMode === 'radar' && isManager && (
        <div className="space-y-3">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start gap-3">
            <Radio className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <strong className="font-extrabold text-emerald-950 block text-[13px]">
                رادار متابعة الفريق المباشرة: كل واحد شغال في إيه دلوقتي؟
              </strong>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                تتبع لحظي لنشاط جميع أفراد التيم، المهمة الحالية التي يعمل عليها كل موظف، حالة مؤقته المباشر، وتاريخ استحقاق المهمة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {team.map(member => {
              // Find active running task for this member
              const runningTask = tasks.find(
                t => t.assignedToId === member.id && t.isTimerRunning
              );
              // Find pending tasks assigned to member
              const memberPendingTasks = tasks.filter(
                t => t.assignedToId === member.id && t.status !== 'completed'
              );
              // Latest task
              const currentOrLatestTask = runningTask || memberPendingTasks[0] || null;

              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                    runningTask ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'
                  }`}
                >
                  {/* Member Info Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <span
                          className={`w-3 h-3 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5 ${
                            runningTask
                              ? 'bg-emerald-500 animate-ping'
                              : member.status === 'online'
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{member.name}</span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold">
                            {member.employeeCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-blue-600 font-semibold">{member.role}</div>
                        <div className="text-[10px] text-slate-400">{member.department}</div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {runningTask ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        <span>يعمل الآن 🟢</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium text-[10px]">
                        في وضع الاستعداد
                      </span>
                    )}
                  </div>

                  {/* Active Task Box */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      {runningTask ? 'المهمة الجاري العمل عليها الآن:' : 'آخر مهمة مسندة إليه:'}
                    </div>

                    {currentOrLatestTask ? (
                      <div>
                        <div
                          onClick={() => setSelectedTaskId(currentOrLatestTask.id)}
                          className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer text-xs leading-snug line-clamp-2"
                        >
                          {renderTaskTitleWithMentions(currentOrLatestTask.title)}
                        </div>

                        {/* Dates: From date to date */}
                        <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            من: <strong>{currentOrLatestTask.startDate || 'غير محدد'}</strong> | إلى: <strong>{currentOrLatestTask.dueDate}</strong>
                          </span>
                        </div>

                        {/* If timer running, show elapsed live clock */}
                        {runningTask && (
                          <div className="mt-2 p-2 bg-emerald-600 text-white rounded-lg flex items-center justify-between font-mono text-xs font-bold">
                            <span className="flex items-center gap-1 text-[11px] font-sans">
                              <Timer className="w-3.5 h-3.5" /> عداد العمل الحي:
                            </span>
                            <span>{formatLiveTimer(runningTask.timerStartedAt)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">
                        لا توجد مهام نشطة حالياً لهذا العضو.
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-1 flex items-center gap-1.5">
                    {currentOrLatestTask && (
                      <button
                        onClick={() => setSelectedTaskId(currentOrLatestTask.id)}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>فتح المهمة والمنشن</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setFilterMember(member.id);
                        setViewMode('list');
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer"
                      title="عرض كل تاسكات هذا العضو فقط"
                    >
                      تاسكاته ({memberPendingTasks.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: TRELLO BY TEAM MEMBER (قائمة لكل عضو من التيم مثل تريللو) */}
      {/* "وكل واحد من التيمل ليه list تاسكات انا احطها من عندي او يحطها بالايام زي تريللو ويعلم عليها صح اللي خلصت وانا اقدر او هو يضيف التاكسات ديه" */}
      {viewMode === 'team_boards' && (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-600 text-white rounded-lg shadow-2xs">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <strong className="font-extrabold text-slate-900 block text-xs">
                  بورد أعضاء الفريق (swiftmynd التيم):
                </strong>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  قائمة مهام مستقلة لكل موظف. يمكنك كمدير أو عضو إضافة مهام فوراً، تشغيل المؤقت (Start/End)، وتعليم علامة صح [✓] على المهمة المنجزة بنقرة واحدة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isManager && (
                <button
                  type="button"
                  onClick={() => setOpenQuickModal('task')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>مهمة جديدة</span>
                </button>
              )}
            </div>
          </div>

          {/* Columns Grid / Horizontal Scroll */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {(isManager && managerScope === 'all'
              ? (filterMember === 'all' ? team : team.filter(m => m.id === filterMember))
              : team.filter(m => m.id === currentUser.id || isTaskAssignedToUser({ id: 'dummy', title: '', assignedToId: m.id } as Task, currentUser) || (m.username && currentUser.username && m.username.toLowerCase() === currentUser.username.toLowerCase()))
            ).map(member => {
              const memberTasks = filteredTasks.filter(t => isTaskAssignedToUser(t, member));
              const completedCount = memberTasks.filter(t => t.status === 'completed').length;
              const isCurrentMemberOpen = quickAddColumn === member.id;

              return (
                <div
                  key={member.id}
                  className="bg-slate-100/85 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col max-h-[80vh] overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="bg-white p-3.5 border-b border-slate-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <span
                          className={`w-2.5 h-2.5 rounded-full border border-white absolute bottom-0 right-0 ${
                            memberTasks.some(t => t.isTimerRunning)
                              ? 'bg-emerald-500 animate-ping'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                          <span>{member.name}</span>
                          {member.id === currentUser.id && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-bold">
                              أنت
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{member.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border">
                        {completedCount}/{memberTasks.length} منجزة
                      </span>
                    </div>
                  </div>

                  {/* Task Cards List */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                    {memberTasks.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 bg-white/70 rounded-xl border border-dashed border-slate-200 text-xs">
                        لا توجد مهام مسندة حالياً
                      </div>
                    ) : (
                      memberTasks.map(task => {
                        const isDone = task.status === 'completed';
                        const deadline = getDeadlineStatus(task.dueDate, task.dueTime, task.status);
                        const isAllTeamTask =
                          task.assignedToId === 'all' ||
                          task.assignedToId === 'team' ||
                          task.assignedToId === 'all_members' ||
                          task.assignedToId === 'all_accounts';

                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border transition-all text-xs space-y-2 select-text shadow-2xs hover:shadow-md ${
                              isDone
                                ? 'bg-emerald-50/50 border-emerald-200/90'
                                : task.isTimerRunning
                                ? 'bg-white border-emerald-300 ring-2 ring-emerald-100'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            {/* Card Top: Checkbox [✓] + Title + Actions (Copy / Edit / Move / Reorder) */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={e => toggleTaskComplete(task.id, e)}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                                    isDone
                                      ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-500'
                                      : 'border-2 border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50'
                                  }`}
                                  title={isDone ? 'إلغاء الإنجاز وإعادة المهمة جارية' : 'تعليم كمكتملة بنجاح ✓'}
                                >
                                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div
                                    onClick={() => setSelectedTaskId(task.id)}
                                    className={`font-extrabold cursor-pointer leading-snug hover:text-blue-600 transition-colors ${
                                      isDone ? 'line-through text-slate-400' : 'text-slate-900'
                                    }`}
                                  >
                                    {renderTaskTitleWithMentions(task.title)}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                    {isAllTeamTask && (
                                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                                        <span>🌟 مهمة لجميع الفريق</span>
                                      </span>
                                    )}
                                    {task.isPrivate && (
                                      <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                                        <span>سرية للمدير</span>
                                      </span>
                                    )}
                                    {isUserMentionedInTask(task, currentUser) && (
                                      <span className="text-[9px] bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                                        <AtSign className="w-2.5 h-2.5 text-purple-700" />
                                        <span>منشن لك</span>
                                      </span>
                                    )}
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                                      {task.category}
                                    </span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${deadline.badgeClass}`}
                                    >
                                      {deadline.label}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono font-medium flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5 text-slate-400" />
                                      <span>تسليم: {task.dueDate}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Card Action Controls: Copy, Edit, Move to Member, Reorder Up/Down */}
                              <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 p-0.5 rounded-lg border border-slate-200/60">
                                <button
                                  type="button"
                                  onClick={e => handleCopyTaskText(task, e)}
                                  className={`p-1 rounded text-[10px] transition-all cursor-pointer ${
                                    copiedTaskId === task.id
                                      ? 'bg-emerald-100 text-emerald-700 font-bold'
                                      : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                                  }`}
                                  title="نسخ نص المهمة وتفاصيلها (Copy)"
                                >
                                  {copiedTaskId === task.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={e => {
                                    handleStartEditTask(task, e);
                                    setSelectedTaskId(task.id);
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
                                  title="تعديل المهمة (Edit)"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>

                                <div className="relative inline-block">
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setMoveDropdownTaskId(moveDropdownTaskId === task.id ? null : task.id);
                                    }}
                                    className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-white transition-all cursor-pointer"
                                    title="نقل لموظف آخر بالتيم (Move)"
                                  >
                                    <Move className="w-3 h-3" />
                                  </button>
                                  {moveDropdownTaskId === task.id && (
                                    <div
                                      onClick={e => e.stopPropagation()}
                                      className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 text-right"
                                    >
                                      <div className="px-3 py-1 text-[10px] font-black text-slate-400 border-b border-slate-100">
                                        نقل المهمة إلى:
                                      </div>
                                      <div className="max-h-40 overflow-y-auto">
                                        {team.map(m => (
                                          <button
                                            key={m.id}
                                            type="button"
                                            onClick={e => handleMoveTaskMember(task.id, m.id, e)}
                                            className={`w-full text-right px-3 py-1.5 text-xs font-bold hover:bg-slate-50 flex items-center justify-between transition-colors ${
                                              m.id === task.assignedToId ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'
                                            }`}
                                          >
                                            <div className="flex items-center gap-1.5 truncate">
                                              <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                                              <span className="truncate">{m.name}</span>
                                            </div>
                                            {m.id === task.assignedToId && <span className="text-[9px] text-blue-500">الحالي</span>}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={e => handleReorderTaskItem(task.id, 'up', e)}
                                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                                  title="تحريك لأعلى ⬆️"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={e => handleReorderTaskItem(task.id, 'down', e)}
                                  className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                                  title="تحريك لأسفل ⬇️"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Card Footer: Timer Start/End + Time logged */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {task.isTimerRunning ? (
                                  <div className="flex items-center gap-1">
                                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                      <span>{formatLiveTimer(task)}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => pauseTaskTimer(task.id)}
                                      className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                                      title="إيقاف مؤقت للاستراحة - لن يتم احتساب وقت التوقف"
                                    >
                                      <Pause className="w-2.5 h-2.5" />
                                      <span>إيقاف مؤقت</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStopTimerTaskId(task.id)}
                                      className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                                      title="إنهاء الجلسة وحساب الوقت الفعلي"
                                    >
                                      <Square className="w-2.5 h-2.5 fill-current" />
                                      <span>إنهاء</span>
                                    </button>
                                  </div>
                                ) : task.isTimerPaused ? (
                                  <div className="flex items-center gap-1">
                                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md font-mono text-[10px] font-bold flex items-center gap-1">
                                      <span>⏸️ {formatLiveTimer(task)}</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => resumeTaskTimer(task.id)}
                                      className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                                      title="استئناف العمل الفعلي"
                                    >
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                      <span>استئناف</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStopTimerTaskId(task.id)}
                                      className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                                      title="إنهاء الجلسة وحساب الوقت الفعلي"
                                    >
                                      <Square className="w-2.5 h-2.5 fill-current" />
                                      <span>إنهاء</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => startTaskTimer(task.id)}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                    title="بدء مؤقت العمل الفعلي"
                                  >
                                    <Play className="w-2.5 h-2.5" />
                                    <span>بدء (Start)</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ⏱️ {formatDurationMinutes(task.totalLoggedMinutes || 0)}
                                </span>
                                <button
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className="text-slate-400 hover:text-blue-600 p-0.5"
                                  title="فتح التفاصيل والمنشنات"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Column Bottom: Quick Add Task Input ("وانا اقدر او هو يضيف التاكسات ديه") */}
                  <div className="p-2.5 bg-white border-t border-slate-200/90">
                    {isCurrentMemberOpen ? (
                      <div className="space-y-2 p-2 bg-slate-50 rounded-xl border border-blue-200 animate-in fade-in">
                        <input
                          type="text"
                          value={quickAddTitle}
                          onChange={e => setQuickAddTitle(e.target.value)}
                          placeholder={`اكتب عنوان المهمة لـ ${member.name}...`}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500 font-medium"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleInlineQuickAdd(member.id);
                          }}
                        />

                        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            <input
                              type="date"
                              value={quickAddDueDate}
                              onChange={e => setQuickAddDueDate(e.target.value)}
                              className="p-1 bg-white border border-slate-200 rounded font-mono text-[10px]"
                            />
                            <select
                              value={quickAddPriority}
                              onChange={e => setQuickAddPriority(e.target.value as TaskPriority)}
                              className="p-1 bg-white border border-slate-200 rounded text-[10px] font-bold"
                            >
                              <option value="medium">متوسطة</option>
                              <option value="high">عالية</option>
                              <option value="urgent">عاجلة 🔴</option>
                              <option value="low">منخفضة</option>
                            </select>
                          </div>

                          {isManager && (
                            <label className="flex items-center gap-1 text-[10px] text-amber-900 font-bold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={quickAddIsPrivate}
                                onChange={e => setQuickAddIsPrivate(e.target.checked)}
                                className="accent-amber-600 rounded"
                              />
                              <span>سرية للمدير 🔒</span>
                            </label>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickAddColumn(null);
                              setQuickAddTitle('');
                            }}
                            className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-bold"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInlineQuickAdd(member.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs"
                          >
                            إضافة المهمة
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddColumn(member.id);
                          setQuickAddTitle('');
                          setQuickAddDueDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="w-full py-1.5 px-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-dashed border-slate-200 hover:border-blue-300 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        <span>+ إضافة مهمة لـ {member.name.split(' ')[0]}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: TRELLO BY DAYS (بورد الأيام: اليوم، غداً، هذا الأسبوع...) */}
      {/* "يحطها بالايام زي تريللو ويعلم عليها صح اللي خلصت" */}
      {viewMode === 'day_boards' && (() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrowDate = new Date(Date.now() + 86400000);
        const tomorrowStr = tomorrowDate.toISOString().split('T')[0];
        const in7DaysDate = new Date(Date.now() + 7 * 86400000);
        const in7DaysStr = in7DaysDate.toISOString().split('T')[0];

        const dayColumns = [
          {
            id: 'col_today',
            title: '📅 اليوم (Today)',
            subtitle: 'المستحقة اليوم أو المتأخرة',
            color: 'border-rose-400 bg-rose-50/40 text-rose-800',
            defaultDate: todayStr,
            tasks: filteredTasks.filter(t => t.status !== 'completed' && t.dueDate <= todayStr)
          },
          {
            id: 'col_tomorrow',
            title: '⏳ غداً (Tomorrow)',
            subtitle: 'المستحقة يوم غد',
            color: 'border-amber-400 bg-amber-50/40 text-amber-800',
            defaultDate: tomorrowStr,
            tasks: filteredTasks.filter(t => t.status !== 'completed' && t.dueDate === tomorrowStr)
          },
          {
            id: 'col_week',
            title: '🗓️ هذا الأسبوع (This Week)',
            subtitle: 'خلال الأيام الـ 7 القادمة',
            color: 'border-blue-400 bg-blue-50/40 text-blue-800',
            defaultDate: in7DaysStr,
            tasks: filteredTasks.filter(
              t => t.status !== 'completed' && t.dueDate > tomorrowStr && t.dueDate <= in7DaysStr
            )
          },
          {
            id: 'col_later',
            title: '📌 قريباً لاحقاً (Upcoming)',
            subtitle: 'مجدولة لمواعيد لاحقة',
            color: 'border-purple-400 bg-purple-50/40 text-purple-800',
            defaultDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            tasks: filteredTasks.filter(
              t => t.status !== 'completed' && (!t.dueDate || t.dueDate > in7DaysStr)
            )
          },
          {
            id: 'col_done',
            title: '✅ المنجزة والمكتملة (Done)',
            subtitle: 'المهام التي تم إنهاؤها بنجاح',
            color: 'border-emerald-400 bg-emerald-50/40 text-emerald-800',
            defaultDate: todayStr,
            tasks: filteredTasks.filter(t => t.status === 'completed')
          }
        ];

        return (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-600 text-white rounded-lg shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <strong className="font-extrabold text-slate-900 block text-xs">
                    بورد الأيام (swiftmynd بالأيام):
                  </strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    تنظيم وتوزيع المهام حسب أيام الاستحقاق (اليوم، غداً، هذا الأسبوع، قريباً، المنجزة). علامة صح [✓] لإنهاء أي مهمة فوراً.
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-start">
              {dayColumns.map(col => {
                const isColOpen = quickAddColumn === col.id;

                return (
                  <div
                    key={col.id}
                    className="bg-slate-100/85 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col max-h-[80vh] overflow-hidden"
                  >
                    {/* Header */}
                    <div className={`p-3 border-b-2 bg-white flex items-center justify-between ${col.color}`}>
                      <div>
                        <div className="font-black text-xs text-slate-900">{col.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{col.subtitle}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full font-bold text-[10px] border">
                        {col.tasks.length}
                      </span>
                    </div>

                    {/* Tasks List */}
                    <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                      {col.tasks.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 bg-white/70 rounded-xl border border-dashed border-slate-200 text-xs">
                          لا توجد مهام في هذه القائمة
                        </div>
                      ) : (
                        col.tasks.map(task => {
                          const isDone = task.status === 'completed';
                          const assignee = team.find(m => m.id === task.assignedToId) || currentUser;

                          return (
                            <div
                              key={task.id}
                              className={`p-3 rounded-xl border transition-all text-xs space-y-2 select-text shadow-2xs hover:shadow-md ${
                                isDone
                                  ? 'bg-emerald-50/50 border-emerald-200/90'
                                  : task.isTimerRunning
                                  ? 'bg-white border-emerald-300 ring-2 ring-emerald-100'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              {/* Top: Checkbox [✓] + Title + Actions (Copy / Edit / Move / Reorder) */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <button
                                    type="button"
                                    onClick={e => toggleTaskComplete(task.id, e)}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                                      isDone
                                        ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-500'
                                        : 'border-2 border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50'
                                    }`}
                                    title={isDone ? 'إعادة المهمة جارية' : 'تعليم كمكتملة بنجاح ✓'}
                                  >
                                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div
                                      onClick={() => setSelectedTaskId(task.id)}
                                      className={`font-extrabold cursor-pointer leading-snug hover:text-blue-600 transition-colors ${
                                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                                      }`}
                                    >
                                      {renderTaskTitleWithMentions(task.title)}
                                    </div>

                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <img
                                        src={assignee.avatar}
                                        alt={assignee.name}
                                        className="w-4 h-4 rounded-full object-cover border"
                                      />
                                      <span className="text-[10px] font-bold text-slate-700 truncate max-w-[90px]">
                                        {assignee.name}
                                      </span>
                                      {task.isPrivate && (
                                        <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded font-black flex items-center gap-0.5">
                                          <Lock className="w-2 h-2 text-amber-700" />
                                          <span>سرية</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 p-0.5 rounded-lg border border-slate-200/60">
                                  <button
                                    type="button"
                                    onClick={e => handleCopyTaskText(task, e)}
                                    className={`p-1 rounded text-[10px] transition-all cursor-pointer ${
                                      copiedTaskId === task.id
                                        ? 'bg-emerald-100 text-emerald-700 font-bold'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                                    }`}
                                    title="نسخ نص المهمة وتفاصيلها (Copy)"
                                  >
                                    {copiedTaskId === task.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={e => {
                                      handleStartEditTask(task, e);
                                      setSelectedTaskId(task.id);
                                    }}
                                    className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
                                    title="تعديل المهمة (Edit)"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>

                                  <div className="relative inline-block">
                                    <button
                                      type="button"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setMoveDropdownTaskId(moveDropdownTaskId === task.id ? null : task.id);
                                      }}
                                      className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-white transition-all cursor-pointer"
                                      title="نقل لموظف آخر بالتيم (Move)"
                                    >
                                      <Move className="w-3 h-3" />
                                    </button>
                                    {moveDropdownTaskId === task.id && (
                                      <div
                                        onClick={e => e.stopPropagation()}
                                        className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 text-right"
                                      >
                                        <div className="px-3 py-1 text-[10px] font-black text-slate-400 border-b border-slate-100">
                                          نقل المهمة إلى:
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                          {team.map(m => (
                                            <button
                                              key={m.id}
                                              type="button"
                                              onClick={e => handleMoveTaskMember(task.id, m.id, e)}
                                              className={`w-full text-right px-3 py-1.5 text-xs font-bold hover:bg-slate-50 flex items-center justify-between transition-colors ${
                                                m.id === task.assignedToId ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'
                                              }`}
                                            >
                                              <div className="flex items-center gap-1.5 truncate">
                                                <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                                                <span className="truncate">{m.name}</span>
                                              </div>
                                              {m.id === task.assignedToId && <span className="text-[9px] text-blue-500">الحالي</span>}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={e => handleReorderTaskItem(task.id, 'up', e)}
                                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                                    title="تحريك لأعلى ⬆️"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={e => handleReorderTaskItem(task.id, 'down', e)}
                                    className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                                    title="تحريك لأسفل ⬇️"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Footer: Timer Start/End */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  {task.isTimerRunning ? (
                                    <div className="flex items-center gap-1">
                                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-md font-mono text-[9px] font-bold">
                                        {formatLiveTimer(task)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => pauseTaskTimer(task.id)}
                                        className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[9px] font-bold cursor-pointer"
                                        title="إيقاف مؤقت للاستراحة - لن يحسب وقت التوقف"
                                      >
                                        <Pause className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setStopTimerTaskId(task.id)}
                                        className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[9px] font-bold cursor-pointer"
                                        title="إنهاء الجلسة وحساب الوقت الفعلي"
                                      >
                                        <Square className="w-2.5 h-2.5 fill-current" />
                                      </button>
                                    </div>
                                  ) : task.isTimerPaused ? (
                                    <div className="flex items-center gap-1">
                                      <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-md font-mono text-[9px] font-bold">
                                        ⏸️ {formatLiveTimer(task)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => resumeTaskTimer(task.id)}
                                        className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[9px] font-bold cursor-pointer"
                                        title="استئناف العمل"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setStopTimerTaskId(task.id)}
                                        className="px-1.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[9px] font-bold cursor-pointer"
                                        title="إنهاء الجلسة وحساب الوقت"
                                      >
                                        <Square className="w-2.5 h-2.5 fill-current" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => startTaskTimer(task.id)}
                                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5"
                                      title="بدء المؤقت"
                                    >
                                      <Play className="w-2.5 h-2.5" />
                                      <span>بدء (Start)</span>
                                    </button>
                                  )}
                                </div>

                                <div className="text-[10px] text-slate-400 font-mono">
                                  {task.dueDate}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Column Quick Add */}
                    {col.id !== 'col_done' && (
                      <div className="p-2.5 bg-white border-t border-slate-200/90">
                        {isColOpen ? (
                          <div className="space-y-2 p-2 bg-slate-50 rounded-xl border border-amber-200 animate-in fade-in">
                            <input
                              type="text"
                              value={quickAddTitle}
                              onChange={e => setQuickAddTitle(e.target.value)}
                              placeholder={`اكتب مهمة لـ ${col.title.split(' ')[1]}...`}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500 font-medium"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleInlineQuickAdd(currentUser.id, col.defaultDate);
                              }}
                            />

                            <div className="flex items-center justify-end gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickAddColumn(null);
                                  setQuickAddTitle('');
                                }}
                                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-bold"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInlineQuickAdd(currentUser.id, col.defaultDate)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-2xs"
                              >
                                إضافة
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setQuickAddColumn(col.id);
                              setQuickAddTitle('');
                            }}
                            className="w-full py-1.5 px-2 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-800 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-dashed border-slate-200 hover:border-amber-300 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-600" />
                            <span>+ إضافة مهمة لهذا اليوم</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* VIEW 1: DETAILED LIST VIEW WITH LIVE TIMERS & ACTIONS */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold">
                  <th className="py-3 px-3 w-8 text-center">⭐</th>
                  <th className="py-3 px-3">عنوان المهمة والتصنيف</th>
                  <th className="py-3 px-3">المسؤول المكلف</th>
                  <th className="py-3 px-3">تاريخ العمل (من يوم إيه لإيه)</th>
                  <th className="py-3 px-3">الأولوية والحالة</th>
                  <th className="py-3 px-3 text-center">مؤقت العمل المباشر</th>
                  <th className="py-3 px-3">إجمالي ساعات العمل</th>
                  <th className="py-3 px-3">تعليقات ومنشن</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-bold text-slate-700">لا توجد مهام مطابقة للشروط المحددة</div>
                        <p className="text-[11px] text-slate-400">
                          {isManager
                            ? 'يمكنك إضافة مهمة جديدة أو تغيير التصفية'
                            : 'ليس لديك مهام معلقة مسندة إليك حالياً'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => {
                    const assignee = team.find(m => m.id === task.assignedToId) || currentUser;
                    const deadline = getDeadlineStatus(task.dueDate, task.dueTime, task.status);
                    const isStarred = starredTasks.includes(task.id);
                    const isMyTask = task.assignedToId === currentUser.id;
                    const commentsCount = task.comments?.length || 0;

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          task.isTimerRunning ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        {/* Checkbox [✓] & Star */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={e => toggleTaskComplete(task.id, e)}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                task.status === 'completed'
                                  ? 'bg-emerald-600 text-white shadow-2xs ring-1 ring-emerald-500'
                                  : 'border-2 border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50'
                              }`}
                              title={task.status === 'completed' ? 'إعادة المهمة جارية' : 'تعليم كمكتملة بنجاح ✓'}
                            >
                              {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <button
                              onClick={e => toggleStar(task.id, e)}
                              className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  isStarred ? 'text-amber-400 fill-amber-400' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </td>

                        {/* Title & Category */}
                        <td className="py-3 px-3 max-w-xs">
                          <div
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`font-extrabold hover:text-blue-600 transition-colors cursor-pointer ${
                              task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                            title={task.title}
                          >
                            {renderTaskTitleWithMentions(task.title)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {task.isPrivate && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded font-black flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5 text-amber-700" />
                                <span>سرية للمدير</span>
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-bold">
                              {task.category}
                            </span>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} خطوة)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{assignee.name}</span>
                                {isMyTask && (
                                  <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded font-bold">
                                    أنت
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">{assignee.role}</div>
                            </div>
                          </div>
                        </td>

                        {/* Work Dates: From date to date */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-mono text-slate-700">
                              من: <strong className="text-slate-900">{task.startDate || 'غير محدد'}</strong>
                            </div>
                            <div className="text-[11px] font-mono text-slate-700">
                              إلى: <strong className="text-blue-700">{task.dueDate}</strong>
                            </div>
                            <span
                              className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold border ${deadline.badgeClass}`}
                            >
                              {deadline.label}
                            </span>
                          </div>
                        </td>

                        {/* Priority & Status */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  task.priority === 'urgent'
                                    ? 'bg-rose-100 text-rose-700'
                                    : task.priority === 'high'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {task.priority === 'urgent'
                                  ? 'عاجل جداً'
                                  : task.priority === 'high'
                                  ? 'مرتفع'
                                  : task.priority === 'medium'
                                  ? 'متوسط'
                                  : 'عادي'}
                              </span>
                            </div>

                            <select
                              value={task.status}
                              onChange={e => changeTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                              <option value="todo">قيد الانتظار</option>
                              <option value="in_progress">جاري العمل</option>
                              <option value="review">قيد المراجعة</option>
                              <option value="completed">مكتملة</option>
                            </select>
                          </div>
                        </td>

                        {/* Live Timer Control */}
                        <td className="py-3 px-3 text-center">
                          {task.isTimerRunning ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-mono font-bold text-xs flex items-center gap-1.5 shadow-2xs animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                <span>{formatLiveTimer(task)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => pauseTaskTimer(task.id)}
                                  className="text-[10px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.5 cursor-pointer bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                                  title="إيقاف مؤقت للاستراحة - لن يحسب وقت التوقف"
                                >
                                  <Pause className="w-2.5 h-2.5" /> إيقاف مؤقت
                                </button>
                                <button
                                  onClick={() => setStopTimerTaskId(task.id)}
                                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                                >
                                  <Square className="w-2.5 h-2.5 fill-current" /> إنهاء وحفظ
                                </button>
                              </div>
                            </div>
                          ) : task.isTimerPaused ? (
                            <div className="flex flex-col items-center gap-1">
                              <div className="px-2.5 py-1 bg-amber-500 text-white rounded-lg font-mono font-bold text-xs flex items-center gap-1 shadow-2xs">
                                <span>⏸️ {formatLiveTimer(task)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => resumeTaskTimer(task.id)}
                                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" /> استئناف
                                </button>
                                <button
                                  onClick={() => setStopTimerTaskId(task.id)}
                                  className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-0.5 cursor-pointer bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                                >
                                  <Square className="w-2.5 h-2.5 fill-current" /> إنهاء وحفظ
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startTaskTimer(task.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer mx-auto"
                              title="تشغيل مؤقت العمل المباشر"
                            >
                              <Play className="w-3 h-3" />
                              <span>بدء المؤقت</span>
                            </button>
                          )}
                        </td>

                        {/* Logged Hours */}
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-800 text-[11px]">
                            {formatDurationMinutes(task.totalLoggedMinutes || 0)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            من أصل {task.estimatedHours || 4} س تقديرية
                          </div>
                        </td>

                        {/* Comments & Mentions Count */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              commentsCount > 0
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-2xs ring-1 ring-blue-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                            }`}
                            title="فتح صندوق المنشن والتعليقات المباشرة"
                          >
                            <AtSign className="w-3.5 h-3.5 text-blue-600" />
                            <span>{commentsCount > 0 ? `${commentsCount} منشن` : '+ أضف منشن @'}</span>
                            {commentsCount > 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedTaskId(task.id)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                              title="تفاصيل المهمة وسجل الفترات والمنشن"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setManualLogTaskId(task.id);
                                setManualMemberId(task.assignedToId);
                              }}
                              className="p-1.5 hover:bg-slate-100 text-emerald-600 rounded transition-colors cursor-pointer"
                              title="إضافة فترة عمل يدوياً"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {isManager && (
                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
                                    deleteTask(task.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                title="حذف المهمة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
        </div>
      )}

      {/* VIEW 2: TIME LOGS CHRONOLOGICAL HUB (من يوم إيه لإيه) */}
      {viewMode === 'time_logs' && (
        <div className="space-y-3">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <History className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold text-emerald-950 block text-[13px]">
                  سجل فترات عمل التيم المفصل (من يوم إيه لإيه بالوقت والمدة)
                </strong>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  هنا تجد جدولاً كاملاً لكل فترات العمل المسجلة: الموظف الذي عمل، عنوان المهمة، بدأ من تاريخ كذا الساعة كذا إلى تاريخ كذا الساعة كذا، مع مدة العمل وملاحظات الإنجاز.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const firstTaskId = filteredTasks[0]?.id || tasks[0]?.id;
                if (firstTaskId) {
                  setManualLogTaskId(firstTaskId);
                  setManualMemberId(currentUser.id);
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shrink-0 shadow-2xs transition-all cursor-pointer text-[11px]"
            >
              + إضافة فترة عمل يدوية
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold">
                    <th className="py-3 px-4">عضو الفريق</th>
                    <th className="py-3 px-3">المهمة والتصنيف</th>
                    <th className="py-3 px-3">بدأ العمل (من يوم)</th>
                    <th className="py-3 px-3">انتهى العمل (إلى يوم)</th>
                    <th className="py-3 px-3">مدة الجلسة</th>
                    <th className="py-3 px-3">ملاحظات فترة العمل</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTimeLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        لا توجد فترات عمل مسجلة بعد. استخدم المؤقت في جدول المهام للبدء بالتسجيل.
                      </td>
                    </tr>
                  ) : (
                    allTimeLogs.map(({ task, log }) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={log.memberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                              alt={log.memberName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-extrabold text-slate-900">{log.memberName}</div>
                              <div className="text-[10px] text-slate-400">عضو معتمد</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div
                            onClick={() => setSelectedTaskId(task.id)}
                            className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer"
                          >
                            {renderTaskTitleWithMentions(task.title)}
                          </div>
                          <div className="text-[10px] text-slate-400">{task.category}</div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                          <strong>{log.startDate}</strong>
                          <span className="text-slate-400 text-[10px] block font-sans">
                            الساعة {log.startTime}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-blue-700">
                          <strong>{log.endDate}</strong>
                          <span className="text-slate-400 text-[10px] block font-sans">
                            الساعة {log.endTime}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] font-mono">
                            {formatDurationMinutes(log.durationMinutes)}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 max-w-xs italic text-[11px]">
                          "{log.note || 'جلسة عمل مسجلة'}"
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isManager && (
                            <button
                              onClick={() => deleteTimeLog(task.id, log.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="حذف هذه الفترة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {(['todo', 'in_progress', 'review', 'completed'] as TaskStatus[]).map(status => {
            const statusTasks = filteredTasks.filter(t => t.status === status);
            const statusLabels: Record<TaskStatus, { title: string; color: string }> = {
              todo: { title: 'قيد الانتظار', color: 'border-slate-300 text-slate-700' },
              in_progress: { title: 'جاري العمل الآن', color: 'border-blue-400 text-blue-700' },
              review: { title: 'قيد المراجعة', color: 'border-amber-400 text-amber-700' },
              completed: { title: 'مكتملة بنجاح', color: 'border-emerald-400 text-emerald-700' }
            };

            return (
              <div key={status} className="bg-slate-100/70 p-3 rounded-xl border border-slate-200/80 space-y-2.5 flex flex-col max-h-[75vh]">
                <div className={`flex items-center justify-between pb-2 border-b-2 font-black ${statusLabels[status].color}`}>
                  <span>{statusLabels[status].title}</span>
                  <span className="px-2 py-0.2 bg-white rounded-full text-[10px] border">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1">
                  {statusTasks.map(task => {
                    const assignee = team.find(m => m.id === task.assignedToId) || currentUser;
                    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed'];
                    const currentStatusIdx = statusOrder.indexOf(task.status);
                    const prevStatus = currentStatusIdx > 0 ? statusOrder[currentStatusIdx - 1] : null;
                    const nextStatus = currentStatusIdx < statusOrder.length - 1 ? statusOrder[currentStatusIdx + 1] : null;

                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-2.5"
                      >
                        {/* Top: Checkbox [✓] + Title + Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={e => toggleTaskComplete(task.id, e)}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
                                task.status === 'completed'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'border border-slate-300 hover:border-blue-500 bg-white'
                              }`}
                              title={task.status === 'completed' ? 'إعادة المهمة جارية' : 'تعليم كمكتملة بنجاح ✓'}
                            >
                              {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className={`font-extrabold text-slate-900 text-xs leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                                {renderTaskTitleWithMentions(task.title)}
                              </div>

                              <div className="flex items-center gap-1.5 mt-1">
                                {task.isPrivate && (
                                  <span className="text-[8px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded font-black flex items-center gap-0.5">
                                    <Lock className="w-2 h-2 text-amber-700" />
                                    <span>سرية</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-mono">
                                  من: {task.startDate || 'اليوم'} | إلى: {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Toolbar */}
                          <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 p-0.5 rounded-lg border border-slate-200/60" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={e => handleCopyTaskText(task, e)}
                              className={`p-1 rounded text-[10px] transition-all cursor-pointer ${
                                copiedTaskId === task.id
                                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-white'
                              }`}
                              title="نسخ نص وتفاصيل المهمة (Copy)"
                            >
                              {copiedTaskId === task.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>

                            <button
                              type="button"
                              onClick={e => {
                                handleStartEditTask(task, e);
                                setSelectedTaskId(task.id);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-white transition-all cursor-pointer"
                              title="تعديل المهمة (Edit)"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <div className="relative inline-block">
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setMoveDropdownTaskId(moveDropdownTaskId === task.id ? null : task.id);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-white transition-all cursor-pointer"
                                title="نقل لموظف آخر بالتيم (Move)"
                              >
                                <Move className="w-3 h-3" />
                              </button>
                              {moveDropdownTaskId === task.id && (
                                <div
                                  onClick={e => e.stopPropagation()}
                                  className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 text-right"
                                >
                                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 border-b border-slate-100">
                                    نقل المهمة إلى:
                                  </div>
                                  <div className="max-h-40 overflow-y-auto">
                                    {team.map(m => (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={e => handleMoveTaskMember(task.id, m.id, e)}
                                        className={`w-full text-right px-3 py-1.5 text-xs font-bold hover:bg-slate-50 flex items-center justify-between transition-colors ${
                                          m.id === task.assignedToId ? 'text-blue-600 bg-blue-50/50' : 'text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                                          <span className="truncate">{m.name}</span>
                                        </div>
                                        {m.id === task.assignedToId && <span className="text-[9px] text-blue-500">الحالي</span>}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={e => handleReorderTaskItem(task.id, 'up', e)}
                              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                              title="تحريك لأعلى ⬆️"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={e => handleReorderTaskItem(task.id, 'down', e)}
                              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                              title="تحريك لأسفل ⬇️"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Move Between Stages in Kanban (MOVE [الموقع بين الكارت والتاني) */}
                        <div className="flex items-center justify-between bg-slate-50/90 px-2 py-1 rounded-lg border border-slate-100 text-[10px]" onClick={e => e.stopPropagation()}>
                          <span className="text-slate-400 font-bold">نقل المرحلة:</span>
                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                type="button"
                                onClick={e => handleMoveTaskStatus(task.id, prevStatus, e)}
                                className="px-1.5 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="نقل إلى المرحلة السابقة"
                              >
                                <span>السابقة</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                type="button"
                                onClick={e => handleMoveTaskStatus(task.id, nextStatus, e)}
                                className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="نقل إلى المرحلة التالية"
                              >
                                <ArrowLeft className="w-2.5 h-2.5" />
                                <span>التالية</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">
                              {assignee.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {task.isTimerRunning ? (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  setStopTimerTaskId(task.id);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer flex items-center gap-0.5 animate-pulse"
                                title="إنهاء الجلسة وحساب الوقت"
                              >
                                <Pause className="w-2.5 h-2.5" />
                                <span>إنهاء (End)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  startTaskTimer(task.id);
                                }}
                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                                title="بدء المؤقت"
                              >
                                <Play className="w-2.5 h-2.5" />
                                <span>بدء (Start)</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskId(task.id);
                              }}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-100 cursor-pointer"
                              title="فتح المنشن والتعليقات"
                            >
                              <AtSign className="w-2.5 h-2.5" />
                              <span>{task.comments?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 4: CALENDAR TIMELINE */}
      {viewMode === 'calendar' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>جدول مواعيد استحقاق وتسليم المهام (Timeline)</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTasks.map(task => {
              const assignee = team.find(m => m.id === task.assignedToId) || currentUser;
              return (
                <div key={task.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-center py-1 bg-blue-50 border border-blue-200 rounded-lg shrink-0">
                      <div className="text-[10px] text-blue-600 font-bold">تسليم</div>
                      <div className="font-mono font-black text-blue-900 text-xs">{task.dueDate.substring(5)}</div>
                    </div>

                    <div>
                      <div
                        onClick={() => setSelectedTaskId(task.id)}
                        className="font-extrabold text-slate-800 hover:text-blue-600 cursor-pointer"
                      >
                        {renderTaskTitleWithMentions(task.title)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        مسند إلى: <strong>{assignee.name}</strong> ({assignee.department}) | من: {task.startDate || 'البدء'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status === 'completed' ? 'مكتملة' : 'جارية'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: STOP TIMER & EXACT TIME/DAY CALCULATION */}
      {/* "لما الموظف يبدء تاسك ويوقف ساعه ويرجع تاني يحسب الساعه لاء عايزه يحسب الوقت اللي اشتغله فعلي بس" */}
      {stopTimerTaskId && (() => {
        const stoppingTask = tasks.find(t => t.id === stopTimerTaskId);
        if (!stoppingTask) return null;

        const startTimestamp = stoppingTask.timerStartedAt || Date.now();
        const startDateObj = new Date(startTimestamp);
        const nowObj = new Date();

        const arabicDayName = nowObj.toLocaleDateString('ar-EG', { weekday: 'long' });
        const fullDateArabic = nowObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const startTimeStr = startDateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const endTimeStr = nowObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        // Calculate actual active worked time (excludes all pauses)
        const currentActiveMs = stoppingTask.isTimerRunning
          ? Math.max(0, Date.now() - (stoppingTask.timerLastResumedAt || stoppingTask.timerStartedAt || Date.now()))
          : 0;
        const totalActiveMs = (stoppingTask.timerAccumulatedMs || 0) + currentActiveMs;
        const calculatedMinutes = Math.max(1, Math.round(totalActiveMs / 60000));

        // Wall clock difference
        const wallClockMs = Math.max(0, Date.now() - startTimestamp);
        const wallClockMinutes = Math.max(1, Math.round(wallClockMs / 60000));
        const idlePausedMinutes = Math.max(0, wallClockMinutes - calculatedMinutes);

        // Effective minutes to record
        const effectiveMinutes = typeof stopTimerCustomMinutes === 'number' && stopTimerCustomMinutes >= 1
          ? stopTimerCustomMinutes
          : calculatedMinutes;

        const hours = Math.floor(effectiveMinutes / 60);
        const mins = effectiveMinutes % 60;
        const durationArabic = hours > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${mins} دقيقة`;
        const newTotalMins = (stoppingTask.totalLoggedMinutes || 0) + effectiveMinutes;

        return (
          <div
            onClick={() => {
              setStopTimerTaskId(null);
              setStopTimerCustomMinutes(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none cursor-pointer"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col cursor-default"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#172033] via-slate-900 to-[#172033] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 rounded-lg">
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                      <span>حساب وقت العمل الفعلي فقط (End Task Timer)</span>
                    </h3>
                    <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                      المهمة: {stoppingTask.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setStopTimerTaskId(null);
                    setStopTimerCustomMinutes(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body: Calculations */}
              <div className="p-5 space-y-4 text-xs">
                {/* Highlighted Result Box: التاسك خد وقت أد إيه فعلي */}
                <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    ⏱️ مدة العمل الفعلية المحسوبة (صافي بدون أوقات التوقف والراحة):
                  </span>
                  <div className="text-3xl font-black text-emerald-700 tracking-tight font-mono">
                    {durationArabic}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-bold">
                    ({effectiveMinutes} دقيقة عمل فعلي)
                  </div>
                </div>

                {/* Excluded Pause Notice if applicable */}
                {idlePausedMinutes > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900">
                    <span className="text-lg">☕</span>
                    <div className="text-[11px] leading-relaxed">
                      <strong>تم استبعاد أوقات التوقف والراحة تلقائياً:</strong>
                      <span className="block text-amber-800">
                        استغرقت فترات التوقف ({idlePausedMinutes >= 60 ? `${Math.floor(idlePausedMinutes / 60)} ساعة و ${idlePausedMinutes % 60} دقيقة` : `${idlePausedMinutes} دقيقة`}) وتم استبعادها تماماً من الحساب!
                      </span>
                    </div>
                  </div>
                )}

                {/* Day & Times Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block">اليوم والتاريخ</span>
                    <strong className="text-slate-900 text-xs font-black block">{arabicDayName}</strong>
                    <span className="text-[10px] text-slate-500 font-mono block">{fullDateArabic}</span>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-blue-600 font-bold block">وقت البدء (Start)</span>
                    <strong className="text-blue-950 text-xs font-black block font-mono">{startTimeStr}</strong>
                    <span className="text-[10px] text-blue-600 font-bold block">انطلاق المؤقت</span>
                  </div>

                  <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-amber-700 font-bold block">وقت الانتهاء (End)</span>
                    <strong className="text-amber-950 text-xs font-black block font-mono">{endTimeStr}</strong>
                    <span className="text-[10px] text-amber-600 font-bold block">لحظة الإيقاف</span>
                  </div>
                </div>

                {/* Manual Adjustment in case timer was forgotten on */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 text-[11px]">
                      هل تركت المؤقت يعمل دون قصد أثناء غيابك؟ عدل دقائق العمل الفعلية:
                    </label>
                    {stopTimerCustomMinutes !== null && (
                      <button
                        type="button"
                        onClick={() => setStopTimerCustomMinutes(null)}
                        className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        استعادة الوقت التلقائي ({calculatedMinutes} د)
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={effectiveMinutes}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        setStopTimerCustomMinutes(isNaN(val) ? 1 : Math.max(1, val));
                      }}
                      className="w-24 p-2 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-bold">دقيقة عمل فعلي</span>

                    {/* Quick presets */}
                    <div className="flex items-center gap-1 mr-auto flex-wrap">
                      {[15, 30, 45, 60, 90, 120].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setStopTimerCustomMinutes(m)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            effectiveMinutes === m
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {m >= 60 ? (m === 60 ? 'ساعة' : `${m / 60} س`) : `${m} د`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Total Task Time Metric */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600">إجمالي وقت المهمة التراكمي بعد إضافة الجلسة:</span>
                  <strong className="text-slate-900 font-mono text-xs">
                    {formatDurationMinutes(newTotalMins)}
                  </strong>
                </div>

                {/* Session Note */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    ملاحظات عما أنجزته في هذه الجلسة (اختياري):
                  </label>
                  <textarea
                    value={stopTimerNote}
                    onChange={e => setStopTimerNote(e.target.value)}
                    placeholder="مثال: تم إكمال مسودة العقد، مراجعة الأسعار والتواصل مع العميل..."
                    rows={2}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStopTimerTaskId(null);
                      setStopTimerCustomMinutes(null);
                    }}
                    className="px-3 py-2 text-slate-500 hover:text-slate-800 font-bold cursor-pointer w-full sm:w-auto text-center"
                  >
                    إلغاء وإبقاء المؤقت
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        stopTaskTimer(stopTimerTaskId, stopTimerNote, false, effectiveMinutes);
                        setStopTimerTaskId(null);
                        setStopTimerNote('');
                        setStopTimerCustomMinutes(null);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all cursor-pointer text-xs"
                      title="تسجيل فترة العمل الفعلي مع إبقاء المهمة جارية"
                    >
                      حفظ الوقت الفعلي وإبقاء المهمة جارية ⏱️
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        stopTaskTimer(stopTimerTaskId, stopTimerNote, true, effectiveMinutes);
                        setStopTimerTaskId(null);
                        setStopTimerNote('');
                        setStopTimerCustomMinutes(null);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
                      title="تسجيل الوقت الفعلي وإنهاء المهمة كـ مكتملة"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>حفظ الوقت وإنهاء المهمة بنجاح ✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: MANUAL TIME LOG ENTRY (من يوم إيه لإيه) */}
      {manualLogTaskId && (
        <div
          onClick={() => setManualLogTaskId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden cursor-default"
          >
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>تسجيل فترة عمل يدوياً (من تاريخ إلى تاريخ)</span>
              </h3>
              <button
                onClick={() => setManualLogTaskId(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الموظف الذي عمل على التاسك</label>
                <select
                  value={manualMemberId}
                  onChange={e => setManualMemberId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {team.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">بدأ العمل (من يوم) *</label>
                  <input
                    type="date"
                    required
                    value={manualStartDate}
                    onChange={e => setManualStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={manualStartTime}
                    onChange={e => setManualStartTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">انتهى العمل (إلى يوم) *</label>
                  <input
                    type="date"
                    required
                    value={manualEndDate}
                    onChange={e => setManualEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الانتهاء</label>
                  <input
                    type="time"
                    value={manualEndTime}
                    onChange={e => setManualEndTime(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المدة بالدقائق *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={manualDurationMins}
                  onChange={e => setManualDurationMins(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات فترة العمل</label>
                <textarea
                  value={manualNote}
                  onChange={e => setManualNote(e.target.value)}
                  placeholder="ما الذي تم إنجازه في هذه الفترة..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setManualLogTaskId(null)}
                  className="px-3 py-1.5 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs"
                >
                  تأكيد وحفظ الفترة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TASK DETAILS, WORK PERIODS & INTERACTIVE MENTIONS */}
      {selectedTask && (
        <div
          onClick={() => {
            setSelectedTaskId(null);
            setEditingTaskId(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] cursor-default"
          >
            <div className="bg-[#172033] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm line-clamp-1">{renderTaskTitleWithMentions(selectedTask.title)}</h3>
                  <div className="text-[10px] text-slate-400">
                    تصنيف: {selectedTask.category} | أولوية: {selectedTask.priority}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyTaskText(selectedTask)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedTaskId === selectedTask.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="نسخ نص وبيانات المهمة بالكامل (Copy)"
                >
                  {copiedTaskId === selectedTask.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTaskId === selectedTask.id ? 'تم النسخ ✓' : 'نسخ النص'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (editingTaskId === selectedTask.id) {
                      setEditingTaskId(null);
                    } else {
                      handleStartEditTask(selectedTask);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editingTaskId === selectedTask.id
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                  title="تعديل تفاصيل المهمة والمسؤول والتواريخ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editingTaskId === selectedTask.id ? 'إلغاء التعديل' : 'تعديل المهمة'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedTaskId(null);
                    setEditingTaskId(null);
                  }}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {editingTaskId === selectedTask.id ? (
              <div className="p-5 overflow-y-auto space-y-4 text-xs bg-slate-50/50">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-700" />
                    <span>تعديل بيانات المهمة والموظف المسؤول والمواعيد:</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-mono">حفظ مباشر في النظام</span>
                </div>

                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">عنوان المهمة *</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={e => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      placeholder="عنوان المهمة..."
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">وصف المهمة والمطلوب تفصيلياً</label>
                    <textarea
                      value={editFormData.description}
                      onChange={e => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 leading-relaxed"
                      placeholder="اكتب المطلوب بدقة أو انسخ وألصق النص هنا..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الموظف المسؤول (المكلف بها)</label>
                      <select
                        value={editFormData.assignedToId}
                        onChange={e => setEditFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        {team.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                      <select
                        value={editFormData.category}
                        onChange={e => setEditFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="إداري">إداري</option>
                        <option value="تسويق">تسويق</option>
                        <option value="مبيعات">مبيعات</option>
                        <option value="تقني">تقني</option>
                        <option value="دعم">دعم</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">الأولوية</label>
                      <select
                        value={editFormData.priority}
                        onChange={e => setEditFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="urgent">🔴 عاجلة جداً</option>
                        <option value="high">🟠 عالية</option>
                        <option value="medium">🟡 متوسطة</option>
                        <option value="low">🟢 منخفضة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">حالة المهمة (المرحلة)</label>
                      <select
                        value={editFormData.status}
                        onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      >
                        <option value="todo">قيد الانتظار (To Do)</option>
                        <option value="in_progress">جاري العمل (In Progress)</option>
                        <option value="review">قيد المراجعة (Review)</option>
                        <option value="completed">مكتملة بنجاح ✓ (Done)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">تاريخ البدء</label>
                      <input
                        type="date"
                        value={editFormData.startDate}
                        onChange={e => setEditFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">تاريخ التسليم النهائي *</label>
                      <input
                        type="date"
                        required
                        value={editFormData.dueDate}
                        onChange={e => setEditFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {isManager && (
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <input
                          type="checkbox"
                          checked={editFormData.isPrivate}
                          onChange={e => setEditFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>مهمة سرية خاصة بالمدير العام فقط (لا يراها بقية الفريق)</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingTaskId(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    إلغاء التعديل
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTaskEdit}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>حفظ التعديلات الآن</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-500 text-[10px]">وصف المهمة والمطلوب:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyTaskText(selectedTask)}
                      className="text-blue-600 hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>نسخ الوصف</span>
                    </button>
                  </div>
                  <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedTask.description || 'لا يوجد وصف مفصل للمهمة.'}
                  </p>
                </div>

              {/* Task Metrics Info */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 border rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">تاريخ البدء</span>
                  <div className="font-mono font-extrabold text-slate-800 mt-0.5">
                    {selectedTask.startDate || 'غير محدد'}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">تاريخ التسليم النهائي</span>
                  <div className="font-mono font-extrabold text-blue-700 mt-0.5">
                    {selectedTask.dueDate}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold">إجمالي ساعات العمل</span>
                  <div className="font-black text-emerald-600 mt-0.5">
                    {formatDurationMinutes(selectedTask.totalLoggedMinutes || 0)}
                  </div>
                </div>
              </div>

              {/* Work Periods Log */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>سجل فترات عمل التيم على هذه المهمة (من يوم إيه لإيه):</span>
                  </span>
                  <button
                    onClick={() => {
                      setManualLogTaskId(selectedTask.id);
                      setManualMemberId(selectedTask.assignedToId);
                    }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة فترة عمل
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {!selectedTask.timeLogs || selectedTask.timeLogs.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 border border-dashed rounded-xl text-[11px]">
                      لم يتم تسجيل فترات عمل بعد. استخدم زر "بدء المؤقت" لتسجيل الجلسة.
                    </div>
                  ) : (
                    selectedTask.timeLogs.map(log => (
                      <div
                        key={log.id}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{log.memberName}</span>
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full font-bold text-[10px]">
                              {formatDurationMinutes(log.durationMinutes)}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            من: <strong>{log.startDate} ({log.startTime})</strong> إلى: <strong>{log.endDate} ({log.endTime})</strong>
                          </div>
                          {log.note && <p className="text-[10px] text-slate-600 italic">"{log.note}"</p>}
                        </div>

                        {isManager && (
                          <button
                            onClick={() => deleteTimeLog(selectedTask.id, log.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* COMMENTS & MENTIONS SYSTEM (@منشن) */}
              {/* "ويجيلي اشعار لو حد عمل منشن للتاسك ليا او لحد من التيم لبعضه" */}
              <div className="space-y-3 pt-3 border-t border-slate-200 bg-slate-50/60 p-3.5 rounded-2xl border">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-2xs">
                      <AtSign className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px]">التعليقات ونظام المنشن الفوري (@Mentions):</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    إشعارات فورية للجرس (🔔)
                  </span>
                </div>

                {/* Helpful Instruction Banner */}
                <div className="bg-white border border-blue-150 p-2.5 rounded-xl text-[11px] text-slate-600 leading-relaxed space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1 text-xs">
                    <span>💡 كيف ترسل منشن ويصل إشعار للشخص وللمدير؟</span>
                  </div>
                  <p>
                    1. اضغط على اسم أي عضو من <strong>الأزرار السريعة</strong> أدناه لإضافته للمنشن، أو اكتب <strong>@</strong> في مربع النص.
                    <br />
                    2. سيصل العضو المنشن <strong>إشعار فوري في جرس التنبيهات (🔔)</strong>، كما يصل <strong>إشعار للمدير</strong> تلقائياً عند منشن أي فرد لآخر.
                  </p>
                </div>

                {mentionSuccessToast && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم إرسال التعليق وإرسال إشعار المنشن فوراً لجميع المعنيين وللمدير!</span>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {!selectedTask.comments || selectedTask.comments.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                      لا توجد تعليقات أو منشنات مسجلة بعد على هذه المهمة. يمكنك أن تبدأ أول منشن من النموذج أدناه.
                    </div>
                  ) : (
                    selectedTask.comments.map(comment => (
                      <div
                        key={comment.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.authorAvatar}
                              alt={comment.authorName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-bold text-slate-900">{comment.authorName}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{comment.createdAt}</span>
                        </div>
                        <div className="text-slate-800 pr-8 leading-relaxed font-medium">
                          {renderCommentWithMentions(comment.content)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Mention Quick Picker Chips */}
                <div className="pt-1 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <AtSign className="w-3 h-3 text-blue-600" />
                      <span>انقر على اسم عضو لإضافته للمنشن فوراً (@):</span>
                    </span>
                    <span className="text-slate-400 font-normal">يتم تلوين العضو المختار</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {team.map(member => {
                      const isSelected = selectedMentionIds.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleToggleMentionUser(member)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs ring-2 ring-blue-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                          }`}
                        >
                          <span>@{member.name.split(' ')[0]}</span>
                          {member.accessLevel === 'admin' ? (
                            <span className="text-[9px] bg-amber-400 text-amber-950 px-1 rounded font-black">
                              المدير
                            </span>
                          ) : (
                            <span className="text-[9px] opacity-70">({member.role.split(' ')[0]})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="اكتب تعليقك هنا أو اضغط على اسم العضو أعلاه لإضافته للمنشن (@)..."
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs shadow-2xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال وإشعار (@)</span>
                  </button>
                </form>
              </div>

              {/* Subtasks */}
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="font-bold text-xs text-slate-900">الخطوات الفرعية:</div>
                  <div className="space-y-1">
                    {selectedTask.subtasks.map(st => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubTask(selectedTask.id, st.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs"
                      >
                        <input type="checkbox" checked={st.completed} readOnly className="rounded text-blue-600" />
                        <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex items-center justify-between pt-3 border-t">
                {isManager && (
                  <button
                    onClick={() => {
                      if (confirm('هل تريد حذف هذه المهمة نهائياً؟')) {
                        deleteTask(selectedTask.id);
                        setSelectedTaskId(null);
                      }
                    }}
                    className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> حذف المهمة
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedTaskId(null);
                    setEditingTaskId(null);
                  }}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer text-xs mr-auto"
                >
                  إغلاق
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Tasks Trash Modal (سلة مهملات المهام - استعادة وتفريغ بالكامل) */}
      {isTasksTrashModalOpen && (
        <div
          onClick={() => setIsTasksTrashModalOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <span>سلة مهملات المهام</span>
                    <span className="text-xs bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full">
                      {deletedTasks.length} مهمة
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs">
                    استعادة المهام المحذوفة أو تفريغ سلة المهملات نهائياً
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {deletedTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `هل أنت متأكد من تفريغ سلة المهملات بالكامل وحذف جميع المهام (${deletedTasks.length}) نهائياً؟\nلن يمكن التراجع عن هذا الإجراء.`
                        )
                      ) {
                        emptyTasksTrash();
                        showToast('تم تفريغ سلة المهملات بالكامل وحذف جميع المهام نهائياً 🗑️');
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="تفريغ سلة المهملات بالكامل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تفريغ السلة بالكامل</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsTasksTrashModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: List of deleted tasks */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {deletedTasks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-xs">سلة مهملات المهام فارغة تماماً ✨</div>
                  <p className="text-[11px] text-slate-400">
                    أي مهمة يتم حذفها ستظهر هنا ويمكنك استعادتها بضغطة زر واحدة.
                  </p>
                </div>
              ) : (
                deletedTasks.map(task => {
                  const assignee =
                    task.assignedToId === 'all' || task.assignedToId === 'team'
                      ? 'جميع أعضاء الفريق 🌟'
                      : team.find(m => m.id === task.assignedToId)?.name || 'غير محدد';

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="font-extrabold text-slate-900 text-xs truncate">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span>المسؤول: <strong className="text-slate-800">{assignee}</strong></span>
                          <span>•</span>
                          <span>تاريخ الاستحقاق: <strong className="text-slate-800 font-mono">{task.dueDate || 'غير محدد'}</strong></span>
                          <span>•</span>
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            أولوية: {task.priority === 'urgent' ? 'حرجة' : task.priority === 'high' ? 'عالية' : 'متوسطة'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            restoreTaskFromTrash(task.id);
                            showToast(`تمت استعادة المهمة "${task.title}" بنجاح! 📋`);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="استعادة المهمة لجدول العمل"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة المهمة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('هل تريد حذف هذه المهمة نهائياً من سلة المهملات؟')) {
                              permanentlyDeleteTask(task.id);
                              showToast('تم الحذف النهائي للمهمة');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-medium">
                {deletedTasks.length > 0 ? `إجمالي المهام في السلة: ${deletedTasks.length}` : 'لا توجد مهام محذوفة'}
              </span>
              <button
                type="button"
                onClick={() => setIsTasksTrashModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
