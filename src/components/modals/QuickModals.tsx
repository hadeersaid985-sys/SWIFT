import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Building,
  Briefcase,
  Mail,
  Calendar,
  Users,
  Plus,
  Send,
  Trash2,
  AtSign,
  Clock,
  Sparkles,
  AlertCircle,
  Tag,
  Bell,
  Lock,
  Shield
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { TaskPriority, TaskStatus, DealStage, TeamMember } from '../../types/crm';

export const QuickModals: React.FC = () => {
  const {
    openQuickModal,
    setOpenQuickModal,
    team,
    addTask,
    addLead,
    addDeal,
    sendEmail,
    addMeeting,
    addTeamMember,
    currentUser
  } = useCRM();

  const isManager =
    currentUser.accessLevel === 'admin' ||
    currentUser.accessLevel === 'manager' ||
    currentUser.id === 'user-1';

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(currentUser.id);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('high');
  const [taskCategory, setTaskCategory] = useState<'مبيعات' | 'تقني' | 'تسويق' | 'دعم' | 'إداري'>('مبيعات');
  const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('16:00');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState<number>(4);
  const [taskMentionedIds, setTaskMentionedIds] = useState<string[]>([]);
  const [taskIsPrivate, setTaskIsPrivate] = useState<boolean>(false);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasksList, setSubtasksList] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadTitle, setLeadTitle] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadValue, setLeadValue] = useState<number | string>(100000);
  const [leadCurrency, setLeadCurrency] = useState<'ج.م' | 'ر.س' | '$'>('ج.م');
  const [leadFinalPrice, setLeadFinalPrice] = useState<number | string>('');
  const [leadSource, setLeadSource] = useState<string>('إحالة عميل سابق');
  const [leadCustomSource, setLeadCustomSource] = useState<string>('');
  const [leadDetailedDesc, setLeadDetailedDesc] = useState<string>('');
  const [leadNegotiations, setLeadNegotiations] = useState<string>('');
  const [leadScore, setLeadScore] = useState(85);
  const [leadNotes, setLeadNotes] = useState('');
  const [leadAssignedMemberIds, setLeadAssignedMemberIds] = useState<string[]>(['user-maibel']);

  // Deal Form State
  const [dealTitle, setDealTitle] = useState('');
  const [dealCompany, setDealCompany] = useState('');
  const [dealContactName, setDealContactName] = useState('');
  const [dealContactEmail, setDealContactEmail] = useState('');
  const [dealContactPhone, setDealContactPhone] = useState('');
  const [dealValue, setDealValue] = useState(250000);
  const [dealStage, setDealStage] = useState<DealStage>('مؤهل');
  const [dealDate, setDealDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [dealAssignee, setDealAssignee] = useState(currentUser.id);

  // Mail Form State
  const [mailTo, setMailTo] = useState(team[1]?.email || 'team@swiftmynd.com');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailTag, setMailTag] = useState<'عاجل' | 'عملاء' | 'داخلي' | 'تقارير'>('داخلي');

  // Meeting Form State
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDate, setMeetDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetTime, setMeetTime] = useState('11:00');
  const [meetDuration, setMeetDuration] = useState('30 دقيقة');
  const [meetLocation, setMeetLocation] = useState<'Google Meet' | 'Zoom' | 'مقر الشركة' | 'مكالمة هاتفية'>('Google Meet');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/swiftmynd-team');
  const [meetNotes, setMeetNotes] = useState('');

  // Member Form State
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberDept, setMemberDept] = useState<'المبيعات' | 'التطوير والتقنية' | 'التسويق' | 'خدمة العملاء' | 'الإدارة المالية' | 'الموارد البشرية'>('المبيعات');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberSecondaryEmail, setMemberSecondaryEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('+966 50 123 4567');
  const [memberWhatsapp, setMemberWhatsapp] = useState('+966 50 123 4567');
  const [memberUsername, setMemberUsername] = useState('');
  const [memberPassword, setMemberPassword] = useState('User@Swift2026');
  const [memberAccessLevel, setMemberAccessLevel] = useState<'admin' | 'manager' | 'member' | 'viewer'>('member');
  const [memberLinkedin, setMemberLinkedin] = useState('');
  const [memberSlack, setMemberSlack] = useState('');

  // Insert Mention in Title
  const insertMentionInTitle = (member: TeamMember) => {
    const handle = `@${member.name.replace(/\s+/g, '_')}`;
    setTaskTitle(prev => {
      if (prev.includes(handle)) return prev;
      return prev.trim() ? `${prev.trim()} ${handle} ` : `${handle} `;
    });
    if (!taskMentionedIds.includes(member.id)) {
      setTaskMentionedIds(prev => [...prev, member.id]);
    }
  };

  const toggleMentionMember = (memberId: string) => {
    const member = team.find(m => m.id === memberId);
    if (!member) return;
    const handle = `@${member.name.replace(/\s+/g, '_')}`;

    if (taskMentionedIds.includes(memberId)) {
      setTaskMentionedIds(prev => prev.filter(id => id !== memberId));
      setTaskTitle(prev => prev.replace(handle, '').replace(/\s+/g, ' ').trim());
    } else {
      setTaskMentionedIds(prev => [...prev, memberId]);
      setTaskTitle(prev => {
        if (prev.includes(handle)) return prev;
        return prev.trim() ? `${prev.trim()} ${handle} ` : `${handle} `;
      });
    }
  };

  // Set Deadline Presets
  const setDeadlinePreset = (preset: 'today' | 'tomorrow' | '3days' | 'end_of_week' | 'urgent_2h') => {
    const now = new Date();
    if (preset === 'today') {
      setTaskDueDate(now.toISOString().split('T')[0]);
      setTaskDueTime('17:00');
    } else if (preset === 'tomorrow') {
      const tom = new Date(now.getTime() + 86400000);
      setTaskDueDate(tom.toISOString().split('T')[0]);
      setTaskDueTime('16:00');
    } else if (preset === '3days') {
      const after3 = new Date(now.getTime() + 3 * 86400000);
      setTaskDueDate(after3.toISOString().split('T')[0]);
      setTaskDueTime('16:00');
    } else if (preset === 'end_of_week') {
      const currentDay = now.getDay();
      const daysUntilThu = (4 - currentDay + 7) % 7 || 7;
      const thu = new Date(now.getTime() + daysUntilThu * 86400000);
      setTaskDueDate(thu.toISOString().split('T')[0]);
      setTaskDueTime('17:00');
    } else if (preset === 'urgent_2h') {
      setTaskDueDate(now.toISOString().split('T')[0]);
      const targetHours = (now.getHours() + 2) % 24;
      setTaskDueTime(`${String(targetHours).padStart(2, '0')}:00`);
      setTaskPriority('urgent');
    }
  };

  // Calculate live deadline preview
  const getDeadlinePreview = () => {
    if (!taskDueDate) return null;
    try {
      const dueDateTime = new Date(`${taskDueDate}T${taskDueTime || '16:00'}:00`);
      const now = new Date();
      const diffMs = dueDateTime.getTime() - now.getTime();
      const isPast = diffMs < 0;
      const absDiffHours = Math.abs(diffMs) / (1000 * 60 * 60);

      if (isPast) {
        return {
          text: '⚠️ تنبيه: موعد التسليم المحدد في الماضي!',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      }
      if (absDiffHours < 24) {
        const hours = Math.floor(absDiffHours);
        const mins = Math.floor((absDiffHours - hours) * 60);
        return {
          text: `⚡ موعد التسليم: اليوم خلال ${hours} س و ${mins} دقيقة! (الساعة ${taskDueTime})`,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
        };
      }
      const days = Math.round(absDiffHours / 24);
      return {
        text: `⏳ موعد التسليم: متبقي حوالي ${days} أيام (${taskDueDate} - ${taskDueTime})`,
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    } catch {
      return null;
    }
  };

  if (!openQuickModal) return null;

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      assignedToId: taskAssignee,
      priority: taskPriority,
      status: 'todo',
      startDate: taskStartDate,
      dueDate: taskDueDate,
      dueTime: taskDueTime,
      estimatedHours: Number(taskEstimatedHours) || 4,
      totalLoggedMinutes: 0,
      isTimerRunning: false,
      timeLogs: [],
      category: taskCategory,
      subtasks: subtasksList,
      mentionedUserIds: taskMentionedIds,
      isPrivate: isManager ? taskIsPrivate : false
    });

    setTaskTitle('');
    setTaskDesc('');
    setTaskMentionedIds([]);
    setTaskIsPrivate(false);
    setSubtasksList([]);
    setOpenQuickModal(null);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasksList(prev => [
      ...prev,
      { id: 'sub-' + Date.now(), title: subtaskInput.trim(), completed: false }
    ]);
    setSubtaskInput('');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadCompany.trim()) return;

    const finalSource = leadSource === 'مصدر آخر' ? (leadCustomSource.trim() || 'مصدر مخصص') : leadSource;
    const finalAssignees = leadAssignedMemberIds.length > 0 ? leadAssignedMemberIds : [currentUser.id];

    addLead({
      name: leadName.trim(),
      company: leadCompany.trim(),
      title: leadTitle.trim() || 'مسؤول المشتريات والتعاقدات',
      email: leadEmail.trim(),
      phone: leadPhone.trim(),
      status: 'جديد',
      source: finalSource,
      customSource: leadSource === 'مصدر آخر' ? leadCustomSource.trim() : undefined,
      leadScore,
      assignedToId: finalAssignees[0] || currentUser.id,
      assignedTeamMemberIds: finalAssignees,
      estimatedValue: Number(leadValue) || 0,
      currency: leadCurrency || 'ج.م',
      finalPrice: leadFinalPrice ? Number(leadFinalPrice) : undefined,
      detailedDescription: leadDetailedDesc.trim(),
      negotiationsHistory: leadNegotiations.trim(),
      negotiationEntries: leadNegotiations.trim() ? [
        {
          id: 'neg-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          type: 'جلسة تفاوض',
          summary: leadNegotiations.trim(),
          offeredPrice: Number(leadValue) || 0,
          finalPrice: leadFinalPrice ? Number(leadFinalPrice) : undefined,
          currency: leadCurrency || 'ج.م',
          outcome: 'موافقة مبدئية',
          authorName: currentUser.name,
          authorId: currentUser.id
        }
      ] : [],
      notes: leadNotes.trim()
    });

    // Reset Form
    setLeadName('');
    setLeadCompany('');
    setLeadTitle('');
    setLeadEmail('');
    setLeadPhone('');
    setLeadValue(100000);
    setLeadFinalPrice('');
    setLeadDetailedDesc('');
    setLeadNegotiations('');
    setLeadCustomSource('');
    setLeadAssignedMemberIds(['user-maibel']);
    setOpenQuickModal(null);
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim() || !dealCompany.trim()) return;

    addDeal({
      title: dealTitle,
      company: dealCompany,
      contactName: dealContactName || 'ممثل العميل',
      contactEmail: dealContactEmail,
      contactPhone: dealContactPhone,
      value: Number(dealValue) || 100000,
      currency: 'ر.س',
      stage: dealStage,
      probability: dealStage === 'مغلقة ناجحة' ? 100 : 50,
      expectedCloseDate: dealDate,
      assignedToId: dealAssignee
    });

    setOpenQuickModal(null);
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailSubject.trim() || !mailBody.trim()) return;

    const recipient = team.find(m => m.email === mailTo);
    sendEmail({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderAvatar: currentUser.avatar,
      recipientEmails: [mailTo],
      recipientNames: [recipient?.name || mailTo],
      subject: mailSubject,
      body: mailBody,
      tag: mailTag
    });

    setMailSubject('');
    setMailBody('');
    setOpenQuickModal(null);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle.trim()) return;

    addMeeting({
      title: meetTitle,
      date: meetDate,
      time: meetTime,
      duration: meetDuration,
      location: meetLocation,
      meetingLink: meetLink,
      attendees: [currentUser.id],
      notes: meetNotes,
      status: 'قادم'
    });

    setOpenQuickModal(null);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) return;

    const uName = memberUsername.trim() || memberName.replace(/\s+/g, '.').toLowerCase();
    addTeamMember({
      name: memberName,
      employeeCode: `SM-${100 + team.length + 1}`,
      role: memberRole,
      department: memberDept,
      email: memberEmail || `${uName}@swiftmynd.com`,
      secondaryEmail: memberSecondaryEmail,
      phone: memberPhone,
      whatsappNumber: memberWhatsapp,
      username: uName,
      password: memberPassword || 'User@Swift2026',
      accessLevel: memberAccessLevel,
      isAccountActive: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'online',
      socialAccounts: {
        linkedin: memberLinkedin,
        slack: memberSlack,
        whatsapp: memberWhatsapp
      }
    });

    setMemberName('');
    setMemberRole('');
    setMemberEmail('');
    setMemberUsername('');
    setOpenQuickModal(null);
  };

  return (
    <div
      onClick={() => setOpenQuickModal(null)}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in cursor-pointer"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto cursor-default"
      >
        {/* MODAL 1: ADD TASK */}
        {openQuickModal === 'task' && (
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  إنشاء مهمة عمل جديدة وتحديد موعد التسليم
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Task Title & Mentions */}
              <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <span>عنوان المهمة *</span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                      <AtSign className="w-2.5 h-2.5" /> يدعم المنشن المباشر (@)
                    </span>
                  </label>
                  {taskMentionedIds.length > 0 && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ تم تحديد {taskMentionedIds.length} منشن
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    placeholder="مثال: مراجعة العرض المالي مع @هدير_سعيد وإرسال العقد النهائي"
                    className="w-full p-2.5 pl-8 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 font-bold text-slate-900 shadow-2xs"
                  />
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <AtSign className="w-4 h-4 text-blue-500" />
                  </div>
                </div>

                {/* Quick Mention Chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>منشن أحد الزملاء في العنوان (اضغط للإدراج الفوري):</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {team.map(m => {
                      const handle = `@${m.name.replace(/\s+/g, '_')}`;
                      const isMentioned = taskTitle.includes(handle) || taskMentionedIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => insertMentionInTitle(m)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            isMentioned
                              ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-4 h-4 rounded-full object-cover border border-white/50"
                          />
                          <span>{m.name.split(' ')[0]}</span>
                          <span className={isMentioned ? 'text-blue-100 font-mono' : 'text-slate-400 font-mono text-[10px]'}>
                            {isMentioned ? '✓' : '+'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Live Preview if mentions are present */}
                {taskTitle.includes('@') && (
                  <div className="p-2 bg-blue-50/90 rounded-lg border border-blue-200 text-blue-900 flex items-start gap-1.5 mt-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-[11px]">
                      <span className="font-bold">معاينة العنوان للتيم: </span>
                      <span className="font-medium">
                        {taskTitle.split(/(@[^\s]+)/g).map((part, i) =>
                          part.startsWith('@') ? (
                            <span
                              key={i}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                            >
                              <AtSign className="w-2.5 h-2.5 inline" />
                              {part.substring(1)}
                            </span>
                          ) : (
                            part
                          )
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Task Details and Assignee */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">تفاصيل وملاحظات المهمة</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={e => setTaskDesc(e.target.value)}
                  placeholder="أدخل الشروط، المعايير المطلوب استيفاؤها، أو الملاحظات..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسؤول عن التنفيذ</label>
                  <select
                    value={taskAssignee}
                    onChange={e => {
                      const val = e.target.value;
                      setTaskAssignee(val);
                      if (val !== currentUser.id) {
                        setTaskIsPrivate(false);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer font-bold text-xs"
                  >
                    <option value="all">🌟 جميع أعضاء الفريق (مهمة مشتركة لكل الحسابات)</option>
                    {team.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role}) {m.id === currentUser.id ? '— أنت (المدير)' : ''}
                      </option>
                    ))}
                  </select>

                  <div className="mt-1.5 p-2 bg-blue-50/80 border border-blue-200 rounded-lg text-[10px] text-blue-900 flex items-center gap-1.5 font-bold">
                    <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      {taskAssignee === 'all'
                        ? '🌟 ستظهر هذه المهمة في حسابات جميع أفراد الفريق وتتزامن فوراً مع إشعار لكل موظف.'
                        : taskAssignee === currentUser.id
                        ? 'ستضاف المهمة لجدولك الشخصي ومتاحة لمتابعة العمل.'
                        : `✅ ستظهر هذه المهمة فوراً في حساب (${team.find(m => m.id === taskAssignee)?.name || 'الموظف'}) عند تسجيل دخوله.`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">درجة الأولوية</label>
                  <select
                    value={taskPriority}
                    onChange={e => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer font-bold"
                  >
                    <option value="urgent">🔴 حرجة (عاجلة جداً)</option>
                    <option value="high">🟡 عالية الأهمية</option>
                    <option value="medium">🔵 متوسطة</option>
                    <option value="low">⚪ منخفضة</option>
                  </select>
                </div>
              </div>

              {/* DEADLINE & DELIVERY TIME SECTION (تحديد موعد التسليم) */}
              <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 p-3.5 rounded-xl border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-slate-900 text-xs">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>تحديد موعد التسليم والمهلة الزمنية</span>
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded-full border border-blue-200">
                    مطلوب للتتبع الدقيق
                  </span>
                </div>

                {/* Quick Deadline Presets */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500">خيارات سريعة للموعد النهائي:</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset('today')}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      ⚡ اليوم (17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset('tomorrow')}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      📅 غداً (16:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset('3days')}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      🗓️ بعد 3 أيام
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset('end_of_week')}
                      className="px-2.5 py-1 bg-white hover:bg-blue-100/70 text-slate-800 hover:text-blue-700 rounded-lg border border-slate-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      🎯 نهاية الأسبوع (الخميس)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlinePreset('urgent_2h')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      🚨 مستعجل (خلال ساعتين)
                    </button>
                  </div>
                </div>

                {/* Live Deadline Preview Status Banner */}
                {(() => {
                  const preview = getDeadlinePreview();
                  if (!preview) return null;
                  return (
                    <div className={`p-2 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${preview.badgeClass}`}>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{preview.text}</span>
                    </div>
                  );
                })()}

                {/* Date and Time Fields Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">تاريخ بدء العمل (من يوم) *</label>
                    <input
                      type="date"
                      required
                      value={taskStartDate}
                      onChange={e => setTaskStartDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-blue-900 mb-1">تاريخ التسليم النهائي (إلى يوم) *</label>
                    <input
                      type="date"
                      required
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-blue-300 bg-white font-bold text-blue-900 text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">وقت التسليم المحدد بالساعة</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={taskDueTime}
                        onChange={e => setTaskDueTime(e.target.value)}
                        className="w-full p-2 pl-7 rounded-xl border border-slate-200 bg-white font-medium text-xs"
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">الساعات التقديرية المقدرة</label>
                    <input
                      type="number"
                      min="1"
                      value={taskEstimatedHours}
                      onChange={e => setTaskEstimatedHours(Number(e.target.value))}
                      placeholder="مثال: 6 ساعات"
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-medium text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القسم</label>
                <select
                  value={taskCategory}
                  onChange={e => setTaskCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer"
                >
                  <option value="مبيعات">قسم المبيعات والصفقات</option>
                  <option value="تقني">قسم التطوير والتقنية</option>
                  <option value="تسويق">قسم التسويق واستقطاب العملاء</option>
                  <option value="دعم">قسم خدمة ورضا العملاء</option>
                  <option value="إداري">الإدارة والمالية</option>
                </select>
              </div>

              {/* Private Task Toggle for Manager */}
              {isManager && (
                <div
                  onClick={() => setTaskIsPrivate(!taskIsPrivate)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    taskIsPrivate
                      ? 'bg-purple-50/90 border-purple-300 ring-1 ring-purple-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        taskIsPrivate ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span>مهمة خاصة وسرية للمدير فقط</span>
                        {taskIsPrivate ? (
                          <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                            مقفلة وسرية 🔒
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (اختياري)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {taskIsPrivate
                          ? 'محدش من التيم يقدر يطلع على هذه المهمة نهائياً، مرئية لك فقط كمدير.'
                          : 'إذا تم التفعيل، لن تظهر هذه المهمة لأي موظف في التيم وستكون خاصة بك وحدك.'}
                      </div>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={taskIsPrivate}
                    onChange={e => setTaskIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Subtasks addition */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-700">قائمة الخطوات الفرعية (Checklist)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={e => setSubtaskInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder="اكتب خطوة فرعية واضغط إضافة..."
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                  >
                    إضافة
                  </button>
                </div>

                {subtasksList.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {subtasksList.map(st => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border text-slate-700"
                      >
                        <span>• {st.title}</span>
                        <button
                          type="button"
                          onClick={() => setSubtasksList(prev => prev.filter(x => x.id !== st.id))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                حفظ المهمة وتعيين الموعد
              </button>
            </div>
          </form>
        )}

        {/* MODAL 2: COMPOSE MAIL */}
        {openQuickModal === 'mail' && (
          <form onSubmit={handleSendMail} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  إنشاء رسالة بريد إلكتروني رسمية (SwiftMail)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">إلى (اختر من الفريق أو اكتب بريداً):</label>
                <div className="flex gap-2">
                  <select
                    onChange={e => setMailTo(e.target.value)}
                    value={mailTo}
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    {team.map(m => (
                      <option key={m.id} value={m.email}>
                        {m.name} - ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">موضوع الرسالة *</label>
                  <input
                    type="text"
                    required
                    value={mailSubject}
                    onChange={e => setMailSubject(e.target.value)}
                    placeholder="مثال: متابعة مستجدات صفقة توريد النظام السحابي"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={mailTag}
                    onChange={e => setMailTag(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="داخلي">داخلي</option>
                    <option value="عاجل">عاجل</option>
                    <option value="عملاء">عملاء</option>
                    <option value="تقارير">تقارير</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نص الرسالة *</label>
                <textarea
                  rows={6}
                  required
                  value={mailBody}
                  onChange={e => setMailBody(e.target.value)}
                  placeholder="السلام عليكم ورحمة الله وبركاته، تحية طيبة وبعد..."
                  className="w-full p-3 rounded-xl border border-slate-200 leading-relaxed font-normal"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال البريد الآن</span>
              </button>
            </div>
          </form>
        )}

        {/* MODAL 3: ADD LEAD */}
        {openQuickModal === 'lead' && (
          <form onSubmit={handleCreateLead} className="space-y-4 max-h-[88vh] overflow-y-auto p-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    تسجيل عميل محتمل جديد (New Lead)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    إضافة عميل مبيعات وتحديد الموظف المصرح له برؤيته وتفاصيل التفاوض والسعر النهائي
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Row 1: اسم العميل واسم الشركة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    placeholder="مثال: باك لينك"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الشركة / المؤسسة *</label>
                  <input
                    type="text"
                    required
                    value={leadCompany}
                    onChange={e => setLeadCompany(e.target.value)}
                    placeholder="مثال: اوفر باك لينك"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Row 2: رقم الهاتف والبريد */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                    placeholder="201005137224"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono dir-ltr focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Row 3: مصدر العميل والقيمة بالجنيه */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مصدر العميل</label>
                  <select
                    value={leadSource}
                    onChange={e => setLeadSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer focus:outline-none focus:border-purple-500"
                  >
                    <option value="إحالة عميل سابق">إحالة عميل سابق</option>
                    <option value="الموقع الإلكتروني">الموقع الإلكتروني</option>
                    <option value="إعلان ممول">إعلان ممول</option>
                    <option value="لينكد إن">لينكد إن</option>
                    <option value="مؤتمر / ملتقى">مؤتمر / ملتقى</option>
                    <option value="محادثة واتساب مباشر">محادثة واتساب مباشر</option>
                    <option value="مكالمة هاتفية واردة">مكالمة هاتفية واردة</option>
                    <option value="تيك توك">تيك توك</option>
                    <option value="مصدر آخر">مصدر آخر (مخصص)...</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">القيمة التقديرية المتوقعة</label>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                      <span>العملة:</span>
                      <select
                        value={leadCurrency}
                        onChange={e => setLeadCurrency(e.target.value as any)}
                        className="bg-purple-50 border border-purple-200 text-purple-800 rounded px-1.5 py-0.5 font-bold cursor-pointer"
                      >
                        <option value="ج.م">جنيه مصري (ج.م)</option>
                        <option value="ر.س">ريال سعودي (ر.س)</option>
                        <option value="$">دولار ($)</option>
                      </select>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={leadValue}
                      onChange={e => setLeadValue(e.target.value)}
                      placeholder="0"
                      className="w-full p-2.5 pr-3 pl-12 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      {leadCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* إذا تم اختيار مصدر آخر: حقل إدخال المصدر المخصص */}
              {leadSource === 'مصدر آخر' && (
                <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200 space-y-1 animate-in fade-in">
                  <label className="block font-bold text-purple-900 text-xs">
                    اكتب المصدر المخصص للعميل: *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadCustomSource}
                    onChange={e => setLeadCustomSource(e.target.value)}
                    placeholder="مثال: ترشيح من شريك، تليجرام، استشارة مجانية، بحث جوجل..."
                    className="w-full p-2 rounded-lg bg-white border border-purple-300 text-xs font-bold focus:outline-none focus:border-purple-600"
                  />
                </div>
              )}

              {/* Row 4: السعر النهائي ونسبة الاهتمام */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <span>السعر النهائي المتفق عليه (إن وجد)</span>
                    <span className="text-[10px] text-emerald-600 font-normal">({leadCurrency})</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={leadFinalPrice}
                      onChange={e => setLeadFinalPrice(e.target.value)}
                      placeholder="مثال: 95000"
                      className="w-full p-2.5 pr-3 pl-12 rounded-xl border border-emerald-200 bg-emerald-50/30 text-emerald-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600">
                      {leadCurrency}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تقييم احتمالية الإغلاق والاهتمام ({leadScore}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={leadScore}
                    onChange={e => setLeadScore(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Row 5: وصف تفصيلي للعميل المحتمل */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  الوصف التفصيلي للعميل المحتمل واحتياجاته:
                </label>
                <textarea
                  rows={2}
                  value={leadDetailedDesc}
                  onChange={e => setLeadDetailedDesc(e.target.value)}
                  placeholder="اكتب طبيعة نشاط العميل، متطلبات المشروع، المشاكل التي يرغب بحلها، وأي تفاصيل هامة..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              {/* Row 6: التفاوضات التي تمت */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  التفاوضات التي تمت والعروض المقدمة:
                </label>
                <textarea
                  rows={2}
                  value={leadNegotiations}
                  onChange={e => setLeadNegotiations(e.target.value)}
                  placeholder="سجل المفاوضات: ما تم الاتفاق عليه، العرض المبدئي، الخصومات المتفق عليها، ورد العميل..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs leading-relaxed focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              {/* Row 7: تحديد من يظهر له من الموظفين (فريق المبيعات / مين من الموظفين) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 flex items-center gap-1.5 text-xs">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>مين من الموظفين المصرح لهم برؤية هذا العميل؟ (فريق المبيعات)</span>
                  </label>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    الأدمن يرى الكل 🔒
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  علّم على موظفي المبيعات المصرح لهم برؤية ومتابعة هذا العميل (لن يظهر لباقي المبيعات أو الأقسام الأخرى):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {team.map(member => {
                    const isChecked = leadAssignedMemberIds.includes(member.id);
                    const isSales =
                      member.department === 'المبيعات' ||
                      member.role?.toLowerCase().includes('sales') ||
                      member.role?.toLowerCase().includes('سيلز') ||
                      member.id === 'user-maibel';

                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-100/70 border-purple-300 text-purple-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setLeadAssignedMemberIds(prev => [...prev, member.id]);
                            } else {
                              setLeadAssignedMemberIds(prev => prev.filter(id => id !== member.id));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="w-6 h-6 rounded-lg bg-purple-200 text-purple-900 font-black text-[10px] flex items-center justify-center shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold text-slate-900 flex items-center gap-1">
                            <span>{member.name}</span>
                            {isSales && (
                              <span className="text-[9px] bg-purple-200 text-purple-900 font-extrabold px-1.5 py-0.2 rounded">
                                مبيعات
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{member.role}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              >
                حفظ العميل المحتمل
              </button>
            </div>
          </form>
        )}

        {/* MODAL 4: ADD DEAL */}
        {openQuickModal === 'deal' && (
          <form onSubmit={handleCreateDeal} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  إضافة صفقة مبيعات جديدة في المسار (Deal)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الصفقة *</label>
                <input
                  type="text"
                  required
                  value={dealTitle}
                  onChange={e => setDealTitle(e.target.value)}
                  placeholder="مثال: توريد وتطبيق نظام ERP وإدارة علاقات العملاء"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المؤسسة / العميل *</label>
                  <input
                    type="text"
                    required
                    value={dealCompany}
                    onChange={e => setDealCompany(e.target.value)}
                    placeholder="شركة الرواد للتجارة"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القيمة المالية (ر.س) *</label>
                  <input
                    type="number"
                    required
                    value={dealValue}
                    onChange={e => setDealValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مرحلة الصفقة في الـ Pipeline</label>
                  <select
                    value={dealStage}
                    onChange={e => setDealStage(e.target.value as DealStage)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="مؤهل">مؤهل مبدئياً</option>
                    <option value="عرض سعر">تقديم عرض سعر</option>
                    <option value="تفاوض">التفاوض والعقود</option>
                    <option value="مغلقة ناجحة">مغلقة ناجحة (تم الربح)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الإغلاق المتوقع</label>
                  <input
                    type="date"
                    value={dealDate}
                    onChange={e => setDealDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                حفظ الصفقة
              </button>
            </div>
          </form>
        )}

        {/* MODAL 5: SCHEDULE MEETING */}
        {openQuickModal === 'meeting' && (
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  جدولة اجتماع جديد أو مكالمة رسمية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الاجتماع *</label>
                <input
                  type="text"
                  required
                  value={meetTitle}
                  onChange={e => setMeetTitle(e.target.value)}
                  placeholder="مثال: جلسة استعراض خطة المشروع مع إدارة البنك"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ الاجتماع</label>
                  <input
                    type="date"
                    value={meetDate}
                    onChange={e => setMeetDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت الاجتماع</label>
                  <input
                    type="time"
                    value={meetTime}
                    onChange={e => setMeetTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مكان اللقاء</label>
                  <select
                    value={meetLocation}
                    onChange={e => setMeetLocation(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="مقر الشركة">مقر الشركة</option>
                    <option value="مكالمة هاتفية">مكالمة هاتفية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رابط الجلسة إن وجد</label>
                  <input
                    type="url"
                    value={meetLink}
                    onChange={e => setMeetLink(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-left dir-ltr"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                تأكيد الجدولة
              </button>
            </div>
          </form>
        )}

        {/* MODAL 6: ADD TEAM MEMBER */}
        {openQuickModal === 'member' && (
          <form onSubmit={handleCreateMember} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  إضافة عضو جديد لفريق العمل (Team Member)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    placeholder="مثال: يوسف الرشيدي"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المسمى الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={memberRole}
                    onChange={e => setMemberRole(e.target.value)}
                    placeholder="مثال: مستشار مبيعات كبار العملاء"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / الإدارة</label>
                  <select
                    value={memberDept}
                    onChange={e => setMemberDept(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="المبيعات">المبيعات</option>
                    <option value="التطوير والتقنية">التطوير والتقنية</option>
                    <option value="التسويق">التسويق</option>
                    <option value="خدمة العملاء">خدمة العملاء</option>
                    <option value="الإدارة المالية">الإدارة المالية</option>
                    <option value="الموارد البشرية">الموارد البشرية</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">مستوى الصلاحية (الاكسيس)</label>
                  <select
                    value={memberAccessLevel}
                    onChange={e => setMemberAccessLevel(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="member">عضو فريق وموظف (Member)</option>
                    <option value="manager">مدير قسم (Manager)</option>
                    <option value="admin">مدير عام للنظام (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Username & Password */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <div className="font-extrabold text-blue-900 text-[11px]">بيانات الدخول للنظام (اليوزر والباسورد):</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">اسم المستخدم (اليوزر) *</label>
                    <input
                      type="text"
                      required
                      value={memberUsername}
                      onChange={e => setMemberUsername(e.target.value)}
                      placeholder="yousef.rashidi"
                      className="w-full p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">كلمة المرور (الباسورد) *</label>
                    <input
                      type="text"
                      required
                      value={memberPassword}
                      onChange={e => setMemberPassword(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={memberPhone}
                    onChange={e => setMemberPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الواتساب</label>
                  <input
                    type="text"
                    value={memberWhatsapp}
                    onChange={e => setMemberWhatsapp(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Email & Secondary */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد المؤسسي</label>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    placeholder="yousef.rashidi@swiftmynd.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">البريد البديل</label>
                  <input
                    type="email"
                    value={memberSecondaryEmail}
                    onChange={e => setMemberSecondaryEmail(e.target.value)}
                    placeholder="yousef.personal@gmail.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Accounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حساب LinkedIn</label>
                  <input
                    type="text"
                    value={memberLinkedin}
                    onChange={e => setMemberLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حساب Slack</label>
                  <input
                    type="text"
                    value={memberSlack}
                    onChange={e => setMemberSlack(e.target.value)}
                    placeholder="@username"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpenQuickModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                إضافة العضو للفريق
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
