export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimeLogEntry {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  durationMinutes: number; // المدة بالدقائق
  note?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string; // تاريخ بدء العمل (من يوم)
  dueDate: string; // تاريخ التسليم النهائي (إلى يوم)
  dueTime?: string; // وقت التسليم
  category: 'مبيعات' | 'تقني' | 'تسويق' | 'دعم' | 'إداري';
  estimatedHours?: number; // الساعات التقديرية
  totalLoggedMinutes?: number; // إجمالي الدقائق المسجلة
  isTimerRunning?: boolean; // هل المؤقت يعمل حالياً
  isTimerPaused?: boolean; // هل المؤقت متوقف مؤقتاً (Pause)
  timerStartedAt?: number; // timestamp بدء المؤقت
  timerLastResumedAt?: number; // timestamp آخر مرة استؤنف فيها المؤقت
  timerAccumulatedMs?: number; // إجمالي الميلي ثانية الفعلية المتراكمة بدون فترات التوقف
  timeLogs: TimeLogEntry[]; // سجل فترات عمل التيم (من يوم كذا لكذا)
  relatedTo?: {
    type: 'deal' | 'lead' | 'client';
    id: string;
    name: string;
  };
  subtasks: SubTask[];
  mentionedUserIds?: string[]; // أعضاء الفريق المعنيين بالمنشن في المهمة وعنوانها
  comments?: TaskComment[]; // تعليقات ومنشنات الفريق على المهمة
  isPrivate?: boolean; // مهمة سرية خاصة بالمدير فقط - لا تظهر لأي موظف في التيم
  createdAt: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  mentionedUserIds: string[]; // منشن أعضاء الفريق المعنيين
}

export type AccessLevel = 'admin' | 'manager' | 'member' | 'viewer';

export interface SocialAccounts {
  linkedin?: string;
  slack?: string;
  github?: string;
  whatsapp?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  employeeCode: string; // كود الموظف التعريفي e.g. SM-001
  role: string;
  department: 'المبيعات' | 'التطوير والتقنية' | 'التسويق' | 'خدمة العملاء' | 'الإدارة المالية' | 'الموارد البشرية';
  email: string; // البريد الرسمي
  secondaryEmail?: string; // بريد بديل
  phone: string; // رقم الهاتف
  whatsappNumber?: string; // رقم الواتساب
  username: string; // يوزر الدخول للنظام
  password: string; // باسورد الدخول
  accessLevel: AccessLevel; // مستوى الصلاحيات والاكسيس
  allowedTabs?: string[]; // الأقسام المسموح له بالوصول إليها
  isAccountActive: boolean; // حالة تفعيل الحساب
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  joinedDate: string; // تاريخ البداية في الشركة
  salary?: number; // المرتب الشهري الأساسي
  salaryCurrency?: string; // العملة e.g. "ر.س" | "ج.م" | "$"
  allowances?: number; // بدلات ومكافآت
  contractType?: 'دوام كامل' | 'دوام جزئي' | 'عقد فريلانس' | 'استشاري' | 'عقد استشاري';
  workingHours?: string; // ساعات العمل
  bankIban?: string; // الحساب البنكي
  bio?: string;
  socialAccounts?: SocialAccounts; // اكونتات التواصل والعمل
}

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface EmailMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  recipientEmails: string[];
  recipientNames: string[];
  subject: string;
  body: string;
  date: string;
  time: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  isRead: boolean;
  isStarred: boolean;
  attachments?: EmailAttachment[];
  tag?: 'عاجل' | 'عملاء' | 'داخلي' | 'تقارير';
}

