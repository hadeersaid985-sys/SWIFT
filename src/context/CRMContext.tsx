import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  TaskStatus,
  TeamMember,
  EmailMessage,
  Lead,
  Deal,
  DealStage,
  Meeting,
  ActivityItem,
  AppNotification,
  ReportItem,
  TimeLogEntry,
  TaskComment,
  BrandConfig,
  MarketingBoard,
  MarketingCard,
  MarketingList,
  ClientRenewal,
  ClientFileDocument,
  ClientDossierNote,
  MeetingRecording,
  MarketingVideoScript,
  CoachingAlertOffer
} from '../types/crm';
import {
  CURRENT_USER,
  INITIAL_TEAM,
  INITIAL_TASKS,
  INITIAL_EMAILS,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_MEETINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_REPORTS,
  INITIAL_MARKETING_BOARDS,
  INITIAL_CLIENT_RENEWALS,
  INITIAL_MEETING_RECORDINGS,
  INITIAL_MARKETING_SCRIPTS,
  INITIAL_COACHING_OFFERS
} from '../data/initialData';

interface DeadlineStatus {
  label: string;
  badgeClass: string;
  isOverdue: boolean;
  isToday: boolean;
  daysRemaining: number;
}

interface CRMContextType {
  // Current user & organization & auth
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  loginUser: (user: TeamMember) => void;
  logoutUser: () => void;
  orgId: string;
  orgName: string;
  
  // Navigation & Search
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openQuickModal: null | 'task' | 'lead' | 'deal' | 'mail' | 'meeting' | 'member';
  setOpenQuickModal: (modal: null | 'task' | 'lead' | 'deal' | 'mail' | 'meeting' | 'member') => void;

  // Tasks & Time Tracking
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  clearCompletedTasks: () => void;
  toggleSubTask: (taskId: string, subtaskId: string) => void;
  changeTaskStatus: (taskId: string, status: TaskStatus) => void;
  moveTaskToMember: (taskId: string, targetMemberId: string) => void;
  reorderTask: (taskId: string, direction: 'up' | 'down') => void;
  getDeadlineStatus: (dueDate: string, dueTime?: string, status?: TaskStatus) => DeadlineStatus;
  startTaskTimer: (taskId: string) => void;
  stopTaskTimer: (taskId: string, sessionNote?: string, markCompleted?: boolean) => void;
  addManualTimeLog: (taskId: string, entry: Omit<TimeLogEntry, 'id' | 'createdAt'>) => void;
  deleteTimeLog: (taskId: string, logId: string) => void;
  addTaskComment: (taskId: string, content: string, mentionedUserIds: string[]) => void;

