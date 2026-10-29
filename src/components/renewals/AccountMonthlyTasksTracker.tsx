import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Calendar,
  Clock,
  User,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  FileSpreadsheet,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown,
  Sparkles,
  BarChart3,
  Check,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  ClientRenewal,
  AccountMonthlyTask,
  AccountMonthlyTaskCategory,
  TeamMember
} from '../../types/crm';
import {
  calculateAccountTaskProgress,
  getDeliveryCountdown,
  filterAccountTasks,
  getAccountManagerMetrics
} from '../../utils/accountTasks';

interface Props {
  singleClientId?: string; // Optional: restrict to a single client (e.g. inside dossier modal)
  onOpenClientDossier?: (client: ClientRenewal) => void;
}

export const AccountMonthlyTasksTracker: React.FC<Props> = ({
  singleClientId,
  onOpenClientDossier
}) => {
  const {
    clientRenewals,
    visibleClients,
    team,
    currentUser,
    isManager,
    addAccountMonthlyTask,
    toggleAccountMonthlyTask,
    updateAccountMonthlyTask,
    deleteAccountMonthlyTask,
    setClientAccountManager
  } = useCRM();

  // Active clients pool (strictly active, never suspended)
  const activeClients = useMemo(() => {
    const pool = isManager ? clientRenewals : visibleClients;
    return (pool || []).filter(c => c.status !== 'suspended');
  }, [isManager, clientRenewals, visibleClients]);

  // Selected Month (defaults to current month: YYYY-MM)
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>('all');
  const [onlyMyAccounts, setOnlyMyAccounts] = useState<boolean>(false);

  // Modals state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [targetClientIdForTask, setTargetClientIdForTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ clientId: string; task: AccountMonthlyTask } | null>(null);

  const [taskFormData, setTaskFormData] = useState<{
    title: string;
    deliverableCount: string;
    category: AccountMonthlyTaskCategory;
    assignedToId: string;
    dueDate: string;
    month: string;
    notes: string;
  }>({
    title: '',
    deliverableCount: '',
    category: 'محتوى وبوستات',
    assignedToId: '',
    dueDate: new Date().toISOString().split('T')[0],
    month: currentMonthStr,
    notes: ''
  });

  // Assign Account Manager modal state
  const [assignManagerModalClient, setAssignManagerModalClient] = useState<ClientRenewal | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  // Months options
  const monthOptions = [
    { value: '2026-10', label: 'أكتوبر 2026 (الشهر الحالي)' },
    { value: '2026-11', label: 'نوفمبر 2026' },
    { value: '2026-12', label: 'ديسمبر 2026' },
    { value: '2027-01', label: 'يناير 2027' }
  ];

  // Categories list
  const categories: AccountMonthlyTaskCategory[] = [
    'محتوى وبوستات',
    'ريلز ومونتاج',
    'تصميم جرافيك',
    'سيو ومقالات',
    'إعلانات ممولة',
    'تقارير وتحليلات',
    'إداري ومتابعة',
    'أخرى'
  ];

  // Filter clients
  const filteredClients = useMemo(() => {
    let list = activeClients;

    // Single client mode
    if (singleClientId) {
      list = list.filter(c => c.id === singleClientId);
    }

    // Only my accounts filter (Account Manager)
    if (onlyMyAccounts && currentUser) {
      list = list.filter(c => {
        const idMatch = c.accountManagerId === currentUser.id;
        const nameMatch = c.accountManagerName && c.accountManagerName.toLowerCase().includes(currentUser.name.toLowerCase());
        const managedByMatch = c.managedBy && c.managedBy.toLowerCase().includes(currentUser.name.toLowerCase());
        return idMatch || nameMatch || managedByMatch;
      });
    } else if (selectedAccountManager !== 'all') {
      list = list.filter(c => {
        const idMatch = c.accountManagerId === selectedAccountManager;
        const nameMatch = c.accountManagerName && c.accountManagerName.toLowerCase().includes(selectedAccountManager.toLowerCase());
        const managedByMatch = c.managedBy && c.managedBy.toLowerCase().includes(selectedAccountManager.toLowerCase());
        return idMatch || nameMatch || managedByMatch;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.clientName.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.serviceName.toLowerCase().includes(q) ||
        (c.monthlyTasks || []).some(t => t.title.toLowerCase().includes(q) || (t.assignedToName && t.assignedToName.toLowerCase().includes(q)))
      );
    }

    // Status filter
    if (statusFilter === 'pending') {
      list = list.filter(c => {
        const tasks = filterAccountTasks(c.monthlyTasks, 'all', selectedMonth);
        return tasks.some(t => !t.completed);
      });
    } else if (statusFilter === 'completed') {
      list = list.filter(c => {
        const tasks = filterAccountTasks(c.monthlyTasks, 'all', selectedMonth);
        return tasks.length > 0 && tasks.every(t => t.completed);
      });
    } else if (statusFilter === 'urgent') {
      list = list.filter(c => {
        const tasks = filterAccountTasks(c.monthlyTasks, 'all', selectedMonth);
        const hasPending = tasks.some(t => !t.completed);
        const deadline = c.monthlyDeliveryDate || c.renewalDate;
        const countdown = getDeliveryCountdown(deadline);
        return hasPending && countdown.daysRemaining <= 4;
      });
    }

    return list;
  }, [
    activeClients,
    singleClientId,
    onlyMyAccounts,
    currentUser,
    selectedAccountManager,
    searchQuery,
    statusFilter,
    selectedMonth
  ]);

  // Overall metrics for the current view
  const managerMetrics = useMemo(() => {
    const managerId = onlyMyAccounts && currentUser ? currentUser.id : selectedAccountManager;
    return getAccountManagerMetrics(activeClients, managerId);
  }, [activeClients, onlyMyAccounts, currentUser, selectedAccountManager]);

  // Open add modal
  const handleOpenAddTask = (clientId: string) => {
    setTargetClientIdForTask(clientId);
    setEditingTask(null);
    const client = activeClients.find(c => c.id === clientId);
    const defaultDueDate = client?.monthlyDeliveryDate || client?.renewalDate || new Date().toISOString().split('T')[0];
    
    setTaskFormData({
      title: '',
      deliverableCount: '',
      category: 'محتوى وبوستات',
      assignedToId: team[0]?.id || '',
      dueDate: defaultDueDate,
      month: selectedMonth,
      notes: ''
    });
    setShowAddTaskModal(true);
  };

  // Open edit modal
  const handleOpenEditTask = (clientId: string, task: AccountMonthlyTask) => {
    setTargetClientIdForTask(clientId);
    setEditingTask({ clientId, task });
    setTaskFormData({
      title: task.title,
      deliverableCount: task.deliverableCount || '',
      category: task.category,
      assignedToId: task.assignedToId || '',
      dueDate: task.dueDate,
      month: task.month || selectedMonth,
      notes: task.notes || ''
    });
    setShowAddTaskModal(true);
  };

  // Save task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientIdForTask || !taskFormData.title.trim()) return;

    const assignedMember = team.find(m => m.id === taskFormData.assignedToId);

    if (editingTask) {
      updateAccountMonthlyTask(editingTask.clientId, editingTask.task.id, {
        title: taskFormData.title.trim(),
        deliverableCount: taskFormData.deliverableCount.trim() || undefined,
        category: taskFormData.category,
        assignedToId: taskFormData.assignedToId,
        assignedToName: assignedMember ? assignedMember.name : undefined,
        assignedToRole: assignedMember ? assignedMember.role : undefined,
        dueDate: taskFormData.dueDate,
        month: taskFormData.month,
        notes: taskFormData.notes.trim() || undefined
      });
    } else {
      addAccountMonthlyTask(targetClientIdForTask, {
        title: taskFormData.title.trim(),
        deliverableCount: taskFormData.deliverableCount.trim() || undefined,
        category: taskFormData.category,
        completed: false,
        assignedToId: taskFormData.assignedToId,
        assignedToName: assignedMember ? assignedMember.name : undefined,
        assignedToRole: assignedMember ? assignedMember.role : undefined,
        dueDate: taskFormData.dueDate,
        month: taskFormData.month,
        notes: taskFormData.notes.trim() || undefined
      });
    }

    setShowAddTaskModal(false);
    setEditingTask(null);
  };

  // Assign Manager submit
  const handleAssignManagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignManagerModalClient || !selectedManagerId) return;
    const member = team.find(m => m.id === selectedManagerId);
    if (!member) return;

    setClientAccountManager(assignManagerModalClient.id, member.id, member.name);
    setAssignManagerModalClient(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner (Clean Enterprise Navy/Slate, No AI-Slop) */}
      {!singleClientId && (
        <div className="bg-[#1e293b] text-white p-4 sm:p-5 rounded-2xl border border-slate-700 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-600/30 text-blue-300 rounded-lg text-xs font-bold mb-2 border border-blue-500/30">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>متابعة إنجاز وتسليمات الحسابات</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                تاسكات الحسابات الشهرية ومتابعة الإنجاز
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                لكل اكونت: أضف مخرجات وتاسكات الشهر، ضع علامة صح عند الإنجاز، وتابع المتبقي مع التيم ومعدل الإنجاز قبل موعد التسليم.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setOnlyMyAccounts(!onlyMyAccounts)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  onlyMyAccounts
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
                title="تصفية حساباتي فقط (الأكونت مانجر)"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span>أكونتاتي فقط ({currentUser.name})</span>
                {onlyMyAccounts && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Account Manager KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-slate-700/80">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 font-bold">الحسابات النشطة</div>
              <div className="text-xl font-black text-white mt-0.5">
                {managerMetrics.managedAccountsCount} اكونت
              </div>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 font-bold">إجمالي تاسكات الشهر</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">
                {managerMetrics.totalTasks} تاسك
              </div>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-emerald-400 font-bold">المنجز بنجاح</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span>{managerMetrics.completedTasks}</span>
                <span className="text-xs text-emerald-300 font-bold">({managerMetrics.overallProgressPercent}%)</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-amber-400 font-bold">المتبقي مع التيم</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">
                {managerMetrics.remainingTasks} تاسك
              </div>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>حسابات عاجلة (تسليم قريب)</span>
              </div>
              <div className="text-xl font-black text-rose-400 mt-0.5">
                {managerMetrics.urgentAccountsCount} حساب
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Month Selector, Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>شهر التاسكات:</span>
            </span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-black text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Account Manager Filter Dropdown */}
          {!singleClientId && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>الأكونت مانجر:</span>
              </span>
              <select
                value={selectedAccountManager}
                onChange={e => {
                  setSelectedAccountManager(e.target.value);
                  if (onlyMyAccounts) setOnlyMyAccounts(false);
                }}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="all">جميع مديري الحسابات</option>
                {team.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث بالحساب أو التاسك أو اسم الموظف..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs font-bold border-t border-slate-100">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الكل ({activeClients.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>بها تاسكات متبقية</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>مكتملة بالكامل</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('urgent')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تسليم عاجل (خلال 4 أيام)</span>
          </button>
        </div>
      </div>

      {/* Accounts & Monthly Tasks Cards */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">لا توجد حسابات تطابق خيارات التصفية</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              تأكد من اختيار الشهر المناسب أو إزالة فلاتر البحث لعرض الحسابات وتاسكاتها الشهرية.
            </p>
          </div>
        ) : (
          filteredClients.map(client => {
            const clientMonthTasks = filterAccountTasks(client.monthlyTasks, 'all', selectedMonth);
            const progress = calculateAccountTaskProgress(clientMonthTasks);
            const targetDeadline = client.monthlyDeliveryDate || client.renewalDate;
            const countdown = getDeliveryCountdown(targetDeadline);

            // Account manager name
            const managerName = client.accountManagerName || client.managedBy || 'غير محدد';

            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Account Card Header */}
                <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200">
                      {client.clientName.charAt(0) || 'ع'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {client.clientName}
                        </h3>
                        {client.company && (
                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {client.company}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {client.serviceName}
                        </span>
                      </div>

                      {/* Account Manager Badge & Delivery Date */}
                      <div className="flex items-center gap-2.5 mt-1 flex-wrap text-xs">
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-purple-600" />
                          <span>الأكونت مانجر:</span>
                          <strong className="text-purple-950 font-black">{managerName}</strong>
                        </span>

                        {isManager && (
                          <button
                            type="button"
                            onClick={() => {
                              setAssignManagerModalClient(client);
                              setSelectedManagerId(client.accountManagerId || team[0]?.id || '');
                            }}
                            className="text-[10px] text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer"
                          >
                            (تغيير)
                          </button>
                        )}

                        <span className="text-slate-300">•</span>

                        {/* Delivery countdown badge */}
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${countdown.badgeClass}`}>
                          <Calendar className="w-3 h-3" />
                          <span>موعد التسليم: {targetDeadline}</span>
                          <strong className="mr-1 font-bold">({countdown.label})</strong>
                        </span>

                        {/* Google sheet link shortcut if available */}
                        {client.sheetUrl && (
                          <a
                            href={client.sheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md font-bold transition-colors"
                            title="فتح شيت المتابعة"
                          >
                            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                            <span>شيت العميل ↗</span>
                          </a>
                        )}

                        {onOpenClientDossier && (
                          <button
                            type="button"
                            onClick={() => onOpenClientDossier(client)}
                            className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer mr-auto"
                          >
                            ملف العميل الكامل ←
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Task Button */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAddTask(client.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ إضافة تاسك للشهر</span>
                    </button>
                  </div>
                </div>

                {/* Account Monthly Progress Bar */}
                <div className="px-4 py-3 bg-white border-b border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700">معدل الإنجاز لشهر ({selectedMonth}):</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        progress.isAllCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : progress.progressPercent > 50
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {progress.progressPercent}% إنجاز
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{progress.completed} منجز</span>
                      </span>
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{progress.remaining} متبقي مع التيم</span>
                      </span>
                      <span className="text-slate-400">إجمالي: {progress.total}</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar Track */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        progress.isAllCompleted
                          ? 'bg-emerald-600'
                          : progress.progressPercent >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tasks Interactive Checklist (يظهر التاسكات list خلصت يتعلم عليها صح واعرف المتبقي ومع مين) */}
                <div className="p-4 space-y-2">
                  {clientMonthTasks.length === 0 ? (
                    <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-500">
                        لا توجد تاسكات مسجلة لهذا الحساب في شهر {selectedMonth}.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenAddTask(client.id)}
                        className="inline-flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>اضغط هنا لإضافة مخرجات وتاسكات الشهر للعميل</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clientMonthTasks.map(task => {
                        const isDone = task.completed;
                        const taskCountdown = getDeliveryCountdown(task.dueDate);

                        return (
                          <div
                            key={task.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-600'
                                : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-2xs'
                            }`}
                          >
                            {/* Checkbox and Task Details */}
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                              {/* Clickable Checkbox Button */}
                              <button
                                type="button"
                                onClick={() => toggleAccountMonthlyTask(client.id, task.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all cursor-pointer mt-0.5 sm:mt-0 ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'border-2 border-slate-300 hover:border-blue-600 text-transparent'
                                }`}
                                title={isDone ? 'اضغط للإلغاء والتعليم كغير مكتمل' : 'اضغط للتعليم كمنجز بنجاح ✅'}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-xs sm:text-sm font-bold truncate ${
                                      isDone ? 'line-through text-slate-400 font-medium' : 'text-slate-900 font-extrabold'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {task.deliverableCount && (
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                                      {task.deliverableCount}
                                    </span>
                                  )}

                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                    {task.category}
                                  </span>

                                  {isDone && (
                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>تم الإنجاز {task.completedByName ? `بواسطة ${task.completedByName}` : ''}</span>
                                    </span>
                                  )}
                                </div>

                                {task.notes && (
                                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                    {task.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Assignee ("مع مين") & Deadline & Actions */}
                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
                              {/* Assignee Badge ("مع مين") */}
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-slate-500 text-[11px]">مع:</span>
                                <strong className="text-slate-900">
                                  {task.assignedToName || 'غير مسند'}
                                </strong>
                                {task.assignedToRole && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({task.assignedToRole})
                                  </span>
                                )}
                              </div>

                              {/* Task Deadline Badge */}
                              <div className={`text-[11px] px-2 py-0.5 rounded-md border font-bold ${taskCountdown.badgeClass}`}>
                                <span>{task.dueDate}</span>
                                {!isDone && <span className="mr-1">({taskCountdown.label})</span>}
                              </div>

                              {/* Edit & Delete Actions */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTask(client.id, task)}
                                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
                                  title="تعديل بيانات التاسك"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteAccountMonthlyTask(client.id, task.id)}
                                  className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                  title="حذف التاسك"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT MONTHLY TASK MODAL */}
      {showAddTaskModal && (
        <div
          onClick={() => setShowAddTaskModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="px-5 py-4 bg-[#1e293b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {editingTask ? 'تعديل تاسك الحساب' : 'إضافة تاسك شهري جديد للحساب'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان التاسك / المهمة المطلوبة: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={e => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  placeholder="مثال: تصميم 12 بوست انستقرام وفيس بوك، أو إعداد خطة السيو..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    عدد المخرجات (اختياري):
                  </label>
                  <input
                    type="text"
                    value={taskFormData.deliverableCount}
                    onChange={e => setTaskFormData({ ...taskFormData, deliverableCount: e.target.value })}
                    placeholder="مثال: 12 بوست، 4 ريلز، شيت المقالات"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تصنيف التاسك:
                  </label>
                  <select
                    value={taskFormData.category}
                    onChange={e => setTaskFormData({ ...taskFormData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-bold cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* مع مين (Team Assignee) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    مع مين بالتيم (الموظف المكلف): <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={taskFormData.assignedToId}
                    onChange={e => setTaskFormData({ ...taskFormData, assignedToId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-bold cursor-pointer"
                  >
                    <option value="">اختر الموظف المسؤول...</option>
                    {team.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* تاريخ التسليم */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    موعد التسليم النهائي (المعاد): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={taskFormData.dueDate}
                    onChange={e => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  شهر التاسك:
                </label>
                <select
                  value={taskFormData.month}
                  onChange={e => setTaskFormData({ ...taskFormData, month: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-bold cursor-pointer"
                >
                  {monthOptions.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات أو روابط إضافية للتاسك:
                </label>
                <textarea
                  rows={2}
                  value={taskFormData.notes}
                  onChange={e => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                  placeholder="أي توجيهات خاصة من الأكونت مانجر للموظف المكلف..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingTask ? 'حفظ التعديلات' : 'إضافة التاسك للحساب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN ACCOUNT MANAGER MODAL */}
      {assignManagerModalClient && (
        <div
          onClick={() => setAssignManagerModalClient(null)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="px-5 py-4 bg-[#1e293b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-sm">
                  تعيين الأكونت مانجر لـ {assignManagerModalClient.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignManagerModalClient(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignManagerSubmit} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed font-medium">
                اختر الأكونت مانجر المسؤول عن متابعة تسليمات وتاسكات هذا العميل:
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                {team.map(member => (
                  <label
                    key={member.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedManagerId === member.id
                        ? 'bg-purple-50 border-purple-400 font-bold text-purple-950 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="account_manager_choice"
                        value={member.id}
                        checked={selectedManagerId === member.id}
                        onChange={() => setSelectedManagerId(member.id)}
                        className="text-purple-600 cursor-pointer"
                      />
                      <div>
                        <div className="font-extrabold text-slate-900">{member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.role} • {member.department}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignManagerModalClient(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  حفظ وتعيين المدير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
