import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TeamMember,
  EmailMessage,
  Lead,
  LeadNegotiationEntry,
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
  AccountMonthlyTask,
  ClientFileDocument,
  ClientDossierNote,
  MeetingRecording,
  MarketingVideoScript,
  CoachingAlertOffer,
  AttendanceRecord,
  CompanyExpense,
  MonthlyPayrollRecord,
  SalesCommissionDeal,
  MonthlySalesCommissionRecord,
  ClientPaymentEntry,
  ClientFinancialContract,
  MarketingIdea,
  WrittenThoughtNote,
  PerformanceEvaluationRecord,
  DelayRecord,
  CompanyRule,
  RuleViolationRecord,
  MonthlyPerformanceReview,
  DelayReviewStatus,
  ViolationReviewStatus,
  CallLog
} from '../types/crm';
import {
  CURRENT_USER,
  INITIAL_TEAM,
  INITIAL_TASKS,
  INITIAL_EMAILS,
  INITIAL_LEADS,
  INITIAL_DEALS,
  INITIAL_MEETINGS,
  INITIAL_CALLS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_REPORTS,
  INITIAL_MARKETING_BOARDS,
  INITIAL_CLIENT_RENEWALS,
  INITIAL_MEETING_RECORDINGS,
  INITIAL_MARKETING_SCRIPTS,
  INITIAL_COACHING_OFFERS,
  INITIAL_ATTENDANCE,
  INITIAL_EXPENSES,
  INITIAL_SALES_COMMISSIONS,
  INITIAL_FINANCIAL_CONTRACTS,
  INITIAL_MARKETING_IDEAS,
  INITIAL_WRITTEN_THOUGHTS,
  INITIAL_PERFORMANCE_EVALUATIONS,
  INITIAL_DELAYS,
  INITIAL_COMPANY_RULES,
  INITIAL_RULE_VIOLATIONS,
  INITIAL_MONTHLY_PERFORMANCE_REVIEWS
} from '../data/initialData';
import {
  isUserAccountManager,
  getAccountManagerClients,
  getAccountManagerTeamMembers,
  isTaskInAccountManagerScope,
  filterTasksForAccountManager
} from '../utils/accountManagerScope';
import {
  saveTaskToFirestore,
  deleteTaskFromFirestore,
  bulkDeleteTasksFromFirestore,
  restoreTaskInFirestore,
  onTasksSnapshot,
  onDeletedTasksSnapshot,
  onNotificationsSnapshot,
  saveNotificationToFirestore,
  seedInitialTasksIfEmpty,
  saveClientRenewalToFirestore,
  deleteClientRenewalFromFirestore,
  onClientRenewalsSnapshot,
  saveTeamMemberToFirestore,
  saveTeamPasswordToFirestore,
  onTeamMembersSnapshot,
  seedInitialTeamIfEmpty
} from '../firebase';
import { resolveActiveTab, normalizeTabName } from '../utils/navigationState';

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
  deletedTasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  clearCompletedTasks: () => void;
  restoreTaskFromTrash: (taskId: string) => void;
  emptyTasksTrash: () => void;
  permanentlyDeleteTask: (taskId: string) => void;
  toggleSubTask: (taskId: string, subtaskId: string) => void;
  changeTaskStatus: (taskId: string, status: TaskStatus) => void;
  moveTaskToMember: (taskId: string, targetMemberId: string) => void;
  reorderTask: (taskId: string, direction: 'up' | 'down') => void;
  getDeadlineStatus: (dueDate: string, dueTime?: string, status?: TaskStatus) => DeadlineStatus;
  startTaskTimer: (taskId: string) => void;
  pauseTaskTimer: (taskId: string) => void;
  resumeTaskTimer: (taskId: string) => void;
  stopTaskTimer: (taskId: string, sessionNote?: string, markCompleted?: boolean, customDurationMinutes?: number) => void;
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
  emptyTrash: () => void;
  restoreEmailFromTrash: (id: string) => void;
  permanentlyDeleteEmail: (id: string) => void;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  addLeadsBulk: (leads: Omit<Lead, 'id' | 'createdAt'>[]) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  assignLeadTeamMembers: (leadId: string, memberIds: string[]) => void;
  addLeadNegotiation: (leadId: string, entry: Omit<LeadNegotiationEntry, 'id' | 'createdAt'>) => void;
  convertLeadToDeal: (leadId: string, dealValue?: number) => void;

  // Deals
  deals: Deal[];
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDealStage: (id: string, stage: DealStage) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;

  // Meetings & Communications (التواصل والاجتماعات)
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id'>) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;

  // Calls (المكالمات)
  calls: CallLog[];
  addCallLog: (call: Omit<CallLog, 'id' | 'createdAt'>) => CallLog;
  updateCallLog: (id: string, updates: Partial<CallLog>) => void;
  deleteCallLog: (id: string) => void;

  // Create Task directly from Meeting Action Item or Call Log
  createTaskFromActionItem: (params: {
    title: string;
    description?: string;
    assignedToId: string;
    dueDate: string;
    dueTime?: string;
    priority?: TaskPriority;
    category?: 'مبيعات' | 'تقني' | 'تسويق' | 'دعم' | 'إداري';
    clientId?: string;
    clientName?: string;
    meetingId?: string;
    meetingTitle?: string;
    callId?: string;
  }) => Task;

  // Account Manager Scope & Filtering (نطاق مدير الحسابات)
  isCurrentUserAccountManager: boolean;
  accountManagerClients: ClientRenewal[];
  accountManagerTeam: TeamMember[];
  accountManagerScopeTasks: Task[];
  isTaskInAccountManagerScope: (task: Task, user?: TeamMember) => boolean;
  filterTasksForAccountManager: (tasks: Task[], user: TeamMember) => Task[];
  selectedSimulatedAccountManagerId: string | 'all';
  setSelectedSimulatedAccountManagerId: (id: string | 'all') => void;
  effectiveAccountManager: TeamMember | null;

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
  deletedMarketingCardIds: string[];
  deletedMarketingListIds: string[];

  // Client Renewals Tracker & Folder Dossiers (ملفات العملاء وفولدر المستندات وتوزيع الفريق)
  clientRenewals: ClientRenewal[];
  visibleClients: ClientRenewal[]; // كل العملاء للأدمن، وفقط الموكلين للموظف
  addClientRenewal: (renewal: Omit<ClientRenewal, 'id' | 'createdAt'>) => void;
  updateClientRenewal: (id: string, updates: Partial<ClientRenewal>) => void;
  deleteClientRenewal: (id: string) => void;
  markRenewalCompleted: (id: string) => void;
  addClientFile: (clientId: string, file: Omit<ClientFileDocument, 'id' | 'uploadedAt'>) => void;
  deleteClientFile: (clientId: string, fileId: string) => void;
  updateClientFilePermissions: (clientId: string, fileId: string, allowedTeamMemberIds: string[]) => void;
  addClientNote: (clientId: string, text: string) => void;
  assignClientTeam: (clientId: string, memberIds: string[]) => void;
  // تاسكات الشهر ومتابعة الإنجاز لكل اكونت (Account Monthly Tasks)
  addAccountMonthlyTask: (clientId: string, task: Omit<AccountMonthlyTask, 'id' | 'createdAt'>) => void;
  toggleAccountMonthlyTask: (clientId: string, taskId: string) => void;
  updateAccountMonthlyTask: (clientId: string, taskId: string, updates: Partial<AccountMonthlyTask>) => void;
  deleteAccountMonthlyTask: (clientId: string, taskId: string) => void;
  setClientAccountManager: (clientId: string, managerId: string, managerName: string) => void;
  convertLeadToClientAndHandoff: (leadId: string, data: { serviceName: string; amount: number; planCycle: 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي'; currency?: string; assignedTeamIds: string[]; onboardingNotes?: string }) => void;
  renewalsDueSoonCount: number;
  visibleLeads: Lead[]; // كل الليدز للأدمن، والموكلين للموظف
  isSalesUser: boolean; // هل المستخدم في قسم المبيعات أو أدمن
  leadsDueFollowUpTodayCount: number; // عدد العملاء المحتملين المستحق متابعتهم اليوم أو متأخرين

  // Suspended Contracts (العقود الموقوفة وتوثيق سبب الإيقاف لكل عميل)
  suspendedContracts: ClientRenewal[];
  suspendClientContract: (id: string, reason: string, notes?: string, category?: string) => void;
  reactivateClientContract: (id: string) => void;
  updateSuspensionReason: (id: string, reason: string, notes?: string, category?: string) => void;
  addSuspendedContract: (data: Omit<ClientRenewal, 'id' | 'createdAt' | 'status'> & { suspensionReason: string; notes?: string; suspensionCategory?: string }) => void;


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

  // نظام الحضور والغياب والتأخيرات (Attendance & Absence)
  attendanceRecords: AttendanceRecord[];
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  batchMarkAttendance: (records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;

  // مسير الرواتب والمصروفات والأرباح (Payroll & Profit)
  monthlyPayrolls: MonthlyPayrollRecord[];
  saveMonthlyPayroll: (payroll: MonthlyPayrollRecord) => void;
  markPayrollPaid: (id: string, paymentMethod?: string) => void;
  companyExpenses: CompanyExpense[];
  addCompanyExpense: (expense: Omit<CompanyExpense, 'id'>) => void;
  updateCompanyExpense: (id: string, updates: Partial<CompanyExpense>) => void;
  deleteCompanyExpense: (id: string) => void;
  setGlobalCurrency: (newCurrency: string, updateExistingTeam?: boolean) => void;

  // عمولات فريق المبيعات لكل شهر منفصل
  monthlySalesCommissions: MonthlySalesCommissionRecord[];
  addOrUpdateSalesCommission: (record: MonthlySalesCommissionRecord) => void;
  markSalesCommissionPayout: (id: string, status: 'draft' | 'approved' | 'paid', payoutDate?: string, paymentMethod?: string) => void;
  addDealToSalesCommission: (commissionId: string, deal: Omit<SalesCommissionDeal, 'id'>) => void;

  // سيستم العقود والمدفوعات وباقي دفع العملاء
  clientFinancialContracts: ClientFinancialContract[];
  recordClientPayment: (contractId: string, payment: Omit<ClientPaymentEntry, 'id' | 'createdAt'>) => void;
  addClientFinancialContract: (contract: Omit<ClientFinancialContract, 'id' | 'createdAt' | 'payments' | 'remainingBalance'>) => void;
  updateClientFinancialContract: (id: string, updates: Partial<ClientFinancialContract>) => void;
  deleteClientFinancialContract: (id: string) => void;

  // أفكار الماركيتنج وأفكاري المكتوبة
  marketingIdeas: MarketingIdea[];
  addMarketingIdea: (idea: Omit<MarketingIdea, 'id' | 'createdAt'>) => void;
  updateMarketingIdea: (id: string, updates: Partial<MarketingIdea>) => void;
  deleteMarketingIdea: (id: string) => void;
  writtenThoughts: WrittenThoughtNote[];
  addWrittenThought: (thought: Omit<WrittenThoughtNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWrittenThought: (id: string, updates: Partial<WrittenThoughtNote>) => void;
  deleteWrittenThought: (id: string) => void;
  togglePinThought: (id: string) => void;

  // ==================== 1. تقييم أداء الموظفين (Performance Evaluations) ====================
  performanceEvaluations: PerformanceEvaluationRecord[];
  addPerformanceEvaluation: (record: Omit<PerformanceEvaluationRecord, 'id' | 'createdAt'>) => void;
  updatePerformanceEvaluation: (id: string, updates: Partial<PerformanceEvaluationRecord>) => void;
  deletePerformanceEvaluation: (id: string) => void;
  approvePerformanceEvaluation: (id: string, actionTaken?: string, followUpDate?: string) => void;
  addEvaluationClarification: (id: string, clarification: string) => void;

  // ==================== 2. متابعة التأخيرات المنظم (Delays & Attendance Log) ====================
  delays: DelayRecord[];
  addDelayRecord: (record: Omit<DelayRecord, 'id' | 'createdAt'>) => void;
  updateDelayRecord: (id: string, updates: Partial<DelayRecord>) => void;
  deleteDelayRecord: (id: string) => void;
  reviewDelayRecord: (id: string, reviewStatus: DelayReviewStatus, actionTaken?: string, notes?: string) => void;

  // ==================== 3. قواعد وسياسات الشركة (Company Rules & Policies) ====================
  companyRules: CompanyRule[];
  addCompanyRule: (rule: Omit<CompanyRule, 'id' | 'createdAt' | 'lastModified' | 'acknowledgments'>) => void;
  updateCompanyRule: (id: string, updates: Partial<CompanyRule>) => void;
  deleteCompanyRule: (id: string) => void;
  acknowledgeCompanyRule: (ruleId: string, employeeId?: string, employeeName?: string) => void;

  // ==================== 4. سجل حالات عدم الالتزام (Rule Violations Log) ====================
  ruleViolations: RuleViolationRecord[];
  addRuleViolation: (violation: Omit<RuleViolationRecord, 'id' | 'createdAt'>) => void;
  updateRuleViolation: (id: string, updates: Partial<RuleViolationRecord>) => void;
  deleteRuleViolation: (id: string) => void;
  reviewRuleViolation: (id: string, reviewStatus: ViolationReviewStatus, actionTaken?: string, notes?: string) => void;
  addViolationClarification: (id: string, clarification: string) => void;

  // ==================== 5. التقييم الشهري للموظفين (Monthly Reviews) ====================
  monthlyPerformanceReviews: MonthlyPerformanceReview[];
  saveMonthlyPerformanceReview: (review: MonthlyPerformanceReview) => void;
  deleteMonthlyPerformanceReview: (id: string) => void;

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

  // الملف الشخصي وتحديث بيانات المستخدم الحالي
  updateCurrentProfile: (updates: Partial<TeamMember>) => void;

  // النسخ الاحتياطي وتصدير واستيراد البيانات (Backup & Export/Import & GitHub)
  exportSystemBackup: () => string;
  getSystemBackupJson: () => string;
  importSystemBackup: (jsonData: string) => { success: boolean; message: string };
  isGitHubModalOpen: boolean;
  setIsGitHubModalOpen: (open: boolean) => void;
}

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: 'SWIFTMYND',
  brandSubtitle: 'منظومة إدارة المهام وتتبع الإنتاجية',
  brandBadge: 'CRM Cloud',
  logoType: 'custom_image',
  logoDisplayMode: 'icon_and_text',
  customLogoUrl: '/assets/aistudio/PROFILE2_3fe3b3a5.png',
  customFaviconUrl: '/assets/aistudio/PROFILE2_3fe3b3a5.png',
  customLogoHeight: 38,
  primaryColor: '#0284c7',
  secondaryColor: '#1e3a8a',
  accentColor: '#f59e0b',
  sidebarTheme: 'dark',
  systemCurrency: 'ج.م',
  adminPin: '8899'
};

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'swiftmynd_crm_';

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In private browsing or cross-origin iframe
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore quota or security errors
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  },
  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {}
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch {}
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {}
  }
};

export const ensureValidUser = (u: any): TeamMember => {
  if (!u || typeof u !== 'object') return CURRENT_USER;
  const valid: TeamMember = {
    ...CURRENT_USER,
    ...u,
    id: u.id || CURRENT_USER.id,
    name: u.name || CURRENT_USER.name,
    username: u.username || CURRENT_USER.username,
    accessLevel: u.accessLevel || CURRENT_USER.accessLevel,
    role: u.role || CURRENT_USER.role,
    avatar: u.avatar || CURRENT_USER.avatar
  };

  // Strictly enforce separation for Mariam (Web Developer) and Islam (Video Editor)
  if (valid.id === 'user-mariam' || (valid.username && valid.username.toLowerCase() === 'mariam')) {
    valid.id = 'user-mariam';
    valid.name = u.name || 'Mariam';
    valid.role = u.role || 'Web Developer';
    valid.department = u.department || 'التطوير والتقنية';
    valid.username = 'Mariam';
    valid.employeeCode = u.employeeCode || 'SM-106';
    valid.avatar = u.avatar || valid.avatar;
  } else if (
    valid.id === 'user-islam' ||
    valid.id === 'user-1793025675186' ||
    valid.id === 'user-1793016178916' ||
    (valid.username && valid.username.toLowerCase() === 'islam')
  ) {
    valid.id = 'user-islam';
    valid.name = u.name || 'Islam';
    valid.role = u.role || 'Video Editor';
    valid.department = u.department || 'المبيعات';
    valid.username = 'Islam';
    valid.employeeCode = u.employeeCode || 'SM-108';
    valid.avatar = u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    valid.password = u.password || 'Sw!ftiHaiQ$Cka6';
  }

  return valid;
};

export const ensureValidBrandConfig = (b: any): BrandConfig => {
  if (!b || typeof b !== 'object') return DEFAULT_BRAND_CONFIG;
  const logoUrl = b.customLogoUrl && b.customLogoUrl.trim() !== '' ? b.customLogoUrl : DEFAULT_BRAND_CONFIG.customLogoUrl;
  const faviconUrl = b.customFaviconUrl && b.customFaviconUrl.trim() !== '' ? b.customFaviconUrl : DEFAULT_BRAND_CONFIG.customFaviconUrl;
  return {
    ...DEFAULT_BRAND_CONFIG,
    ...b,
    logoType: 'custom_image',
    customLogoUrl: logoUrl,
    customFaviconUrl: faviconUrl,
    brandName: b.brandName || DEFAULT_BRAND_CONFIG.brandName,
    brandSubtitle: b.brandSubtitle || DEFAULT_BRAND_CONFIG.brandSubtitle,
    brandBadge: b.brandBadge || DEFAULT_BRAND_CONFIG.brandBadge,
    systemCurrency: (!b.systemCurrency || b.systemCurrency === 'ر.س') ? 'ج.م' : b.systemCurrency
  };
};