export interface LeadNegotiationEntry {
  id: string;
  date: string;
  type: string; // 'مكالمة هاتفية' | 'محادثة واتساب' | 'اجتماع زوم' | 'جلسة تفاوض' | 'عرض سعر' | 'أخرى'
  summary: string;
  offeredPrice?: number;
  finalPrice?: number;
  currency?: string;
  outcome?: string; // 'موافقة مبدئية' | 'طلب تخفيض' | 'متردد' | 'تم الاتفاق' | 'مرفوض'
  authorName?: string;
  authorId?: string;
  createdAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  status: 'جديد' | 'تم التواصل' | 'مهتم' | 'مؤهل' | 'غير مؤهل' | 'صفقة ناجحة (Won)';
  source: string;
  customSource?: string; // مصدر آخر مخصص تم إدخاله
  leadScore: number;
  assignedToId: string;
  assignedTeamMemberIds?: string[]; // موظفو المبيعات المصرح لهم برؤية ومتابعة هذا العميل
  estimatedValue: number;
  currency?: string; // e.g. "ج.م" (الجنيه المصري) أو "ر.س" أو "$"
  finalPrice?: number; // السعر النهائي المتفق عليه
  detailedDescription?: string; // وصف تفصيلي للعميل المحتمل واحتياجاته
  negotiationsHistory?: string; // ملخص المفاوضات
  negotiationEntries?: LeadNegotiationEntry[]; // سجل التفاوضات وجولاتها
  notes?: string;
  followUpDate?: string; // تاريخ متابعة العميل القادمة (YYYY-MM-DD)
  followUpTime?: string; // وقت المتابعة المحدد (HH:mm)
  followUpNotes?: string; // ملاحظات وتوجيهات متابعة العميل
  sheetUrl?: string; // رابط شيت العميل أو ملف إكسيل / جوجل شيت
  sheetTitle?: string; // عنوان الشيت (e.g. "شيت بيانات ومكالمات العميل")
  folderFiles?: ClientFileDocument[]; // ملفات وشيتات مرفقة بمجلد العميل المحتمل
  createdAt: string;
  isConvertedToClient?: boolean; // هل تم تحويله ونقله لباقي التيم كعميل رسمي
  convertedClientId?: string; // معرف العميل بعد التحويل
  convertedAt?: string;
}

export type DealStage = 'مؤهل' | 'عرض سعر' | 'تفاوض' | 'مغلقة ناجحة' | 'ملغاة';

export interface Deal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  assignedToId: string;
  createdAt: string;
  notes?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: 'Google Meet' | 'Zoom' | 'مقر الشركة' | 'مكالمة هاتفية';
  meetingLink?: string;
  attendees: string[]; // Member IDs
  clientName?: string;
  notes?: string;
  status: 'قادم' | 'مكتمل' | 'ملغي';
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'deal' | 'email' | 'lead' | 'meeting' | 'team';
  title: string;
  description: string;
  timestamp: string;
  userName: string;
  userAvatar: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'task_deadline' | 'email' | 'deal_won' | 'lead' | 'system' | 'task_mention' | 'renewal_alert' | 'daily_digest';
  isRead: boolean;
  linkTab?: string;
  taskId?: string;
  senderName?: string;
  senderAvatar?: string;
  mentionedUserId?: string;
  recipientUserId?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  description: string;
  folder: string;
  lastAccessed: string;
  createdBy: string;
  isStarred?: boolean;
  fileType?: 'pdf' | 'sheet' | 'system'; // نوع التقرير: ملف PDF، شيت إكسيل/CSV، أو تقرير نظام تلقائي
  fileUrl?: string; // رابط أو ملف التقرير (Base64 أو URL)
  fileName?: string; // اسم الملف الأصلي (e.g. "تقرير_المبيعات_الشهري.pdf")
  fileSize?: string; // حجم الملف (e.g. "2.4 MB")
  sheetLink?: string; // رابط جوجل شيت المباشر (Google Sheets)
}

export interface BrandConfig {
  brandName: string; // e.g. "SWIFTMYND"
  brandSubtitle: string; // e.g. "منظومة إدارة المهام وتتبع الإنتاجية"
  brandBadge: string; // e.g. "CRM Cloud" or "سويفت"
  logoType: 'default' | 'custom_image';
  logoDisplayMode?: 'icon_and_text' | 'full_image_only'; // وضع عرض الشعار: كامل بصورة الشعار أم رمز بجانب النص
  customLogoUrl?: string; // base64 or URL
  customFaviconUrl?: string; // Favicon icon URL or base64
  customLogoHeight?: number; // ارتفاع اللوجو بالبكسل (24px - 64px)
  primaryColor?: string; // e.g. "#0284c7"
  secondaryColor?: string; // e.g. "#1e3a8a"
  accentColor?: string; // e.g. "#f59e0b"
  sidebarTheme?: 'dark' | 'midnight' | 'slate' | 'brand_tint';
  systemCurrency?: string; // e.g. "ر.س"
  adminPin?: string; // رمز أمان الأدمن لمنع دخول الموظفين (الافتراضي 8899)
  updatedAt?: string;
}

// Marketing Board & Planner (بورد ومخطط الماركيتنج لادمن)
export interface MarketingCardLabel {
  id: string;
  name: string;
  color: string;
}

export interface MarketingCard {
  id: string;
  title: string;
  description?: string;
  coverImage?: string; // Banner or image preview (like Zaher.ai in screenshot)
  linkUrl?: string; // URL link (like prepostseo.com)
  linkLabel?: string;
  labels?: MarketingCardLabel[];
  checklist?: { id: string; text: string; done: boolean }[];
  dueDate?: string; // YYYY-MM-DD
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: string;
}