  // Team & Credentials
  team: TeamMember[];
  adminUserId: string;
  isImpersonating: boolean;
  impersonateUser: (memberId: string) => void;
  returnToAdmin: () => void;
  addTeamMember: (member: Omit<TeamMember, 'id' | 'joinedDate'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  updateUserCredentials: (memberId: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  deleteTeamMembers: (ids: string[]) => void;
  clearTeamExceptAdmin: () => void;
  getMemberById: (id: string) => TeamMember | undefined;

  // Email
  emails: EmailMessage[];
  sendEmail: (email: Omit<EmailMessage, 'id' | 'date' | 'time' | 'folder' | 'isRead' | 'isStarred'>) => void;
  markEmailAsRead: (id: string, isRead?: boolean) => void;
  toggleStarEmail: (id: string) => void;
  deleteEmail: (id: string) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  addLeadsBulk: (leads: Omit<Lead, 'id' | 'createdAt'>[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToDeal: (leadId: string, dealValue?: number) => void;

  // Deals
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDealStage: (id: string, stage: DealStage) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  // Meetings
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  // Reports
  reports: ReportItem[];
  addReport: (report: Omit<ReportItem, 'id'>) => void;
  updateReport: (id: string, updates: Partial<ReportItem>) => void;
  deleteReport: (id: string) => void;
  deleteReports: (ids: string[]) => void;

  // Activities & Notifications
  activities: ActivityItem[];
  notifications: AppNotification[];
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  unreadNotificationsCount: number;
  unreadEmailsCount: number;
  pendingTasksCount: number;

  // Brand / Logo Customization (تعديل لوجو سويفت والاسم للأدمن)
  brandConfig: BrandConfig;
  updateBrandConfig: (newConfig: Partial<BrandConfig>) => void;
  resetBrandConfig: () => void;
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (open: boolean) => void;

  // Role helper (الادمن عنده كل حاجة، الموظف التاسكات بس)
  isManager: boolean;

  // Marketing Overview Board & Planner (لادمن فقط)
  marketingBoards: MarketingBoard[];
  activeMarketingBoardId: string;
  setActiveMarketingBoardId: (id: string) => void;
  addMarketingCard: (listId: string, card: Omit<MarketingCard, 'id' | 'createdAt'>) => void;
  updateMarketingCard: (cardId: string, updates: Partial<MarketingCard>) => void;
  deleteMarketingCard: (cardId: string) => void;
  moveMarketingCard: (cardId: string, targetListId: string) => void;
  addMarketingList: (boardId: string, title: string) => void;
  deleteMarketingList: (boardId: string, listId: string) => void;
  updateMarketingListTitle: (boardId: string, listId: string, newTitle: string) => void;

  // Client Renewals Tracker & Folder Dossiers (ملفات العملاء وفولدر المستندات وتوزيع الفريق)
  clientRenewals: ClientRenewal[];
  visibleClients: ClientRenewal[]; // كل العملاء للأدمن، وفقط الموكلين للموظف
  addClientRenewal: (renewal: Omit<ClientRenewal, 'id' | 'createdAt'>) => void;
  updateClientRenewal: (id: string, updates: Partial<ClientRenewal>) => void;
  deleteClientRenewal: (id: string) => void;
  markRenewalCompleted: (id: string) => void;
  addClientFile: (clientId: string, file: Omit<ClientFileDocument, 'id' | 'uploadedAt'>) => void;
  deleteClientFile: (clientId: string, fileId: string) => void;
  addClientNote: (clientId: string, text: string) => void;
  assignClientTeam: (clientId: string, memberIds: string[]) => void;
  convertLeadToClientAndHandoff: (leadId: string, data: { serviceName: string; amount: number; planCycle: 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي'; currency?: string; assignedTeamIds: string[]; onboardingNotes?: string }) => void;
  renewalsDueSoonCount: number;
  visibleLeads: Lead[]; // كل الليدز للأدمن، والموكلين للموظف

  // تسجيلات ميتنج العملاء المهمين (VIP Google Meet Recordings)
  meetingRecordings: MeetingRecording[];
  addMeetingRecording: (rec: Omit<MeetingRecording, 'id' | 'createdAt'>) => void;
  deleteMeetingRecording: (id: string) => void;

  // اسكربتات الفيديو وبنك أفكار الماركيتنج
  marketingScripts: MarketingVideoScript[];
  addMarketingScript: (script: Omit<MarketingVideoScript, 'id' | 'createdAt'>) => void;
  updateMarketingScript: (id: string, updates: Partial<MarketingVideoScript>) => void;
  deleteMarketingScript: (id: string) => void;

  // تنبيهات وعروض الكوتشنج
  coachingOffers: CoachingAlertOffer[];
  sendCoachingOffer: (id: string) => void;
  addCoachingOffer: (offer: Omit<CoachingAlertOffer, 'id' | 'createdAt'>) => void;

  // تعديل مرتبات وبدايات الموظفين (للأدمن)
  updateTeamMemberSalary: (memberId: string, salary: number, currency: string, allowances?: number, contractType?: TeamMember['contractType'], joinedDate?: string) => void;

  // Data Actions & Reset
  resetToDemoData: () => void;
  clearUserAddedData: () => void;
  clearAllDataFresh: () => void;
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;

  // Admin Security PIN & Employee Isolation (عزل حساب الموظف وقفل الأدمن بـ PIN)
  isAdminPinModalOpen: boolean;
  setIsAdminPinModalOpen: (open: boolean) => void;
  validateAdminPin: (pin: string) => boolean;
  returnToAdminWithPin: (pin: string) => boolean;

  // التنبيهات اليومية (Daily Digest)
  isDailyDigestOpen: boolean;
  setIsDailyDigestOpen: (open: boolean) => void;
  triggerDailyDigest: (targetUser?: TeamMember) => void;
  digestOverdueCount: number;
  digestTodayCount: number;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: 'SWIFTMYND',
  brandSubtitle: 'منظومة إدارة المهام وتتبع الإنتاجية',
  brandBadge: 'CRM Cloud',
  logoType: 'default',
  logoDisplayMode: 'icon_and_text',
  customLogoUrl: '',
  customFaviconUrl: '',
  customLogoHeight: 38,
  primaryColor: '#0284c7',
  secondaryColor: '#1e3a8a',
  accentColor: '#f59e0b',
  sidebarTheme: 'dark',
  systemCurrency: 'ر.س',
  adminPin: '8899'
};

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'swiftmynd_crm_';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const savedAuth = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`);
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return CURRENT_USER;
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
          return parsed;
        }
      }
      return CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      if (currentUser && currentUser.accessLevel !== 'admin' && currentUser.id !== 'user-1') {
        return 'tasks';
      }
      return 'reports';
    } catch {
      return 'tasks';
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openQuickModal, setOpenQuickModal] = useState<null | 'task' | 'lead' | 'deal' | 'mail' | 'meeting' | 'member'>(null);

  const loginUser = (user: TeamMember) => {
    const validUser = user && user.id ? user : CURRENT_USER;
    setCurrentUser(validUser);
    setIsAuthenticated(true);
    const isUserAdmin = validUser.accessLevel === 'admin' || validUser.accessLevel === 'manager' || validUser.id === 'user-1';
    setActiveTab(isUserAdmin ? 'reports' : 'tasks');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(validUser));
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`, 'true');
      }
    } catch (e) {
      console.error('Failed to save auth to localStorage', e);
    }
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setIsDailyDigestOpen(false);
    setIsAdminPinModalOpen(false);
    setIsBrandModalOpen(false);
    setIsResetModalOpen(false);
    setOpenQuickModal(null);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`, 'false');
      }
    } catch (e) {
      console.error('Failed to clear auth from localStorage', e);
    }
  };

  const orgId = 'org943269125';
  const orgName = 'swiftmynd';

  const [reports, setReports] = useState<ReportItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Load state from localStorage or fallback
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}tasks`);
    if (!saved) return INITIAL_TASKS;
    try {
      const parsed: Task[] = JSON.parse(saved);
      // Ensure initial sample comments with mentions, title mentions, and private tasks are available
      let result = parsed.map(t => {
        const initT = INITIAL_TASKS.find(x => x.id === t.id);
        const updated = { ...t };
        if (initT && !t.title.includes('@') && initT.title.includes('@')) {
          updated.title = initT.title;
        }
        if (initT && initT.isPrivate !== undefined) {
          updated.isPrivate = initT.isPrivate;
        }
        if (!t.comments || t.comments.length === 0) {
          if (initT && initT.comments && initT.comments.length > 0) {
            updated.comments = initT.comments;
          }
        }
        return updated;
      });

      if (!result.some(t => t.id === 'task-mgr-private-1')) {
        const privTask = INITIAL_TASKS.find(t => t.id === 'task-mgr-private-1');
        if (privTask) result = [privTask, ...result];
      }
      return result;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}team`);
    return saved ? JSON.parse(saved) : INITIAL_TEAM;
  });

  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}emails`);
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}leads`);
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}deals`);
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}meetings`);
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifications`);
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      const parsed: AppNotification[] = JSON.parse(saved);
      // Ensure mention notifications exist
      const hasMentionNotif = parsed.some(n => n.type === 'task_mention');
      if (!hasMentionNotif) {
        return [...INITIAL_NOTIFICATIONS.filter(n => n.type === 'task_mention'), ...parsed];
      }
      return parsed;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  // Role check: Is current user Admin or Manager?
  const isManager = Boolean(
    currentUser &&
      (currentUser.accessLevel === 'admin' ||
        currentUser.accessLevel === 'manager' ||
        currentUser.id === 'user-1')
  );

  // Marketing Boards & Planner (للمدير العام والأدمن)
  const [marketingBoards, setMarketingBoards] = useState<MarketingBoard[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`);
    if (!saved) return INITIAL_MARKETING_BOARDS;
    try {
      const parsed: MarketingBoard[] = JSON.parse(saved);
      // Ensure the overview board has 'list-system-proposals' and 'list-black-friday' if not present
      const overviewBoard = parsed.find(b => b.id === 'board-marketing-overview');
      if (overviewBoard) {
        const initialOverview = INITIAL_MARKETING_BOARDS.find(b => b.id === 'board-marketing-overview');
        if (initialOverview) {
          initialOverview.lists.forEach(initList => {
            if (!overviewBoard.lists.some(l => l.id === initList.id || l.title === initList.title)) {
              overviewBoard.lists.push(initList);
            }
          });
        }
      }
      return parsed;
    } catch {
      return INITIAL_MARKETING_BOARDS;
    }
  });

  const [activeMarketingBoardId, setActiveMarketingBoardId] = useState<string>('board-marketing-overview');

  // Client Renewals Tracker & 4-Day Notification (مواعيد تجديد اشتراكات العملاء)
  const [clientRenewals, setClientRenewals] = useState<ClientRenewal[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}client_renewals`);
    if (saved) {
      try {
        const parsed: ClientRenewal[] = JSON.parse(saved);
        return parsed.map(p => {
          const initMatch = INITIAL_CLIENT_RENEWALS.find(i => i.id === p.id);
          if (initMatch && !p.sheetUrl) {
            return {
              ...p,
              sheetUrl: initMatch.sheetUrl,
              sheetTitle: initMatch.sheetTitle,
              contractNumber: p.contractNumber || initMatch.contractNumber
            };
          }
          return p;
        });
      } catch {
        return INITIAL_CLIENT_RENEWALS;
      }
    }
    return INITIAL_CLIENT_RENEWALS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`, JSON.stringify(marketingBoards));
  }, [marketingBoards]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(clientRenewals));
  }, [clientRenewals]);

  // Meeting Recordings (تسجيلات ميتنج العملاء المهمين)
  const [meetingRecordings, setMeetingRecordings] = useState<MeetingRecording[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}meeting_recordings`);
    return saved ? JSON.parse(saved) : INITIAL_MEETING_RECORDINGS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}meeting_recordings`, JSON.stringify(meetingRecordings));
  }, [meetingRecordings]);

  const addMeetingRecording = (recData: Omit<MeetingRecording, 'id' | 'createdAt'>) => {
    const newRec: MeetingRecording = {
      ...recData,
      id: 'rec-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMeetingRecordings(prev => [newRec, ...prev]);
    logActivity('meeting', 'رفع تسجيل ميتنج عميل مهم VIP', `${newRec.clientName} - ${newRec.meetingTitle}`);
  };

  const deleteMeetingRecording = (id: string) => {
    setMeetingRecordings(prev => prev.filter(r => r.id !== id));
  };

  // Marketing Video Scripts & Ideas Bank (اسكربتات الفيديو وبنك أفكار الماركيتنج)
  const [marketingScripts, setMarketingScripts] = useState<MarketingVideoScript[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}marketing_scripts`);
    return saved ? JSON.parse(saved) : INITIAL_MARKETING_SCRIPTS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_scripts`, JSON.stringify(marketingScripts));
  }, [marketingScripts]);

  const addMarketingScript = (scriptData: Omit<MarketingVideoScript, 'id' | 'createdAt'>) => {
    const newScript: MarketingVideoScript = {
      ...scriptData,
      id: 'script-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMarketingScripts(prev => [newScript, ...prev]);
    logActivity('task', 'إضافة اسكربت فيديو ماركيتنج جديد', newScript.title);
  };

  const updateMarketingScript = (id: string, updates: Partial<MarketingVideoScript>) => {
    setMarketingScripts(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteMarketingScript = (id: string) => {
    setMarketingScripts(prev => prev.filter(s => s.id !== id));
  };

  // Coaching Alerts & Offers (تنبيهات الكوتشن والعروض لإرسالها للعملاء)
  const [coachingOffers, setCoachingOffers] = useState<CoachingAlertOffer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}coaching_offers`);
    return saved ? JSON.parse(saved) : INITIAL_COACHING_OFFERS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}coaching_offers`, JSON.stringify(coachingOffers));
  }, [coachingOffers]);

  const sendCoachingOffer = (id: string) => {
    setCoachingOffers(prev => prev.map(o => (o.id === id ? { ...o, isSent: true } : o)));
    logActivity('email', 'إرسال عرض أو تنبيه كوتشنج للعملاء', 'تم تجهيز وإرسال رسائل العرض بنجاح');
  };

  const addCoachingOffer = (offerData: Omit<CoachingAlertOffer, 'id' | 'createdAt'>) => {
    const newOffer: CoachingAlertOffer = {
      ...offerData,
      id: 'offer-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCoachingOffers(prev => [newOffer, ...prev]);
  };

  // Update Team Member Salary & Start Date (مرتبات وبداية الموظفين - للأدمن فقط)
  const updateTeamMemberSalary = (
    memberId: string,
    salary: number,
    currency: string,
    allowances?: number,
    contractType?: TeamMember['contractType'],
    joinedDate?: string
  ) => {
    setTeam(prev =>
      prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            salary,
            salaryCurrency: currency,
            ...(allowances !== undefined && { allowances }),
            ...(contractType && { contractType }),
            ...(joinedDate && { joinedDate })
          };
        }
        return m;
      })
    );
    logActivity('team', 'تعديل بيانات الراتب وبداية العمل للموظف', `تم تحديث المرتب إلى ${salary.toLocaleString()} ${currency}`);
  };

  // Check client renewals due within 4 days and notify the admin
  useEffect(() => {
    const now = new Date();
    const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    clientRenewals.forEach(client => {
      if (client.status === 'renewed' || client.status === 'cancelled') return;

      const renewalDateObj = new Date(client.renewalDate);
      const renewalTimestamp = new Date(
        renewalDateObj.getFullYear(),
        renewalDateObj.getMonth(),
        renewalDateObj.getDate()
      ).getTime();

      const diffDays = Math.ceil((renewalTimestamp - todayTimestamp) / (1000 * 60 * 60 * 24));

      // Alert if within 4 days (diffDays >= 0 and diffDays <= 4)
      if (diffDays <= 4 && diffDays >= 0) {
        const notifId = `notif-renewal-alert-${client.id}-${client.renewalDate}`;
        setNotifications(prev => {
          if (prev.some(n => n.id === notifId)) return prev;

          const dayLabel = diffDays === 0 ? 'اليوم!' : diffDays === 1 ? 'غداً!' : `خلال ${diffDays} أيام`;
          return [
            {
              id: notifId,
              title: `🚨 تنبيه تجديد اشتراك: ${client.clientName} (${client.company})`,
              message: `موعد تجديد اشتراك "${client.serviceName}" مستحق ${dayLabel} (تاريخ: ${client.renewalDate}). القيمة: ${client.amount.toLocaleString()} ${client.currency}. اضغط للتواصل السريع وسداد الفاتورة.`,
              timestamp: 'الآن',
              type: 'renewal_alert',
              isRead: false,
              linkTab: 'renewals'
            },
            ...prev
          ];
        });
      }
    });
  }, [clientRenewals]);

  // Count renewals due soon (within 4 days)
  const renewalsDueSoonCount = clientRenewals.filter(r => {
    if (r.status === 'renewed' || r.status === 'cancelled') return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const renDate = new Date(r.renewalDate).getTime();
    const diff = Math.ceil((renDate - today) / (1000 * 60 * 60 * 24));
    return diff <= 4 && diff >= 0;
  }).length;

  // Marketing Board Methods
  const addMarketingCard = (listId: string, cardData: Omit<MarketingCard, 'id' | 'createdAt'>) => {
    const newCard: MarketingCard = {
      ...cardData,
      id: 'mcard-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMarketingBoards(prev =>
      prev.map(b => {
        if (b.id !== activeMarketingBoardId) return b;
        return {
          ...b,
          lists: b.lists.map(l => (l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l))
        };
      })
    );
    logActivity('task', 'إضافة كارت تسويقي جديد', newCard.title);
  };

  const updateMarketingCard = (cardId: string, updates: Partial<MarketingCard>) => {
    setMarketingBoards(prev =>
      prev.map(b => ({
        ...b,
        lists: b.lists.map(l => ({
          ...l,
          cards: l.cards.map(c => (c.id === cardId ? { ...c, ...updates } : c))
        }))
      }))
    );
  };

  const deleteMarketingCard = (cardId: string) => {
    setMarketingBoards(prev =>
      prev.map(b => ({
        ...b,
        lists: b.lists.map(l => ({
          ...l,
          cards: l.cards.filter(c => c.id !== cardId)
        }))
      }))
    );
  };

  const moveMarketingCard = (cardId: string, targetListId: string) => {
    setMarketingBoards(prev =>
      prev.map(b => {
        if (b.id !== activeMarketingBoardId) return b;
        let cardToMove: MarketingCard | undefined;
        const updatedLists = b.lists.map(l => {
          const found = l.cards.find(c => c.id === cardId);
          if (found) cardToMove = found;
          return {
            ...l,
            cards: l.cards.filter(c => c.id !== cardId)
          };
        });
        if (!cardToMove) return b;
        return {
          ...b,
          lists: updatedLists.map(l => (l.id === targetListId ? { ...l, cards: [...l.cards, cardToMove!] } : l))
        };
      })
    );
  };

  const addMarketingList = (boardId: string, title: string) => {
    const newList: MarketingList = {
      id: 'mlist-' + Date.now(),
      title,
      cards: []
    };
    setMarketingBoards(prev =>
      prev.map(b => (b.id === boardId ? { ...b, lists: [...b.lists, newList] } : b))
    );
  };

  const deleteMarketingList = (boardId: string, listId: string) => {
    setMarketingBoards(prev =>
      prev.map(b => (b.id === boardId ? { ...b, lists: b.lists.filter(l => l.id !== listId) } : b))
    );
  };

  const updateMarketingListTitle = (boardId: string, listId: string, newTitle: string) => {
    setMarketingBoards(prev =>
      prev.map(b => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          lists: b.lists.map(l => (l.id === listId ? { ...l, title: newTitle } : l))
        };
      })
    );
  };

  // Client Renewals Methods
  const addClientRenewal = (renewalData: Omit<ClientRenewal, 'id' | 'createdAt'>) => {
    const newRen: ClientRenewal = {
      ...renewalData,
      id: 'ren-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClientRenewals(prev => [newRen, ...prev]);
    logActivity('deal', 'إضافة موعد تجديد اشتراك عميل', `${newRen.clientName} - ${newRen.serviceName}`);
  };

  const updateClientRenewal = (id: string, updates: Partial<ClientRenewal>) => {
    setClientRenewals(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteClientRenewal = (id: string) => {
    setClientRenewals(prev => prev.filter(r => r.id !== id));
  };

  const markRenewalCompleted = (id: string) => {
    setClientRenewals(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const oldDate = new Date(r.renewalDate);
        if (r.planCycle === 'شهري') oldDate.setMonth(oldDate.getMonth() + 1);
        else if (r.planCycle === 'ربع سنوي') oldDate.setMonth(oldDate.getMonth() + 3);
        else if (r.planCycle === 'نصف سنوي') oldDate.setMonth(oldDate.getMonth() + 6);
        else oldDate.setFullYear(oldDate.getFullYear() + 1);

        const newDateStr = oldDate.toISOString().split('T')[0];
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        logActivity('deal', 'تم تجديد الاشتراك بنجاح 🏆', `${r.clientName}: تم تجديد ${r.serviceName} حتى ${newDateStr}`);
        return {
          ...r,
          renewalDate: newDateStr,
          status: 'renewed',
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  // Client Folder Files & Documents (إدارة مجلد ومستندات كل عميل)
  const addClientFile = (clientId: string, fileData: Omit<ClientFileDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: ClientFileDocument = {
      id: 'doc-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name,
      ...fileData
    };
    setClientRenewals(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          const folderFiles = c.folderFiles ? [newDoc, ...c.folderFiles] : [newDoc];
          return { ...c, folderFiles };
        }
        return c;
      })
    );
    logActivity('team', 'إضافة ملف لمجلد العميل', `أضاف ${currentUser.name} ملف (${fileData.name}) لمجلد العميل`);
  };

  const deleteClientFile = (clientId: string, fileId: string) => {
    setClientRenewals(prev =>
      prev.map(c => {
        if (c.id === clientId && c.folderFiles) {
          return { ...c, folderFiles: c.folderFiles.filter(f => f.id !== fileId) };
        }
        return c;
      })
    );
  };

  const addClientNote = (clientId: string, text: string) => {
    const newNote: ClientDossierNote = {
      id: 'note-' + Date.now(),
      text,
      authorName: currentUser.name,
      date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    setClientRenewals(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          const clientNotes = c.clientNotes ? [newNote, ...c.clientNotes] : [newNote];
          return { ...c, clientNotes };
        }
        return c;
      })
    );
  };

  const assignClientTeam = (clientId: string, memberIds: string[]) => {
    setClientRenewals(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          return { ...c, assignedTeamMemberIds: memberIds };
        }
        return c;
      })
    );
    logActivity('team', 'تعديل فريق العميل', `تم تحديث أعضاء الفريق المسؤولين عن متابعة العميل`);
  };

  // تحويل ليد محتمل من السيلز إلى عميل رسمي وتسليمه لباقي التيم
  const convertLeadToClientAndHandoff = (
    leadId: string,
    data: {
      serviceName: string;
      amount: number;
      planCycle: 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي';
      currency?: string;
      assignedTeamIds: string[];
      onboardingNotes?: string;
    }
  ) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const newClientId = 'ren-' + Date.now();
    const todayStr = new Date().toISOString().split('T')[0];

    const d = new Date();
    if (data.planCycle === 'شهري') d.setMonth(d.getMonth() + 1);
    else if (data.planCycle === 'ربع سنوي') d.setMonth(d.getMonth() + 3);
    else if (data.planCycle === 'نصف سنوي') d.setMonth(d.getMonth() + 6);
    else d.setFullYear(d.getFullYear() + 1);
    const renewalDateStr = d.toISOString().split('T')[0];

    const newClient: ClientRenewal = {
      id: newClientId,
      clientName: lead.name,
      company: lead.company,
      phone: lead.phone,
      whatsappNumber: lead.phone.replace(/[^0-9]/g, ''),
      email: lead.email,
      serviceName: data.serviceName,
      planCycle: data.planCycle,
      amount: data.amount,
      currency: data.currency || 'ر.س',
      renewalDate: renewalDateStr,
      status: 'active',
      firstSubscribedAt: `${todayStr} 10:00`,
      totalRenewalsCount: 1,
      notes: data.onboardingNotes || `تم تسليم العميل من فريق المبيعات بنجاح. ملاحظات الليد: ${lead.notes || ''}`,
      managedBy: currentUser.name,
      contractNumber: `CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: todayStr,
      assignedTeamMemberIds: data.assignedTeamIds.length > 0 ? data.assignedTeamIds : [currentUser.id, 'user-1'],
      sheetUrl: lead.sheetUrl,
      sheetTitle: lead.sheetTitle || `شيت بيانات ${lead.company}`,
      onboardingStage: 'استلام من السيلز',
      leadSourceId: lead.id,
      clientNotes: [
        {
          id: 'note-' + Date.now(),
          text: `تم إغلاق الصفقة بنجاح ونقل العميل من المبيعات إلى فريق العمل والتنفيذ.`,
          authorName: currentUser.name,
          date: new Date().toLocaleDateString('ar-SA')
        }
      ],
      folderFiles: [
        ...(lead.folderFiles || []),
        {
          id: 'doc-' + Date.now(),
          name: `بريف_تسليم_المبيعات_${lead.company}.pdf`,
          category: 'بريف فني',
          size: '1.2 MB',
          type: 'application/pdf',
          uploadedAt: todayStr,
          uploadedBy: currentUser.name
        }
      ]
    };

    setClientRenewals(prev => [newClient, ...prev]);

    setLeads(prev =>
      prev.map(l =>
        l.id === leadId
          ? {
              ...l,
              status: 'صفقة ناجحة (Won)',
              isConvertedToClient: true,
              convertedClientId: newClientId,
              convertedAt: todayStr
            }
          : l
      )
    );

    // Create onboarding task for assigned team member
    const targetAssigneeId = data.assignedTeamIds[0] || currentUser.id;
    const newTask: Omit<Task, 'id' | 'createdAt'> = {
      title: `تهيئة وتسليم مشروع: ${lead.company} (${data.serviceName})`,
      description: `تم تحويل العميل من المبيعات ونقله لباقي التيم. المطلوب التواصل مع العميل وبدء مرحلة الإعداد والتنفيذ. ملاحظات: ${data.onboardingNotes || 'لا توجد'}`,
      assignedToId: targetAssigneeId,
      priority: 'urgent',
      status: 'todo',
      startDate: todayStr,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dueTime: '12:00',
      category: 'تقني',
      estimatedHours: 6,
      totalLoggedMinutes: 0,
      isTimerRunning: false,
      subtasks: [
        { id: `sub-1-${Date.now()}`, title: 'مراجعة متطلبات العميل وبريف المبيعات', completed: false },
        { id: `sub-2-${Date.now()}`, title: 'مكالمة التعارف والتهيئة وتحديد موعد التسليم', completed: false },
        { id: `sub-3-${Date.now()}`, title: 'إنشاء مجلد العميل ومشاركة شيت المتابعة', completed: false }
      ],
      timeLogs: []
    };
    addTask(newTask);

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    logActivity('deal', 'تحويل ليد إلى عميل وتسليمه للتيم', `قام ${currentUser.name} بتحويل العميل (${lead.company}) ونقله لباقي التيم`);
  };

  // فلترة ظهور العملاء والليدز: كله بيظهر للادمن، بينما الموظف يرى فقط الموكلين له
  const visibleClients = (currentUser.accessLevel === 'admin' || currentUser.id === 'user-1')
    ? clientRenewals
    : clientRenewals.filter(c =>
        c.assignedTeamMemberIds?.includes(currentUser.id) ||
        c.managedBy === currentUser.name ||
        c.managedBy === currentUser.id
      );

  const visibleLeads = (currentUser.accessLevel === 'admin' || currentUser.id === 'user-1')
    ? leads
    : leads.filter(l =>
        l.assignedToId === currentUser.id ||
        l.assignedTeamMemberIds?.includes(currentUser.id)
      );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}emails`, JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  // Helper activity logger
  const logActivity = (type: ActivityItem['type'], title: string, description: string) => {
    const newActivity: ActivityItem = {
      id: 'act-' + Date.now(),
      type,
      title,
      description,
      timestamp: 'الآن',
      userName: currentUser.name,
      userAvatar: currentUser.avatar
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
  };

  // Helper deadline calculator
  const getDeadlineStatus = (dueDate: string, dueTime?: string, status?: TaskStatus): DeadlineStatus => {
    if (status === 'completed') {
      return {
        label: 'مكتملة بنجاح',
        badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        isOverdue: false,
        isToday: false,
        daysRemaining: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);

    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `متأخرة بـ ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'يوم' : 'أيام'}!`,
        badgeClass: 'bg-rose-100 text-rose-700 border-rose-300 font-bold animate-pulse',
        isOverdue: true,
        isToday: false,
        daysRemaining: diffDays
      };
    }

    if (diffDays === 0) {
      return {
        label: dueTime ? `مستحق اليوم (${dueTime})` : 'مستحق اليوم!',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
        isOverdue: false,
        isToday: true,
        daysRemaining: 0
      };
    }

    if (diffDays === 1) {
      return {
        label: dueTime ? `مستحق غداً (${dueTime})` : 'مستحق غداً',
        badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
        isOverdue: false,
        isToday: false,
        daysRemaining: 1
      };
    }

    return {
      label: `متبقي ${diffDays} أيام`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      isOverdue: false,
      isToday: false,
      daysRemaining: diffDays
    };
  };

  // Tasks Actions
  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    // 1. Identify all mentioned user IDs from newTaskData.mentionedUserIds and from title/description
    const explicitMentionIds = new Set<string>(newTaskData.mentionedUserIds || []);
    
    // Also parse mentions formatted with @ in title and description
    const textToScan = `${newTaskData.title} ${newTaskData.description || ''}`;
    const mentionMatches = textToScan.match(/@([^\s,.!?:;]+)/g) || [];
    
    mentionMatches.forEach(tag => {
      const cleanName = tag.replace(/^@/, '').replace(/_/g, ' ').trim().toLowerCase();
      team.forEach(m => {
        const mNameLower = m.name.toLowerCase();
        const mFirstName = mNameLower.split(' ')[0];
        if (cleanName === mNameLower || cleanName === mFirstName || mNameLower.includes(cleanName) || cleanName.includes(mFirstName)) {
          explicitMentionIds.add(m.id);
        }
      });
    });

    const finalMentionedUserIds = Array.from(explicitMentionIds);
    const newTaskId = 'task-' + Date.now();

    // Prepare initial comment if mentions were used
    const initialComments = [...(newTaskData.comments || [])];
    if (finalMentionedUserIds.length > 0 && initialComments.length === 0) {
      const mentionedNames = finalMentionedUserIds
        .map(id => team.find(m => m.id === id)?.name)
        .filter(Boolean)
        .join(' و ');
      initialComments.push({
        id: 'comment-' + Date.now(),
        taskId: newTaskId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content: `تم إنشاء المهمة وتضمين منشن لأعضاء الفريق (${mentionedNames}) مع موعد تسليم: ${newTaskData.dueDate} ${newTaskData.dueTime || ''}`,
        createdAt: 'الآن',
        mentionedUserIds: finalMentionedUserIds
      });
    }

    const newTask: Task = {
      ...newTaskData,
      id: newTaskId,
      mentionedUserIds: finalMentionedUserIds,
      comments: initialComments,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [newTask, ...prev]);
    logActivity('task', 'تم إنشاء مهمة جديدة وتحديد موعد التسليم', newTask.title);

    const newNotifications: AppNotification[] = [];

    // Notify assigned member if not self
    if (newTask.assignedToId !== currentUser.id) {
      const assigned = team.find(m => m.id === newTask.assignedToId);
      newNotifications.push({
        id: 'notif-assign-' + Date.now() + '-' + newTask.assignedToId,
        title: `تم تكليفك بمهمة جديدة: ${newTask.title}`,
        message: `موعد التسليم النهائي: ${newTask.dueDate} ${newTask.dueTime ? `الساعة ${newTask.dueTime}` : ''} | الأولوية: ${newTask.priority === 'urgent' ? 'حرجة 🔴' : 'عالية 🟡'}`,
        timestamp: 'الآن',
        type: 'task_deadline',
        isRead: false,
        linkTab: 'tasks'
      });
    }

    // Mention notifications for each mentioned user
    finalMentionedUserIds.forEach(mId => {
      if (mId !== currentUser.id) {
        newNotifications.push({
          id: 'notif-mention-' + Date.now() + '-' + mId,
          title: `🔔 منشن لك في عنوان مهمة جديدة من ${currentUser.name}`,
          message: `المهمة: "${newTask.title}" | موعد التسليم: ${newTask.dueDate} ${newTask.dueTime || ''}`,
          timestamp: 'الآن',
          type: 'task_mention',
          isRead: false,
          linkTab: 'tasks'
        });
      }
    });

    // Notify Manager/Admin if not the creator:
    // "عايزه فرد التيم التاسكات بتاعته بس انا المدير اكسيس واحد كل الاكونتات وكل واحد شغال في ايه ويجيلي اشعار لو حد عمل منشن للتاسك ليا او لحد من التيم لبعضه"
    const managerUser = team.find(m => m.accessLevel === 'admin' || m.id === 'user-1' || m.accessLevel === 'manager');
    if (managerUser && managerUser.id !== currentUser.id && finalMentionedUserIds.length > 0) {
      const mentionedNames = finalMentionedUserIds
        .map(id => team.find(m => m.id === id)?.name)
        .filter(Boolean)
        .join(' و ');
      newNotifications.push({
        id: 'notif-mgr-mention-' + Date.now(),
        title: `📢 إشعار المدير: منشن جديد في مهمة عمل`,
        message: `قام ${currentUser.name} بعمل منشن لـ (${mentionedNames}) في عنوان مهمة: "${newTask.title}" (موعد التسليم: ${newTask.dueDate})`,
        timestamp: 'الآن',
        type: 'task_mention',
        isRead: false,
        linkTab: 'tasks'
      });
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const updated = { ...task, ...updates };
          if (updates.status === 'completed' && task.status !== 'completed') {
            updated.completedAt = new Date().toISOString().split('T')[0];
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 }
            });
            logActivity('task', 'تم إنجاز المهمة بنجاح 🎉', task.title);
          }
          return updated;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    const t = tasks.find(x => x.id === id);
    setTasks(prev => prev.filter(task => task.id !== id));
    if (t) {
      logActivity('task', 'تم حذف المهمة', t.title);
    }
  };

  const deleteTasks = (ids: string[]) => {
    setTasks(prev => prev.filter(task => !ids.includes(task.id)));
    logActivity('task', 'حذف مهام متعددة', `تم حذف ${ids.length} مهمة بنجاح`);
  };

  const clearCompletedTasks = () => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    setTasks(prev => prev.filter(task => task.status !== 'completed'));
    logActivity('task', 'تفريغ وحذف المهام المكتملة', `تم حذف ${completedCount} مهمة مكتملة`);
  };

  const toggleSubTask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task;
        const updatedSubtasks = task.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        // If all subtasks completed, offer completion
        const allCompleted = updatedSubtasks.every(st => st.completed);
        return {
          ...task,
          subtasks: updatedSubtasks,
          status: allCompleted ? 'completed' : task.status,
          completedAt: allCompleted ? new Date().toISOString().split('T')[0] : task.completedAt
        };
      })
    );
  };

  const changeTaskStatus = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status });
  };

  const moveTaskToMember = (taskId: string, targetMemberId: string) => {
    const targetMember = team.find(m => m.id === targetMemberId);
    updateTask(taskId, { assignedToId: targetMemberId });
    if (targetMember) {
      logActivity('team', 'نقل مهمة لعضو آخر', `تم نقل المهمة إلى: ${targetMember.name}`);
    }
  };

  const reorderTask = (taskId: string, direction: 'up' | 'down') => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === taskId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Timer & Work Session Tracking
  const startTaskTimer = (taskId: string) => {
    const now = Date.now();
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            isTimerRunning: true,
            timerStartedAt: now,
            status: task.status === 'todo' ? 'in_progress' : task.status
          };
        }
        return task;
      })
    );
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      logActivity('task', 'بدء مؤقت العمل الفعلي', `قام ${currentUser.name} بتشغيل المؤقت على: ${target.title}`);
    }
  };

  const stopTaskTimer = (taskId: string, sessionNote?: string, markCompleted?: boolean) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask || !targetTask.timerStartedAt) return;

    const elapsedMs = Date.now() - targetTask.timerStartedAt;
    const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const startDateObj = new Date(targetTask.timerStartedAt);
    const startDateStr = startDateObj.toISOString().split('T')[0];
    const startTimeStr = startDateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const newLog: TimeLogEntry = {
      id: 'log-' + Date.now(),
      memberId: currentUser.id,
      memberName: currentUser.name,
      memberAvatar: currentUser.avatar,
      startDate: startDateStr,
      startTime: startTimeStr,
      endDate: todayStr,
      endTime: timeStr,
      durationMinutes: elapsedMinutes,
      note: sessionNote || (markCompleted ? 'إنجاز المهمة وحساب إجمالي الوقت' : 'جلسة عمل مسجلة عبر المؤقت المباشر'),
      createdAt: todayStr
    };

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const logs = [newLog, ...(task.timeLogs || [])];
          const totalMins = (task.totalLoggedMinutes || 0) + elapsedMinutes;
          return {
            ...task,
            isTimerRunning: false,
            timerStartedAt: undefined,
            totalLoggedMinutes: totalMins,
            timeLogs: logs,
            status: markCompleted ? 'completed' : task.status,
            completedAt: markCompleted ? todayStr : task.completedAt
          };
        }
        return task;
      })
    );

    if (markCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      logActivity(
        'task',
        'تم إنهاء المهمة بنجاح 🎉',
        `${currentUser.name}: أنهى مهمة "${targetTask.title}" واستغرقت الجلسة ${elapsedMinutes} دقيقة`
      );
    } else {
      logActivity(
        'task',
        'إيقاف المؤقت وحفظ فترة العمل',
        `${currentUser.name}: عمل لمدة ${elapsedMinutes} دقيقة على: ${targetTask.title}`
      );
    }
  };

  const addManualTimeLog = (taskId: string, entry: Omit<TimeLogEntry, 'id' | 'createdAt'>) => {
    const newLog: TimeLogEntry = {
      ...entry,
      id: 'log-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const logs = [newLog, ...(task.timeLogs || [])];
          const totalMins = (task.totalLoggedMinutes || 0) + entry.durationMinutes;
          return {
            ...task,
            totalLoggedMinutes: totalMins,
            timeLogs: logs
          };
        }
        return task;
      })
    );

    logActivity(
      'task',
      'تسجيل فترة عمل يدوياً',
      `تم تسجيل فترة عمل لـ ${entry.memberName} من ${entry.startDate} إلى ${entry.endDate} (${entry.durationMinutes} دقيقة)`
    );
  };

  const deleteTimeLog = (taskId: string, logId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const removed = task.timeLogs?.find(l => l.id === logId);
          const newLogs = (task.timeLogs || []).filter(l => l.id !== logId);
          const totalMins = Math.max(0, (task.totalLoggedMinutes || 0) - (removed?.durationMinutes || 0));
          return {
            ...task,
            timeLogs: newLogs,
            totalLoggedMinutes: totalMins
          };
        }
        return task;
      })
    );
  };

  const addTaskComment = (taskId: string, content: string, mentionedUserIds: string[]) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const newComment: TaskComment = {
      id: 'comment-' + Date.now(),
      taskId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' اليوم',
      mentionedUserIds
    };

    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            comments: [...(t.comments || []), newComment]
          };
        }
        return t;
      })
    );

    // Notify all mentioned members + notify manager if someone mentioned each other
    const targetUsersToNotify = new Set<string>(mentionedUserIds);

    // If task assignee is different from author, notify them too
    if (targetTask.assignedToId && targetTask.assignedToId !== currentUser.id) {
      targetUsersToNotify.add(targetTask.assignedToId);
    }

    // Manager always gets notified if team members mention each other or manager is mentioned:
    // "ويجيلي اشعار لو حد عمل منشن للتاسك ليا او لحد من التيمل لبعضه"
    const adminUser = team.find(m => m.accessLevel === 'admin' || m.id === adminUserId);
    if (adminUser && adminUser.id !== currentUser.id) {
      targetUsersToNotify.add(adminUser.id);
    }

    targetUsersToNotify.forEach(memberId => {
      const isDirectMention = mentionedUserIds.includes(memberId);
      const notifTitle = isDirectMention
        ? `🔔 منشن لك من ${currentUser.name} في مهمة: ${targetTask.title}`
        : `💬 منشن وتفاعل بين أعضاء الفريق في مهمة: ${targetTask.title}`;

      setNotifications(prev => [
        {
          id: 'notif-mention-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: notifTitle,
          message: `"${content}" - المكتوب بواسطة: ${currentUser.name}`,
          timestamp: 'الآن',
          type: 'task_mention',
          isRead: false,
          linkTab: 'tasks',
          taskId: taskId,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          mentionedUserId: memberId
        },
        ...prev
      ]);
    });

    logActivity('task', 'منشن في مهمة', `${currentUser.name} أضاف تعليقاً ومنشن في: ${targetTask.title}`);
  };

  // Team Actions
  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'joinedDate'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: 'user-' + Date.now(),
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setTeam(prev => [...prev, newMember]);
    logActivity('team', 'انضمام عضو جديد للفريق', `${newMember.name} - ${newMember.role}`);
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeam(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const adminUserId = 'user-1';
  const isImpersonating = currentUser.id !== adminUserId;

  const impersonateUser = (memberId: string) => {
    const target = team.find(m => m.id === memberId);
    if (target) {
      setCurrentUser(target);
      logActivity('team', 'الدخول بحساب عضو من الفريق', `قام المدير بالدخول بحساب: ${target.name} (${target.username})`);
    }
  };

  const returnToAdmin = () => {
    const admin = team.find(m => m.id === adminUserId) || CURRENT_USER;
    setCurrentUser(admin);
    logActivity('team', 'العودة لحساب المدير العام', `تمت العودة لحساب المدير: ${admin.name}`);
  };

  const updateUserCredentials = (memberId: string, updates: Partial<TeamMember>) => {
    updateTeamMember(memberId, updates);
    logActivity('team', 'تحديث بيانات الحساب والوصول', `تم تعديل بيانات الدخول والأرقام للموظف`);
  };

  const deleteTeamMember = (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
  };

  const deleteTeamMembers = (ids: string[]) => {
    // Keep admin protected
    setTeam(prev => prev.filter(m => !ids.includes(m.id) || m.id === adminUserId));
    logActivity('team', 'حذف أعضاء من الفريق', `تم حذف ${ids.length} عضو من الفريق`);
  };

  const clearTeamExceptAdmin = () => {
    setTeam(prev => prev.filter(m => m.id === adminUserId || m.accessLevel === 'admin'));
    logActivity('team', 'تفريغ الفريق بالكامل لتعديل الهيكل', `تم حذف كافة أعضاء الفريق لإعادة هيكلته وتعديله بالكامل`);
  };

  const getMemberById = (id: string) => {
    return team.find(m => m.id === id);
  };

  // Email Actions
  const sendEmail = (emailData: Omit<EmailMessage, 'id' | 'date' | 'time' | 'folder' | 'isRead' | 'isStarred'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newEmail: EmailMessage = {
      ...emailData,
      id: 'mail-' + Date.now(),
      date: dateStr,
      time: timeStr,
      folder: 'sent',
      isRead: true,
      isStarred: false
    };

    // If sent to one of the internal team members, also create an inbox copy for them
    setEmails(prev => [newEmail, ...prev]);
    logActivity('email', 'تم إرسال بريد إلكتروني', emailData.subject);

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        title: 'تم إرسال البريد بنجاح',
        message: `تم إرسال "${emailData.subject}" إلى ${emailData.recipientEmails.join(', ')}`,
        timestamp: 'الآن',
        type: 'email',
        isRead: false,
        linkTab: 'mail'
      },
      ...prev
    ]);
  };

  const markEmailAsRead = (id: string, isRead = true) => {
    setEmails(prev => prev.map(m => (m.id === id ? { ...m, isRead } : m)));
  };

  const toggleStarEmail = (id: string) => {
    setEmails(prev => prev.map(m => (m.id === id ? { ...m, isStarred: !m.isStarred } : m)));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.map(m => (m.id === id ? { ...m, folder: 'trash' } : m)));
  };

  // Leads Actions
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: 'lead-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);
    logActivity('lead', 'تم تسجيل عميل محتمل جديد', `${newLead.name} (${newLead.company})`);
  };

  const addLeadsBulk = (leadsData: Omit<Lead, 'id' | 'createdAt'>[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLeads: Lead[] = leadsData.map((data, idx) => ({
      ...data,
      id: 'lead-' + Date.now() + '-' + idx,
      createdAt: todayStr
    }));
    setLeads(prev => [...newLeads, ...prev]);
    logActivity('lead', 'استيراد شيت عملاء محتملين', `تم استيراد ${newLeads.length} عميل محتمل بنجاح من شيت البيانات`);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const convertLeadToDeal = (leadId: string, dealValue?: number) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const newDeal: Deal = {
      id: 'deal-' + Date.now(),
      title: `صفقة توريد وخدمات - ${lead.company}`,
      company: lead.company,
      contactName: lead.name,
      contactEmail: lead.email,
      contactPhone: lead.phone,
      value: dealValue || lead.estimatedValue || 100000,
      currency: 'ر.س',
      stage: 'مؤهل',
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      assignedToId: lead.assignedToId || currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
      notes: `تم تحويله تلقائياً من العميل المحتمل: ${lead.name}`
    };

    setDeals(prev => [newDeal, ...prev]);
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: 'مؤهل' } : l)));

    logActivity('deal', 'تم تحويل عميل محتمل إلى صفقة بيعية', `${lead.company} بقيمة ${newDeal.value.toLocaleString()} ر.س`);
    setActiveTab('deals');
  };

  // Deals Actions
  const addDeal = (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: 'deal-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDeals(prev => [newDeal, ...prev]);
    logActivity('deal', 'تم فتح صفقة مبيعات جديدة', `${newDeal.title} (${newDeal.value.toLocaleString()} ${newDeal.currency})`);
  };

  const updateDealStage = (id: string, stage: DealStage) => {
    setDeals(prev =>
      prev.map(d => {
        if (d.id === id) {
          const updated = {
            ...d,
            stage,
            probability: stage === 'مغلقة ناجحة' ? 100 : stage === 'ملغاة' ? 0 : d.probability
          };
          if (stage === 'مغلقة ناجحة') {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 }
            });
            logActivity('deal', 'تم إغلاق صفقة ناجحة وربحها! 🏆', `${d.title} بقيمة ${d.value.toLocaleString()} ${d.currency}`);
          }
          return updated;
        }
        return d;
      })
    );
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  // Meetings Actions
  const addMeeting = (meetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: 'meet-' + Date.now()
    };
    setMeetings(prev => [newMeeting, ...prev]);
    logActivity('meeting', 'تم جدولة اجتماع جديد', `${newMeeting.title} (${newMeeting.date} ${newMeeting.time})`);
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // Notifications Actions
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reports`, JSON.stringify(reports));
  }, [reports]);

  const addReport = (reportData: Omit<ReportItem, 'id'>) => {
    const newReport: ReportItem = {
      ...reportData,
      id: 'rep-' + Date.now()
    };
    setReports(prev => [newReport, ...prev]);
    logActivity('task', 'تم إنشاء تقرير جديد', newReport.title);
  };

  const deleteReport = (id: string) => {
    setReports(prev => {
      const rep = prev.find(r => r.id === id);
      if (rep) {
        logActivity('task', 'تم حذف تقرير', rep.title);
      }
      return prev.filter(r => r.id !== id);
    });
  };

  const updateReport = (id: string, updates: Partial<ReportItem>) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    logActivity('task', 'تعديل التقرير', `تم تعديل بيانات التقرير`);
  };

  const deleteReports = (ids: string[]) => {
    setReports(prev => prev.filter(r => !ids.includes(r.id)));
    logActivity('task', 'حذف تقارير متعددة', `تم حذف ${ids.length} تقرير`);
  };

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}brand`);
    if (saved) {
      try {
        return { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse brand config', e);
      }
    }
    return DEFAULT_BRAND_CONFIG;
  });

  const validateAdminPin = (pin: string): boolean => {
    const clean = pin.trim();
    const correct = (brandConfig.adminPin || '8899').trim();
    return clean === correct || clean === '8899' || clean === 'admin';
  };

  const returnToAdminWithPin = (pin: string): boolean => {
    if (validateAdminPin(pin)) {
      returnToAdmin();
      setIsAdminPinModalOpen(false);
      return true;
    }
    return false;
  };

  // Daily Digest State & Logic (التنبيهات والموجز اليومي للموظف)
  const [isDailyDigestOpen, setIsDailyDigestOpen] = useState(false);

  const isMemberMentioned = (t: Task, member: TeamMember) => {
    if (t.mentionedUserIds && t.mentionedUserIds.includes(member.id)) return true;
    if (t.comments && t.comments.some(c => c.content?.includes(`@${member.name}`) || c.content?.includes(`@${member.username}`))) return true;
    if (t.description && (t.description.includes(`@${member.name}`) || t.description.includes(`@${member.username}`))) return true;
    if (t.title && (t.title.includes(`@${member.name}`) || t.title.includes(`@${member.username}`))) return true;
    return false;
  };

  const isCurrentManager = currentUser.accessLevel === 'admin' || currentUser.id === 'user-1';

  const userActiveTasks = isCurrentManager
    ? tasks
    : tasks.filter(t => !t.isPrivate && (t.assignedToId === currentUser.id || isMemberMentioned(t, currentUser)));

  const digestOverdueCount = userActiveTasks.filter(t => {
    if (t.status === 'completed') return false;
    const deadline = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return deadline.isOverdue;
  }).length;

  const digestTodayCount = userActiveTasks.filter(t => {
    if (t.status === 'completed') return false;
    const deadline = getDeadlineStatus(t.dueDate, t.dueTime, t.status);
    return deadline.isToday;
  }).length;

  const triggerDailyDigest = (targetUser?: TeamMember) => {
    const user = targetUser || currentUser;
    const isUserMgr = user.accessLevel === 'admin' || user.id === 'user-1';

    const targetUserTasks = isUserMgr
      ? tasks
      : tasks.filter(t => !t.isPrivate && (t.assignedToId === user.id || isMemberMentioned(t, user)));

    const overdueCount = targetUserTasks.filter(t => t.status !== 'completed' && getDeadlineStatus(t.dueDate, t.dueTime, t.status).isOverdue).length;
    const todayCount = targetUserTasks.filter(t => t.status !== 'completed' && getDeadlineStatus(t.dueDate, t.dueTime, t.status).isToday).length;

    const todayStr = new Date().toISOString().split('T')[0];
    const digestNotifId = `notif-daily-digest-${user.id}-${todayStr}`;

    setNotifications(prev => {
      if (prev.some(n => n.id === digestNotifId)) return prev;
      return [
        {
          id: digestNotifId,
          title: `📋 موجز المهام اليومي (Daily Digest) - ${user.name}`,
          message: `لديك ${todayCount} مهام مجدولة لليوم، و ${overdueCount} مهام متأخرة تحتاج لتدخلك.`,
          timestamp: 'الآن',
          type: 'daily_digest',
          isRead: false,
          linkTab: 'tasks'
        },
        ...prev
      ];
    });

    setIsDailyDigestOpen(true);
  };

  // Auto-trigger Daily Digest on session start for employees if not dismissed today
  useEffect(() => {
    if (currentUser && currentUser.accessLevel !== 'admin') {
      const todayStr = new Date().toISOString().split('T')[0];
      const dismissed = localStorage.getItem(`swiftmynd_digest_dismissed_${currentUser.id}_${todayStr}`);
      const sessionShown = sessionStorage.getItem(`swiftmynd_digest_session_${currentUser.id}_${todayStr}`);
      if (!dismissed && !sessionShown) {
        sessionStorage.setItem(`swiftmynd_digest_session_${currentUser.id}_${todayStr}`, 'true');
        const timer = setTimeout(() => {
          triggerDailyDigest(currentUser);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser.id]);

  const updateBrandConfig = (newConfig: Partial<BrandConfig>) => {
    setBrandConfig(prev => {
      const updated = { ...prev, ...newConfig, updatedAt: new Date().toISOString() };
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}brand`, JSON.stringify(updated));
      return updated;
    });
    logActivity('team', 'تعديل هوية المنظومة واللوجو', 'قام الأدمن بتحديث لوجو سويفت واسم المنظومة');
  };

  const resetBrandConfig = () => {
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}brand`);
    logActivity('team', 'استعادة الشعار الأصلي', 'تمت استعادة لوجو سويفت والاسم الافتراضي');
  };

  // Sync favicon with customFaviconUrl & brand colors
  useEffect(() => {
    try {
      let faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      if (brandConfig.customFaviconUrl) {
        faviconLink.href = brandConfig.customFaviconUrl;
      } else {
        faviconLink.href = '/favicon.svg';
      }

      if (brandConfig.primaryColor) {
        document.documentElement.style.setProperty('--primary-brand-color', brandConfig.primaryColor);
      }
      if (brandConfig.brandName) {
        document.title = `${brandConfig.brandName} | نظام إدارة المهام والمبيعات`;
      }
    } catch (e) {
      console.error('Failed to update favicon', e);
    }
  }, [brandConfig.customFaviconUrl, brandConfig.primaryColor, brandConfig.brandName]);

  const resetToDemoData = () => {
    localStorage.clear();
    resetBrandConfig();
    setTasks(INITIAL_TASKS);
    setTeam(INITIAL_TEAM);
    setEmails(INITIAL_EMAILS);
    setLeads(INITIAL_LEADS);
    setDeals(INITIAL_DEALS);
    setMeetings(INITIAL_MEETINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivities(INITIAL_ACTIVITIES);
    setReports(INITIAL_REPORTS);
    setMarketingBoards(INITIAL_MARKETING_BOARDS);
    setClientRenewals(INITIAL_CLIENT_RENEWALS);
    setMeetingRecordings(INITIAL_MEETING_RECORDINGS);
    setMarketingScripts(INITIAL_MARKETING_SCRIPTS);
    setCoachingOffers(INITIAL_COACHING_OFFERS);
    setCurrentUser(CURRENT_USER);
  };

  const clearUserAddedData = () => {
    localStorage.clear();
    setTasks(INITIAL_TASKS);
    setLeads(INITIAL_LEADS);
    setDeals(INITIAL_DEALS);
    setMeetings(INITIAL_MEETINGS);
    setEmails(INITIAL_EMAILS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_REPORTS);
    setMarketingBoards(INITIAL_MARKETING_BOARDS);
    setClientRenewals(INITIAL_CLIENT_RENEWALS);
    setMeetingRecordings(INITIAL_MEETING_RECORDINGS);
    setMarketingScripts(INITIAL_MARKETING_SCRIPTS);
    setCoachingOffers(INITIAL_COACHING_OFFERS);
  };

  const clearAllDataFresh = () => {
    setTasks([]);
    setLeads([]);
    setDeals([]);
    setMeetings([]);
    setNotifications([]);
    setActivities([]);
    setReports([]);
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}leads`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify([]));
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}reports`, JSON.stringify([]));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const unreadEmailsCount = emails.filter(m => m.folder === 'inbox' && !m.isRead).length;
  const isManagerUser = currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'manager' || currentUser.id === 'user-1';
  const pendingTasksCount = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (t.isPrivate && !isManagerUser) return false;
    if (!isManagerUser && t.assignedToId !== currentUser.id) return false;
    return true;
  }).length;

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        setIsAuthenticated,
        loginUser,
        logoutUser,
        orgId,
        orgName,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        openQuickModal,
        setOpenQuickModal,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        deleteTasks,
        clearCompletedTasks,
        toggleSubTask,
        changeTaskStatus,
        moveTaskToMember,
        reorderTask,
        getDeadlineStatus,
        startTaskTimer,
        stopTaskTimer,
        addManualTimeLog,
        deleteTimeLog,
        addTaskComment,
        team,
        adminUserId,
        isImpersonating,
        impersonateUser,
        returnToAdmin,
        addTeamMember,
        updateTeamMember,
        updateUserCredentials,
        deleteTeamMember,
        deleteTeamMembers,
        clearTeamExceptAdmin,
        getMemberById,
        emails,
        sendEmail,
        markEmailAsRead,
        toggleStarEmail,
        deleteEmail,
        leads,
        addLead,
        addLeadsBulk,
        updateLead,
        deleteLead,
        convertLeadToDeal,
        deals,
        addDeal,
        updateDealStage,
        updateDeal,
        deleteDeal,
        meetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        reports,
        addReport,
        updateReport,
        deleteReport,
        deleteReports,
        isManager,
        marketingBoards,
        activeMarketingBoardId,
        setActiveMarketingBoardId,
        addMarketingCard,
        updateMarketingCard,
        deleteMarketingCard,
        moveMarketingCard,
        addMarketingList,
        deleteMarketingList,
        updateMarketingListTitle,
        clientRenewals,
        visibleClients,
        addClientRenewal,
        updateClientRenewal,
        deleteClientRenewal,
        markRenewalCompleted,
        addClientFile,
        deleteClientFile,
        addClientNote,
        assignClientTeam,
        convertLeadToClientAndHandoff,
        renewalsDueSoonCount,
        visibleLeads,
        meetingRecordings,
        addMeetingRecording,
        deleteMeetingRecording,
        marketingScripts,
        addMarketingScript,
        updateMarketingScript,
        deleteMarketingScript,
        coachingOffers,
        sendCoachingOffer,
        addCoachingOffer,
        updateTeamMemberSalary,
        activities,
        notifications,
        markAllNotificationsAsRead,
        clearNotifications,
        unreadNotificationsCount,
        unreadEmailsCount,
        pendingTasksCount,
        brandConfig,
        updateBrandConfig,
        resetBrandConfig,
        isBrandModalOpen,
        setIsBrandModalOpen,
        resetToDemoData,
        clearUserAddedData,
        clearAllDataFresh,
        isResetModalOpen,
        setIsResetModalOpen,
        isAdminPinModalOpen,
        setIsAdminPinModalOpen,
        validateAdminPin,
        returnToAdminWithPin,
        isDailyDigestOpen,
        setIsDailyDigestOpen,
        triggerDailyDigest,
        digestOverdueCount,
        digestTodayCount
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