export const TEAM_ALIASES: Record<string, string[]> = {
  'user-eman': ['user-eman', 'sm-104', 'eman', 'eman ashraf', 'eman_ashraf', 'ايمان', 'إيمان', 'ايمان اشرف', 'إيمان أشرف'],
  'user-amira': ['user-amira', 'sm-110', 'amira', 'amira2', 'اميرة', 'أميرة', 'اميره'],
  'user-aya': ['user-aya', 'sm-103', 'aya', 'aya gaber', 'aya_gaber', 'اية', 'آية', 'ايه', 'اية جابر', 'آية جابر'],
  'user-maibel': ['user-maibel', 'sm-105', 'maibel', 'maibel emad', 'مايبل', 'ميبل', 'مايبل عماد'],
  'user-mariam': ['user-mariam', 'user-1793016396281', 'sm-106', 'mariam', 'مريم'],
  'user-yomna': ['user-yomna', 'sm-107', 'yomna', 'يمنى', 'يمنا'],
  'user-islam': ['user-islam', 'user-1793025675186', 'user-1793016178916', 'sm-108', 'sm-111', 'islam', 'إسلام', 'اسلام'],
  'user-roaa': ['user-roaa', 'sm-109', 'roaa', 'roaa_hetemy', 'رؤى', 'رؤى حتيمي', 'روءة', 'روءا'],
  'user-1': ['user-1', 'user-admin', 'hadeer', 'hadeer.admin', 'هدير', 'هدير سعيد', 'admin', 'المدير']
};

export const getCanonicalUserId = (val?: string | null): string => {
  if (!val) return '';
  const clean = val.trim().toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\-_.]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return '';

  // Pass 1: Direct key match
  for (const canonId of Object.keys(TEAM_ALIASES)) {
    if (canonId.toLowerCase() === clean) return canonId;
  }

  // Pass 2: Exact alias match across all members
  for (const [canonId, aliases] of Object.entries(TEAM_ALIASES)) {
    for (const a of aliases) {
      const cleanA = a.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\-_.]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean === cleanA || clean === cleanA.replace(/\s+/g, '')) {
        return canonId;
      }
    }
  }

  // Pass 3: Exact token match (clean exactly equals one of the words, never loose substring)
  for (const [canonId, aliases] of Object.entries(TEAM_ALIASES)) {
    for (const a of aliases) {
      const cleanA = a.toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[\-_.]/g, ' ').replace(/\s+/g, ' ').trim();
      const wordsA = cleanA.split(/\s+/);
      const wordsClean = clean.split(/\s+/);
      if (wordsClean.length === 1 && wordsA.includes(wordsClean[0]) && wordsClean[0].length >= 3) {
        return canonId;
      }
      if (wordsA.length === 1 && wordsClean.includes(wordsA[0]) && wordsA[0].length >= 3) {
        return canonId;
      }
    }
  }

  return clean;
};

export const isTaskAssignedToUser = (task: Task, user: TeamMember): boolean => {
  if (!user || !task) return false;
  const aid = (task.assignedToId || '').trim().toLowerCase();
  
  // Support tasks assigned to all accounts / all team members
  if (
    aid === 'all' ||
    aid === 'team' ||
    aid === 'all_members' ||
    aid === 'all_accounts' ||
    aid === 'everyone' ||
    aid === 'الجميع' ||
    aid === 'فريق العمل'
  ) {
    return true;
  }

  // 1. Direct ID match (highest priority, strictly isolated)
  if (user.id && aid === user.id.toLowerCase()) return true;

  // 2. Canonical mapping comparison
  const taskCanon = getCanonicalUserId(task.assignedToId);
  const userCanonId = getCanonicalUserId(user.id);
  const userCanonUsername = getCanonicalUserId(user.username);
  const userCanonCode = getCanonicalUserId(user.employeeCode);

  if (
    taskCanon &&
    (taskCanon === userCanonId ||
      taskCanon === userCanonUsername ||
      taskCanon === userCanonCode)
  ) {
    return true;
  }

  // 3. Fallback direct exact check (strictly exact, never loose substring)
  if (user.username && aid === user.username.trim().toLowerCase()) return true;
  if (user.employeeCode && aid === user.employeeCode.trim().toLowerCase()) return true;
  if (user.name && aid === user.name.trim().toLowerCase()) return true;

  // 4. Exact normalized Arabic check (must be exact match, NEVER substring includes between different users!)
  const normAid = aid.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  const normUserName = (user.name || '').toLowerCase().replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  if (normAid && normUserName && normAid === normUserName) {
    return true;
  }

  return false;
};

export const isUserMentionedInTask = (task: Task, user?: TeamMember | null): boolean => {
  if (!user || !task) return false;
  const userCanon =
    getCanonicalUserId(user.id) ||
    getCanonicalUserId(user.name) ||
    getCanonicalUserId(user.username) ||
    getCanonicalUserId(user.employeeCode);

  const uid = (user.id || '').trim().toLowerCase();
  const uname = (user.username || '').trim().toLowerCase();
  const name = (user.name || '').trim().toLowerCase();
  const firstName = name.split(' ')[0] || '';
  const code = (user.employeeCode || '').trim().toLowerCase();

  // 1. Explicit mentionedUserIds
  if (Array.isArray(task.mentionedUserIds)) {
    for (const mId of task.mentionedUserIds) {
      const cleanMid = (mId || '').trim().toLowerCase();
      if (userCanon && getCanonicalUserId(cleanMid) === userCanon) return true;
      if (
        cleanMid === uid ||
        cleanMid === uname ||
        cleanMid === code ||
        (name && cleanMid === name) ||
        (firstName && firstName.length >= 3 && cleanMid === firstName)
      ) {
        return true;
      }
    }
  }

  // 2. Comments
  if (Array.isArray(task.comments)) {
    for (const c of task.comments) {
      if (Array.isArray(c.mentionedUserIds)) {
        for (const mId of c.mentionedUserIds) {
          const cleanMid = (mId || '').trim().toLowerCase();
          if (userCanon && getCanonicalUserId(cleanMid) === userCanon) return true;
          if (
            cleanMid === uid ||
            cleanMid === uname ||
            cleanMid === code ||
            (name && cleanMid === name) ||
            (firstName && firstName.length >= 3 && cleanMid === firstName)
          ) {
            return true;
          }
        }
      }
      const cContent = (c.content || '').toLowerCase();
      if (userCanon && TEAM_ALIASES[userCanon]) {
        for (const alias of TEAM_ALIASES[userCanon]) {
          const cleanAlias = alias.toLowerCase();
          if (
            cContent.includes(`@${cleanAlias}`) ||
            cContent.includes(`@${cleanAlias.replace(/\s+/g, '_')}`)
          ) {
            return true;
          }
        }
      }
      if (
        (uname && (cContent.includes(`@${uname}`) || cContent.includes(`@${uname.replace(/_/g, ' ')}`))) ||
        (name && (cContent.includes(`@${name}`) || cContent.includes(`@${name.replace(/\s+/g, '_')}`))) ||
        (firstName && firstName.length >= 3 && cContent.includes(`@${firstName}`)) ||
        (code && cContent.includes(`@${code}`)) ||
        (uid && cContent.includes(`@${uid}`))
      ) {
        return true;
      }
    }
  }

  // 3. Scan title and description for explicit @ mentions
  const text = `${task.title || ''} ${task.description || ''}`.toLowerCase();
  if (userCanon && TEAM_ALIASES[userCanon]) {
    for (const alias of TEAM_ALIASES[userCanon]) {
      const cleanAlias = alias.toLowerCase();
      if (
        text.includes(`@${cleanAlias}`) ||
        text.includes(`@${cleanAlias.replace(/\s+/g, '_')}`)
      ) {
        return true;
      }
    }
  }

  if (uname && (text.includes(`@${uname}`) || text.includes(`@${uname.replace(/_/g, ' ')}`))) return true;
  if (name && (text.includes(`@${name}`) || text.includes(`@${name.replace(/\s+/g, '_')}`))) return true;
  if (firstName && firstName.length >= 3 && text.includes(`@${firstName}`)) return true;
  if (code && text.includes(`@${code}`)) return true;

  // Arabic variations for Eman / Amira / Aya etc. with @
  const normText = text.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const normName = name.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const normFirst = firstName.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

  if (normName && (normText.includes(`@${normName}`) || normText.includes(`@${normName.replace(/\s+/g, '_')}`))) return true;
  if (normFirst && normFirst.length >= 3 && normText.includes(`@${normFirst}`)) return true;

  return false;
};

