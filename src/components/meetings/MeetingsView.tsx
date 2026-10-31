import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Building,
  Plus,
  Users,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Film,
  Link,
  Copy,
  Check,
  Search,
  Filter,
  X,
  FileText,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ListTodo,
  History,
  CalendarDays,
  User,
  MessageSquare,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  Meeting,
  MeetingType,
  MeetingLocationType,
  MeetingStatus,
  MeetingActionItem,
  CallLog,
  CallType,
  CallOutcome,
  MeetingRecording
} from '../../types/crm';

export const MeetingsView: React.FC = () => {
  const {
    meetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    calls,
    addCallLog,
    updateCallLog,
    deleteCallLog,
    createTaskFromActionItem,
    team,
    visibleClients,
    leads,
    currentUser,
    isManager,
    setActiveTab,
    meetingRecordings,
    addMeetingRecording,
    deleteMeetingRecording
  } = useCRM();

  // Active Main Tab inside Communication & Meetings System
  const [activeSubTab, setActiveSubTab] = useState<'meetings' | 'calls' | 'action_items' | 'history' | 'recordings'>('meetings');

  // Meetings Sub-filters & View Modes
  const [meetingViewMode, setMeetingViewMode] = useState<'cards' | 'calendar' | 'table'>('cards');
  const [meetingSearch, setMeetingSearch] = useState('');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<'all' | MeetingType>('all');
  const [meetingStatusFilter, setMeetingStatusFilter] = useState<'all' | MeetingStatus>('all');
  const [meetingMemberFilter, setMeetingMemberFilter] = useState<'all' | string>('all');

  // Calls Sub-filters
  const [callSearch, setCallSearch] = useState('');
  const [callTypeFilter, setCallTypeFilter] = useState<'all' | CallType>('all');
  const [callOutcomeFilter, setCallOutcomeFilter] = useState<'all' | CallOutcome>('all');
  const [callEmployeeFilter, setCallEmployeeFilter] = useState<'all' | string>('all');

  // History Tab Filter
  const [historyClientFilter, setHistoryClientFilter] = useState<string>('all');

  // Action Items Tab Filter
  const [actionItemStatusFilter, setActionItemStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Modals state
  const [isAddMeetingModalOpen, setIsAddMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [isAddCallModalOpen, setIsAddCallModalOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallLog | null>(null);

  const [isAddRecordingModalOpen, setIsAddRecordingModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Meeting
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meetingType: 'client' as MeetingType,
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:45',
    duration: '45 دقيقة',
    locationType: 'online' as MeetingLocationType,
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/',
    locationAddress: '',
    hostId: currentUser?.id || 'user-1',
    hostName: currentUser?.name || 'هدير سعيد',
    attendees: [currentUser?.id || 'user-1'],
    clientAttendees: '',
    clientId: '',
    clientName: '',
    companyName: '',
    agenda: '',
    summary: '',
    decisions: '',
    notes: '',
    status: 'قادم' as MeetingStatus,
    actionItemsText: '', // Format: Task Title | AssigneeName or Code | DueDate (optional)
    autoCreateTasks: true
  });

  // Form State for Call Log
  const [callForm, setCallForm] = useState({
    clientId: '',
    clientName: '',
    companyName: '',
    contactPerson: '',
    contactPhone: '',
    employeeId: currentUser?.id || 'user-1',
    employeeName: currentUser?.name || 'هدير سعيد',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    durationMinutes: 10,
    type: 'outgoing' as CallType,
    purpose: '',
    summary: '',
    outcome: 'connected' as CallOutcome,
    nextFollowUpDate: '',
    nextFollowUpTime: '12:00',
    followUpNotes: '',
    notes: '',
    createFollowUpTask: false,
    followUpTaskTitle: '',
    followUpTaskAssigneeId: currentUser?.id || 'user-1'
  });

  // Form State for VIP Recording
  const [recordingForm, setRecordingForm] = useState({
    meetingTitle: '',
    clientName: '',
    company: '',
    isVipClient: true,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    duration: '45 دقيقة',
    googleMeetLink: 'https://meet.google.com/',
    recordingUrl: 'https://drive.google.com/file/d/.../view',
    keyTakeaways: '',
    actionItems: '',
    hostName: currentUser?.name || 'هدير سعيد',
    tags: 'عميل مهم, جوجل ميت, تجديد'
  });

  // Copy helper
  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Conflict Detection for Meetings: Detect if any attendees have overlapping meetings
  const detectMeetingConflicts = useMemo(() => {
    const conflicts: { meetingId: string; attendeeName: string; conflictingMeetingTitle: string; time: string }[] = [];

    for (let i = 0; i < meetings.length; i++) {
      const m1 = meetings[i];
      if (m1.status === 'ملغي') continue;

      for (let j = i + 1; j < meetings.length; j++) {
        const m2 = meetings[j];
        if (m2.status === 'ملغي') continue;

        if (m1.date === m2.date) {
          // Check time overlap
          const t1Start = m1.startTime || m1.time || '10:00';
          const t1End = m1.endTime || '11:00';
          const t2Start = m2.startTime || m2.time || '10:00';
          const t2End = m2.endTime || '11:00';

          const overlap = (t1Start < t2End) && (t2Start < t1End);
          if (overlap) {
            // Check mutual attendees
            const sharedAttendees = (m1.attendees || []).filter(id => (m2.attendees || []).includes(id));
            sharedAttendees.forEach(id => {
              const member = team.find(t => t.id === id);
              conflicts.push({
                meetingId: m1.id,
                attendeeName: member?.name || 'عضو بالفريق',
                conflictingMeetingTitle: m2.title,
                time: `${m1.date} الساعة ${t1Start}`
              });
            });
          }
        }
      }
    }

    return conflicts;
  }, [meetings, team]);

  // Combined Clients & Leads for Dropdown Pickers
  const availableClientOptions = useMemo(() => {
    const list: { id: string; name: string; company: string; phone: string; type: 'client' | 'lead' }[] = [];
    (visibleClients || []).forEach(c => {
      list.push({
        id: c.id,
        name: c.clientName,
        company: c.company || c.clientName,
        phone: c.phone || c.whatsappNumber || '',
        type: 'client'
      });
    });
    (leads || []).forEach(l => {
      list.push({
        id: l.id,
        name: l.name,
        company: l.company || l.name,
        phone: l.phone || '',
        type: 'lead'
      });
    });
    return list;
  }, [visibleClients, leads]);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (meetingTypeFilter !== 'all' && m.meetingType !== meetingTypeFilter) return false;
      if (meetingStatusFilter !== 'all' && m.status !== meetingStatusFilter) return false;
      if (meetingMemberFilter !== 'all' && !m.attendees?.includes(meetingMemberFilter) && m.hostId !== meetingMemberFilter) {
        return false;
      }
      if (meetingSearch.trim()) {
        const q = meetingSearch.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchClient = (m.clientName || '').toLowerCase().includes(q);
        const matchCompany = (m.companyName || '').toLowerCase().includes(q);
        const matchHost = (m.hostName || '').toLowerCase().includes(q);
        const agendaStr = Array.isArray(m.agenda) ? m.agenda.join(' ') : (m.agenda || '');
        const matchAgenda = agendaStr.toLowerCase().includes(q);
        if (!matchTitle && !matchClient && !matchCompany && !matchHost && !matchAgenda) return false;
      }
      return true;
    });
  }, [meetings, meetingTypeFilter, meetingStatusFilter, meetingMemberFilter, meetingSearch]);

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (callTypeFilter !== 'all' && c.type !== callTypeFilter) return false;
      if (callOutcomeFilter !== 'all' && c.outcome !== callOutcomeFilter) return false;
      if (callEmployeeFilter !== 'all' && c.employeeId !== callEmployeeFilter) return false;
      if (callSearch.trim()) {
        const q = callSearch.toLowerCase();
        const matchClient = c.clientName.toLowerCase().includes(q);
        const matchCompany = (c.companyName || '').toLowerCase().includes(q);
        const matchPerson = (c.contactPerson || '').toLowerCase().includes(q);
        const matchPhone = (c.contactPhone || '').toLowerCase().includes(q);
        const matchPurpose = c.purpose.toLowerCase().includes(q);
        const matchSummary = c.summary.toLowerCase().includes(q);
        if (!matchClient && !matchCompany && !matchPerson && !matchPhone && !matchPurpose && !matchSummary) {
          return false;
        }
      }
      return true;
    });
  }, [calls, callTypeFilter, callOutcomeFilter, callEmployeeFilter, callSearch]);

  // All Action Items aggregated from Meetings and Calls
  const allActionItems = useMemo(() => {
    const items: {
      id: string;
      sourceType: 'meeting' | 'call';
      sourceId: string;
      sourceTitle: string;
      title: string;
      assignedToId: string;
      assignedToName: string;
      dueDate: string;
      dueTime?: string;
      taskId?: string;
      isCompleted: boolean;
      clientName?: string;
    }[] = [];

    // From Meetings
    meetings.forEach(m => {
      (m.actionItems || []).forEach(ai => {
        items.push({
          id: ai.id,
          sourceType: 'meeting',
          sourceId: m.id,
          sourceTitle: m.title,
          title: ai.title,
          assignedToId: ai.assignedToId,
          assignedToName: ai.assignedToName,
          dueDate: ai.dueDate,
          dueTime: ai.dueTime,
          taskId: ai.taskId,
          isCompleted: ai.isCompleted,
          clientName: m.clientName || m.companyName
        });
      });
    });

    // From Calls with follow-up tasks
    calls.forEach(c => {
      if (c.nextFollowUpDate || c.resultingTaskId) {
        items.push({
          id: 'call-act-' + c.id,
          sourceType: 'call',
          sourceId: c.id,
          sourceTitle: `مكالمة مع ${c.clientName} (${c.purpose})`,
          title: c.resultingTaskTitle || c.followUpNotes || `متابعة العميل: ${c.clientName}`,
          assignedToId: c.employeeId,
          assignedToName: c.employeeName,
          dueDate: c.nextFollowUpDate || c.date,
          dueTime: c.nextFollowUpTime,
          taskId: c.resultingTaskId,
          isCompleted: c.outcome === 'deal_agreed' || Boolean(c.resultingTaskId),
          clientName: c.clientName
        });
      }
    });

    // Filter by completion status
    return items.filter(it => {
      if (actionItemStatusFilter === 'pending') return !it.isCompleted;
      if (actionItemStatusFilter === 'completed') return it.isCompleted;
      return true;
    });
  }, [meetings, calls, actionItemStatusFilter]);

  // Unified Communication History Timeline
  const communicationTimeline = useMemo(() => {
    const list: {
      id: string;
      kind: 'meeting' | 'call';
      date: string;
      time: string;
      title: string;
      clientName: string;
      companyName?: string;
      actorName: string;
      summary: string;
      outcomeOrStatus: string;
      linkOrPhone?: string;
      actionCount?: number;
    }[] = [];

    meetings.forEach(m => {
      list.push({
        id: m.id,
        kind: 'meeting',
        date: m.date,
        time: m.startTime || m.time,
        title: m.title,
        clientName: m.clientName || 'اجتماع داخلي',
        companyName: m.companyName,
        actorName: m.hostName || 'المنسق',
        summary: m.summary || (Array.isArray(m.agenda) ? m.agenda.join(' • ') : m.agenda) || m.notes || 'اجتماع فريق أو عميل',
        outcomeOrStatus: m.status,
        linkOrPhone: m.meetingLink || m.location,
        actionCount: m.actionItems?.length || 0
      });
    });

    calls.forEach(c => {
      list.push({
        id: c.id,
        kind: 'call',
        date: c.date,
        time: c.time,
        title: `${c.type === 'incoming' ? '📞 مكالمة واردة' : '📱 مكالمة صادرة'}: ${c.purpose}`,
        clientName: c.clientName,
        companyName: c.companyName,
        actorName: c.employeeName,
        summary: c.summary,
        outcomeOrStatus:
          c.outcome === 'deal_agreed'
            ? 'تم الاتفاق'
            : c.outcome === 'needs_follow_up'
            ? 'يحتاج متابعة'
            : c.outcome === 'no_answer'
            ? 'لا يوجد رد'
            : 'تم التواصل',
        linkOrPhone: c.contactPhone
      });
    });

    // Sort by date/time descending
    return list
      .filter(item => {
        if (historyClientFilter !== 'all') {
          const normClient = historyClientFilter.toLowerCase();
          const match =
            item.clientName.toLowerCase().includes(normClient) ||
            (item.companyName && item.companyName.toLowerCase().includes(normClient));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
  }, [meetings, calls, historyClientFilter]);

  // Handle Save Meeting
  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title.trim() || !meetingForm.date) return;

    // Parse action items
    const parsedActionItems: MeetingActionItem[] = [];
    if (meetingForm.actionItemsText.trim()) {
      const lines = meetingForm.actionItemsText.split('\n').filter(l => l.trim());
      lines.forEach((line, idx) => {
        const parts = line.split('|').map(p => p.trim());
        const taskTitle = parts[0] || line;
        const assigneePart = parts[1] || '';
        const duePart = parts[2] || meetingForm.date;

        let targetMember = team.find(
          t => t.id === assigneePart || t.name.toLowerCase().includes(assigneePart.toLowerCase())
        );
        if (!targetMember) targetMember = currentUser;

        parsedActionItems.push({
          id: 'act-' + Date.now() + '-' + idx,
          title: taskTitle,
          assignedToId: targetMember.id,
          assignedToName: targetMember.name,
          dueDate: duePart,
          dueTime: '14:00',
          isCompleted: false
        });
      });
    }

    const meetingPayload: Omit<Meeting, 'id'> = {
      title: meetingForm.title.trim(),
      meetingType: meetingForm.meetingType,
      date: meetingForm.date,
      time: meetingForm.startTime,
      startTime: meetingForm.startTime,
      endTime: meetingForm.endTime,
      duration: meetingForm.duration || '45 دقيقة',
      locationType: meetingForm.locationType,
      location: meetingForm.location || 'Google Meet',
      meetingLink: meetingForm.meetingLink,
      locationAddress: meetingForm.locationAddress,
      hostId: meetingForm.hostId,
      hostName: team.find(t => t.id === meetingForm.hostId)?.name || meetingForm.hostName,
      attendees: meetingForm.attendees,
      clientAttendees: meetingForm.clientAttendees
        ? meetingForm.clientAttendees.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      clientId: meetingForm.clientId || undefined,
      clientName: meetingForm.clientName || undefined,
      companyName: meetingForm.companyName || undefined,
      agenda: meetingForm.agenda,
      summary: meetingForm.summary,
      decisions: meetingForm.decisions,
      notes: meetingForm.notes,
      status: meetingForm.status,
      actionItems: parsedActionItems
    };

    if (editingMeeting) {
      updateMeeting(editingMeeting.id, meetingPayload);
    } else {
      const created = addMeeting(meetingPayload);

      // Auto-create real tasks in TasksView if checkbox is checked
      if (meetingForm.autoCreateTasks && parsedActionItems.length > 0) {
        parsedActionItems.forEach(item => {
          createTaskFromActionItem({
            title: item.title,
            description: `مهمة مكلفة مباشرة من اجتماع: ${meetingPayload.title}\nالقرارات المتفق عليها: ${meetingPayload.decisions || 'لا توجد'}`,
            assignedToId: item.assignedToId,
            dueDate: item.dueDate,
            dueTime: item.dueTime,
            priority: 'high',
            category: 'إداري',
            clientId: meetingPayload.clientId,
            clientName: meetingPayload.clientName,
            meetingId: created.id,
            meetingTitle: created.title
          });
        });
      }
    }

    setIsAddMeetingModalOpen(false);
    setEditingMeeting(null);
    resetMeetingForm();
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      title: '',
      meetingType: 'client',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '10:45',
      duration: '45 دقيقة',
      locationType: 'online',
      location: 'Google Meet',
      meetingLink: 'https://meet.google.com/',
      locationAddress: '',
      hostId: currentUser?.id || 'user-1',
      hostName: currentUser?.name || 'هدير سعيد',
      attendees: [currentUser?.id || 'user-1'],
      clientAttendees: '',
      clientId: '',
      clientName: '',
      companyName: '',
      agenda: '',
      summary: '',
      decisions: '',
      notes: '',
      status: 'قادم',
      actionItemsText: '',
      autoCreateTasks: true
    });
  };

  const openEditMeeting = (m: Meeting) => {
    setEditingMeeting(m);
    setMeetingForm({
      title: m.title,
      meetingType: m.meetingType || 'client',
      date: m.date,
      startTime: m.startTime || m.time || '10:00',
      endTime: m.endTime || '10:45',
      duration: m.duration || '45 دقيقة',
      locationType: m.locationType || 'online',
      location: m.location || 'Google Meet',
      meetingLink: m.meetingLink || '',
      locationAddress: m.locationAddress || '',
      hostId: m.hostId || currentUser?.id || 'user-1',
      hostName: m.hostName || currentUser?.name || 'هدير سعيد',
      attendees: m.attendees || [],
      clientAttendees: (m.clientAttendees || []).join(', '),
      clientId: m.clientId || '',
      clientName: m.clientName || '',
      companyName: m.companyName || '',
      agenda: Array.isArray(m.agenda) ? m.agenda.join('\n') : (m.agenda || ''),
      summary: m.summary || '',
      decisions: Array.isArray(m.decisions) ? m.decisions.join('\n') : (m.decisions || ''),
      notes: m.notes || '',
      status: m.status || 'قادم',
      actionItemsText: (m.actionItems || [])
        .map(a => `${a.title} | ${a.assignedToName} | ${a.dueDate}`)
        .join('\n'),
      autoCreateTasks: false
    });
    setIsAddMeetingModalOpen(true);
  };

  // Handle Save Call Log
  const handleSaveCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callForm.clientName.trim() || !callForm.purpose.trim()) return;

    const callPayload: Omit<CallLog, 'id' | 'createdAt'> = {
      clientId: callForm.clientId || undefined,
      clientName: callForm.clientName.trim(),
      companyName: callForm.companyName || undefined,
      contactPerson: callForm.contactPerson || undefined,
      contactPhone: callForm.contactPhone || undefined,
      employeeId: callForm.employeeId,
      employeeName: team.find(t => t.id === callForm.employeeId)?.name || callForm.employeeName,
      date: callForm.date,
      time: callForm.time,
      durationMinutes: Number(callForm.durationMinutes) || 5,
      type: callForm.type,
      purpose: callForm.purpose.trim(),
      summary: callForm.summary.trim(),
      outcome: callForm.outcome,
      nextFollowUpDate: callForm.nextFollowUpDate || undefined,
      nextFollowUpTime: callForm.nextFollowUpTime || undefined,
      followUpNotes: callForm.followUpNotes || undefined,
      notes: callForm.notes || undefined
    };

    if (editingCall) {
      updateCallLog(editingCall.id, callPayload);
    } else {
      const createdCall = addCallLog(callPayload);

      // Create linked task if user requested it
      if (callForm.createFollowUpTask && (callForm.followUpTaskTitle || callForm.followUpNotes)) {
        createTaskFromActionItem({
          title: callForm.followUpTaskTitle || `متابعة مكالمة مع ${createdCall.clientName}`,
          description: `مهمة ناتجة عن مكالمة هاتفية: ${createdCall.summary}\nملاحظات المتابعة: ${createdCall.followUpNotes || 'متابعة العميل'}`,
          assignedToId: callForm.followUpTaskAssigneeId || currentUser.id,
          dueDate: callForm.nextFollowUpDate || callForm.date,
          dueTime: callForm.nextFollowUpTime || '12:00',
          priority: 'high',
          category: 'مبيعات',
          clientId: createdCall.clientId,
          clientName: createdCall.clientName,
          callId: createdCall.id
        });
      }
    }

    setIsAddCallModalOpen(false);
    setEditingCall(null);
    resetCallForm();
  };

  const resetCallForm = () => {
    setCallForm({
      clientId: '',
      clientName: '',
      companyName: '',
      contactPerson: '',
      contactPhone: '',
      employeeId: currentUser?.id || 'user-1',
      employeeName: currentUser?.name || 'هدير سعيد',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      durationMinutes: 10,
      type: 'outgoing',
      purpose: '',
      summary: '',
      outcome: 'connected',
      nextFollowUpDate: '',
      nextFollowUpTime: '12:00',
      followUpNotes: '',
      notes: '',
      createFollowUpTask: false,
      followUpTaskTitle: '',
      followUpTaskAssigneeId: currentUser?.id || 'user-1'
    });
  };

  const openEditCall = (c: CallLog) => {
    setEditingCall(c);
    setCallForm({
      clientId: c.clientId || '',
      clientName: c.clientName,
      companyName: c.companyName || '',
      contactPerson: c.contactPerson || '',
      contactPhone: c.contactPhone || '',
      employeeId: c.employeeId,
      employeeName: c.employeeName,
      date: c.date,
      time: c.time,
      durationMinutes: c.durationMinutes,
      type: c.type,
      purpose: c.purpose,
      summary: c.summary,
      outcome: c.outcome,
      nextFollowUpDate: c.nextFollowUpDate || '',
      nextFollowUpTime: c.nextFollowUpTime || '12:00',
      followUpNotes: c.followUpNotes || '',
      notes: c.notes || '',
      createFollowUpTask: false,
      followUpTaskTitle: '',
      followUpTaskAssigneeId: c.employeeId
    });
    setIsAddCallModalOpen(true);
  };

  // Toggle Action item completion directly
  const handleToggleMeetingActionItem = (meetingId: string, actionId: string) => {
    const targetMeeting = meetings.find(m => m.id === meetingId);
    if (!targetMeeting || !targetMeeting.actionItems) return;

    const updated = targetMeeting.actionItems.map(item =>
      item.id === actionId ? { ...item, isCompleted: !item.isCompleted } : item
    );

    updateMeeting(meetingId, { actionItems: updated });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in text-xs font-['Cairo',sans-serif]">
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                التواصل والاجتماعات
              </h1>
              <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                منظومة موحدة
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              جدولة الاجتماعات، تسجيل المكالمات الصادرة والواردة، متابعة التكليفات والمهام، وسجل التواصل الشامل للعملاء.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              resetMeetingForm();
              setEditingMeeting(null);
              setIsAddMeetingModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة اجتماع جديد</span>
          </button>

          <button
            onClick={() => {
              resetCallForm();
              setEditingCall(null);
              setIsAddCallModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>تسجيل مكالمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Meeting Conflict Warning Banner (if any) */}
      {detectMeetingConflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-amber-950 flex items-center gap-2">
              <span>تنبيه نظام منع تداخل المواعيد (Conflict Warning)</span>
              <span className="bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.2 rounded-full text-[10px]">
                {detectMeetingConflicts.length} تداخل رُصد
              </span>
            </h4>
            <div className="mt-1 space-y-1">
              {detectMeetingConflicts.slice(0, 3).map((c, i) => (
                <div key={i} className="text-amber-800">
                  • <strong>{c.attendeeName}</strong> مشارك في اجتماعين متزامنين في نفس التوقيت ({c.time} مع "{c.conflictingMeetingTitle}").
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'meetings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>الاجتماعات ({meetings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calls')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'calls'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>المكالمات والتواصل ({calls.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('action_items')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'action_items'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>المتابعات والتكليفات ({allActionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل التواصل الموحد</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recordings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'recordings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>تسجيلات Google Meet ({meetingRecordings.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. MEETINGS TAB                                         */}
      {/* ======================================================== */}
      {activeSubTab === 'meetings' && (
        <div className="space-y-4">
          {/* Controls & Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالعنوان، اسم العميل، جدول الأعمال، أو المنسق..."
                value={meetingSearch}
                onChange={e => setMeetingSearch(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <select
                value={meetingTypeFilter}
                onChange={e => setMeetingTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">جميع الأنواع</option>
                <option value="internal">داخلي (Internal)</option>
                <option value="client">مع عميل (Client)</option>
                <option value="partner">مع شريك (Partner)</option>
              </select>

              {/* Status Filter */}
              <select
                value={meetingStatusFilter}
                onChange={e => setMeetingStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">جميع الحالات</option>
                <option value="قادم">مجدول / قادم</option>
                <option value="مكتمل">تم وانعقد</option>
                <option value="مؤجل">مؤجل / أُعيدت جدولته</option>
                <option value="ملغي">ملغي</option>
              </select>

              {/* Member Filter */}
              <select
                value={meetingMemberFilter}
                onChange={e => setMeetingMemberFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">كل الموظفين</option>
                {team.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* View Switcher */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setMeetingViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                    meetingViewMode === 'cards' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  بطاقات
                </button>
                <button
                  onClick={() => setMeetingViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                    meetingViewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  جدول
                </button>
              </div>
            </div>
          </div>

          {/* Meetings Cards View */}
          {meetingViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeetings.length === 0 ? (
                <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-sm">لا توجد اجتماعات مطابقة للفلتر</h3>
                  <p className="text-slate-500 mt-1">يمكنك جدولة اجتماع جديد بالضغط على زر «جدولة اجتماع جديد» بالأعلى.</p>
                </div>
              ) : (
                filteredMeetings.map(m => {
                  const hostMember = team.find(t => t.id === m.hostId);
                  const isCompleted = m.status === 'مكتمل';
                  const isCancelled = m.status === 'ملغي';

                  return (
                    <div
                      key={m.id}
                      className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50/10'
                          : isCancelled
                          ? 'border-slate-200 bg-slate-50/50 opacity-70'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.meetingType === 'internal'
                                ? 'bg-indigo-100 text-indigo-800'
                                : m.meetingType === 'partner'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {m.meetingType === 'internal'
                              ? 'اجتماع داخلي'
                              : m.meetingType === 'partner'
                              ? 'شراكة وتعاون'
                              : 'اجتماع مع عميل'}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === 'مكتمل'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'ملغي'
                                ? 'bg-rose-100 text-rose-800'
                                : m.status === 'مؤجل'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                          {m.title}
                        </h3>

                        {/* Client / Organization */}
                        {(m.clientName || m.companyName) && (
                          <div className="flex items-center gap-1.5 mt-2 text-slate-600 font-semibold text-xs">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.clientName || m.companyName}</span>
                          </div>
                        )}

                        {/* Time & Duration */}
                        <div className="flex items-center gap-3 mt-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-bold">{m.date}</span>
                          </div>
                          <span className="text-slate-300">|</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{m.startTime || m.time}</span>
                            <span className="text-slate-400">({m.duration})</span>
                          </div>
                        </div>

                        {/* Meeting Location / Online Link */}
                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            {m.locationType === 'in_person' ? (
                              <Building className="w-3.5 h-3.5 text-amber-600" />
                            ) : m.locationType === 'phone' ? (
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Video className="w-3.5 h-3.5 text-blue-600" />
                            )}
                            <span className="font-bold">{m.location || 'أونلاين'}</span>
                          </div>

                          {m.meetingLink && m.locationType !== 'in_person' && (
                            <a
                              href={m.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                            >
                              <span>دخول الاجتماع</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Host & Attendees */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400">المسؤول:</span>
                            <span className="font-bold text-slate-800 text-[11px]">
                              {m.hostName || hostMember?.name || 'غير محدد'}
                            </span>
                          </div>

                          <div className="flex -space-x-reverse -space-x-2 overflow-hidden">
                            {(m.attendees || []).slice(0, 4).map(aid => {
                              const attendee = team.find(t => t.id === aid);
                              return (
                                <img
                                  key={aid}
                                  src={attendee?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                                  alt={attendee?.name || ''}
                                  title={attendee?.name || ''}
                                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                />
                              );
                            })}
                            {(m.attendees || []).length > 4 && (
                              <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
                                +{(m.attendees || []).length - 4}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action items counter */}
                        {m.actionItems && m.actionItems.length > 0 && (
                          <div className="mt-3 bg-blue-50/70 border border-blue-100 rounded-xl p-2.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 mb-1.5">
                              <span className="flex items-center gap-1">
                                <ListTodo className="w-3.5 h-3.5 text-blue-600" />
                                <span>المهام الناتجة ({m.actionItems.length})</span>
                              </span>
                              <span>
                                {m.actionItems.filter(a => a.isCompleted).length} / {m.actionItems.length} تم
                              </span>
                            </div>
                            <div className="space-y-1">
                              {m.actionItems.slice(0, 2).map(act => (
                                <div
                                  key={act.id}
                                  onClick={() => handleToggleMeetingActionItem(m.id, act.id)}
                                  className="flex items-center justify-between text-[10px] bg-white p-1.5 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={act.isCompleted}
                                      onChange={() => {}}
                                      className="rounded-sm text-blue-600 cursor-pointer pointer-events-none"
                                    />
                                    <span className={act.isCompleted ? 'line-through text-slate-400' : 'font-semibold text-slate-800'}>
                                      {act.title}
                                    </span>
                                  </div>
                                  <span className="text-slate-400 text-[9px]">{act.assignedToName}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {m.status !== 'مكتمل' && (
                            <button
                              onClick={() => updateMeeting(m.id, { status: 'مكتمل' })}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              تعليم كمكتمل
                            </button>
                          )}
                          <button
                            onClick={() => openEditMeeting(m)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الاجتماع"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من حذف هذا الاجتماع؟')) {
                              deleteMeeting(m.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Meetings Table View */}
          {meetingViewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">الاجتماع</th>
                      <th className="p-3.5">النوع</th>
                      <th className="p-3.5">العميل / الطرف</th>
                      <th className="p-3.5">الموعد والتوقيت</th>
                      <th className="p-3.5">المسؤول</th>
                      <th className="p-3.5">الحضور</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMeetings.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 max-w-[220px]">
                          <div className="truncate">{m.title}</div>
                          {m.meetingLink && (
                            <a
                              href={m.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <span>{m.location}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.meetingType === 'internal'
                                ? 'bg-indigo-100 text-indigo-800'
                                : m.meetingType === 'partner'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {m.meetingType === 'internal' ? 'داخلي' : m.meetingType === 'partner' ? 'شراكة' : 'عميل'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700">{m.clientName || m.companyName || '—'}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900">{m.date}</div>
                          <div className="text-[10px] text-slate-500">{m.startTime || m.time} ({m.duration})</div>
                        </td>
                        <td className="p-3.5 text-slate-800 font-semibold">{m.hostName || '—'}</td>
                        <td className="p-3.5 text-slate-600">{m.attendees?.length || 0} عضو</td>
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.status === 'مكتمل'
                                ? 'bg-emerald-100 text-emerald-800'
                                : m.status === 'ملغي'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditMeeting(m)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMeeting(m.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CALLS TAB                                            */}
      {/* ======================================================== */}
      {activeSubTab === 'calls' && (
        <div className="space-y-4">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400">إجمالي المكالمات</span>
              <div className="text-xl font-black text-slate-900 mt-1">{calls.length}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600">تم الاتفاق والنجاح</span>
              <div className="text-xl font-black text-emerald-700 mt-1">
                {calls.filter(c => c.outcome === 'deal_agreed').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-600">تحتاج متابعة قادمة</span>
              <div className="text-xl font-black text-amber-700 mt-1">
                {calls.filter(c => c.outcome === 'needs_follow_up').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500">لا يوجد رد</span>
              <div className="text-xl font-black text-slate-700 mt-1">
                {calls.filter(c => c.outcome === 'no_answer').length}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالعميل، الهاتف، الشخص المتحدث، أو الغرض من المكالمة..."
                value={callSearch}
                onChange={e => setCallSearch(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={callTypeFilter}
                onChange={e => setCallTypeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">كل المكالمات</option>
                <option value="outgoing">صادرة (Outgoing)</option>
                <option value="incoming">واردة (Incoming)</option>
              </select>

              <select
                value={callOutcomeFilter}
                onChange={e => setCallOutcomeFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">جميع النتائج</option>
                <option value="deal_agreed">تم الاتفاق</option>
                <option value="needs_follow_up">يحتاج متابعة</option>
                <option value="connected">تم التواصل</option>
                <option value="no_answer">لا يوجد رد</option>
              </select>

              <select
                value={callEmployeeFilter}
                onChange={e => setCallEmployeeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">جميع الموظفين</option>
                {team.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calls List */}
          <div className="space-y-3">
            {filteredCalls.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-sm">لا توجد مكالمات مسجلة مطابقة</h3>
                <p className="text-slate-500 mt-1">ابدأ بتسجيل أول مكالمة للعميل من خلال زر «تسجيل مكالمة جديدة».</p>
              </div>
            ) : (
              filteredCalls.map(c => {
                const isIncoming = c.type === 'incoming';
                const employee = team.find(t => t.id === c.employeeId);

                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="flex items-start gap-3.5 flex-1">
                      <div
                        className={`p-3 rounded-2xl shrink-0 ${
                          isIncoming ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {isIncoming ? <PhoneIncoming className="w-5 h-5" /> : <PhoneOutgoing className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm">{c.clientName}</h4>
                          {c.companyName && (
                            <span className="text-[11px] text-slate-500">({c.companyName})</span>
                          )}

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.outcome === 'deal_agreed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.outcome === 'needs_follow_up'
                                ? 'bg-amber-100 text-amber-800'
                                : c.outcome === 'no_answer'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.outcome === 'deal_agreed'
                              ? 'تم الاتفاق بنجاح'
                              : c.outcome === 'needs_follow_up'
                              ? 'يحتاج متابعة'
                              : c.outcome === 'no_answer'
                              ? 'لا يوجد رد'
                              : 'تم التواصل'}
                          </span>

                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                            {isIncoming ? 'واردة' : 'صادرة'} • {c.durationMinutes} دقيقة
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 font-bold">{c.purpose}</div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                          {c.summary}
                        </p>

                        {/* Follow up alert if specified */}
                        {c.nextFollowUpDate && (
                          <div className="flex items-center gap-2 text-[11px] text-amber-800 font-bold mt-1 bg-amber-50 px-2.5 py-1 rounded-lg w-fit border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>موعد المتابعة القادمة: {c.nextFollowUpDate} {c.nextFollowUpTime ? `الساعة ${c.nextFollowUpTime}` : ''}</span>
                            {c.followUpNotes && <span className="text-amber-700 font-normal">({c.followUpNotes})</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right metadata & actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                          <span>{c.employeeName || employee?.name}</span>
                          <img
                            src={employee?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {c.date} • {c.time}
                        </div>
                        {c.contactPhone && (
                          <div className="text-[10px] text-blue-600 font-semibold dir-ltr text-right mt-0.5">
                            {c.contactPhone}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        {/* Quick Task Generation button if not created yet */}
                        {!c.resultingTaskId ? (
                          <button
                            onClick={() => {
                              createTaskFromActionItem({
                                title: `متابعة مكالمة: ${c.clientName}`,
                                description: `مهمة تم توليدها من سجل المكالمة:\n${c.summary}\nملاحظات المتابعة: ${c.followUpNotes || 'التواصل مع العميل'}`,
                                assignedToId: c.employeeId || currentUser.id,
                                dueDate: c.nextFollowUpDate || c.date,
                                dueTime: c.nextFollowUpTime || '14:00',
                                priority: 'high',
                                category: 'مبيعات',
                                clientId: c.clientId,
                                clientName: c.clientName,
                                callId: c.id
                              });
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="توليد مهمة عمل في بورد المهام"
                          >
                            <Plus className="w-3 h-3" />
                            <span>إنشاء تاسك</span>
                          </button>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>تاسك مرتبط</span>
                          </span>
                        )}

                        <button
                          onClick={() => openEditCall(c)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل المكالمة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('هل تريد حذف سجل هذه المكالمة؟')) {
                              deleteCallLog(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACTION ITEMS & FOLLOW-UPS TAB                         */}
      {/* ======================================================== */}
      {activeSubTab === 'action_items' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                المتابعات والإجراءات الناتجة عن التواصل
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                قائمة حية بكافة المهام والتكليفات الناتجة عن الاجتماعات والمكالمات ومواعيد تنفيذها.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={actionItemStatusFilter}
                onChange={e => setActionItemStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="all">كل المتابعات</option>
                <option value="pending">بانتظار التنفيذ</option>
                <option value="completed">مكتملة ومنجزة</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {allActionItems.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-slate-700">لا توجد متابعات مسجلة حالياً</p>
                  <p className="text-xs text-slate-500 mt-1">تضاف المتابعات تلقائياً عند تسجيل القرارات في الاجتماعات أو المكالمات.</p>
                </div>
              ) : (
                allActionItems.map(item => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            item.isCompleted ? 'text-emerald-500' : 'text-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.2 rounded-md">
                            المصدر: {item.sourceType === 'meeting' ? 'اجتماع' : 'مكالمة'} ({item.sourceTitle})
                          </span>
                          {item.clientName && (
                            <span className="text-blue-600 font-bold">العميل: {item.clientName}</span>
                          )}
                          <span>المسؤول: {item.assignedToName}</span>
                          <span>الموعد: {item.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.taskId ? (
                        <button
                          onClick={() => setActiveTab('tasks')}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>عرض في المهام</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            createTaskFromActionItem({
                              title: item.title,
                              assignedToId: item.assignedToId,
                              dueDate: item.dueDate,
                              dueTime: item.dueTime,
                              priority: 'high',
                              clientName: item.clientName,
                              meetingId: item.sourceType === 'meeting' ? item.sourceId : undefined,
                              callId: item.sourceType === 'call' ? item.sourceId : undefined
                            });
                          }}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إنشاء تاسك رسمي</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. UNIFIED COMMUNICATION HISTORY TIMELINE TAB            */}
      {/* ======================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                سجل التواصل التاريخي الموحد (Communication Timeline)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                تاريخ اجتماعات ومكالمات كل عميل أو شركة مجمعة ومجدولة زمنياً مع الملخص والقرارات.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyClientFilter}
                onChange={e => setHistoryClientFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer min-w-[200px]"
              >
                <option value="all">كل العملاء والشركات</option>
                {availableClientOptions.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="relative border-r-2 border-slate-200 pr-6 space-y-6">
              {communicationTimeline.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="font-bold">لا يوجد سجل تواصل مسجل لهذا الفلتر</p>
                </div>
              ) : (
                communicationTimeline.map(item => (
                  <div key={item.id} className="relative">
                    {/* Timeline bullet */}
                    <div
                      className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                        item.kind === 'meeting' ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}
                    />

                    <div className="bg-slate-50 hover:bg-blue-50/40 transition-colors p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.kind === 'meeting'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.kind === 'meeting' ? 'اجتماع' : 'مكالمة'}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-xs">{item.title}</h4>
                        </div>

                        <div className="text-[11px] text-slate-500 font-semibold">
                          {item.date} • {item.time}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-bold text-slate-800">العميل: {item.clientName}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600">المسؤول: {item.actorName}</span>
                        <span className="text-slate-400">|</span>
                        <span className="text-emerald-700 font-bold">{item.outcomeOrStatus}</span>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. RECORDINGS TAB (Google Meet VIP Recordings Hub)       */}
      {/* ======================================================== */}
      {activeSubTab === 'recordings' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                تسجيلات Google Meet وميتنج العملاء (VIP Recordings)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                روابط التسجيل المباشرة من Google Drive / Meet، القرارات الهامة، وتوصيات المتابعة.
              </p>
            </div>

            <button
              onClick={() => setIsAddRecordingModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة تسجيل ميتنج</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetingRecordings.map(rec => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                      Google Meet تسجيل
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{rec.date}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{rec.meetingTitle}</h3>
                  <div className="text-xs text-slate-600 font-semibold mt-1">العميل: {rec.clientName}</div>

                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-800">أهم المخرجات والقرارات:</div>
                    <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                      {rec.keyTakeaways.slice(0, 3).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={rec.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>مشاهدة التسجيل</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(rec.id, rec.recordingUrl)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
                      title="نسخ الرابط"
                    >
                      {copiedId === rec.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deleteMeetingRecording(rec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT MEETING                                */}
      {/* ======================================================== */}
      {isAddMeetingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col text-xs">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base">
                  {editingMeeting ? 'تعديل بيانات الاجتماع' : 'جدولة اجتماع جديد في المنظومة'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddMeetingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMeeting} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title & Meeting Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">عنوان الاجتماع *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مراجعة خطة التسويق واعتماد ميزانية الإعلانات"
                    value={meetingForm.title}
                    onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع الاجتماع</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={e => setMeetingForm({ ...meetingForm, meetingType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="internal">اجتماع داخلي (فريق العمل)</option>
                    <option value="client">مع عميل (Client Meeting)</option>
                    <option value="partner">مع شركة شريكة (Partner)</option>
                  </select>
                </div>
              </div>

              {/* Client Selection (if with client or partner) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">العميل أو الشركة المرتبطة</label>
                  <select
                    value={meetingForm.clientId}
                    onChange={e => {
                      const selectedId = e.target.value;
                      const found = availableClientOptions.find(o => o.id === selectedId);
                      setMeetingForm({
                        ...meetingForm,
                        clientId: selectedId,
                        clientName: found?.name || '',
                        companyName: found?.company || found?.name || ''
                      });
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- اختياري: حدد العميل أو اتركه داخلياً --</option>
                    {availableClientOptions.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المشاركون من جهة العميل (أسماء / أرقام)</label>
                  <input
                    type="text"
                    placeholder="مثال: أ. محمد العتيبي، م. سارة"
                    value={meetingForm.clientAttendees}
                    onChange={e => setMeetingForm({ ...meetingForm, clientAttendees: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Date, Time, Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">وقت البداية</label>
                  <input
                    type="time"
                    value={meetingForm.startTime}
                    onChange={e => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">وقت النهاية</label>
                  <input
                    type="time"
                    value={meetingForm.endTime}
                    onChange={e => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المدة التقديرية</label>
                  <input
                    type="text"
                    value={meetingForm.duration}
                    onChange={e => setMeetingForm({ ...meetingForm, duration: e.target.value })}
                    placeholder="45 دقيقة"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Location Type, Link, or Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">طريقة الاجتماع</label>
                  <select
                    value={meetingForm.locationType}
                    onChange={e => {
                      const type = e.target.value as MeetingLocationType;
                      setMeetingForm({
                        ...meetingForm,
                        locationType: type,
                        location: type === 'in_person' ? 'مقر الشركة' : type === 'phone' ? 'مكالمة هاتفية' : 'Google Meet'
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="online">أونلاين (Google Meet / Zoom)</option>
                    <option value="in_person">حضوري (مقر الشركة / موقع العميل)</option>
                    <option value="phone">هاتفي (Phone Call)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">
                    {meetingForm.locationType === 'in_person' ? 'مكان الانعقاد بالتفصيل' : 'رابط الاجتماع (Google Meet / Zoom)'}
                  </label>
                  <input
                    type="text"
                    placeholder={meetingForm.locationType === 'in_person' ? 'القاعة الرئيسية أو عنوان المقر' : 'https://meet.google.com/xxx-xxxx-xxx'}
                    value={meetingForm.locationType === 'in_person' ? meetingForm.locationAddress : meetingForm.meetingLink}
                    onChange={e => {
                      if (meetingForm.locationType === 'in_person') {
                        setMeetingForm({ ...meetingForm, locationAddress: e.target.value });
                      } else {
                        setMeetingForm({ ...meetingForm, meetingLink: e.target.value });
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Host and Team Attendees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">المسؤول عن إدارة الاجتماع</label>
                  <select
                    value={meetingForm.hostId}
                    onChange={e => setMeetingForm({ ...meetingForm, hostId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    {team.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">حالة الاجتماع</label>
                  <select
                    value={meetingForm.status}
                    onChange={e => setMeetingForm({ ...meetingForm, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="قادم">مجدول / قادم</option>
                    <option value="مكتمل">تم وانعقد</option>
                    <option value="مؤجل">أُعيدت جدولته (مؤجل)</option>
                    <option value="ملغي">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Attendees Multiselect */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">المشاركون من فريق العمل (حدد المشاركين):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                  {team.map(m => {
                    const isSelected = meetingForm.attendees.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-[11px] cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) {
                              setMeetingForm({ ...meetingForm, attendees: [...meetingForm.attendees, m.id] });
                            } else {
                              setMeetingForm({
                                ...meetingForm,
                                attendees: meetingForm.attendees.filter(id => id !== m.id)
                              });
                            }
                          }}
                          className="rounded-sm text-blue-600 cursor-pointer"
                        />
                        <span className="truncate">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Agenda */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">جدول الأعمال والنقاط المطلوب مناقشتها (Agenda)</label>
                <textarea
                  rows={2}
                  placeholder="1. استعراض نتائج الأسبوع الماضى&#10;2. الاتفاق على شروط العقد الجديد"
                  value={meetingForm.agenda}
                  onChange={e => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              {/* Summary and Decisions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">ملخص ما دار في الاجتماع</label>
                  <textarea
                    rows={2}
                    placeholder="ملخص المناقشة والنقاط المحورية..."
                    value={meetingForm.summary}
                    onChange={e => setMeetingForm({ ...meetingForm, summary: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">القرارات المتفق عليها</label>
                  <textarea
                    rows={2}
                    placeholder="القرارات الملزمة والتوصيات..."
                    value={meetingForm.decisions}
                    onChange={e => setMeetingForm({ ...meetingForm, decisions: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action items text generator */}
              <div className="space-y-1 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-blue-950 flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-blue-600" />
                    <span>المهام والتكليفات الناتجة (كل سطر: عنوان المهمة | اسم المسؤول | تاريخ التسليم)</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  placeholder="إرسال عرض السعر المعدل | أحمد الشريف | 2026-11-02&#10;تعديل تصاميم البوستات | إسلام | 2026-11-03"
                  value={meetingForm.actionItemsText}
                  onChange={e => setMeetingForm({ ...meetingForm, actionItemsText: e.target.value })}
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-xl focus:outline-hidden text-xs"
                />

                <label className="flex items-center gap-2 mt-2 text-blue-900 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={meetingForm.autoCreateTasks}
                    onChange={e => setMeetingForm({ ...meetingForm, autoCreateTasks: e.target.checked })}
                    className="rounded-sm text-blue-600 cursor-pointer"
                  />
                  <span>إنشاء مهام فورية تلقائياً في بورد مهام الفريق (Tasks Board) لكل تكليف أعلاه!</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingMeeting ? 'حفظ التعديلات' : 'تأكيد وجدولة الاجتماع'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT CALL LOG                               */}
      {/* ======================================================== */}
      {isAddCallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col text-xs">
            <div className="bg-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">
                  {editingCall ? 'تعديل سجل المكالمة' : 'تسجيل مكالمة هاتفية جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddCallModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCall} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Client Picker or Direct Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">العميل أو جهة الاتصال *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="اسم العميل أو المؤسسة"
                      value={callForm.clientName}
                      onChange={e => setCallForm({ ...callForm, clientName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اختيار سريع من قائمة العملاء</label>
                  <select
                    onChange={e => {
                      const found = availableClientOptions.find(c => c.id === e.target.value);
                      if (found) {
                        setCallForm({
                          ...callForm,
                          clientId: found.id,
                          clientName: found.name,
                          companyName: found.company,
                          contactPhone: found.phone
                        });
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- اختر لملء البيانات تلقائياً --</option>
                    {availableClientOptions.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone, Person, Type, Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="010XXXXXXXX"
                    value={callForm.contactPhone}
                    onChange={e => setCallForm({ ...callForm, contactPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-left dir-ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نوع المكالمة</label>
                  <select
                    value={callForm.type}
                    onChange={e => setCallForm({ ...callForm, type: e.target.value as CallType })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="outgoing">صادرة (أنا اتصلت)</option>
                    <option value="incoming">واردة (العميل اتصل)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">مدة المكالمة (دقائق)</label>
                  <input
                    type="number"
                    min="1"
                    value={callForm.durationMinutes}
                    onChange={e => setCallForm({ ...callForm, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الموظف القائم بالمكالمة</label>
                  <select
                    value={callForm.employeeId}
                    onChange={e => setCallForm({ ...callForm, employeeId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    {team.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Purpose and Result */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">الغرض من المكالمة *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: متابعة عرض السعر / تجديد الاشتراك / استفسار فني"
                    value={callForm.purpose}
                    onChange={e => setCallForm({ ...callForm, purpose: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">نتيجة المكالمة *</label>
                  <select
                    value={callForm.outcome}
                    onChange={e => setCallForm({ ...callForm, outcome: e.target.value as CallOutcome })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden cursor-pointer font-bold"
                  >
                    <option value="connected">تم التواصل والنقاش</option>
                    <option value="deal_agreed">تم الاتفاق والموافقة (صفقة ناجحة)</option>
                    <option value="needs_follow_up">يحتاج متابعة لاحقة</option>
                    <option value="no_answer">لا يوجد رد / مغلق</option>
                    <option value="rescheduled">طلب العميل تأجيل المكالمة</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">ملخص ما تم الاتفاق عليه في المكالمة</label>
                <textarea
                  rows={2}
                  placeholder="سجل النقاط الأساسية التي تم تداولها خلال المكالمة..."
                  value={callForm.summary}
                  onChange={e => setCallForm({ ...callForm, summary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              {/* Next Follow Up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                <div className="space-y-1">
                  <label className="font-bold text-amber-950">موعد المتابعة القادمة (إن وجد)</label>
                  <input
                    type="date"
                    value={callForm.nextFollowUpDate}
                    onChange={e => setCallForm({ ...callForm, nextFollowUpDate: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-950">ملاحظات توجيه المتابعة</label>
                  <input
                    type="text"
                    placeholder="مثال: الاتصال لتأكيد تحويل الحساب البنكي"
                    value={callForm.followUpNotes}
                    onChange={e => setCallForm({ ...callForm, followUpNotes: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl focus:outline-hidden text-xs"
                  />
                </div>

                {/* Auto Task checkbox */}
                <div className="sm:col-span-2 pt-2 border-t border-amber-200/60">
                  <label className="flex items-center gap-2 font-bold text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={callForm.createFollowUpTask}
                      onChange={e => setCallForm({ ...callForm, createFollowUpTask: e.target.checked })}
                      className="rounded-sm text-amber-600 cursor-pointer"
                    />
                    <span>إنشاء مهمة (Task) تلقائية في بورد المهام لموعد هذه المتابعة!</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddCallModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCall ? 'حفظ التعديلات' : 'تسجيل المكالمة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD VIP RECORDING                                 */}
      {/* ======================================================== */}
      {isAddRecordingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 text-xs">
            <div className="bg-rose-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Film className="w-5 h-5 text-rose-400" />
                <h3 className="font-extrabold text-base">إضافة تسجيل Google Meet لعميل</h3>
              </div>
              <button
                onClick={() => setIsAddRecordingModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!recordingForm.meetingTitle || !recordingForm.clientName || !recordingForm.recordingUrl) return;

                addMeetingRecording({
                  meetingTitle: recordingForm.meetingTitle,
                  clientName: recordingForm.clientName,
                  company: recordingForm.company || 'غير محدد',
                  isVipClient: recordingForm.isVipClient,
                  date: recordingForm.date,
                  time: recordingForm.time,
                  duration: recordingForm.duration,
                  googleMeetLink: recordingForm.googleMeetLink,
                  recordingUrl: recordingForm.recordingUrl,
                  keyTakeaways: recordingForm.keyTakeaways
                    .split('\n')
                    .map(t => t.trim())
                    .filter(Boolean),
                  actionItems: recordingForm.actionItems
                    .split('\n')
                    .map(a => a.trim())
                    .filter(Boolean),
                  hostName: recordingForm.hostName,
                  tags: recordingForm.tags
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean),
                  notes: 'تمت إضافته إلى مركز تسجيلات العملاء'
                });

                setIsAddRecordingModalOpen(false);
              }}
              className="p-5 sm:p-6 space-y-3"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700">عنوان الاجتماع *</label>
                <input
                  type="text"
                  required
                  placeholder="اجتماع مراجعة الحملة مع شركة جولدن"
                  value={recordingForm.meetingTitle}
                  onChange={e => setRecordingForm({ ...recordingForm, meetingTitle: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={recordingForm.clientName}
                    onChange={e => setRecordingForm({ ...recordingForm, clientName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">تاريخ الاجتماع</label>
                  <input
                    type="date"
                    value={recordingForm.date}
                    onChange={e => setRecordingForm({ ...recordingForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">رابط التسجيل المباشر (Google Drive / Meet) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={recordingForm.recordingUrl}
                  onChange={e => setRecordingForm({ ...recordingForm, recordingUrl: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden dir-ltr text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">أهم القرارات والمخرجات (كل نقطة في سطر)</label>
                <textarea
                  rows={2}
                  placeholder="تم اعتماد خطة الشهر الجديد&#10;طلب العميل تعديل الثواني الأولى للريلز"
                  value={recordingForm.keyTakeaways}
                  onChange={e => setRecordingForm({ ...recordingForm, keyTakeaways: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddRecordingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التسجيل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