export interface MarketingList {
  id: string;
  title: string;
  cards: MarketingCard[];
}

export interface MarketingBoard {
  id: string;
  title: string;
  description?: string;
  lists: MarketingList[];
  createdAt: string;
}

// مستندات وملفات مجلد العميل (Client Folder Files & Documents)
export interface ClientFileDocument {
  id: string;
  name: string;
  category: 'عقد' | 'فاتورة' | 'بريف فني' | 'عرض سعر' | 'ملفات تصميم' | 'أخرى';
  size: string;
  type: string;
  url?: string;
  uploadedAt: string;
  uploadedBy?: string;
  // صلاحية الظهور للموظفين: معرّفات الموظفين المصرح لهم برؤية هذا الملف (فارغة أو غير محددة = متاح لجميع موظفي هذا العميل)
  allowedTeamMemberIds?: string[];
}

// ملاحظات وسجل متابعة العميل
export interface ClientDossierNote {
  id: string;
  text: string;
  authorName: string;
  date: string;
}

// شيتات جوجل المتعددة للعميل
export interface ClientGoogleSheet {
  id: string;
  title: string;
  url: string;
}

// Client Renewals Tracker (مواعيد تجديد اشتراكات العملاء والتنبيهات بـ 4 أيام)
export type RenewalStatus = 'active' | 'renewing_soon' | 'overdue' | 'renewed' | 'cancelled' | 'suspended';

export interface ClientRenewal {
  id: string;
  clientName: string;
  company: string;
  projectDescription?: string; // وصف المشروع ومتطلبات العمل والملفات
  phone: string;
  whatsappNumber: string;
  email?: string;
  serviceName: string; // e.g. "استضافة وسيرفرات 2 دومين", "باقة سيو وذكاء اصطناعي GEO", "نظام CRM وسيلز"
  planCycle: 'شهري' | 'ربع سنوي' | 'نصف سنوي' | 'سنوي';
  amount: number;
  currency: string; // e.g. "ر.س", "د.ك", "$"
  renewalDate: string; // YYYY-MM-DD
  startDate?: string; // تاريخ بدء التعاقد / تاريخ البداية
  status: RenewalStatus;
  firstSubscribedAt?: string; // تاريخ وساعة أول اشتراك (e.g. "2024-01-10 14:00")
  totalRenewalsCount?: number; // عدد مرات التجديد
  lastPaymentDate?: string;
  notes?: string;
  managedBy?: string;
  // تفاصيل إيقاف العقد (السبب والتاريخ والتصنيف)
  suspensionReason?: string; // سبب إيقاف العقد والاشتراك (السبب يكون مسجل ومحفوظ)
  suspendedAt?: string; // تاريخ إيقاف العقد
  suspensionCategory?: 'financial' | 'client_request' | 'technical' | 'restructuring' | 'project_done' | 'other';
  suspensionNotes?: string; // تفاصيل إضافية وملاحظات المتابعة لسبب الإيقاف
  expectedResumeDate?: string; // تاريخ العودة المتوقع
  suspendedBy?: string; // الشخص الذي قام بالإيقاف
  sheetUrl?: string; // رابط شيت جوجل (Google Sheet) لسهولة وصول التيم للملف والبيانات
  sheetTitle?: string; // عنوان الشيت مثلاً "شيت متابعة الحملات والعميل"
  googleSheets?: ClientGoogleSheet[]; // شيتات جوجل المتعددة للعميل (+ إضافة أكثر من شيت)
  driveFolderUrl?: string; // رابط مجلد جوجل درايف للعميل
  contractNumber?: string; // رقم العقد
  clientDocuments?: { id: string; name: string; type: string; url: string; date: string }[];
  createdAt: string;
  swiftRequests?: string[]; // طلبات سويفت الخاصة بالحساب
  renewalHistory?: {
    id: string;
    date: string;
    cycle: string;
    amount: number;
    receiptNumber: string;
    note: string;
  }[];
  // NEW: فريق العمل المصرح لهم برؤية ومتابعة العميل (وكله بيظهر للادمن)
  assignedTeamMemberIds?: string[];
  // NEW: منشن فريق العمل لمتابعة العميل وملفاته
  mentionedTeamMemberIds?: string[];
  // NEW: مجلد الملفات والمستندات الخاص بالعميل
  folderFiles?: ClientFileDocument[];
  // NEW: سجل الملاحظات والتعاملات
  clientNotes?: ClientDossierNote[];
  // NEW: مرحلة التهيئة والتسليم من السيلز للتيم
  onboardingStage?: 'استلام من السيلز' | 'قيد التهيئة والتنفيذ' | 'تسليم ومتابعة مستمرة' | 'مكتمل بنجاح';
  leadSourceId?: string;
}