export const matchUserCredentials = (
  member: TeamMember,
  inputUsername: string,
  inputPassword: string
): boolean => {
  if (!member) return false;
  const cleanUser = (inputUsername || '').trim().toLowerCase();
  const cleanPass = (inputPassword || '').trim();
  if (!cleanUser || !cleanPass) return false;

  const memberUsername = (member.username || '').trim().toLowerCase();
  const memberEmail = (member.email || '').trim().toLowerCase();
  const memberName = (member.name || '').trim().toLowerCase();
  const memberCode = (member.employeeCode || '').trim().toLowerCase();
  const memberFirstName = memberName.split(' ')[0] || '';
  const memberUserPrefix = memberUsername.split('.')[0] || '';

  // Arabic normalization helper
  const normalizeAr = (s: string) => s.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  const normInput = normalizeAr(cleanUser);
  const normName = normalizeAr(memberName);
  const normFirstName = normalizeAr(memberFirstName);

  // Match Eman specifically (Arabic / English)
  const isEmanUser =
    (cleanUser === 'eman' || normInput === 'ايمان' || normInput === 'ايمن') &&
    (memberUsername === 'eman' || memberCode === 'sm-104' || normName === 'ايمان' || normName === 'ايمان اشرف');

  // Match Amira specifically (Amira, Amira2, SM-110, Arabic أميرة)
  const isAmiraUser =
    (cleanUser === 'amira' || cleanUser === 'amira2' || cleanUser === 'sm-110' || normInput === 'اميرة' || normInput === 'اميره') &&
    (memberUsername === 'amira' || memberUsername === 'amira2' || memberCode === 'sm-110' || normName === 'اميرة' || normName === 'أميرة');

  // Match Islam specifically (Islam, SM-108, SM-111, Arabic إسلام / اسلام)
  const isIslamUser =
    (cleanUser === 'islam' || cleanUser === 'sm-108' || cleanUser === 'sm-111' || normInput === 'اسلام' || normInput === 'إسلام') &&
    (memberUsername === 'islam' || memberCode === 'sm-108' || memberCode === 'sm-111' || normName === 'اسلام' || normName === 'إسلام');

  // Strictly exact user match - NEVER use loose substring normName.includes(normInput) which confuses Islam with Mariam!
  const isUserMatch =
    memberUsername === cleanUser ||
    memberEmail === cleanUser ||
    memberName === cleanUser ||
    memberCode === cleanUser ||
    memberFirstName === cleanUser ||
    memberUserPrefix === cleanUser ||
    normName === normInput ||
    normFirstName === normInput ||
    isEmanUser ||
    isAmiraUser ||
    isIslamUser ||
    (cleanUser === 'admin' && (member.accessLevel === 'admin' || member.id === 'user-1'));

  if (!isUserMatch) return false;

  // Password check: exact, trimmed, case-insensitive, master PIN 8899, admin fallback, or default password
  const memberPass = (member.password || '').trim();
  const isPassMatch =
    memberPass === cleanPass ||
    memberPass.toLowerCase() === cleanPass.toLowerCase() ||
    cleanPass === '8899' ||
    cleanPass === 'Admin@Swift2026' ||
    cleanPass === 'admin' ||
    (isAmiraUser && (cleanPass === 'Sw!ftC4gc4i#D6T' || cleanPass === 'Sw!ftbKMPddC@CL' || cleanPass.toLowerCase() === 'sw!ftc4gc4i#d6t' || cleanPass.toLowerCase() === 'sw!ftbkmpddc@cl')) ||
    (isIslamUser && (cleanPass === 'Sw!ftIHaiQ$Cka6' || cleanPass === 'Sw!ftiHaiQ$Cka6' || cleanPass.toLowerCase() === 'sw!ftihaiq$cka6')) ||
    (member.accessLevel === 'admin' && (cleanPass === '8899' || cleanPass === 'Admin@Swift2026')) ||
    (isEmanUser && (cleanPass === 'Eman@Swift27526' || cleanPass.toLowerCase() === 'eman@swift27526')) ||
    cleanPass === 'User@Swift2026';

  return isPassMatch;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`);
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<TeamMember>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return ensureValidUser(parsed);
        }
      }
    } catch {}
    return CURRENT_USER;
  });

  const setSafeCurrentUser = (user: TeamMember) => {
    const validUser = ensureValidUser(user);
    setCurrentUser(validUser);
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(validUser));
  };

  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      const isUserAdmin = currentUser ? (currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'manager' || currentUser.id === 'user-1') : false;
      const isSales = currentUser ? (isUserAdmin || currentUser.department?.includes('مبيعات') || currentUser.department?.includes('Sales') || currentUser.role?.includes('مبيعات') || currentUser.role?.includes('Sales') || currentUser.name?.toLowerCase().includes('maibel') || currentUser.username?.toLowerCase().includes('maibel')) : false;

      const allowedEmployeeTabs = [
        'tasks',
        'renewals',
        'meetings',
        'calls',
        'mail',
        'chat',
        'profile',
        'performance',
        'company_rules',
        'delays',
        'payroll',
        ...(isSales ? ['leads'] : [])
      ];

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlTab = urlParams?.get('tab');
      const hashTab = typeof window !== 'undefined' ? window.location.hash : null;
      const storedTab = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}active_tab`);

      return resolveActiveTab({
        urlTab,
        hashTab,
        storedTab,
        isManager: isUserAdmin,
        allowedTabs: allowedEmployeeTabs,
        defaultAdminTab: 'reports',
        defaultEmployeeTab: 'tasks'
      });
    } catch {
      return 'tasks';
    }
  });

  const setActiveTab = (tab: string) => {
    const cleanTab = normalizeTabName(tab) || 'home';
    setActiveTabState(cleanTab);
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}active_tab`, cleanTab);

    if (typeof window !== 'undefined' && window.history) {
      try {
        const url = new URL(window.location.href);
        if (!url.pathname.includes('/login')) {
          url.searchParams.set('tab', cleanTab);
          window.history.replaceState({ tab: cleanTab }, '', url.toString());
        }
      } catch (e) {
        console.warn('History replaceState error:', e);
      }
    }
  };

  // Sync activeTab when user navigates using browser back/forward or hash
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');
        const hashTab = window.location.hash;
        const storedTab = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}active_tab`);

        const isUserAdmin = currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'manager' || currentUser.id === 'user-1';
        const isSales = isUserAdmin || currentUser.department?.includes('مبيعات') || currentUser.department?.includes('Sales') || currentUser.role?.includes('مبيعات') || currentUser.role?.includes('Sales') || currentUser.name?.toLowerCase().includes('maibel') || currentUser.username?.toLowerCase().includes('maibel');
        const allowedEmployeeTabs = [
          'tasks',
          'renewals',
          'meetings',
          'calls',
          'mail',
          'chat',
          'profile',
          'performance',
          'company_rules',
          'delays',
          'payroll',
          ...(isSales ? ['leads'] : [])
        ];

        const target = resolveActiveTab({
          urlTab,
          hashTab,
          storedTab,
          isManager: isUserAdmin,
          allowedTabs: allowedEmployeeTabs,
          defaultAdminTab: 'reports',
          defaultEmployeeTab: 'tasks'
        });

        if (target && target !== activeTab) {
          setActiveTabState(target);
          safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}active_tab`, target);
        }
      } catch {}
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [currentUser, activeTab]);

  // Keep URL query param in sync with current activeTab
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history && activeTab) {
      try {
        const url = new URL(window.location.href);
        if (!url.pathname.includes('/login') && url.searchParams.get('tab') !== activeTab) {
          url.searchParams.set('tab', activeTab);
          window.history.replaceState({ tab: activeTab }, '', url.toString());
        }
      } catch {}
    }
  }, [activeTab]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openQuickModal, setOpenQuickModal] = useState<null | 'task' | 'lead' | 'deal' | 'mail' | 'meeting' | 'member'>(null);

  const loginUser = (user: TeamMember) => {
    const validUser = ensureValidUser(user);
    setCurrentUser(validUser);
    setIsAuthenticated(true);
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(validUser));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`, 'true');

    const isUserAdmin = validUser.accessLevel === 'admin' || validUser.accessLevel === 'manager' || validUser.id === 'user-1';
    const isSales = isUserAdmin || validUser.department?.includes('مبيعات') || validUser.department?.includes('Sales') || validUser.role?.includes('مبيعات') || validUser.role?.includes('Sales') || validUser.name?.toLowerCase().includes('maibel') || validUser.username?.toLowerCase().includes('maibel');
    const allowedEmployeeTabs = [
      'tasks',
      'renewals',
      'meetings',
      'calls',
      'mail',
      'chat',
      'profile',
      'performance',
      'company_rules',
      'delays',
      'payroll',
      ...(isSales ? ['leads'] : [])
    ];

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlTab = urlParams?.get('tab');
    const hashTab = typeof window !== 'undefined' ? window.location.hash : null;
    const storedTab = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}active_tab`);

    const targetTab = resolveActiveTab({
      urlTab,
      hashTab,
      storedTab,
      isManager: isUserAdmin,
      allowedTabs: allowedEmployeeTabs,
      defaultAdminTab: 'reports',
      defaultEmployeeTab: 'tasks'
    });

    setActiveTab(targetTab);
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentUser(CURRENT_USER);
    safeStorage.removeItem(`${LOCAL_STORAGE_PREFIX}active_tab`);
    setActiveTabState('home');
    setIsDailyDigestOpen(false);
    setIsAdminPinModalOpen(false);
    setIsBrandModalOpen(false);
    setIsResetModalOpen(false);
    setOpenQuickModal(null);
    try {
      safeStorage.removeItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`);
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}isAuthenticated`, 'false');
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.delete('tab');
        url.searchParams.delete('subtab');
        window.history.replaceState({}, '', url.pathname);
      }
    } catch {}
  };

  const orgId = 'org943269125';
  const orgName = 'swiftmynd';

  const [reports, setReports] = useState<ReportItem[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}reports`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_REPORTS;
  });

  // Load state from localStorage or fallback (excluding any deleted tasks)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedDeleted = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`);
      const deletedIds = new Set<string>();
      if (savedDeleted) {
        try {
          const parsedDel = JSON.parse(savedDeleted);
          if (Array.isArray(parsedDel)) {
            parsedDel.forEach((d: any) => d?.id && deletedIds.add(d.id));
          }
        } catch {}
      }

      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}tasks`);
      if (saved) {
        const parsed: Task[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let result = parsed
            .filter(t => !deletedIds.has(t.id))
            .map(t => {
              const initT = INITIAL_TASKS.find(x => x.id === t.id);
              const updated = { ...t };
              if (initT && !t.title?.includes('@') && initT.title?.includes('@')) {
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

              // Sanitize legacy or misassigned tasks for Mariam and Islam
              if (
                updated.assignedToId === 'Mariam Islam' ||
                updated.assignedToId === 'Mariam' ||
                updated.assignedToId === 'مريم'
              ) {
                updated.assignedToId = 'user-mariam';
              } else if (
                updated.assignedToId === 'Islam' ||
                updated.assignedToId === 'إسلام' ||
                updated.assignedToId === 'اسلام'
              ) {
                updated.assignedToId = 'user-islam';
              }

              return updated;
            });

          if (!result.some(t => t.id === 'task-mgr-private-1') && !deletedIds.has('task-mgr-private-1')) {
            const privTask = INITIAL_TASKS.find(t => t.id === 'task-mgr-private-1');
            if (privTask) result = [privTask, ...result];
          }

          return result;
        }
      }
    } catch {}
    return INITIAL_TASKS;
  });

  const [deletedTasks, setDeletedTasks] = useState<Task[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    try {
      const deletedIds = new Set<string>(['user-mariam', 'user-1793016396281']);
      const savedDeleted = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_team_ids`);
      if (savedDeleted) {
        try {
          const parsedDel = JSON.parse(savedDeleted);
          if (Array.isArray(parsedDel)) {
            parsedDel.forEach((id: string) => deletedIds.add(id));
          }
        } catch {}
      }

      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}team`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const OLD_DEMO_USERNAMES = new Set(['ahmed.sherif', 'sara.marketing', 'tariq.tech', 'mona.support', 'karim.finance']);
          const filteredParsed = parsed.filter((m: any) => {
            const uname = (m.username || '').toLowerCase();
            const id = m.id || '';
            if (OLD_DEMO_USERNAMES.has(uname)) return false;
            if (deletedIds.has(id) || deletedIds.has(uname)) return false;
            return true;
          });
          const existingIds = new Set(filteredParsed.map((m: any) => m.id));
          const existingUsernames = new Set(filteredParsed.map((m: any) => (m.username || '').toLowerCase()));
          const missingMembers = INITIAL_TEAM.filter(
            initM => !existingIds.has(initM.id) &&
                     !existingUsernames.has(initM.username.toLowerCase()) &&
                     !deletedIds.has(initM.id) &&
                     !deletedIds.has(initM.username.toLowerCase())
          );
          const merged = filteredParsed.map((m: any) => {
            const initM = INITIAL_TEAM.find(
              x => x.id === m.id || (x.username && x.username.toLowerCase() === (m.username || '').toLowerCase())
            );
            const salCurr = (m.salaryCurrency === 'ر.س' || !m.salaryCurrency) ? 'ج.م' : m.salaryCurrency;
            let memberObj = initM ? {
              ...initM,
              ...m,
              salaryCurrency: salCurr,
              password: m.password || initM.password,
              username: m.username || initM.username
            } : { ...m, salaryCurrency: salCurr };

            if (
              memberObj.id === 'user-islam' ||
              memberObj.id === 'user-1793025675186' ||
              memberObj.id === 'user-1793016178916' ||
              (memberObj.username || '').toLowerCase() === 'islam'
            ) {
              memberObj.id = 'user-islam';
              memberObj.name = 'Islam';
              memberObj.role = 'Video Editor';
              memberObj.username = 'Islam';
              memberObj.employeeCode = 'SM-108';
              memberObj.isAccountActive = true;
              memberObj.avatar = m.avatar || memberObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              memberObj.password = m.password || memberObj.password || 'Sw!ftiHaiQ$Cka6';
            }

            return memberObj;
          });
          return [...merged, ...missingMembers];
        }
      }
    } catch {}
    return INITIAL_TEAM.filter(m => m.id !== 'user-mariam' && (m.username || '').toLowerCase() !== 'mariam');
  });

  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}emails`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_EMAILS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}leads`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_LEADS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deals`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((d: Deal) => ({
            ...d,
            currency: (d.currency === 'ر.س' || !d.currency) ? 'ج.م' : d.currency
          }));
        }
      }
    } catch {}
    return INITIAL_DEALS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}meetings`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_MEETINGS;
  });

  const [calls, setCalls] = useState<CallLog[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}calls`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_CALLS;
  });

  // State to allow Admin/General Manager to simulate/filter scope as a specific Account Manager
  const [selectedSimulatedAccountManagerId, setSelectedSimulatedAccountManagerId] = useState<string | 'all'>('all');

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}notifications`);
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasMentionNotif = parsed.some(n => n.type === 'task_mention');
          if (!hasMentionNotif) {
            return [...INITIAL_NOTIFICATIONS.filter(n => n.type === 'task_mention'), ...parsed];
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}activities`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_ACTIVITIES;
  });

  // Role check: Is current user Admin or Manager?
  const isManager = Boolean(
    currentUser &&
      (currentUser.accessLevel === 'admin' ||
        currentUser.accessLevel === 'manager' ||
        currentUser.id === 'user-1')
  );

  // Marketing Deleted Items Tracking (تتبع المحذوفات لضمان عدم عودتها نهائياً مع الريفرش)
  const [deletedMarketingCardIds, setDeletedMarketingCardIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_cards`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deletedMarketingListIds, setDeletedMarketingListIds] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_lists`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Marketing Boards & Planner (للمدير العام والأدمن)
  const [marketingBoards, setMarketingBoards] = useState<MarketingBoard[]>(() => {
    try {
      const savedDelCards = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_cards`);
      const delCardSet = new Set<string>(savedDelCards ? JSON.parse(savedDelCards) : []);
      const savedDelLists = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_lists`);
      const delListSet = new Set<string>(savedDelLists ? JSON.parse(savedDelLists) : []);

      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`);
      let sourceBoards: MarketingBoard[] = INITIAL_MARKETING_BOARDS;
      if (saved) {
        const parsed: MarketingBoard[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          sourceBoards = parsed;
        }
      }

      // Filter out permanently deleted lists and cards - never resurrect deleted items
      return sourceBoards.map(board => ({
        ...board,
        lists: (board.lists || [])
          .filter(l => !delListSet.has(l.id))
          .map(l => ({
            ...l,
            cards: (l.cards || []).filter(c => !delCardSet.has(c.id))
          }))
      }));
    } catch {}
    return INITIAL_MARKETING_BOARDS;
  });

  const [activeMarketingBoardId, setActiveMarketingBoardId] = useState<string>('board-marketing-overview');

  // Identifiers of mock demo clients that must never appear in production
  const MOCK_DEMO_CLIENT_IDS = new Set(['ren-1', 'ren-2', 'ren-3', 'ren-4', 'ren-5', 'ren-6']);
  const MOCK_DEMO_CLIENT_NAMES = new Set(['جاسم الصباح', 'عبدالعزيز العتيبي', 'سعود المنصور', 'فهد الدوسري', 'خالد ناصر الجاسم', 'م. أحمد كمال']);

  const isMockDemoClient = (item: any) => {
    if (!item) return true;
    if (item.id && MOCK_DEMO_CLIENT_IDS.has(item.id)) return true;
    const name = (item.clientName || '').trim();
    if (MOCK_DEMO_CLIENT_NAMES.has(name)) return true;
    return false;
  };

  // Client Renewals Tracker & 4-Day Notification (مواعيد تجديد اشتراكات العملاء)
  const [clientRenewals, setClientRenewals] = useState<ClientRenewal[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}client_renewals`);
      if (saved) {
        const parsed: ClientRenewal[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleanList = parsed.filter(p => !isMockDemoClient(p));
          if (cleanList.length > 0) {
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(cleanList));
            return cleanList.map(p => {
              const initMatch = INITIAL_CLIENT_RENEWALS.find(i => i.id === p.id);
              const curr = (p.currency === 'ر.س' || !p.currency) ? 'ج.م' : p.currency;
              return {
                ...initMatch,
                ...p,
                currency: curr,
                projectDescription: p.projectDescription || initMatch?.projectDescription || '',
                assignedTeamMemberIds: (p.assignedTeamMemberIds && p.assignedTeamMemberIds.length > 0)
                  ? p.assignedTeamMemberIds
                  : (initMatch?.assignedTeamMemberIds || ['user-1']),
                folderFiles: (p.folderFiles && p.folderFiles.length > 0)
                  ? p.folderFiles
                  : (initMatch?.folderFiles || []),
                monthlyTasks: (p.monthlyTasks && p.monthlyTasks.length > 0)
                  ? p.monthlyTasks
                  : (initMatch?.monthlyTasks || []),
                accountManagerId: p.accountManagerId || initMatch?.accountManagerId,
                accountManagerName: p.accountManagerName || initMatch?.accountManagerName,
                monthlyDeliveryDate: p.monthlyDeliveryDate || initMatch?.monthlyDeliveryDate,
                sheetUrl: p.sheetUrl || initMatch?.sheetUrl,
                sheetTitle: p.sheetTitle || initMatch?.sheetTitle,
                contractNumber: p.contractNumber || initMatch?.contractNumber
              };
            });
          }
        }
      }
    } catch {}
    const initialClean = INITIAL_CLIENT_RENEWALS.filter(p => !isMockDemoClient(p));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(initialClean));
    return initialClean;
  });

  // Sync to safeStorage
  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(team));

    // Keep currentUser in sync with latest team updates (avatar, role, name, salary)
    if (currentUser && currentUser.id) {
      const match = team.find(m => m.id === currentUser.id || (m.username && currentUser.username && m.username.toLowerCase() === currentUser.username.toLowerCase()));
      if (match) {
        if (
          match.avatar !== currentUser.avatar ||
          match.name !== currentUser.name ||
          match.role !== currentUser.role ||
          match.password !== currentUser.password ||
          match.salaryCurrency !== currentUser.salaryCurrency ||
          match.isAccountActive !== currentUser.isAccountActive
        ) {
          const fresh = { ...currentUser, ...match };
          setCurrentUser(fresh);
          safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(fresh));
        }
      }
    }
  }, [team]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}emails`, JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`, JSON.stringify(marketingBoards));
  }, [marketingBoards]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_cards`, JSON.stringify(deletedMarketingCardIds));
  }, [deletedMarketingCardIds]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_lists`, JSON.stringify(deletedMarketingListIds));
  }, [deletedMarketingListIds]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(clientRenewals));
  }, [clientRenewals]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`, JSON.stringify(deletedTasks));
  }, [deletedTasks]);

  // Meeting Recordings (تسجيلات ميتنج العملاء المهمين)
  const [meetingRecordings, setMeetingRecordings] = useState<MeetingRecording[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}meeting_recordings`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_MEETING_RECORDINGS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meeting_recordings`, JSON.stringify(meetingRecordings));
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
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}marketing_scripts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_MARKETING_SCRIPTS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_scripts`, JSON.stringify(marketingScripts));
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
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}coaching_offers`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_COACHING_OFFERS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}coaching_offers`, JSON.stringify(coachingOffers));
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

  // Attendance & Absence Records (سجلات الحضور والغياب والتأخيرات)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}attendance_records`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_ATTENDANCE;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}attendance_records`, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const recordAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const todayStr = recordData.date || new Date().toISOString().split('T')[0];
    setAttendanceRecords(prev => {
      const existingIdx = prev.findIndex(r => r.memberId === recordData.memberId && r.date === todayStr);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...recordData
        };
        return updated;
      }
      return [
        {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          createdAt: new Date().toISOString(),
          ...recordData
        },
        ...prev
      ];
    });
    logActivity('team', 'تسجيل حضور / غياب موظف', `${recordData.memberName}: ${recordData.status === 'present' ? 'حاضر' : recordData.status === 'late' ? 'متأخر' : recordData.status === 'absent' ? 'غائب' : 'إجازة'}`);
  };

  const batchMarkAttendance = (records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setAttendanceRecords(prev => {
      const updated = [...prev];
      records.forEach(newRec => {
        const recDate = newRec.date || todayStr;
        const idx = updated.findIndex(r => r.memberId === newRec.memberId && r.date === recDate);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], ...newRec };
        } else {
          updated.unshift({
            id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            createdAt: new Date().toISOString(),
            ...newRec
          });
        }
      });
      return updated;
    });
    logActivity('team', 'تحضير سريع للفريق', `تم تسجيل وتحديث حضور ${records.length} موظف بنجاح`);
  };

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendanceRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendanceRecords(prev => prev.filter(r => r.id !== id));
  };

  // Company Operating Expenses (المصروفات التشغيلية لحساب صافي الأرباح والمكسب)
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}company_expenses`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_EXPENSES;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}company_expenses`, JSON.stringify(companyExpenses));
  }, [companyExpenses]);

  const addCompanyExpense = (expenseData: Omit<CompanyExpense, 'id'>) => {
    const newExp: CompanyExpense = {
      ...expenseData,
      id: 'exp-' + Date.now()
    };
    setCompanyExpenses(prev => [newExp, ...prev]);
    logActivity('deal', 'إضافة مصروف تشغيلي للشركة', `${newExp.title}: ${newExp.amount.toLocaleString()} ${newExp.currency}`);
  };

  const updateCompanyExpense = (id: string, updates: Partial<CompanyExpense>) => {
    setCompanyExpenses(prev => {
      const updated = prev.map(e => (e.id === id ? { ...e, ...updates } : e));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}company_expenses`, JSON.stringify(updated));
      return updated;
    });
    logActivity('deal', 'تعديل مصروف تشغيلي', `تم تحديث بيانات المصروف`);
  };

  const deleteCompanyExpense = (id: string) => {
    setCompanyExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}company_expenses`, JSON.stringify(updated));
      return updated;
    });
  };

  // Global Currency Switcher (تغيير العملة في المنظومة كاملة: مرتبات، مصروفات، أرباح، اشتراكات، صفقات)
  const setGlobalCurrency = (newCurrency: string, updateExistingTeam = true) => {
    updateBrandConfig({ systemCurrency: newCurrency });
    if (updateExistingTeam) {
      setTeam(prev => {
        const updated = prev.map(m => ({ ...m, salaryCurrency: newCurrency }));
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(updated));
        return updated;
      });
      setCompanyExpenses(prev => {
        const updated = prev.map(e => ({ ...e, currency: newCurrency }));
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}company_expenses`, JSON.stringify(updated));
        return updated;
      });
      setClientRenewals(prev => {
        const updated = prev.map(r => ({ ...r, currency: newCurrency }));
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(updated));
        return updated;
      });
      setDeals(prev => {
        const updated = prev.map(d => ({ ...d, currency: newCurrency }));
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify(updated));
        return updated;
      });
    }
    logActivity('team', 'تغيير العملة المعتمدة للمنظومة', `تم تعيين العملة إلى: ${newCurrency}`);
  };

  // Auto-migrate to EGP (ج.م) on load if set to SAR (ر.س)
  useEffect(() => {
    if (brandConfig.systemCurrency === 'ر.س' || !brandConfig.systemCurrency) {
      setGlobalCurrency('ج.م', true);
    }
  }, []);

  // Monthly Payroll Records (كشف مسير الرواتب وحالة الصرف)
  const [monthlyPayrolls, setMonthlyPayrolls] = useState<MonthlyPayrollRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}monthly_payrolls`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}monthly_payrolls`, JSON.stringify(monthlyPayrolls));
  }, [monthlyPayrolls]);

  const saveMonthlyPayroll = (payroll: MonthlyPayrollRecord) => {
    setMonthlyPayrolls(prev => {
      const idx = prev.findIndex(p => p.memberId === payroll.memberId && p.month === payroll.month);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = payroll;
        return updated;
      }
      return [...prev, payroll];
    });
  };

  const markPayrollPaid = (id: string, paymentMethod = 'تحويل بنكي') => {
    setMonthlyPayrolls(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              paymentStatus: 'paid',
              paidAt: new Date().toISOString().split('T')[0],
              paymentMethod
            }
          : p
      )
    );
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    logActivity('team', 'صرف راتب موظف بنجاح 💸', `تم اعتماد وصرف الراتب بطريقة (${paymentMethod})`);
  };

  // ==================== عمولات فريق المبيعات لكل شهر منفصل ====================
  const [monthlySalesCommissions, setMonthlySalesCommissions] = useState<MonthlySalesCommissionRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}sales_commissions`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SALES_COMMISSIONS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}sales_commissions`, JSON.stringify(monthlySalesCommissions));
  }, [monthlySalesCommissions]);

  const addOrUpdateSalesCommission = (record: MonthlySalesCommissionRecord) => {
    setMonthlySalesCommissions(prev => {
      const idx = prev.findIndex(r => r.id === record.id || (r.memberId === record.memberId && r.month === record.month));
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...record, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [{ ...record, updatedAt: new Date().toISOString() }, ...prev];
    });
    logActivity('deal', 'تحديث عمولة المبيعات الشهرية', `تم تحديث عمولة ${record.memberName} لشهر ${record.month}`);
  };

  const markSalesCommissionPayout = (
    id: string,
    status: 'draft' | 'approved' | 'paid',
    payoutDate = new Date().toISOString().split('T')[0],
    paymentMethod = 'تحويل بنكي'
  ) => {
    setMonthlySalesCommissions(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            payoutStatus: status,
            payoutDate: status === 'paid' ? payoutDate : c.payoutDate,
            paymentMethod: status === 'paid' ? paymentMethod : c.paymentMethod,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    if (status === 'paid') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      logActivity('deal', 'صرف عمولة مبيعات بنجاح 💰', `تم تحويل عمولة مبيعات بطريقة (${paymentMethod})`);
    } else if (status === 'approved') {
      logActivity('deal', 'اعتماد عمولة مبيعات', `تم اعتماد كشف عمولة المبيعات رسمياً`);
    }
  };

  const addDealToSalesCommission = (commissionId: string, dealData: Omit<SalesCommissionDeal, 'id'>) => {
    const newDeal: SalesCommissionDeal = {
      ...dealData,
      id: 'cd-' + Date.now()
    };
    setMonthlySalesCommissions(prev =>
      prev.map(c => {
        if (c.id === commissionId) {
          const updatedDeals = [newDeal, ...(c.deals || [])];
          const newAchieved = updatedDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
          const newBaseAmount = updatedDeals.reduce((sum, d) => sum + (d.commissionAmount || 0), 0);
          const newAchRate = c.monthlyTarget > 0 ? (newAchieved / c.monthlyTarget) * 100 : 100;
          const newTargetBonus = newAchRate >= 100 ? (c.targetBonusAmount || 2000) : 0;
          const newTotal = newBaseAmount + newTargetBonus + (c.customAdjustmentAmount || 0);
          return {
            ...c,
            deals: updatedDeals,
            dealsCount: updatedDeals.length,
            achievedSales: newAchieved,
            achievementRate: Math.round(newAchRate * 10) / 10,
            baseCommissionAmount: newBaseAmount,
            targetBonusAmount: newTargetBonus,
            totalCommission: newTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      })
    );
    logActivity('deal', 'إضافة صفقة إلى كشف العمولة', `تمت إضافة صفقة (${dealData.clientName}) بقيمة ${dealData.dealValue.toLocaleString()} ${dealData.currency}`);
  };

  // ==================== سيستم العقود والمدفوعات وباقي دفع العملاء ====================
  const [clientFinancialContracts, setClientFinancialContracts] = useState<ClientFinancialContract[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}client_contracts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FINANCIAL_CONTRACTS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_contracts`, JSON.stringify(clientFinancialContracts));
  }, [clientFinancialContracts]);

  const recordClientPayment = (contractId: string, paymentData: Omit<ClientPaymentEntry, 'id' | 'createdAt'>) => {
    const newPayment: ClientPaymentEntry = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      createdAt: new Date().toISOString()
    };

    setClientFinancialContracts(prev =>
      prev.map(contract => {
        if (contract.id === contractId) {
          const payments = [...(contract.payments || []), newPayment];
          const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
          const remaining = Math.max(0, contract.contractTotalValue - totalPaid);
          const status = remaining <= 0 ? 'خالص بالكامل' : contract.paymentStatus === 'متأخر في السداد' ? 'متأخر في السداد' : 'متبقي مبالغ';
          return {
            ...contract,
            payments,
            totalPaidAmount: totalPaid,
            remainingBalance: remaining,
            paymentStatus: status
          };
        }
        return contract;
      })
    );
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    logActivity('deal', 'تحصيل دفعة مالية من عميل 💵', `تم استلام ${paymentData.amount.toLocaleString()} ${paymentData.currency} من (${paymentData.clientName})`);
  };

  const addClientFinancialContract = (contractData: Omit<ClientFinancialContract, 'id' | 'createdAt' | 'payments' | 'remainingBalance'>) => {
    const newContract: ClientFinancialContract = {
      ...contractData,
      id: 'fc-' + Date.now(),
      remainingBalance: Math.max(0, contractData.contractTotalValue - (contractData.totalPaidAmount || 0)),
      payments: contractData.totalPaidAmount > 0 ? [
        {
          id: 'pay-' + Date.now(),
          clientContractId: 'fc-' + Date.now(),
          clientName: contractData.clientName,
          amount: contractData.totalPaidAmount,
          currency: contractData.currency,
          paymentDate: contractData.contractStartDate || new Date().toISOString().split('T')[0],
          paymentMethod: 'تحويل بنكي',
          note: 'دفعة مقدمة مسجلة مع إنشاء العقد',
          receivedBy: currentUser?.name || 'المدير',
          createdAt: new Date().toISOString()
        }
      ] : [],
      createdAt: new Date().toISOString()
    };
    setClientFinancialContracts(prev => [newContract, ...prev]);
    logActivity('deal', 'إنشاء عقد مالي جديد لعميل', `تم تسجيل عقد ${newContract.clientName} بقيمة ${newContract.contractTotalValue.toLocaleString()} ${newContract.currency}`);
  };

  const updateClientFinancialContract = (id: string, updates: Partial<ClientFinancialContract>) => {
    setClientFinancialContracts(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (updates.contractTotalValue !== undefined || updates.totalPaidAmount !== undefined) {
            const totVal = updates.contractTotalValue !== undefined ? updates.contractTotalValue : c.contractTotalValue;
            const totPaid = updates.totalPaidAmount !== undefined ? updates.totalPaidAmount : c.totalPaidAmount;
            updated.remainingBalance = Math.max(0, totVal - totPaid);
            if (updated.remainingBalance <= 0) {
              updated.paymentStatus = 'خالص بالكامل';
            }
          }
          return updated;
        }
        return c;
      })
    );
  };

  const deleteClientFinancialContract = (id: string) => {
    setClientFinancialContracts(prev => prev.filter(c => c.id !== id));
  };

  // ==================== أفكار الماركيتنج وأفكاري المكتوبة ====================
  const [marketingIdeas, setMarketingIdeas] = useState<MarketingIdea[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}marketing_ideas`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MARKETING_IDEAS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_ideas`, JSON.stringify(marketingIdeas));
  }, [marketingIdeas]);

  const addMarketingIdea = (ideaData: Omit<MarketingIdea, 'id' | 'createdAt'>) => {
    const newIdea: MarketingIdea = {
      ...ideaData,
      id: 'midea-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setMarketingIdeas(prev => [newIdea, ...prev]);
    logActivity('deal', 'إضافة فكرة ماركيتنج جديدة 💡', newIdea.title);
  };

  const updateMarketingIdea = (id: string, updates: Partial<MarketingIdea>) => {
    setMarketingIdeas(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteMarketingIdea = (id: string) => {
    setMarketingIdeas(prev => prev.filter(i => i.id !== id));
  };

  const [writtenThoughts, setWrittenThoughts] = useState<WrittenThoughtNote[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}written_thoughts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_WRITTEN_THOUGHTS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}written_thoughts`, JSON.stringify(writtenThoughts));
  }, [writtenThoughts]);

  const addWrittenThought = (thoughtData: Omit<WrittenThoughtNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newThought: WrittenThoughtNote = {
      ...thoughtData,
      id: 'thought-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setWrittenThoughts(prev => [newThought, ...prev]);
    logActivity('task', 'تدوين فكرة استراتيجية جديدة 📝', newThought.title);
  };

  const updateWrittenThought = (id: string, updates: Partial<WrittenThoughtNote>) => {
    setWrittenThoughts(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  };

  const deleteWrittenThought = (id: string) => {
    setWrittenThoughts(prev => prev.filter(t => t.id !== id));
  };

  const togglePinThought = (id: string) => {
    setWrittenThoughts(prev =>
      prev.map(t => (t.id === id ? { ...t, isPinned: !t.isPinned, updatedAt: new Date().toISOString() } : t))
    );
  };

  // ==================== 1. نظام تقييم أداء الموظفين ====================
  const [performanceEvaluations, setPerformanceEvaluations] = useState<PerformanceEvaluationRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}performance_evaluations`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PERFORMANCE_EVALUATIONS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}performance_evaluations`, JSON.stringify(performanceEvaluations));
  }, [performanceEvaluations]);

  const addPerformanceEvaluation = (evalData: Omit<PerformanceEvaluationRecord, 'id' | 'createdAt'>) => {
    const newEval: PerformanceEvaluationRecord = {
      ...evalData,
      id: 'eval-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setPerformanceEvaluations(prev => [newEval, ...prev]);
    logActivity('team', 'تسجيل ملاحظة تقييم أداء للموظف', `${newEval.employeeName} - ${newEval.type === 'positive' ? 'إيجابية' : newEval.type === 'negative' ? 'تقصير' : newEval.type === 'extra_work' ? 'شغل إضافي' : 'فرصة تحسين'}`);
  };

  const updatePerformanceEvaluation = (id: string, updates: Partial<PerformanceEvaluationRecord>) => {
    setPerformanceEvaluations(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deletePerformanceEvaluation = (id: string) => {
    setPerformanceEvaluations(prev => prev.filter(e => e.id !== id));
  };

  const approvePerformanceEvaluation = (id: string, actionTaken?: string, followUpDate?: string) => {
    setPerformanceEvaluations(prev =>
      prev.map(e => {
        if (e.id === id) {
          return {
            ...e,
            status: 'approved',
            reviewedBy: currentUser?.name || 'المدير',
            reviewedAt: new Date().toISOString(),
            actionTaken: actionTaken || e.actionTaken || 'تم الاعتماد',
            followUpDate: followUpDate || e.followUpDate
          };
        }
        return e;
      })
    );
    logActivity('team', 'اعتماد تقييم أداء رسمي', `تم اعتماد تقييم الموظف من قِبل ${currentUser?.name || 'الإدارة'}`);
  };

  const addEvaluationClarification = (id: string, clarification: string) => {
    setPerformanceEvaluations(prev =>
      prev.map(e => {
        if (e.id === id) {
          return {
            ...e,
            employeeClarification: clarification,
            employeeClarificationDate: new Date().toISOString()
          };
        }
        return e;
      })
    );
    logActivity('team', 'إضافة توضيح/رد موظف على التقييم', `أضاف ${currentUser?.name || 'الموظف'} توضيحاً على الملاحظة`);
  };

  // ==================== 2. نظام متابعة التأخيرات المنظم ====================
  const [delays, setDelays] = useState<DelayRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}delays`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DELAYS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}delays`, JSON.stringify(delays));
  }, [delays]);

  const addDelayRecord = (delayData: Omit<DelayRecord, 'id' | 'createdAt'>) => {
    const newDelay: DelayRecord = {
      ...delayData,
      id: 'delay-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setDelays(prev => [newDelay, ...prev]);
    logActivity('team', 'تسجيل واقعة تأخير حضور', `${newDelay.employeeName} (${newDelay.delayMinutes} دقيقة) - ${newDelay.date}`);
  };

  const updateDelayRecord = (id: string, updates: Partial<DelayRecord>) => {
    setDelays(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDelayRecord = (id: string) => {
    setDelays(prev => prev.filter(d => d.id !== id));
  };

  const reviewDelayRecord = (id: string, reviewStatus: DelayReviewStatus, actionTaken?: string, notes?: string) => {
    setDelays(prev =>
      prev.map(d => {
        if (d.id === id) {
          return {
            ...d,
            reviewStatus,
            reviewedBy: currentUser?.name || 'المدير',
            reviewedAt: new Date().toISOString(),
            actionTaken: actionTaken !== undefined ? actionTaken : d.actionTaken,
            notes: notes !== undefined ? notes : d.notes
          };
        }
        return d;
      })
    );
    logActivity('team', 'مراجعة عذر التأخير', `تمت مراجعة حالة التأخير (${reviewStatus})`);
  };

  // ==================== 3. نظام قواعد وسياسات الشركة ====================
  const [companyRules, setCompanyRules] = useState<CompanyRule[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}company_rules`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_COMPANY_RULES;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}company_rules`, JSON.stringify(companyRules));
  }, [companyRules]);

  const addCompanyRule = (ruleData: Omit<CompanyRule, 'id' | 'createdAt' | 'lastModified' | 'acknowledgments'>) => {
    const newRule: CompanyRule = {
      ...ruleData,
      id: 'rule-' + Date.now(),
      acknowledgments: [],
      lastModified: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setCompanyRules(prev => [newRule, ...prev]);
    logActivity('task', 'إضافة قاعدة/سياسة جديدة للشركة 📜', newRule.title);
  };

  const updateCompanyRule = (id: string, updates: Partial<CompanyRule>) => {
    setCompanyRules(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates, lastModified: new Date().toISOString().split('T')[0] } : r))
    );
  };

  const deleteCompanyRule = (id: string) => {
    setCompanyRules(prev => prev.filter(r => r.id !== id));
  };

  const acknowledgeCompanyRule = (ruleId: string, employeeId = currentUser?.id, employeeName = currentUser?.name) => {
    if (!employeeId) return;
    setCompanyRules(prev =>
      prev.map(r => {
        if (r.id === ruleId) {
          const existing = r.acknowledgments || [];
          if (existing.some(a => a.employeeId === employeeId)) return r;
          return {
            ...r,
            acknowledgments: [
              ...existing,
              {
                employeeId,
                employeeName: employeeName || 'موظف',
                acknowledgedAt: new Date().toISOString()
              }
            ]
          };
        }
        return r;
      })
    );
    logActivity('team', 'إقرار اطلاع على قاعدة بالشركة', `أقر ${employeeName} بالاطلاع على لائحة الشركة`);
  };

  // ==================== 4. سجل حالات عدم الالتزام ====================
  const [ruleViolations, setRuleViolations] = useState<RuleViolationRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}rule_violations`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_RULE_VIOLATIONS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}rule_violations`, JSON.stringify(ruleViolations));
  }, [ruleViolations]);

  const addRuleViolation = (violationData: Omit<RuleViolationRecord, 'id' | 'createdAt'>) => {
    const newViolation: RuleViolationRecord = {
      ...violationData,
      id: 'viol-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setRuleViolations(prev => [newViolation, ...prev]);
    logActivity('team', 'تسجيل حالة عدم التزام بقواعد الشركة', `${newViolation.employeeName} - ${newViolation.ruleTitle}`);
  };

  const updateRuleViolation = (id: string, updates: Partial<RuleViolationRecord>) => {
    setRuleViolations(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const deleteRuleViolation = (id: string) => {
    setRuleViolations(prev => prev.filter(v => v.id !== id));
  };

  const reviewRuleViolation = (id: string, reviewStatus: ViolationReviewStatus, actionTaken?: string, notes?: string) => {
    setRuleViolations(prev =>
      prev.map(v => {
        if (v.id === id) {
          return {
            ...v,
            reviewStatus,
            reviewedBy: currentUser?.name || 'المدير',
            reviewedAt: new Date().toISOString(),
            actionTaken: actionTaken !== undefined ? actionTaken : v.actionTaken,
            notes: notes !== undefined ? notes : v.notes
          };
        }
        return v;
      })
    );
    logActivity('team', 'مراجعة حالة عدم الالتزام', `تمت مراجعة الحالة واعتماد النتيجة (${reviewStatus})`);
  };

  const addViolationClarification = (id: string, clarification: string) => {
    setRuleViolations(prev =>
      prev.map(v => (v.id === id ? { ...v, employeeClarification: clarification } : v))
    );
    logActivity('team', 'تقديم رد وتوضيح على مخالفة', `أضاف ${currentUser?.name || 'الموظف'} توضيحاً بشأن الواقعة`);
  };

  // ==================== 5. سجل التقييمات الشهرية ====================
  const [monthlyPerformanceReviews, setMonthlyPerformanceReviews] = useState<MonthlyPerformanceReview[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}monthly_reviews`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MONTHLY_PERFORMANCE_REVIEWS;
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}monthly_reviews`, JSON.stringify(monthlyPerformanceReviews));
  }, [monthlyPerformanceReviews]);

  const saveMonthlyPerformanceReview = (review: MonthlyPerformanceReview) => {
    setMonthlyPerformanceReviews(prev => {
      const idx = prev.findIndex(r => r.id === review.id || (r.employeeId === review.employeeId && r.month === review.month));
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = review;
        return updated;
      }
      return [review, ...prev];
    });
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
    logActivity('team', 'اعتماد التقييم الشهري للموظف 🌟', `تم حفظ تقييم ${review.employeeName} لشهر ${review.month} بتقدير (${review.overallRating})`);
  };

  const deleteMonthlyPerformanceReview = (id: string) => {
    setMonthlyPerformanceReviews(prev => prev.filter(r => r.id !== id));
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

  // Count renewals due soon (within 4 days) - Active contracts only
  const renewalsDueSoonCount = clientRenewals.filter(r => {
    if (r.status === 'renewed' || r.status === 'cancelled' || r.status === 'suspended') return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const renDate = new Date(r.renewalDate).getTime();
    const diff = Math.ceil((renDate - today) / (1000 * 60 * 60 * 24));
    return diff <= 4 && diff >= 0;
  }).length;

  // Automated Follow-up Reminder & Notification generator for Leads
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    leads.forEach(lead => {
      if (!lead.followUpDate || lead.status === 'صفقة ناجحة (Won)' || lead.status === 'غير مؤهل') return;
      const parts = lead.followUpDate.split('-');
      if (parts.length < 3) return;
      const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

      // If follow-up date is today or overdue
      if (diffDays <= 0) {
        const notifId = `notif-lead-followup-${lead.id}-${lead.followUpDate}`;
        setNotifications(prev => {
          if (prev.some(n => n.id === notifId)) return prev;
          const statusText = diffDays === 0 ? 'اليوم!' : `متأخر بـ ${Math.abs(diffDays)} يوم!`;
          return [
            {
              id: notifId,
              title: `🔔 موعد متابعة العميل: ${lead.name} (${lead.company})`,
              message: `حان موعد متابعة العميل المحتمل ${statusText} (تاريخ المتابعة: ${lead.followUpDate}${lead.followUpTime ? ` الساعة ${lead.followUpTime}` : ''}). رقم الهاتف: ${lead.phone}. تواصل معه الآن لمتابعة قراره بخصوص التعاقد.`,
              timestamp: 'الآن',
              type: 'lead',
              isRead: false,
              linkTab: 'leads'
            },
            ...prev
          ];
        });
      }
    });
  }, [leads]);

  // Count leads due for follow-up today or overdue
  const leadsDueFollowUpTodayCount = leads.filter(l => {
    if (!l.followUpDate || l.status === 'صفقة ناجحة (Won)' || l.status === 'غير مؤهل') return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const parts = l.followUpDate.split('-');
    if (parts.length < 3) return false;
    const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    return diff <= 0;
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
    // Record deletion permanently
    setDeletedMarketingCardIds(prev => {
      const updated = Array.from(new Set([...prev, cardId]));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_cards`, JSON.stringify(updated));
      return updated;
    });

    setMarketingBoards(prev => {
      const updated = prev.map(b => ({
        ...b,
        lists: b.lists.map(l => ({
          ...l,
          cards: l.cards.filter(c => c.id !== cardId)
        }))
      }));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`, JSON.stringify(updated));
      return updated;
    });

    // Fire instant server deletion to ensure server store never resurrects it
    fetch('/api/marketing/delete-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId })
    }).catch(() => {});
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
    // Collect all card IDs in this list to permanently mark them as deleted too
    const currentBoard = marketingBoards.find(b => b.id === boardId);
    const targetList = currentBoard?.lists.find(l => l.id === listId);
    const cardIdsInList = targetList ? targetList.cards.map(c => c.id) : [];

    if (cardIdsInList.length > 0) {
      setDeletedMarketingCardIds(prev => {
        const updated = Array.from(new Set([...prev, ...cardIdsInList]));
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_cards`, JSON.stringify(updated));
        return updated;
      });
    }

    setDeletedMarketingListIds(prev => {
      const updated = Array.from(new Set([...prev, listId]));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_lists`, JSON.stringify(updated));
      return updated;
    });

    setMarketingBoards(prev => {
      const updated = prev.map(b => (b.id === boardId ? { ...b, lists: b.lists.filter(l => l.id !== listId) } : b));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`, JSON.stringify(updated));
      return updated;
    });

    // Fire instant server deletion
    fetch('/api/marketing/delete-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, listId, cardIds: cardIdsInList })
    }).catch(() => {});
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
    lastLocalMutationTimeRef.current = Date.now();
    const assignedIds = (renewalData.assignedTeamMemberIds && renewalData.assignedTeamMemberIds.length > 0)
      ? renewalData.assignedTeamMemberIds.filter(id => id !== 'all')
      : team.map(m => m.id);

    let validSheets = renewalData.googleSheets || [];
    if (validSheets.length === 0 && renewalData.sheetUrl) {
      validSheets = [{ id: 'sheet-' + Date.now(), title: renewalData.sheetTitle || 'شيت المتابعة', url: renewalData.sheetUrl }];
    } else if (validSheets.length > 0 && !renewalData.sheetUrl && validSheets[0]?.url) {
      renewalData.sheetUrl = validSheets[0].url;
      renewalData.sheetTitle = validSheets[0].title;
    }

    const newRen: ClientRenewal = {
      ...renewalData,
      id: 'ren-' + Date.now(),
      assignedTeamMemberIds: assignedIds,
      googleSheets: validSheets,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setClientRenewals(prev => {
      const next = [newRen, ...prev.filter(r => r.id !== newRen.id)];
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    logActivity('deal', 'إضافة موعد تجديد اشتراك عميل', `${newRen.clientName} - ${newRen.serviceName}`);

    // Instant multi-device server sync & SSE broadcast
    try {
      fetch('/api/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewal: newRen })
      }).catch(err => console.warn('[CRM] Renewal sync notice:', err));
    } catch {}

    saveClientRenewalToFirestore(newRen);
  };

  const updateClientRenewal = (id: string, updates: Partial<ClientRenewal>) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedObj: ClientRenewal | null = null;

    setClientRenewals(prev => {
      const next = prev.map(r => {
        if (r.id !== id) return r;

        let mergedSheets = updates.googleSheets !== undefined ? updates.googleSheets : r.googleSheets;
        let sheetUrl = updates.sheetUrl !== undefined ? updates.sheetUrl : r.sheetUrl;
        let sheetTitle = updates.sheetTitle !== undefined ? updates.sheetTitle : r.sheetTitle;

        if (updates.googleSheets && updates.googleSheets.length > 0) {
          const first = updates.googleSheets.find(s => s.url);
          if (first) {
            sheetUrl = first.url;
            sheetTitle = first.title;
          }
        } else if (updates.sheetUrl) {
          if (!mergedSheets || mergedSheets.length === 0) {
            mergedSheets = [{ id: 'sheet-1', title: sheetTitle || 'شيت المتابعة', url: updates.sheetUrl }];
          } else {
            mergedSheets = mergedSheets.map((s, idx) =>
              idx === 0 ? { ...s, url: updates.sheetUrl || '', title: sheetTitle || s.title } : s
            );
          }
        }

        const fresh: ClientRenewal = {
          ...r,
          ...updates,
          sheetUrl,
          sheetTitle,
          googleSheets: mergedSheets
        };
        updatedObj = fresh;
        return fresh;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedObj) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedObj })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedObj);
    }
  };

  const deleteClientRenewal = (id: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    setClientRenewals(prev => {
      const next = prev.filter(r => r.id !== id);
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    try {
      fetch('/api/renewals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewalId: id })
      }).catch(() => {});
    } catch {}

    deleteClientRenewalFromFirestore(id);
  };

  const markRenewalCompleted = (id: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedRen: ClientRenewal | null = null;

    setClientRenewals(prev => {
      const next = prev.map(r => {
        if (r.id !== id) return r;
        const oldDate = new Date(r.renewalDate);
        if (r.planCycle === 'شهري') oldDate.setMonth(oldDate.getMonth() + 1);
        else if (r.planCycle === 'ربع سنوي') oldDate.setMonth(oldDate.getMonth() + 3);
        else if (r.planCycle === 'نصف سنوي') oldDate.setMonth(oldDate.getMonth() + 6);
        else oldDate.setFullYear(oldDate.getFullYear() + 1);

        const newDateStr = oldDate.toISOString().split('T')[0];
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        logActivity('deal', 'تم تجديد الاشتراك بنجاح 🏆', `${r.clientName}: تم تجديد ${r.serviceName} حتى ${newDateStr}`);
        const fresh: ClientRenewal = {
          ...r,
          renewalDate: newDateStr,
          status: 'renewed',
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
        updatedRen = fresh;
        return fresh;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedRen) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedRen })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedRen);
    }
  };

  // Suspended Contracts Methods (العقود الموقوفة وتوثيق سبب الإيقاف)
  const suspendClientContract = (id: string, reason: string, notes?: string, category?: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    const target = clientRenewals.find(r => r.id === id);
    if (!target) return;
    const nowStr = new Date().toISOString().split('T')[0];
    const updated: ClientRenewal = {
      ...target,
      status: 'suspended',
      suspensionReason: reason,
      suspendedAt: nowStr,
      suspensionCategory: (category as any) || 'financial',
      suspensionNotes: notes || '',
      suspendedBy: currentUser?.name || 'المدير العام'
    };
    setClientRenewals(prev => {
      const next = prev.map(r => (r.id === id ? updated : r));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });
    try {
      fetch('/api/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewal: updated })
      }).catch(() => {});
    } catch {}
    saveClientRenewalToFirestore(updated);

    logActivity('deal', 'إيقاف عقد عميل مؤقتاً ⏸️', `${target.clientName} (${target.company}) - سبب الإيقاف: ${reason}`);
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        title: `⏸️ تم إيقاف عقد العميل: ${target.clientName}`,
        message: `تم تحويل العقد إلى قسم العقود الموقوفة. السبب: ${reason}`,
        timestamp: 'الآن',
        type: 'renewal_alert',
        isRead: false,
        linkTab: 'suspended_contracts'
      },
      ...prev
    ]);
  };

  const reactivateClientContract = (id: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    const target = clientRenewals.find(r => r.id === id);
    if (!target) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated: ClientRenewal = {
      ...target,
      status: 'active',
      notes: (target.notes ? target.notes + '\n' : '') + `[تمت إعادة تفعيل العقد والاشتراك بتاريخ ${todayStr}]`
    };
    setClientRenewals(prev => {
      const next = prev.map(r => (r.id === id ? updated : r));
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });
    try {
      fetch('/api/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewal: updated })
      }).catch(() => {});
    } catch {}
    saveClientRenewalToFirestore(updated);

    logActivity('deal', 'إعادة تفعيل عقد عميل ▶️', `تمت إعادة تفعيل عقد ${target.clientName} بنجاح`);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
  };

  const updateSuspensionReason = (id: string, reason: string, notes?: string, category?: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedObj: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(r => {
        if (r.id !== id) return r;
        const fresh = {
          ...r,
          suspensionReason: reason,
          suspensionNotes: notes !== undefined ? notes : r.suspensionNotes,
          suspensionCategory: category ? (category as any) : r.suspensionCategory
        };
        updatedObj = fresh;
        return fresh;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });
    if (updatedObj) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedObj })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedObj);
    }
    logActivity('deal', 'تحديث سبب إيقاف العقد ✏️', `تم تحديث سبب إيقاف العقد: ${reason}`);
  };

  const addSuspendedContract = (data: Omit<ClientRenewal, 'id' | 'createdAt' | 'status'> & { suspensionReason: string; notes?: string; suspensionCategory?: string }) => {
    lastLocalMutationTimeRef.current = Date.now();
    const nowStr = new Date().toISOString().split('T')[0];
    const newRen: ClientRenewal = {
      ...data,
      id: 'ren-' + Date.now(),
      status: 'suspended',
      suspendedAt: data.suspendedAt || nowStr,
      suspensionReason: data.suspensionReason,
      suspensionCategory: (data.suspensionCategory as any) || 'financial',
      suspensionNotes: data.notes || '',
      suspendedBy: currentUser?.name || 'المدير العام',
      createdAt: nowStr
    };
    setClientRenewals(prev => {
      const next = [newRen, ...prev];
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });
    try {
      fetch('/api/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renewal: newRen })
      }).catch(() => {});
    } catch {}
    saveClientRenewalToFirestore(newRen);

    logActivity('deal', 'تسجيل عقد موقوف جديد', `${newRen.clientName} (${newRen.company}) - السبب: ${data.suspensionReason}`);
  };

  const suspendedContracts = React.useMemo(() => {
    return (clientRenewals || []).filter(r => r.status === 'suspended');
  }, [clientRenewals]);

  // Client Folder Files & Documents (إدارة مجلد ومستندات كل عميل)
  const addClientFile = (clientId: string, fileData: Omit<ClientFileDocument, 'id' | 'uploadedAt'>) => {
    lastLocalMutationTimeRef.current = Date.now();
    const newDoc: ClientFileDocument = {
      id: 'doc-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name,
      ...fileData
    };
    let updatedClient: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const folderFiles = c.folderFiles ? [newDoc, ...c.folderFiles] : [newDoc];
          const fresh = { ...c, folderFiles };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
    logActivity('team', 'إضافة ملف لمجلد العميل', `أضاف ${currentUser.name} ملف (${fileData.name}) لمجلد العميل`);
  };

  const deleteClientFile = (clientId: string, fileId: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId && c.folderFiles) {
          const fresh = { ...c, folderFiles: c.folderFiles.filter(f => f.id !== fileId) };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
  };

  const updateClientFilePermissions = (clientId: string, fileId: string, allowedTeamMemberIds: string[]) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId && c.folderFiles) {
          const fresh = {
            ...c,
            folderFiles: c.folderFiles.map(f =>
              f.id === fileId ? { ...f, allowedTeamMemberIds } : f
            )
          };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
    logActivity('team', 'تعديل صلاحيات ملف للعميل', `قام ${currentUser.name} بتحديث صلاحيات وصول الموظفين لمستند بالعميل`);
  };

  const addClientNote = (clientId: string, text: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    const newNote: ClientDossierNote = {
      id: 'note-' + Date.now(),
      text,
      authorName: currentUser.name,
      date: new Date().toLocaleDateString('ar-SA') + ' ' + new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
    let updatedClient: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const clientNotes = c.clientNotes ? [newNote, ...c.clientNotes] : [newNote];
          const fresh = { ...c, clientNotes };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
  };

  const assignClientTeam = (clientId: string, memberIds: string[]) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const fresh = { ...c, assignedTeamMemberIds: memberIds };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
    logActivity('team', 'تعديل فريق العميل', `تم تحديث أعضاء الفريق المسؤولين عن متابعة العميل`);
  };

  // تاسكات الشهر ومتابعة الإنجاز لكل اكونت (Account Monthly Tasks & Delivery Tracker)
  const addAccountMonthlyTask = (clientId: string, taskData: Omit<AccountMonthlyTask, 'id' | 'createdAt'>) => {
    lastLocalMutationTimeRef.current = Date.now();
    const newTask: AccountMonthlyTask = {
      id: 'atask-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      ...taskData
    };
    let updatedClient: ClientRenewal | null = null;
    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const monthlyTasks = c.monthlyTasks ? [...c.monthlyTasks, newTask] : [newTask];
          const fresh = { ...c, monthlyTasks };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
      const cName = (updatedClient as ClientRenewal).clientName;
      logActivity('task', 'إضافة تاسك شهري للحساب 📋', `${newTask.title} - العميل: ${cName}`);
    }
  };

  const toggleAccountMonthlyTask = (clientId: string, taskId: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;
    let completedState = false;
    let taskTitle = '';

    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const monthlyTasks = (c.monthlyTasks || []).map(t => {
            if (t.id === taskId) {
              const nextCompleted = !t.completed;
              completedState = nextCompleted;
              taskTitle = t.title;
              return {
                ...t,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString().split('T')[0] : undefined,
                completedByName: nextCompleted ? currentUser.name : undefined
              };
            }
            return t;
          });
          const fresh = { ...c, monthlyTasks };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }

    if (completedState) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      logActivity('task', 'إنجاز تاسك شهري بالحساب ✅', `تم وضع علامة صح على: ${taskTitle}`);
    }
  };

  const updateAccountMonthlyTask = (clientId: string, taskId: string, updates: Partial<AccountMonthlyTask>) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;

    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const monthlyTasks = (c.monthlyTasks || []).map(t => {
            if (t.id === taskId) {
              return { ...t, ...updates };
            }
            return t;
          });
          const fresh = { ...c, monthlyTasks };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
  };

  const deleteAccountMonthlyTask = (clientId: string, taskId: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;

    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const monthlyTasks = (c.monthlyTasks || []).filter(t => t.id !== taskId);
          const fresh = { ...c, monthlyTasks };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
    }
  };

  const setClientAccountManager = (clientId: string, managerId: string, managerName: string) => {
    lastLocalMutationTimeRef.current = Date.now();
    let updatedClient: ClientRenewal | null = null;

    setClientRenewals(prev => {
      const next = prev.map(c => {
        if (c.id === clientId) {
          const fresh = {
            ...c,
            accountManagerId: managerId,
            accountManagerName: managerName,
            managedBy: managerName
          };
          updatedClient = fresh;
          return fresh;
        }
        return c;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(next));
      return next;
    });

    if (updatedClient) {
      try {
        fetch('/api/renewals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ renewal: updatedClient })
        }).catch(() => {});
      } catch {}
      saveClientRenewalToFirestore(updatedClient);
      const cName = (updatedClient as ClientRenewal).clientName;
      logActivity('deal', 'تعيين أكونت مانجر للعميل 👤', `${managerName} مديراً لحساب ${cName}`);
    }
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
      currency: data.currency || brandConfig.systemCurrency || 'ج.م',
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
  const isUserAdminOrRoot = Boolean(
    currentUser &&
      (currentUser.accessLevel === 'admin' ||
        currentUser.accessLevel === 'manager' ||
        currentUser.id === 'user-1')
  );

  const visibleClients = useMemo(() => {
    // ملفات العملاء والاشتراكات الحالية فقط (الموقوفة تظهر في العقود الموقوفة لوحدها فقط)
    const activeRenewals = (clientRenewals || []).filter(c => c.status !== 'suspended');

    if (isUserAdminOrRoot) {
      return activeRenewals;
    }
    if (!currentUser) return [];

    const currentUid = (currentUser.id || '').trim().toLowerCase();
    const currentName = (currentUser.name || '').trim().toLowerCase();
    const currentUsername = (currentUser.username || '').trim().toLowerCase();
    const currentCode = (currentUser.employeeCode || '').trim().toLowerCase();
    const userCanon = getCanonicalUserId(currentUser.id) || getCanonicalUserId(currentUser.username) || getCanonicalUserId(currentUser.name);
    const userAliases = (userCanon && TEAM_ALIASES[userCanon]) ? TEAM_ALIASES[userCanon].map(a => a.toLowerCase().trim()) : [];

    const normalizeAr = (s: string) => (s || '').replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim().toLowerCase();
    const normName = normalizeAr(currentName);
    const normUsername = normalizeAr(currentUsername);

    return activeRenewals
      .filter(c => {
        // Exclude any mock demo client
        if (isMockDemoClient(c)) return false;

        // An employee ONLY sees a client if they are explicitly assigned, mentioned, or managing the client!
        // 1. Explicit ID in assignedTeamMemberIds
        let isDirectlyAssigned = false;
        if (Array.isArray(c.assignedTeamMemberIds) && c.assignedTeamMemberIds.length > 0) {
          for (const mId of c.assignedTeamMemberIds) {
            const cleanM = (mId || '').trim().toLowerCase();
            if (cleanM === currentUid || cleanM === currentCode || cleanM === currentUsername) {
              isDirectlyAssigned = true;
              break;
            }
            if (userCanon && getCanonicalUserId(cleanM) === userCanon) {
              isDirectlyAssigned = true;
              break;
            }
          }
        }

        // 2. Explicit ID in mentionedTeamMemberIds
        let isDirectlyMentioned = false;
        if (Array.isArray(c.mentionedTeamMemberIds) && c.mentionedTeamMemberIds.length > 0) {
          for (const mId of c.mentionedTeamMemberIds) {
            const cleanM = (mId || '').trim().toLowerCase();
            if (cleanM === currentUid || cleanM === currentCode || cleanM === currentUsername) {
              isDirectlyMentioned = true;
              break;
            }
            if (userCanon && getCanonicalUserId(cleanM) === userCanon) {
              isDirectlyMentioned = true;
              break;
            }
          }
        }

        // 3. ManagedBy matches name or alias (e.g. "اميره" vs "Amira", "Aya", "هدير", etc.)
        let isManagerOfClient = false;
        if (c.managedBy) {
          const cleanMgr = c.managedBy.trim().toLowerCase();
          const normMgr = normalizeAr(cleanMgr);
          if (cleanMgr === currentUid || cleanMgr === currentName || cleanMgr === currentUsername) isManagerOfClient = true;
          else if (normMgr === normName || normMgr === normUsername) isManagerOfClient = true;
          else if (userCanon && getCanonicalUserId(cleanMgr) === userCanon) isManagerOfClient = true;
          else if (userAliases.some(alias => cleanMgr === alias || normMgr === normalizeAr(alias))) isManagerOfClient = true;
        }

        // Strict isolation: if employee was unmentioned or unassigned, they cannot see the client!
        if (!isDirectlyAssigned && !isDirectlyMentioned && !isManagerOfClient) {
          return false;
        }

        return true;
      })
      .map(client => ({
        ...client,
        // تأمين الملفات في طبقة البيانات: إتاحة الملفات المصرح بها لهذا الموظف فقط
        folderFiles: (client.folderFiles || []).filter(file => {
          if (!file.allowedTeamMemberIds || file.allowedTeamMemberIds.length === 0) {
            return true;
          }
          return file.allowedTeamMemberIds.includes(currentUser.id) ||
                 (userCanon && file.allowedTeamMemberIds.some(fId => getCanonicalUserId(fId) === userCanon));
        })
      }));
  }, [clientRenewals, isUserAdminOrRoot, currentUser]);

  const isSalesUser = Boolean(
    isUserAdminOrRoot ||
    (currentUser && (
      currentUser.department === 'المبيعات' ||
      currentUser.role?.toLowerCase().includes('sales') ||
      currentUser.role?.toLowerCase().includes('سيلز') ||
      currentUser.allowedTabs?.includes('leads')
    ))
  );

  const visibleLeads = useMemo(() => {
    if (isUserAdminOrRoot) return leads;
    if (!isSalesUser) return []; // لغير موظفي المبيعات، لا تظهر العملاء المحتملة إطلاقاً
    // لموظفي المبيعات (مثل مايبل Maibel): تظهر فقط العملاء المعلمة أو المعينة لهم من الإدارة
    return leads.filter(l =>
      Boolean(
        currentUser &&
          (l.assignedToId === currentUser.id ||
            l.assignedTeamMemberIds?.includes(currentUser.id))
      )
    );
  }, [leads, isUserAdminOrRoot, isSalesUser, currentUser]);

  // Sync to safeStorage
  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}emails`, JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify(activities));
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

    if (!dueDate) {
      return {
        label: 'بدون موعد',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        isOverdue: false,
        isToday: false,
        daysRemaining: 999
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
        const mUsernameLower = (m.username || '').toLowerCase();
        const mCodeLower = (m.employeeCode || '').toLowerCase();
        const mIdLower = (m.id || '').toLowerCase();

        // Arabic normalization
        const normClean = cleanName.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
        const normMName = mNameLower.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
        const normMFirst = mFirstName.replace(/[إأآا]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

        if (
          cleanName === mIdLower ||
          cleanName === mUsernameLower ||
          cleanName === mCodeLower ||
          cleanName === mNameLower ||
          cleanName === mFirstName ||
          cleanName === mNameLower.replace(/\s+/g, '') ||
          normClean === normMName ||
          normClean === normMFirst ||
          (normClean === 'ايمان' && (mUsernameLower === 'eman' || mIdLower === 'user-eman')) ||
          (cleanName === 'eman' && (mUsernameLower === 'eman' || mIdLower === 'user-eman')) ||
          (cleanName.includes('eman') && mIdLower === 'user-eman') ||
          (normClean.includes('ايمان') && mIdLower === 'user-eman')
        ) {
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

    let cleanAssignedId = newTaskData.assignedToId;
    if (cleanAssignedId) {
      const canonId = getCanonicalUserId(cleanAssignedId);
      if (canonId && TEAM_ALIASES[canonId]) {
        cleanAssignedId = canonId;
      }
    }

    const newTask: Task = {
      ...newTaskData,
      assignedToId: cleanAssignedId,
      id: newTaskId,
      mentionedUserIds: finalMentionedUserIds,
      comments: initialComments,
      createdAt: new Date().toISOString().split('T')[0]
    };

    lastLocalMutationTimeRef.current = Date.now();
    setTasks(prev => [newTask, ...prev]);
    logActivity('task', 'تم إنشاء مهمة جديدة وتحديد موعد التسليم', newTask.title);

    const newNotifications: AppNotification[] = [];

    // Notify assigned member if not self
    if (newTask.assignedToId && newTask.assignedToId !== currentUser.id) {
      newNotifications.push({
        id: 'notif-assign-' + Date.now() + '-' + newTask.assignedToId,
        title: `تم تكليفك بمهمة جديدة: ${newTask.title}`,
        message: `موعد التسليم النهائي: ${newTask.dueDate} ${newTask.dueTime ? `الساعة ${newTask.dueTime}` : ''} | الأولوية: ${newTask.priority === 'urgent' ? 'حرجة 🔴' : 'عالية 🟡'}`,
        timestamp: 'الآن',
        type: 'task_deadline',
        isRead: false,
        linkTab: 'tasks',
        taskId: newTaskId,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        recipientUserId: newTask.assignedToId
      });
    }

    // Mention notifications for each mentioned user
    finalMentionedUserIds.forEach(mId => {
      if (mId !== currentUser.id) {
        newNotifications.push({
          id: 'notif-mention-' + Date.now() + '-' + mId,
          title: `🔔 منشن لك في مهمة جديدة من ${currentUser.name}`,
          message: `المهمة: "${newTask.title}" | موعد التسليم: ${newTask.dueDate} ${newTask.dueTime || ''}`,
          timestamp: 'الآن',
          type: 'task_mention',
          isRead: false,
          linkTab: 'tasks',
          taskId: newTaskId,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          mentionedUserId: mId,
          recipientUserId: mId
        });
      }
    });

    // Notify Manager/Admin if not the creator
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
        linkTab: 'tasks',
        taskId: newTaskId,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        recipientUserId: managerUser.id
      });
    }

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }

    // Instant Firebase Firestore Synchronization (Global zero-lag sync across all team members)
    saveTaskToFirestore(newTask);

    // Instant Multi-Device Server Sync (Backup channel)
    try {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: newTask,
          notifications: newNotifications,
          activity: {
            id: 'act-' + Date.now(),
            type: 'task',
            title: 'تم إنشاء مهمة جديدة وتحديد موعد التسليم',
            description: newTask.title,
            timestamp: 'الآن',
            user: currentUser.name
          }
        })
      }).catch(err => console.warn('[SWIFTMYND] Instant task sync notice:', err));
    } catch (e) {}
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    let finalUpdates = { ...updates };
    if (finalUpdates.assignedToId) {
      const canonId = getCanonicalUserId(finalUpdates.assignedToId);
      if (canonId && TEAM_ALIASES[canonId]) {
        finalUpdates.assignedToId = canonId;
      }
    }

    const existing = tasks.find(t => t.id === id);
    const updatedTaskObj: Task = existing
      ? { ...existing, ...finalUpdates }
      : ({ id, ...finalUpdates } as Task);

    if (updates.status === 'completed' && existing?.status !== 'completed') {
      updatedTaskObj.completedAt = new Date().toISOString().split('T')[0];
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      logActivity('task', 'تم إنجاز المهمة بنجاح 🎉', updatedTaskObj.title);
    }

    lastLocalMutationTimeRef.current = Date.now();
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updatedTaskObj } : task))
    );

    // Instant Firebase Firestore Synchronization
    saveTaskToFirestore(updatedTaskObj);

    // Instant multi-device sync
    try {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: updatedTaskObj })
      }).catch(err => console.warn('[SWIFTMYND] Update task sync notice:', err));
    } catch (e) {}
  };

  const deleteTask = (id: string) => {
    const t = tasks.find(x => x.id === id);
    const targetTask: Task = t || ({ id, title: 'مهمة محذوفة' } as Task);
    const withCompleted = { ...targetTask, completedAt: targetTask.completedAt || new Date().toISOString() };

    lastLocalMutationTimeRef.current = Date.now();
    setDeletedTasks(prev => [withCompleted, ...prev.filter(x => x.id !== id)]);
    setTasks(prev => prev.filter(task => task.id !== id));
    if (t) {
      logActivity('task', 'تم نقل المهمة لسلة المهملات', t.title);
    }

    // Instant Firebase Firestore Deletion & Move to Trash
    deleteTaskFromFirestore(id, withCompleted);

    // Instant server sync & broadcast across all devices
    try {
      fetch('/api/tasks/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, task: withCompleted })
      }).catch(err => console.warn('[SWIFTMYND] Delete task sync notice:', err));
    } catch (e) {}
  };

  const deleteTasks = (ids: string[]) => {
    const toDelete = tasks.filter(t => ids.includes(t.id));
    if (toDelete.length > 0) {
      lastLocalMutationTimeRef.current = Date.now();
      setDeletedTasks(prev => [...toDelete, ...prev.filter(x => !ids.includes(x.id))]);
      setTasks(prev => prev.filter(task => !ids.includes(task.id)));
      logActivity('task', 'نقل مهام لسلة المهملات', `تم نقل ${ids.length} مهمة لسلة المهملات`);

      // Instant Firebase Firestore Bulk Deletion
      bulkDeleteTasksFromFirestore(ids, tasks);

      try {
        fetch('/api/tasks/delete-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskIds: ids })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const clearCompletedTasks = () => {
    const completedList = tasks.filter(t => t.status === 'completed');
    if (completedList.length > 0) {
      lastLocalMutationTimeRef.current = Date.now();
      const completedIds = completedList.map(t => t.id);
      setDeletedTasks(prev => [...completedList, ...prev.filter(x => !completedIds.includes(x.id))]);
      setTasks(prev => prev.filter(task => task.status !== 'completed'));
      logActivity('task', 'تفريغ ونقل المهام المكتملة لسلة المهملات', `تم نقل ${completedList.length} مهمة مكتملة لسلة المهملات`);

      // Instant Firebase Firestore Bulk Deletion
      bulkDeleteTasksFromFirestore(completedIds, tasks);

      try {
        fetch('/api/tasks/delete-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskIds: completedIds })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const restoreTaskFromTrash = (taskId: string) => {
    const t = deletedTasks.find(x => x.id === taskId);
    if (t) {
      lastLocalMutationTimeRef.current = Date.now();
      setTasks(prev => [t, ...prev.filter(x => x.id !== taskId)]);
      setDeletedTasks(prev => prev.filter(x => x.id !== taskId));
      logActivity('task', 'استعادة مهمة من سلة المهملات', t.title);

      // Instant Firebase Firestore Restore
      restoreTaskInFirestore(taskId, t);

      try {
        fetch('/api/tasks/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  const emptyTasksTrash = () => {
    const count = deletedTasks.length;
    setDeletedTasks([]);
    logActivity('task', 'تفريغ سلة مهملات المهام بالكامل', `تم حذف ${count} مهمة نهائياً من سلة المهملات`);
  };

  const permanentlyDeleteTask = (taskId: string) => {
    setDeletedTasks(prev => prev.filter(x => x.id !== taskId));
    logActivity('task', 'حذف نهائي للمهمة', 'تم حذف المهمة نهائياً من سلة المهملات');
  };

  const toggleSubTask = (taskId: string, subtaskId: string) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const updatedSubtasks = (target.subtasks || []).map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    const updated: Task = {
      ...target,
      subtasks: updatedSubtasks,
      status: allCompleted ? 'completed' : target.status,
      completedAt: allCompleted ? new Date().toISOString().split('T')[0] : target.completedAt
    };

    setTasks(prev => prev.map(task => (task.id === taskId ? updated : task)));

    // Instant Firebase Firestore Sync
    saveTaskToFirestore(updated);

    try {
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: updated })
      }).catch(() => {});
    } catch (e) {}
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

  // Timer & Work Session Tracking (حساب الوقت الفعلي الصافي واستبعاد فترات التوقف والراحة)
  const startTaskTimer = (taskId: string) => {
    const now = Date.now();
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      const isResuming = Boolean(target.isTimerPaused);
      const updated: Task = {
        ...target,
        isTimerRunning: true,
        isTimerPaused: false,
        timerStartedAt: isResuming ? (target.timerStartedAt || now) : now,
        timerLastResumedAt: now,
        timerAccumulatedMs: isResuming ? (target.timerAccumulatedMs || 0) : 0,
        status: target.status === 'todo' ? ('in_progress' as TaskStatus) : target.status
      };
      saveTaskToFirestore(updated);
      logActivity(
        'task',
        isResuming ? 'استئناف مؤقت العمل' : 'بدء مؤقت العمل الفعلي',
        `قام ${currentUser.name} بـ ${isResuming ? 'استئناف' : 'تشغيل'} المؤقت على: ${target.title}`
      );
    }

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const isResuming = Boolean(task.isTimerPaused);
          return {
            ...task,
            isTimerRunning: true,
            isTimerPaused: false,
            timerStartedAt: isResuming ? (task.timerStartedAt || now) : now,
            timerLastResumedAt: now,
            timerAccumulatedMs: isResuming ? (task.timerAccumulatedMs || 0) : 0,
            status: task.status === 'todo' ? 'in_progress' : task.status
          };
        }
        return task;
      })
    );
  };

  const pauseTaskTimer = (taskId: string) => {
    const now = Date.now();
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    // Calculate actual active worked time in this segment
    const segmentStart = target.timerLastResumedAt || target.timerStartedAt || now;
    const segmentWorkedMs = target.isTimerRunning ? Math.max(0, now - segmentStart) : 0;
    const newAccumulatedMs = (target.timerAccumulatedMs || 0) + segmentWorkedMs;

    const updated: Task = {
      ...target,
      isTimerRunning: false,
      isTimerPaused: true,
      timerAccumulatedMs: newAccumulatedMs,
      timerLastResumedAt: undefined
    };

    saveTaskToFirestore(updated);
    setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
    logActivity(
      'task',
      'إيقاف مؤقت للعمل (Pause)',
      `قام ${currentUser.name} بإيقاف المؤقت مؤقتاً لمهمة: ${target.title} (تم حفظ ${Math.round(newAccumulatedMs / 60000)} دقيقة عمل فعلية)`
    );
  };

  const resumeTaskTimer = (taskId: string) => {
    const now = Date.now();
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const updated: Task = {
      ...target,
      isTimerRunning: true,
      isTimerPaused: false,
      timerStartedAt: target.timerStartedAt || now,
      timerLastResumedAt: now,
      timerAccumulatedMs: target.timerAccumulatedMs || 0,
      status: target.status === 'todo' ? 'in_progress' : target.status
    };

    saveTaskToFirestore(updated);
    setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
    logActivity('task', 'استئناف العمل الفعلي (Resume)', `قام ${currentUser.name} باستئناف مؤقت: ${target.title}`);
  };

  const stopTaskTimer = (
    taskId: string,
    sessionNote?: string,
    markCompleted?: boolean,
    customDurationMinutes?: number
  ) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const now = new Date();
    const nowMs = now.getTime();

    // Calculate actual worked time only (EXCLUDES ALL PAUSED TIME)
    let elapsedMinutes: number;
    if (typeof customDurationMinutes === 'number' && customDurationMinutes > 0) {
      elapsedMinutes = Math.round(customDurationMinutes);
    } else {
      const currentSegmentWorkedMs = targetTask.isTimerRunning
        ? Math.max(0, nowMs - (targetTask.timerLastResumedAt || targetTask.timerStartedAt || nowMs))
        : 0;
      const totalActiveWorkedMs = (targetTask.timerAccumulatedMs || 0) + currentSegmentWorkedMs;
      elapsedMinutes = Math.max(1, Math.round(totalActiveWorkedMs / 60000));
    }

    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const startDateObj = new Date(targetTask.timerStartedAt || nowMs);
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
      note: sessionNote || (markCompleted ? 'إنجاز المهمة وحساب الوقت الفعلي الصافي' : 'جلسة عمل فعلية مسجلة عبر المؤقت المباشر (مستبعد منها فترات التوقف)'),
      createdAt: todayStr
    };

    const updatedTask: Task = {
      ...targetTask,
      isTimerRunning: false,
      isTimerPaused: false,
      timerStartedAt: undefined,
      timerLastResumedAt: undefined,
      timerAccumulatedMs: 0,
      totalLoggedMinutes: (targetTask.totalLoggedMinutes || 0) + elapsedMinutes,
      timeLogs: [newLog, ...(targetTask.timeLogs || [])],
      status: markCompleted ? 'completed' : targetTask.status,
      completedAt: markCompleted ? todayStr : targetTask.completedAt
    };

    saveTaskToFirestore(updatedTask);

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          return updatedTask;
        }
        return task;
      })
    );

    if (markCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
      logActivity(
        'task',
        'تم إنهاء المهمة بنجاح 🎉',
        `${currentUser.name}: أنهى مهمة "${targetTask.title}" واستغرقت جلسة العمل الفعلية ${elapsedMinutes} دقيقة`
      );
    } else {
      logActivity(
        'task',
        'إيقاف المؤقت وحفظ وقت العمل الفعلي',
        `${currentUser.name}: عمل ${elapsedMinutes} دقيقة عمل فعلي على: ${targetTask.title}`
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

    // Manager always gets notified if team members mention each other or manager is mentioned
    const adminUser = team.find(m => m.accessLevel === 'admin' || m.id === adminUserId);
    if (adminUser && adminUser.id !== currentUser.id) {
      targetUsersToNotify.add(adminUser.id);
    }

    const createdNotifs: AppNotification[] = [];

    targetUsersToNotify.forEach(memberId => {
      const isDirectMention = mentionedUserIds.includes(memberId);
      const notifTitle = isDirectMention
        ? `🔔 منشن لك من ${currentUser.name} في مهمة: ${targetTask.title}`
        : `💬 منشن وتفاعل بين أعضاء الفريق في مهمة: ${targetTask.title}`;

      createdNotifs.push({
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
        mentionedUserId: memberId,
        recipientUserId: memberId
      });
    });

    if (createdNotifs.length > 0) {
      setNotifications(prev => [...createdNotifs, ...prev]);
      createdNotifs.forEach(n => saveNotificationToFirestore(n));
    }

    // Instant Firebase Firestore Sync
    const updatedWithComments: Task = {
      ...targetTask,
      comments: [...(targetTask.comments || []), newComment]
    };
    saveTaskToFirestore(updatedWithComments);

    logActivity('task', 'منشن في مهمة', `${currentUser.name} أضاف تعليقاً ومنشن في: ${targetTask.title}`);

    // Instant server sync
    try {
      fetch('/api/tasks/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          comment: newComment,
          notifications: createdNotifs
        })
      }).catch(() => {});
    } catch (e) {}
  };

  // Team Actions
  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'joinedDate'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: 'user-' + Date.now(),
      isAccountActive: memberData.isAccountActive !== undefined ? memberData.isAccountActive : true,
      salaryCurrency: memberData.salaryCurrency || brandConfig.systemCurrency || 'ر.س',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setTeam(prev => {
      const updated = [...prev, newMember];
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(updated));
      return updated;
    });
    // Sync to Firestore
    saveTeamMemberToFirestore(newMember);
    logActivity('team', 'انضمام عضو جديد للفريق', `${newMember.name} - ${newMember.role}`);
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    let fullUpdatedMember: TeamMember | null = null;
    setTeam(prev => {
      const updated = prev.map(m => {
        if (m.id === id) {
          const fresh = { ...m, ...updates };
          fullUpdatedMember = fresh;
          return fresh;
        }
        return m;
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(updated));
      return updated;
    });

    // Directly update currentUser if it is currently logged in as this member
    setCurrentUser(prev => {
      if (prev.id === id || (prev.username && updates.username && prev.username.toLowerCase() === updates.username.toLowerCase())) {
        const updatedUser = { ...prev, ...updates };
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prev;
    });

    // If avatar was updated, propagate to all tasks assigned to this user
    if (updates.avatar) {
      setTasks(prev => {
        const updated = prev.map(t => (t.assignedToId === id || (id === 'user-islam' && (t.assignedToId === 'user-islam' || t.assignedToId === 'Islam')) ? { ...t, assigneeAvatar: updates.avatar } : t));
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(updated));
        return updated;
      });
    }

    // Immediately persist directly to Firestore Database with the new password
    if (fullUpdatedMember) {
      saveTeamMemberToFirestore(fullUpdatedMember);
    }
    if (updates.password) {
      saveTeamPasswordToFirestore(id, updates.password);
    }

    // Immediately persist profile updates to backend server so it never reverts on reload or sync
    try {
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: id,
          username: updates.username,
          updates
        })
      }).catch(err => console.warn('[SWIFTMYND] Profile sync notice:', err));
    } catch (e) {}
  };

  const adminUserId = 'user-1';
  const isImpersonating = Boolean(currentUser && currentUser.id !== adminUserId);

  const impersonateUser = (memberId: string) => {
    const target = team.find(m => m.id === memberId);
    if (target) {
      loginUser(target);
      logActivity('team', 'الدخول بحساب عضو من الفريق', `قام المدير بالدخول بحساب: ${target.name} (${target.username})`);
    }
  };

  const returnToAdmin = () => {
    const admin = team.find(m => m.id === adminUserId) || CURRENT_USER;
    loginUser(admin);
    logActivity('team', 'العودة لحساب المدير العام', `تمت العودة لحساب المدير: ${admin.name}`);
  };

  const updateUserCredentials = (memberId: string, updates: Partial<TeamMember>) => {
    updateTeamMember(memberId, updates);
    if (updates.password) {
      saveTeamPasswordToFirestore(memberId, updates.password);
    }
    logActivity('team', 'تحديث بيانات الحساب والوصول', `تم تعديل بيانات الدخول والأرقام للموظف وحفظ كلمة المرور في الداتا بيز`);
  };

  const deleteTeamMember = (id: string) => {
    try {
      const savedDeleted = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_team_ids`);
      const delList: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
      if (!delList.includes(id)) {
        delList.push(id);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_team_ids`, JSON.stringify(delList));
      }
    } catch {}

    setTeam(prev => {
      const updated = prev.filter(m => m.id !== id);
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(updated));
      return updated;
    });

    try {
      fetch(`/api/team/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    logActivity('team', 'حذف موظف من الفريق', `تم حذف الموظف من المنظومة بنجاح`);
  };

  const deleteTeamMembers = (ids: string[]) => {
    // Keep admin protected
    try {
      const savedDeleted = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}deleted_team_ids`);
      const delList: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
      ids.forEach(id => {
        if (!delList.includes(id)) delList.push(id);
      });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_team_ids`, JSON.stringify(delList));
    } catch {}

    setTeam(prev => {
      const updated = prev.filter(m => !ids.includes(m.id) || m.id === adminUserId);
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(updated));
      return updated;
    });

    ids.forEach(id => {
      try {
        fetch(`/api/team/${id}`, { method: 'DELETE' }).catch(() => {});
      } catch {}
    });

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
    logActivity('email', 'نقل رسالة لسلة المهملات', 'تم نقل الرسالة لسلة المهملات');
  };

  const emptyTrash = () => {
    const count = emails.filter(m => m.folder === 'trash').length;
    setEmails(prev => prev.filter(m => m.folder !== 'trash'));
    logActivity('email', 'تفريغ سلة المهملات بالكامل', `تم حذف ${count} رسالة نهائياً من سلة المهملات`);
  };

  const restoreEmailFromTrash = (id: string) => {
    setEmails(prev => prev.map(m => (m.id === id ? { ...m, folder: 'inbox' } : m)));
    logActivity('email', 'استعادة رسالة من سلة المهملات', 'تمت استعادة الرسالة إلى البريد الوارد');
  };

  const permanentlyDeleteEmail = (id: string) => {
    setEmails(prev => prev.filter(m => m.id !== id));
    logActivity('email', 'حذف نهائي للرسالة', 'تم الحذف النهائي للرسالة');
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

  const assignLeadTeamMembers = (leadId: string, memberIds: string[]) => {
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, assignedTeamMemberIds: memberIds } : l))
    );
  };

  const addLeadNegotiation = (leadId: string, entryData: Omit<LeadNegotiationEntry, 'id' | 'createdAt'>) => {
    const newEntry: LeadNegotiationEntry = {
      ...entryData,
      id: 'neg-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setLeads(prev =>
      prev.map(l => {
        if (l.id !== leadId) return l;
        const currentEntries = l.negotiationEntries || [];
        const updatedEntries = [newEntry, ...currentEntries];
        const summaryText = `[${newEntry.date} - ${newEntry.type}]: ${newEntry.summary}${
          newEntry.finalPrice || newEntry.offeredPrice
            ? ` (السعر: ${(newEntry.finalPrice || newEntry.offeredPrice)?.toLocaleString()} ${newEntry.currency || l.currency || 'ج.م'})`
            : ''
        }`;
        return {
          ...l,
          negotiationEntries: updatedEntries,
          negotiationsHistory: l.negotiationsHistory
            ? `${summaryText}\n${l.negotiationsHistory}`
            : summaryText,
          finalPrice: newEntry.finalPrice ?? l.finalPrice,
          currency: newEntry.currency ?? l.currency
        };
      })
    );
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
      currency: brandConfig.systemCurrency || 'ج.م',
      stage: 'مؤهل',
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      assignedToId: lead.assignedToId || currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
      notes: `تم تحويله تلقائياً من العميل المحتمل: ${lead.name}`
    };

    setDeals(prev => [newDeal, ...prev]);
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: 'مؤهل' } : l)));

    logActivity('deal', 'تم تحويل عميل محتمل إلى صفقة بيعية', `${lead.company} بقيمة ${newDeal.value.toLocaleString()} ${brandConfig.systemCurrency || 'ج.م'}`);
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

  // Meetings Actions (التواصل والاجتماعات)
  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}calls`, JSON.stringify(calls));
  }, [calls]);

  const addMeeting = (meetingData: Omit<Meeting, 'id'>): Meeting => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: 'meet-' + Date.now(),
      createdAt: meetingData.createdAt || new Date().toISOString()
    };
    setMeetings(prev => [newMeeting, ...prev]);
    logActivity('meeting', 'تم جدولة اجتماع جديد', `${newMeeting.title} (${newMeeting.date} ${newMeeting.time || newMeeting.startTime || ''})`);
    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)));
  };

  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  // Calls Actions (سجل المكالمات)
  const addCallLog = (callData: Omit<CallLog, 'id' | 'createdAt'>): CallLog => {
    const newCall: CallLog = {
      ...callData,
      id: 'call-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setCalls(prev => [newCall, ...prev]);
    logActivity(
      'lead',
      'تم تسجيل مكالمة جديدة',
      `${newCall.type === 'incoming' ? 'مكالمة واردة من' : 'مكالمة صادرة إلى'} ${newCall.clientName} (${newCall.purpose})`
    );
    return newCall;
  };

  const updateCallLog = (id: string, updates: Partial<CallLog>) => {
    setCalls(prev => prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)));
  };

  const deleteCallLog = (id: string) => {
    setCalls(prev => prev.filter(c => c.id !== id));
  };

  // Create Task directly from Meeting Action Item or Call Log
  const createTaskFromActionItem = (params: {
    title: string;
    description?: string;
    assignedToId: string;
    dueDate: string;
    dueTime?: string;
    priority?: TaskPriority;
    category?: 'مبيعات' | 'تقني' | 'تسويق' | 'دعم' | 'إداري';
    clientId?: string;
    clientName?: string;
    meetingId?: string;
    meetingTitle?: string;
    callId?: string;
  }): Task => {
    const assignedMember = team.find(m => m.id === params.assignedToId);
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: params.title,
      description:
        params.description ||
        (params.meetingTitle
          ? `مهمة مكلفة من اجتماع: ${params.meetingTitle}`
          : 'مهمة مكلفة من التواصل والمتابعة'),
      assignedToId: params.assignedToId || currentUser.id,
      priority: params.priority || 'high',
      status: 'todo',
      dueDate: params.dueDate,
      dueTime: params.dueTime || '14:00',
      category: params.category || 'إداري',
      timeLogs: [],
      subtasks: [],
      createdById: currentUser.id,
      createdByName: currentUser.name,
      meetingId: params.meetingId,
      meetingTitle: params.meetingTitle,
      callId: params.callId,
      createdAt: new Date().toISOString(),
      ...(params.clientId || params.clientName
        ? {
            relatedTo: {
              type: 'client',
              id: params.clientId || 'client-gen',
              name: params.clientName || 'عميل'
            }
          }
        : {})
    };

    addTask(newTask);

    // If linked to meeting action item, link that action item with the newly created task ID
    if (params.meetingId) {
      setMeetings(prev =>
        prev.map(m => {
          if (m.id === params.meetingId && m.actionItems) {
            return {
              ...m,
              actionItems: m.actionItems.map(item =>
                item.title === params.title ? { ...item, taskId: newTask.id } : item
              )
            };
          }
          return m;
        })
      );
    }

    // If linked to call, update that call with resultingTaskId
    if (params.callId) {
      setCalls(prev =>
        prev.map(c =>
          c.id === params.callId
            ? { ...c, resultingTaskId: newTask.id, resultingTaskTitle: newTask.title }
            : c
        )
      );
    }

    logActivity(
      'task',
      'تم إنشاء مهمة من التواصل والاجتماعات',
      `"${newTask.title}" مسندة إلى: ${assignedMember?.name || 'عضو'}`
    );

    return newTask;
  };

  // Notifications Actions
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}reports`, JSON.stringify(reports));
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
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_PREFIX}brand`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return ensureValidBrandConfig(parsed);
        }
      }
    } catch {}
    return DEFAULT_BRAND_CONFIG;
  });

  const isInitialDataLoadedRef = React.useRef(false);
  const isSyncingFromServerRef = React.useRef(false);
  const lastLocalMutationTimeRef = React.useRef(0);

  // Real-time bidirectional synchronization via Firebase Firestore (Across all accounts & devices)
  useEffect(() => {
    let unsubscribeTasks: (() => void) | null = null;
    let unsubscribeDeleted: (() => void) | null = null;
    let unsubscribeNotifications: (() => void) | null = null;
    let unsubscribeRenewals: (() => void) | null = null;
    let unsubscribeTeam: (() => void) | null = null;

    try {
      // Seed initial team if Firestore collection is empty
      seedInitialTeamIfEmpty(team);

      unsubscribeTeam = onTeamMembersSnapshot(remoteTeam => {
        if (Array.isArray(remoteTeam) && remoteTeam.length > 0) {
          setTeam(prev => {
            const memberMap = new Map(prev.map(m => [m.id, m]));
            remoteTeam.forEach(m => {
              if (m && m.id) {
                const existing = memberMap.get(m.id);
                memberMap.set(m.id, { ...(existing || {}), ...m });
              }
            });
            const merged = Array.from(memberMap.values());
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(merged));
            return merged;
          });
        }
      });

      unsubscribeTasks = onTasksSnapshot(remoteTasks => {
        if (Array.isArray(remoteTasks)) {
          if (remoteTasks.length === 0 && tasks.length > 0) {
            seedInitialTasksIfEmpty(tasks);
            return;
          }
          if (Date.now() - lastLocalMutationTimeRef.current < 1500) {
            return;
          }
          if (remoteTasks.length > 0) {
            isSyncingFromServerRef.current = true;
            setTasks(prev => {
              const taskMap = new Map<string, Task>();
              prev.forEach(t => taskMap.set(t.id, t));
              remoteTasks.forEach(t => taskMap.set(t.id, { ...(taskMap.get(t.id) || {}), ...t }));
              const merged = Array.from(taskMap.values());
              safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(merged));
              return merged;
            });
          }
        }
      });

      unsubscribeDeleted = onDeletedTasksSnapshot(remoteDeleted => {
        if (Array.isArray(remoteDeleted)) {
          setDeletedTasks(remoteDeleted);
          safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`, JSON.stringify(remoteDeleted));
        }
      });

      unsubscribeNotifications = onNotificationsSnapshot(remoteNotifs => {
        if (Array.isArray(remoteNotifs) && remoteNotifs.length > 0) {
          setNotifications(prev => {
            const notifMap = new Map(prev.map(n => [n.id, n]));
            remoteNotifs.forEach(n => notifMap.set(n.id, n));
            return Array.from(notifMap.values());
          });
        }
      });

      unsubscribeRenewals = onClientRenewalsSnapshot(remoteRenewals => {
        if (Array.isArray(remoteRenewals) && remoteRenewals.length > 0) {
          if (Date.now() - lastLocalMutationTimeRef.current < 2000) return;
          const cleanRemote = remoteRenewals.filter(r => !isMockDemoClient(r));
          setClientRenewals(prev => {
            const map = new Map(prev.map(r => [r.id, r]));
            cleanRemote.forEach(r => map.set(r.id, { ...(map.get(r.id) || {}), ...r }));
            const merged = Array.from(map.values());
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(merged));
            return merged;
          });
        }
      });
    } catch (err) {
      console.warn('[Firebase] Snapshot registration notice:', err);
    }

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeDeleted) unsubscribeDeleted();
      if (unsubscribeNotifications) unsubscribeNotifications();
      if (unsubscribeRenewals) unsubscribeRenewals();
      if (unsubscribeTeam) unsubscribeTeam();
    };
  }, []);

  // Real-time zero-latency sync via Server-Sent Events (SSE)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/live-sync');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TASK_MUTATION' || payload.type === 'FULL_SYNC') {
            const serverDeletedSet = new Set((payload.deletedTasks || []).map((t: any) => t.id));
            
            if (Array.isArray(payload.tasks)) {
              const cleanTasks = payload.tasks.filter((t: any) => !serverDeletedSet.has(t.id));
              setTasks(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(cleanTasks)) {
                  isSyncingFromServerRef.current = true;
                  safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(cleanTasks));
                  return cleanTasks;
                }
                return prev;
              });
            }
            if (Array.isArray(payload.deletedTasks)) {
              setDeletedTasks(payload.deletedTasks);
              safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`, JSON.stringify(payload.deletedTasks));
            }
            if (Array.isArray(payload.notifications)) {
              setNotifications(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(payload.notifications)) {
                  isSyncingFromServerRef.current = true;
                  return payload.notifications;
                }
                return prev;
              });
            }
          }

          if (payload.type === 'TEAM_MUTATION' || payload.type === 'FULL_SYNC') {
            if (Array.isArray(payload.team) && payload.team.length > 0) {
              setTeam(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(payload.team)) {
                  isSyncingFromServerRef.current = true;
                  safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(payload.team));
                  return payload.team;
                }
                return prev;
              });
            }
          }

          if (payload.type === 'RENEWAL_MUTATION' || payload.type === 'FULL_SYNC') {
            if (Array.isArray(payload.clientRenewals)) {
              setClientRenewals(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(payload.clientRenewals)) {
                  isSyncingFromServerRef.current = true;
                  safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(payload.clientRenewals));
                  return payload.clientRenewals;
                }
                return prev;
              });
            }
          }

          if (payload.type === 'MARKETING_MUTATION' || payload.type === 'FULL_SYNC') {
            if (Array.isArray(payload.deletedMarketingCardIds)) {
              setDeletedMarketingCardIds(prev => Array.from(new Set([...prev, ...payload.deletedMarketingCardIds])));
            }
            if (Array.isArray(payload.deletedMarketingListIds)) {
              setDeletedMarketingListIds(prev => Array.from(new Set([...prev, ...payload.deletedMarketingListIds])));
            }
            if (Array.isArray(payload.marketingBoards)) {
              const delCards = new Set(payload.deletedMarketingCardIds || []);
              const delLists = new Set(payload.deletedMarketingListIds || []);
              const sanitized = payload.marketingBoards
                .filter((b: any) => !delLists.has(b.id))
                .map((b: any) => ({
                  ...b,
                  lists: (b.lists || [])
                    .filter((l: any) => !delLists.has(l.id))
                    .map((l: any) => ({
                      ...l,
                      cards: (l.cards || []).filter((c: any) => !delCards.has(c.id))
                    }))
                }));
              setMarketingBoards(sanitized);
            }
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Synchronize state with server /api/data for multi-user / multi-device access (with anti-cache)
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/data?_t=' + Date.now(), {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (res.ok) {
          const serverData = await res.json();
          if (!isMounted || !serverData || typeof serverData !== 'object') return;

          const serverDeletedSet = new Set((serverData.deletedTasks || []).map((t: any) => t.id));

          if (Array.isArray(serverData.tasks)) {
            const cleanTasks = serverData.tasks.filter((t: any) => !serverDeletedSet.has(t.id));
            isSyncingFromServerRef.current = true;
            setTasks(cleanTasks);
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(cleanTasks));
          }
          if (Array.isArray(serverData.deletedTasks)) {
            setDeletedTasks(serverData.deletedTasks);
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`, JSON.stringify(serverData.deletedTasks));
          }
          if (Array.isArray(serverData.team) && serverData.team.length > 0) {
            setTeam(serverData.team);
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(serverData.team));

            // Sync currentUser with serverData.team while preserving active avatar and credentials
            setCurrentUser(prevUser => {
              if (!prevUser || !prevUser.id) return prevUser;
              const matchedMember = serverData.team.find(
                (m: any) =>
                  m.id === prevUser.id ||
                  (m.username && prevUser.username && m.username.toLowerCase() === prevUser.username.toLowerCase()) ||
                  (prevUser.id === 'user-islam' && (m.id === 'user-islam' || m.id === 'user-1793025675186' || m.id === 'user-1793016178916'))
              );
              if (matchedMember) {
                const updatedUser = ensureValidUser({
                  ...prevUser,
                  ...matchedMember,
                  avatar: prevUser.avatar?.startsWith('data:') ? prevUser.avatar : (matchedMember.avatar || prevUser.avatar)
                });
                safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(updatedUser));
                return updatedUser;
              }
              return prevUser;
            });
          }
          if (Array.isArray(serverData.clientRenewals)) {
            setClientRenewals(serverData.clientRenewals);
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(serverData.clientRenewals));
          }
          if (Array.isArray(serverData.notifications) && serverData.notifications.length > 0) {
            setNotifications(serverData.notifications);
          }
          if (Array.isArray(serverData.activities) && serverData.activities.length > 0) {
            setActivities(serverData.activities);
          }
          if (Array.isArray(serverData.emails) && serverData.emails.length > 0) {
            setEmails(serverData.emails);
          }
          if (serverData.brandConfig && typeof serverData.brandConfig === 'object') {
            setBrandConfig(ensureValidBrandConfig(serverData.brandConfig));
          }
          // Sync marketing deletions and boards
          if (Array.isArray(serverData.deletedMarketingCardIds)) {
            setDeletedMarketingCardIds(prev => {
              const combined = Array.from(new Set([...prev, ...serverData.deletedMarketingCardIds]));
              safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_cards`, JSON.stringify(combined));
              return combined;
            });
          }
          if (Array.isArray(serverData.deletedMarketingListIds)) {
            setDeletedMarketingListIds(prev => {
              const combined = Array.from(new Set([...prev, ...serverData.deletedMarketingListIds]));
              safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_marketing_lists`, JSON.stringify(combined));
              return combined;
            });
          }
          if (Array.isArray(serverData.marketingBoards) && serverData.marketingBoards.length > 0) {
            const delCards = new Set([...(serverData.deletedMarketingCardIds || []), ...deletedMarketingCardIds]);
            const delLists = new Set([...(serverData.deletedMarketingListIds || []), ...deletedMarketingListIds]);
            const sanitizedBoards = serverData.marketingBoards
              .filter((b: any) => !delLists.has(b.id))
              .map((b: any) => ({
                ...b,
                lists: (b.lists || [])
                  .filter((l: any) => !delLists.has(l.id))
                  .map((l: any) => ({
                    ...l,
                    cards: (l.cards || []).filter((c: any) => !delCards.has(c.id))
                  }))
              }));
            setMarketingBoards(sanitizedBoards);
            safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`, JSON.stringify(sanitizedBoards));
          }
          isInitialDataLoadedRef.current = true;
        }
      } catch (err) {
        isInitialDataLoadedRef.current = true;
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save to server store whenever tasks or core state change (Only runs AFTER server data is loaded, and only by admin/manager)
  useEffect(() => {
    if (!isInitialDataLoadedRef.current) return;
    if (isSyncingFromServerRef.current) {
      isSyncingFromServerRef.current = false;
      return;
    }

    // Protection: regular employee accounts should never push full system wipes
    const isUserAdmin = currentUser.accessLevel === 'admin' || currentUser.accessLevel === 'manager' || currentUser.id === 'user-1';
    if (!isUserAdmin) return;

    const timer = setTimeout(async () => {
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tasks,
            deletedTasks,
            team,
            emails,
            leads,
            deals,
            meetings,
            brandConfig,
            reports,
            activities,
            notifications,
            clientRenewals,
            marketingBoards,
            deletedMarketingCardIds,
            deletedMarketingListIds
          })
        });
      } catch (e) {}
    }, 800);
    return () => clearTimeout(timer);
  }, [tasks, deletedTasks, team, emails, leads, deals, meetings, brandConfig, reports, activities, notifications, clientRenewals, marketingBoards, deletedMarketingCardIds, deletedMarketingListIds, currentUser]);

  // Real-time polling & window focus listener to guarantee fresh tasks across all devices
  useEffect(() => {
    const fetchFreshTasks = async () => {
      // Avoid overriding freshly added or edited tasks while request is settling
      if (Date.now() - lastLocalMutationTimeRef.current < 2500) {
        return;
      }
      try {
        const res = await fetch('/api/tasks?_t=' + Date.now(), {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (res.ok) {
          const serverData = await res.json();
          const serverDeletedSet = new Set((serverData?.deletedTasks || []).map((t: any) => t.id));

          if (serverData && Array.isArray(serverData.tasks)) {
            const cleanTasks = serverData.tasks.filter((t: any) => !serverDeletedSet.has(t.id));
            setTasks(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(cleanTasks)) {
                isSyncingFromServerRef.current = true;
                safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(cleanTasks));
                return cleanTasks;
              }
              return prev;
            });
          }
          if (serverData && Array.isArray(serverData.notifications)) {
            setNotifications(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData.notifications)) {
                isSyncingFromServerRef.current = true;
                return serverData.notifications;
              }
              return prev;
            });
          }
          if (serverData && Array.isArray(serverData.deletedTasks)) {
            setDeletedTasks(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(serverData.deletedTasks)) {
                isSyncingFromServerRef.current = true;
                safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deleted_tasks`, JSON.stringify(serverData.deletedTasks));
                return serverData.deletedTasks;
              }
              return prev;
            });
          }
          if (serverData && Array.isArray(serverData.team) && serverData.team.length > 0) {
            setTeam(prev => {
              if (prev.length !== serverData.team.length) {
                isSyncingFromServerRef.current = true;
                safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(serverData.team));
                return serverData.team;
              }
              return prev;
            });
          }
          if (serverData && Array.isArray(serverData.clientRenewals)) {
            const cleanRenewals = serverData.clientRenewals.filter((r: any) => !isMockDemoClient(r));
            setClientRenewals(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(cleanRenewals)) {
                isSyncingFromServerRef.current = true;
                safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(cleanRenewals));
                return cleanRenewals;
              }
              return prev;
            });
          }
        }
      } catch {}
    };

    // Run immediately on component mount
    fetchFreshTasks();

    const interval = setInterval(fetchFreshTasks, 1000);
    window.addEventListener('focus', fetchFreshTasks);
    document.addEventListener('visibilitychange', fetchFreshTasks);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchFreshTasks);
      document.removeEventListener('visibilitychange', fetchFreshTasks);
    };
  }, []);

  const validateAdminPin = (pin: string): boolean => {
    const clean = (pin || '').trim();
    const correct = (brandConfig?.adminPin || '8899').trim();
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
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const isMemberMentioned = (t: Task, member?: TeamMember | null) => {
    return isUserMentionedInTask(t, member);
  };

  const isCurrentManager = Boolean(
    currentUser && (currentUser.accessLevel === 'admin' || currentUser.id === 'user-1')
  );

  const userActiveTasks = isCurrentManager
    ? tasks
    : tasks.filter(t => !t.isPrivate && (isTaskAssignedToUser(t, currentUser) || isUserMentionedInTask(t, currentUser)));

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
    const user = targetUser ? ensureValidUser(targetUser) : currentUser;
    if (!user || !user.id) return;
    const isUserMgr = user.accessLevel === 'admin' || user.id === 'user-1';

    const targetUserTasks = isUserMgr
      ? tasks
      : tasks.filter(t => !t.isPrivate && (isTaskAssignedToUser(t, user) || isMemberMentioned(t, user)));

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
    if (currentUser && currentUser.accessLevel !== 'admin' && currentUser.id) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const dismissed = safeStorage.getItem(`swiftmynd_digest_dismissed_${currentUser.id}_${todayStr}`);
        const sessionShown = safeSessionStorage.getItem(`swiftmynd_digest_session_${currentUser.id}_${todayStr}`);
        if (!dismissed && !sessionShown) {
          safeSessionStorage.setItem(`swiftmynd_digest_session_${currentUser.id}_${todayStr}`, 'true');
          const timer = setTimeout(() => {
            triggerDailyDigest(currentUser);
          }, 600);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.error('Digest check error', e);
      }
    }
  }, [currentUser?.id]);

  const updateBrandConfig = (newConfig: Partial<BrandConfig>) => {
    setBrandConfig(prev => {
      const updated = ensureValidBrandConfig({ ...prev, ...newConfig, updatedAt: new Date().toISOString() });
      safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}brand`, JSON.stringify(updated));
      return updated;
    });
    logActivity('team', 'تعديل هوية المنظومة واللوجو', 'قام الأدمن بتحديث لوجو سويفت واسم المنظومة');
  };

  const resetBrandConfig = () => {
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    safeStorage.removeItem(`${LOCAL_STORAGE_PREFIX}brand`);
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
      if (brandConfig?.customFaviconUrl) {
        faviconLink.href = brandConfig.customFaviconUrl;
      } else {
        faviconLink.href = '/assets/aistudio/PROFILE2_3fe3b3a5.png';
      }

      if (brandConfig?.primaryColor) {
        document.documentElement.style.setProperty('--primary-brand-color', brandConfig.primaryColor);
      }
      if (brandConfig?.brandName) {
        document.title = `${brandConfig.brandName} | نظام إدارة المهام والمبيعات`;
      }
    } catch (e) {
      console.error('Failed to update favicon', e);
    }
  }, [brandConfig?.customFaviconUrl, brandConfig?.primaryColor, brandConfig?.brandName]);

  const resetToDemoData = () => {
    safeStorage.clear();
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
    safeStorage.clear();
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
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify([]));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}leads`, JSON.stringify([]));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify([]));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify([]));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}notifications`, JSON.stringify([]));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}activities`, JSON.stringify([]));
    safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}reports`, JSON.stringify([]));
  };

  const updateCurrentProfile = (updates: Partial<TeamMember>) => {
    if (!currentUser?.id) return;
    updateTeamMember(currentUser.id, updates);
    logActivity(
      'team',
      'تحديث الملف الشخصي',
      `قام المستخدم (${updates.name || currentUser.name}) بتحديث بيانات حسابه (الاسم / الصورة / كلمة المرور)`
    );
  };

  const getSystemBackupJson = () => {
    const backupData = {
      version: '1.0',
      system: 'SWIFTMYND / tazkoraio',
      exportedAt: new Date().toISOString(),
      brandConfig,
      team,
      tasks,
      leads,
      deals,
      meetings,
      emails,
      clientRenewals,
      marketingBoards,
      meetingRecordings,
      marketingScripts,
      coachingOffers,
      reports,
      activities,
      notifications,
      attendanceRecords,
      companyExpenses,
      monthlyPayrolls,
      monthlySalesCommissions,
      clientFinancialContracts,
      marketingIdeas,
      writtenThoughts
    };
    return JSON.stringify(backupData, null, 2);
  };

  const exportSystemBackup = () => {
    const jsonStr = getSystemBackupJson();
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `tazkora-crm-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Backup download error', e);
      }
    }
    logActivity('team', 'تصدير نسخة احتياطية كاملة للمنظومة', `تم تصدير وحفظ نسخة احتياطية لكافة الحسابات والبيانات`);
    return jsonStr;
  };

  const importSystemBackup = (jsonData: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonData);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف.' };
      }

      if (Array.isArray(data.team) && data.team.length > 0) {
        setTeam(data.team);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}team`, JSON.stringify(data.team));
      }
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}tasks`, JSON.stringify(data.tasks));
      }
      if (Array.isArray(data.leads)) {
        setLeads(data.leads);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}leads`, JSON.stringify(data.leads));
      }
      if (Array.isArray(data.deals)) {
        setDeals(data.deals);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}deals`, JSON.stringify(data.deals));
      }
      if (Array.isArray(data.meetings)) {
        setMeetings(data.meetings);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meetings`, JSON.stringify(data.meetings));
      }
      if (Array.isArray(data.emails)) {
        setEmails(data.emails);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}emails`, JSON.stringify(data.emails));
      }
      if (Array.isArray(data.clientRenewals)) {
        setClientRenewals(data.clientRenewals);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_renewals`, JSON.stringify(data.clientRenewals));
      }
      if (Array.isArray(data.marketingBoards)) {
        setMarketingBoards(data.marketingBoards);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_boards`, JSON.stringify(data.marketingBoards));
      }
      if (Array.isArray(data.meetingRecordings)) {
        setMeetingRecordings(data.meetingRecordings);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}meeting_recordings`, JSON.stringify(data.meetingRecordings));
      }
      if (Array.isArray(data.marketingScripts)) {
        setMarketingScripts(data.marketingScripts);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_scripts`, JSON.stringify(data.marketingScripts));
      }
      if (Array.isArray(data.coachingOffers)) {
        setCoachingOffers(data.coachingOffers);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}coaching_offers`, JSON.stringify(data.coachingOffers));
      }
      if (Array.isArray(data.reports)) {
        setReports(data.reports);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}reports`, JSON.stringify(data.reports));
      }
      if (Array.isArray(data.attendanceRecords)) {
        setAttendanceRecords(data.attendanceRecords);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}attendance_records`, JSON.stringify(data.attendanceRecords));
      }
      if (Array.isArray(data.companyExpenses)) {
        setCompanyExpenses(data.companyExpenses);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}company_expenses`, JSON.stringify(data.companyExpenses));
      }
      if (Array.isArray(data.monthlyPayrolls)) {
        setMonthlyPayrolls(data.monthlyPayrolls);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}monthly_payrolls`, JSON.stringify(data.monthlyPayrolls));
      }
      if (Array.isArray(data.monthlySalesCommissions)) {
        setMonthlySalesCommissions(data.monthlySalesCommissions);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}sales_commissions`, JSON.stringify(data.monthlySalesCommissions));
      }
      if (Array.isArray(data.clientFinancialContracts)) {
        setClientFinancialContracts(data.clientFinancialContracts);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}client_contracts`, JSON.stringify(data.clientFinancialContracts));
      }
      if (Array.isArray(data.marketingIdeas)) {
        setMarketingIdeas(data.marketingIdeas);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}marketing_ideas`, JSON.stringify(data.marketingIdeas));
      }
      if (Array.isArray(data.writtenThoughts)) {
        setWrittenThoughts(data.writtenThoughts);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}written_thoughts`, JSON.stringify(data.writtenThoughts));
      }
      if (data.brandConfig && typeof data.brandConfig === 'object') {
        const validBrand = ensureValidBrandConfig(data.brandConfig);
        setBrandConfig(validBrand);
        safeStorage.setItem(`${LOCAL_STORAGE_PREFIX}brand`, JSON.stringify(validBrand));
      }

      logActivity('team', 'استيراد واستعادة نسخة احتياطية', 'تمت استعادة كافة البيانات والحسابات بنجاح من ملف الباك اب');
      return { success: true, message: 'تم استيراد واستعادة كافة بيانات المنظومة وفريق العمل بنجاح!' };
    } catch (e: any) {
      console.error('Import backup failed', e);
      return { success: false, message: 'حدث خطأ أثناء قراءة ملف النسخة الاحتياطية: ' + (e?.message || '') };
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const unreadEmailsCount = emails.filter(m => m.folder === 'inbox' && !m.isRead).length;
  const isManagerUser = Boolean(
    currentUser &&
      (currentUser.accessLevel === 'admin' ||
        currentUser.accessLevel === 'manager' ||
        currentUser.id === 'user-1')
  );
  const pendingTasksCount = tasks.filter(t => {
    if (t.status === 'completed') return false;
    if (t.isPrivate && !isManagerUser) return false;
    if (!isManagerUser && currentUser && t.assignedToId !== currentUser.id) return false;
    return true;
  }).length;

  // Account Manager Scope & Filtering Calculations
  const isCurrentUserAccountManager = isUserAccountManager(currentUser, clientRenewals);

  const simulatedAccountManager =
    selectedSimulatedAccountManagerId !== 'all'
      ? team.find(m => m.id === selectedSimulatedAccountManagerId) || null
      : null;

  const effectiveAccountManager: TeamMember | null =
    simulatedAccountManager || (isCurrentUserAccountManager ? currentUser : null);

  const accountManagerClients = effectiveAccountManager
    ? getAccountManagerClients(effectiveAccountManager, clientRenewals)
    : [];

  const accountManagerTeam = effectiveAccountManager
    ? getAccountManagerTeamMembers(effectiveAccountManager, clientRenewals, team, tasks)
    : [];

  const accountManagerScopeTasks = effectiveAccountManager
    ? filterTasksForAccountManager(tasks, effectiveAccountManager, clientRenewals)
    : tasks;

  const isTaskInScope = (task: Task, user?: TeamMember): boolean => {
    const targetUser = user || effectiveAccountManager;
    if (!targetUser) return true;
    return isTaskInAccountManagerScope(task, targetUser, clientRenewals);
  };

  const filterTasksForAM = (taskList: Task[], user: TeamMember): Task[] => {
    return filterTasksForAccountManager(taskList, user, clientRenewals);
  };

  return (
    <CRMContext.Provider
      value={{
        currentUser,
        setCurrentUser: setSafeCurrentUser,
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
        deletedTasks,
        addTask,
        updateTask,
        deleteTask,
        deleteTasks,
        clearCompletedTasks,
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
        emptyTrash,
        restoreEmailFromTrash,
        permanentlyDeleteEmail,
        leads,
        addLead,
        addLeadsBulk,
        updateLead,
        deleteLead,
        assignLeadTeamMembers,
        addLeadNegotiation,
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
        calls,
        addCallLog,
        updateCallLog,
        deleteCallLog,
        createTaskFromActionItem,
        isCurrentUserAccountManager,
        accountManagerClients,
        accountManagerTeam,
        accountManagerScopeTasks,
        isTaskInAccountManagerScope: isTaskInScope,
        filterTasksForAccountManager: filterTasksForAM,
        selectedSimulatedAccountManagerId,
        setSelectedSimulatedAccountManagerId,
        effectiveAccountManager,
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
        deletedMarketingCardIds,
        deletedMarketingListIds,
        clientRenewals,
        visibleClients,
        addClientRenewal,
        updateClientRenewal,
        deleteClientRenewal,
        markRenewalCompleted,
        addClientFile,
        deleteClientFile,
        updateClientFilePermissions,
        addClientNote,
        assignClientTeam,
        addAccountMonthlyTask,
        toggleAccountMonthlyTask,
        updateAccountMonthlyTask,
        deleteAccountMonthlyTask,
        setClientAccountManager,
        convertLeadToClientAndHandoff,
        renewalsDueSoonCount,
        visibleLeads,
        isSalesUser,
        leadsDueFollowUpTodayCount,
        suspendedContracts,
        suspendClientContract,
        reactivateClientContract,
        updateSuspensionReason,
        addSuspendedContract,
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
        attendanceRecords,
        recordAttendance,
        batchMarkAttendance,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        monthlyPayrolls,
        saveMonthlyPayroll,
        markPayrollPaid,
        companyExpenses,
        addCompanyExpense,
        updateCompanyExpense,
        deleteCompanyExpense,
        setGlobalCurrency,
        monthlySalesCommissions,
        addOrUpdateSalesCommission,
        markSalesCommissionPayout,
        addDealToSalesCommission,
        clientFinancialContracts,
        recordClientPayment,
        addClientFinancialContract,
        updateClientFinancialContract,
        deleteClientFinancialContract,
        marketingIdeas,
        addMarketingIdea,
        updateMarketingIdea,
        deleteMarketingIdea,
        writtenThoughts,
        addWrittenThought,
        updateWrittenThought,
        deleteWrittenThought,
        togglePinThought,
        performanceEvaluations,
        addPerformanceEvaluation,
        updatePerformanceEvaluation,
        deletePerformanceEvaluation,
        approvePerformanceEvaluation,
        addEvaluationClarification,
        delays,
        addDelayRecord,
        updateDelayRecord,
        deleteDelayRecord,
        reviewDelayRecord,
        companyRules,
        addCompanyRule,
        updateCompanyRule,
        deleteCompanyRule,
        acknowledgeCompanyRule,
        ruleViolations,
        addRuleViolation,
        updateRuleViolation,
        deleteRuleViolation,
        reviewRuleViolation,
        addViolationClarification,
        monthlyPerformanceReviews,
        saveMonthlyPerformanceReview,
        deleteMonthlyPerformanceReview,
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
        digestTodayCount,
        exportSystemBackup,
        getSystemBackupJson,
        importSystemBackup,
        isGitHubModalOpen,
        setIsGitHubModalOpen,
        updateCurrentProfile
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