// تسجيلات ميتنج العملاء المهمين (VIP Google Meet Recordings)
export interface MeetingRecording {
  id: string;
  meetingTitle: string;
  clientName: string;
  company: string;
  isVipClient: boolean;
  date: string;
  time: string;
  duration: string;
  googleMeetLink: string;
  recordingUrl: string; // لينك التسجيل المباشر
  keyTakeaways: string[];
  actionItems: string[];
  hostName: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

// اسكربتات الفيديو وبنك أفكار الماركيتنج (Marketing Video Scripts & Ideas Bank)
export interface MarketingVideoScript {
  id: string;
  title: string;
  platform: 'TikTok' | 'Instagram Reels' | 'YouTube Shorts' | 'LinkedIn' | 'Facebook';
  productCategory: 'ظاهرلي جيو (GEO)' | 'ظاهرلي سوشيال ميديا' | 'سويفت سيلز' | 'كوتشنج واستشارات' | 'سيستم الشركات';
  hook: string; // أول 3 ثواني (الخطاف لجذب المشاهد)
  problem: string; // المشكلة التي يواجهها العميل
  solution: string; // الحل والقيمة التنافسية
  callToAction: string; // الدعوة لاتخاذ إجراء (CTA)
  status: 'فكرة' | 'جاهز للتصوير' | 'تم التصوير' | 'في المونتاج' | 'تم النشر';
  targetDuration: string; // e.g. "45 ثانية"
  visualNotes?: string; // إرشادات التصوير واللقطات
  tags: string[];
  createdAt: string;
}

// عروض وتنبيهات الكوتشن للعملاء
export interface CoachingAlertOffer {
  id: string;
  title: string;
  type: 'coaching_session' | 'renewal_discount' | 'bundle_offer' | 'feature_announcement';
  targetClients: string; // e.g. "عملاء باقة الجيو", "جميع عملاء التجديد"
  messageTemplate: string;
  discountPercent?: number;
  validUntil: string;
  isSent: boolean;
  createdAt: string;
}

// مركز نقل الـ 2 سيستم للهوست والـ 2 دومين وتحميل الملفات
export interface SystemMigrationConfig {
  id: string;
  systemName: 'ظاهرلي جيو' | 'ظاهرلي سوشيال ميديا' | 'سويفت مايند CRM';
  domain: string;
  subdomain?: string;
  status: 'ready' | 'transferring' | 'active' | 'dns_pending';
  fileCount: number;
  totalSizeMb: number;
  techStack: string;
  serverPort: number;
  dbName: string;
  lastBackupDate: string;
  nginxConfigSample: string;
  envConfigSample: string;
}

// Attendance & Absence Tracker (نظام الحضور والغياب والتأخيرات)
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // e.g. "09:00"
  checkOutTime?: string; // e.g. "17:00"
  lateMinutes?: number; // e.g. 45
  isExcused?: boolean; // معفي من الخصم
  notes?: string;
  createdAt?: string;
}

// Monthly Payroll & Net Salaries Sheet (كشف مسير الرواتب وصافي المستحقات)
export interface MonthlyPayrollRecord {
  id: string;
  memberId: string;
  memberName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  salaryCurrency: string;
  allowances: number;
  bonus: number;
  attendedDays: number;
  absentDays: number;
  lateMinutes: number;
  absenceDeduction: number;
  delayDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayable: number;
  paymentStatus: 'pending' | 'paid';
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

// Company Operating Expense for Profit calculation (المصروفات التشغيلية لحساب صافي الأرباح)
export interface CompanyExpense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: 'تسويق وإعلانات' | 'سيرفرات وأدوات تقنية' | 'إيجار ومقر' | 'استشارات وقانونية' | 'أخرى';
  date: string;
  notes?: string;
}
// Team Chat & Direct Messaging (دردشة وتواصل فريق العمل)
export interface ChatAttachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'file';
  url: string;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface ChatMessage {
  id: string;
  channelId?: string; // e.g. 'general', 'sales', 'tech', 'announcements'
  recipientId?: string; // 1-on-1 DM recipient user ID
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  senderDepartment?: string;
  text: string;
  timestamp: string; // ISO string
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  isPinned?: boolean;
  readBy?: string[]; // user IDs
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isPrivate?: boolean;
  department?: string;
  createdAt: string;
  createdById?: string;
}
