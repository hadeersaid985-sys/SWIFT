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
  // نظام متابعة جودة التنفيذ والتسليم
  actualCompletionDate?: string; // تاريخ التسليم الفعلي
  actualCompletionTime?: string; // وقت التسليم الفعلي
  qualityRating?: 'excellent' | 'very_good' | 'good' | 'needs_work' | 'unacceptable'; // مستوى جودة التنفيذ
  reviewOutcome?: 'approved' | 'revisions_requested' | 'under_review' | 'pending'; // نتيجة مراجعة التاسك
  revisionsCount?: number; // عدد مرات طلب التعديلات
  delayReason?: string; // سبب التأخير أو إعادة العمل
  delayResponsibleParty?: 'employee' | 'client_approval' | 'management' | 'external_info' | 'technical'; // هل التأخير بسبب الموظف أم عوامل خارجية؟
  evaluationsLinkedCount?: number; // عدد الملاحظات والتقييمات المرتبطة بهذه التاسك
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

// تاسكات الشهر ومتابعة الإنجاز لكل اكونت (Account Monthly Tasks & Deliverables)
export type AccountMonthlyTaskCategory =
  | 'محتوى وبوستات'
  | 'ريلز ومونتاج'
  | 'تصميم جرافيك'
  | 'سيو ومقالات'
  | 'إعلانات ممولة'
  | 'تقارير وتحليلات'
  | 'إداري ومتابعة'
  | 'أخرى';

export interface AccountMonthlyTask {
  id: string;
  title: string;
  month: string; // e.g. "2026-10"
  assignedToId?: string; // مع مين (معرف العضو)
  assignedToName?: string; // اسم الموظف المكلف
  assignedToRole?: string; // تخصص العضو (سيو، مصمم، كاتب محتوى...)
  category: AccountMonthlyTaskCategory;
  completed: boolean;
  completedAt?: string;
  completedByName?: string;
  dueDate: string; // موعد التسليم المحدد (قبل معاد التسليم)
  deliverableCount?: string; // عدد المخرجات (مثلاً: 12 بوست، 4 ريلز، خطة الشهر)
  notes?: string;
  createdAt: string;
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
  monthlyDeliveryDate?: string; // موعد التسليم الشهري المحدد
  status: RenewalStatus;
  firstSubscribedAt?: string; // تاريخ وساعة أول اشتراك (e.g. "2024-01-10 14:00")
  totalRenewalsCount?: number; // عدد مرات التجديد
  lastPaymentDate?: string;
  notes?: string;
  managedBy?: string; // اسم مدير الحساب
  accountManagerId?: string; // معرف الأكونت مانجر
  accountManagerName?: string; // اسم الأكونت مانجر المسند له الحساب
  monthlyTasks?: AccountMonthlyTask[]; // قائمة تاسكات الشهر المضافة للحساب (Checklist)
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

// ==================== عمولات فريق المبيعات لكل شهر منفصل ====================
export interface SalesCommissionDeal {
  id: string;
  dealId?: string;
  clientName: string;
  dealValue: number;
  currency: string;
  closedDate: string; // YYYY-MM-DD
  commissionRate: number; // e.g. 5 (%)
  commissionAmount: number; // e.g. 1500
  notes?: string;
}

export interface MonthlySalesCommissionRecord {
  id: string;
  month: string; // YYYY-MM e.g. "2026-10"
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  monthlyTarget: number; // التارجت الشهري
  achievedSales: number; // المبيعات المحققة الفعلية
  achievementRate: number; // نسبة التحقيق %
  dealsCount: number; // عدد الصفقات المغلقة
  baseCommissionRate: number; // نسبة العمولة الأساسية %
  baseCommissionAmount: number; // قيمة العمولة الأساسية
  targetBonusAmount: number; // بونص تحقيق أو تخطي التارجت
  customAdjustmentAmount: number; // مكافآت أو تسويات إضافية (+/-)
  totalCommission: number; // إجمالي العمولة المستحقة
  currency: string;
  payoutStatus: 'draft' | 'approved' | 'paid'; // مسودة / معتمد / تم الصرف
  payoutDate?: string;
  paymentMethod?: string;
  notes?: string;
  deals: SalesCommissionDeal[];
  updatedAt: string;
}

// ==================== سيستم العقود والمدفوعات وباقي دفع العملاء ====================
export interface ClientPaymentEntry {
  id: string;
  clientContractId: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentDate: string; // YYYY-MM-DD
  paymentMethod: 'تحويل بنكي' | 'فودافون كاش' | 'كاش نقدياً' | 'فيزا / بطاقة' | 'شيك بنكي' | 'أخرى';
  referenceNumber?: string; // رقم الحوالة / الإيصال
  receiptUrl?: string;
  note?: string;
  receivedBy?: string;
  createdAt: string;
}

export interface ClientFinancialContract {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  serviceTitle: string; // اسم الخدمة أو الباقة
  contractTotalValue: number; // إجمالي قيمة التعاقد
  currency: string;
  totalPaidAmount: number; // إجمالي المبالغ المدفوعة حتى الآن
  remainingBalance: number; // المتبقي على العميل (contractTotalValue - totalPaidAmount)
  contractStartDate: string; // تاريخ بدء العقد
  contractEndDate?: string; // تاريخ نهاية العقد
  nextPaymentDueDate?: string; // موعد استحقاق الدفعة القادمة
  paymentPlan: 'دفعة واحدة' | 'دفعتين' | 'أقساط شهرية' | 'اشتراك ربع سنوي' | 'أخرى';
  paymentStatus: 'خالص بالكامل' | 'متبقي مبالغ' | 'متأخر في السداد';
  phone?: string;
  whatsappNumber?: string;
  notes?: string;
  payments: ClientPaymentEntry[];
  createdAt: string;
}

// ==================== نظام الحسابات والمالية المتقدم (Advanced Financial System) ====================

// 1. حسابات الخزينة والبنوك والمحافظ
export interface FinancialAccount {
  id: string;
  name: string; // e.g. "خزنة الشركة الرئيسية (الكاش)", "البنك التجاري الدولي CIB", "فودافون كاش / إنستاباي"
  accountType: 'cash' | 'bank' | 'wallet';
  accountNumber?: string;
  currency: string; // "ج.م"
  openingBalance: number; // الرصيد الافتتاحي المعتمد
  currentBalance: number; // الرصيد الفعلي الحالي
  isDefault?: boolean;
  notes?: string;
  updatedAt?: string;
}

// 2. سجل الحركات المالية الموحد (سندات القبض والصرف، الإيرادات والمصروفات والتحويلات)
export type FinancialTransactionType = 'revenue' | 'expense' | 'transfer';
export type FinancialTransactionStatus = 'draft' | 'approved' | 'paid' | 'cancelled';

export interface FinancialTransaction {
  id: string;
  transactionNumber: string; // e.g. "TRX-2026-001", "REC-104", "PAY-205"
  type: FinancialTransactionType; // إيراد / مصروف / تحويل داخلي
  status: FinancialTransactionStatus; // مسودة / معتمدة / مدفوعة / ملغاة
  category: string; // تصنيف الحركة (مرتبات، إيجار، إيراد عميل، تسويق، سيرفرات...)
  chartAccountCode?: string; // رمز الحساب في دليل الحسابات
  amount: number; // المبلغ بالجنيه المصري
  currency: string; // "ج.م"
  date: string; // تاريخ إثبات الحركة YYYY-MM-DD
  dueDate?: string; // تاريخ الاستحقاق
  paidAt?: string; // تاريخ السداد الفعلي
  isPaid: boolean; // هل تم الصرف/التحصيل الفعلي (فصل المستحق عن المدفوع)
  fromAccountId?: string; // الخزنة أو البنك المنصرف منه
  fromAccountName?: string;
  toAccountId?: string; // الخزنة أو البنك المودع فيه
  toAccountName?: string;
  clientId?: string; // العميل المرتبط إن وجد
  clientName?: string;
  companyName?: string;
  employeeId?: string; // الموظف المرتبط إن وجد
  employeeName?: string;
  vendorName?: string; // المورد أو الجهة المستفيدة
  invoiceId?: string; // الفاتورة المرتبطة
  contractId?: string; // العقد المرتبط
  projectId?: string; // المشروع المرتبط
  projectTitle?: string;
  taskId?: string; // التاسك المرتبط لحساب التكلفة
  paymentMethod: 'نقدي' | 'تحويل بنكي' | 'فودافون كاش / إنستاباي' | 'شيك بنكي' | 'فيزا / بطاقة' | 'أخرى';
  voucherType?: 'receipt' | 'payment' | 'transfer' | 'journal'; // سند قبض / سند صرف / سند تحويل / قيد
  referenceNumber?: string; // رقم الإيصال أو كود الحوالة البنكية
  description: string; // البيان والشرح
  notes?: string;
  createdById: string;
  createdByName: string;
  approvedById?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// 3. الالتزامات والمصروفات المتكررة (الإيجارات والاشتراكات والمرافق)
export interface RecurringObligation {
  id: string;
  title: string; // e.g. "إيجار المقر الإداري", "سيرفرات واستضافة AWS", "اشتراكات الذكاء الاصطناعي"
  category: 'إيجار ومقر' | 'سيرفرات وأدوات تقنية' | 'اشتراكات برامج' | 'مرافق وكهرباء' | 'تسويق وإعلانات' | 'صيانة ونظافة' | 'أخرى';
  beneficiary: string; // المورد / الجهة المستفيدة / صاحب العقار
  periodicAmount: number; // القيمة الدورية بالجنيه المصري
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual'; // دورية الاستحقاق
  startDate: string;
  endDate?: string;
  nextDueDate: string; // موعد الاستحقاق القادم
  targetAccountId?: string; // الخزنة أو البنك المتوقع استخدامه للسداد
  paidThisPeriod: boolean; // هل تم سداد دورة الشهر الحالي
  paidAmountThisPeriod: number;
  lastPaidDate?: string;
  chartAccountCode?: string;
  contractFileUrl?: string;
  notes?: string;
  status: 'active' | 'paused' | 'completed';
}

// 4. دليل الحسابات (Chart of Accounts)
export type ChartAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export interface ChartAccount {
  code: string; // e.g. "101", "102", "201", "401", "501"
  name: string;
  type: ChartAccountType;
  category: 'أصول' | 'التزامات' | 'حقوق ملكية' | 'إيرادات' | 'مصروفات';
  parentCode?: string;
  balance: number;
  debitTotal: number;
  creditTotal: number;
  description?: string;
}

// 5. القيود اليومية المحاسبية المزدوجة (Double-Entry Journal)
export interface JournalEntryLine {
  accountCode: string;
  accountName: string;
  debit: number; // مدين
  credit: number; // دائن
  description?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. "JV-2026-001"
  date: string;
  description: string;
  referenceType?: 'invoice' | 'receipt' | 'payment' | 'payroll' | 'transfer' | 'manual';
  referenceId?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'draft' | 'posted';
  postedAt?: string;
  createdByName: string;
  approvedByName?: string;
  createdAt: string;
}

// 6. الفواتير والتحصيلات
export interface ClientInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-101"
  clientId: string;
  clientName: string;
  companyName: string;
  phone?: string;
  contractId?: string;
  projectId?: string;
  serviceTitle: string;
  items: ClientInvoiceItem[];
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  taxRate: number; // %
  taxAmount: number;
  totalAmount: number; // الإجمالي النهائي
  paidAmount: number; // المحصل
  remainingAmount: number; // المتبقي
  status: 'draft' | 'approved' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  payments: {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    receiptNumber?: string;
    accountId?: string;
    note?: string;
  }[];
  notes?: string;
  createdAt: string;
}

// ==================== أفكار الماركيتنج وأفكاري المكتوبة ====================
export interface MarketingIdea {
  id: string;
  title: string;
  channel: 'فيسبوك وإعلانات' | 'تيك توك وريلز' | 'إنستجرام' | 'جوجل وسيو GEO' | 'إيميل ماركتنج' | 'لينكد إن' | 'مؤتمرات وفعاليات' | 'أخرى';
  targetAudience: string; // الجمهور المستهدف
  concept: string; // فكرة المحتوى أو الحملة
  goal: 'جذب ليدز ومبيعات' | 'وعي بالعلامة التجارية' | 'إطلاق ميزة جديدة' | 'إعادة استهداف العملاء' | 'بناء ثقة';
  estimatedBudget?: number;
  currency?: string;
  status: 'فكرة جديدة' | 'قيد التجهيز والتخطيط' | 'قيد الاختبار' | 'مطبقة وناجحة' | 'مؤجلة';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface WrittenThoughtNote {
  id: string;
  title: string;
  content: string;
  category: 'تطوير الشركة' | 'استراتيجية المبيعات' | 'أفكار منتجات وتطوير' | 'كفاءة الفريق والعمل' | 'توسعات وشراكات' | 'ملاحظات سرية';
  isPinned: boolean;
  color?: string; // اللون المميز للملاحظة
  tags: string[];
  updatedAt: string;
  createdAt: string;
}

// ==================== 1. نظام تقييم أداء الموظفين (Performance Evaluations) ====================
export type EvaluationType = 'positive' | 'negative' | 'extra_work' | 'improvement';
export type EvaluationCategory = 'quality' | 'commitment' | 'teamwork' | 'initiative' | 'communication' | 'other';
export type EvaluationStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface PerformanceEvaluationRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD تاريخ الواقعة
  type: EvaluationType; // إيجابيات / سلبيات أو تقصير / شغل إضافي مميز / فرص للتحسين
  category: EvaluationCategory; // جودة الشغل، الالتزام، سرعة الإنجاز، التعاون، المبادرة
  description: string; // وصف واضح للموقف بالتفصيل
  relatedTaskId?: string; // ربط بالتاسك إن وجدت
  relatedTaskTitle?: string;
  evidenceUrl?: string; // دليل أو رابط للتاسك / المرفقات
  evidenceNote?: string;
  createdById: string; // اسم الشخص الذي سجّل الملاحظة
  createdByName: string;
  createdAt: string;
  employeeClarification?: string; // رد الموظف أو توضيحه
  employeeClarificationDate?: string;
  status: EvaluationStatus; // مسودة / بانتظار المراجعة / معتمدة / مرفوضة
  reviewedBy?: string; // اسم المسؤول عن المراجعة والاعتماد
  reviewedAt?: string;
  actionTaken?: string; // الإجراء المتخذ: شكر وتقدير، تنبيه، تدريب، مكافأة، لا إجراء
  followUpDate?: string; // موعد المتابعة إن لزم
  pointsWeight?: number; // وزن التقييم (مثلاً +5 أو -5)
  notes?: string;
}

// ==================== 2. نظام متابعة التأخيرات المنظم (Delays & Attendance Log) ====================
export type DelayRangeCategory = '1-5' | '6-15' | '16-30' | '30+';
export type DelayReasonCategory =
  | 'not_specified'
  | 'personal'
  | 'emergency'
  | 'attendance_device_issue'
  | 'traffic_commute'
  | 'work_related'
  | 'other';

export type DelayReviewStatus = 'pending' | 'reviewed' | 'excused' | 'unexcused';

export interface DelayRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  scheduledStartTime: string; // موعد بداية الدوام المحدد e.g. "09:00"
  actualArrivalTime: string; // وقت الحضور الفعلي e.g. "09:28"
  delayMinutes: number; // مدة التأخير بالدقائق (محسوبة تلقائياً)
  delayRange: DelayRangeCategory; // فئة التأخير (من 1 إلى 5، 6 إلى 15، 16 إلى 30، أكثر من 30)
  reasonCategory: DelayReasonCategory; // سبب التأخير المصنف
  reasonDetails: string; // تفاصيل العذر المقدم
  reviewStatus: DelayReviewStatus; // حالة مراجعة العذر (بانتظار المراجعة / تمت المراجعة / تم اعتماد العذر / تم رفض العذر)
  reviewedBy?: string; // اسم المسؤول عن مراجعة الحالة
  reviewedAt?: string;
  actionTaken?: string; // الإجراء المتخذ: عذر مقبول بدون جزاء، تنبيه ودي، لفت نظر، خصم معتمد بعد المراجعة
  notes?: string;
  createdAt: string;
}

// ==================== 3. نظام قواعد وسياسات الشركة (Company Rules & Policies) ====================
export type CompanyRuleCategory =
  | 'attendance'
  | 'work_quality'
  | 'task_delivery'
  | 'communication'
  | 'confidentiality'
  | 'tools_usage'
  | 'general';

export interface RuleAcknowledgment {
  employeeId: string;
  employeeName: string;
  acknowledgedAt: string; // ISO date-time
}

export interface CompanyRule {
  id: string;
  title: string; // اسم القاعدة مثل الالتزام بمواعيد العمل
  category: CompanyRuleCategory; // الحضور، جودة الشغل، تسليم التاسكات، التواصل، سرية المعلومات، أدوات الشركة
  description: string; // شرح المطلوب بشكل محدد ومفصل
  targetDepartment: string; // كل الشركة أو قسم معين
  effectiveDate: string; // تاريخ السريان (لا تطبق بأثر رجعي)
  approvedBy: string; // المسؤول عن اعتمادها
  version: string; // رقم الإصدار e.g. "v1.0"
  lastModified: string;
  documentUrl?: string; // إمكانية إرفاق مستندات توضيحية أو روابط
  violationProcedure: string; // آلية التعامل مع المخالفة وفق السياسة المعتمدة
  severityLevel: 'critical' | 'high' | 'medium' | 'guideline';
  acknowledgments: RuleAcknowledgment[]; // سجل إقرار واطلاع الموظفين على القاعدة
  createdAt: string;
}

export type ViolationReviewStatus = 'under_review' | 'confirmed' | 'excused' | 'dismissed';

export interface RuleViolationRecord {
  id: string;
  ruleId: string; // القاعدة المعنية
  ruleTitle: string;
  employeeId: string;
  employeeName: string;
  department: string;
  incidentDate: string; // تاريخ الواقعة
  description: string; // تفاصيل الواقعة
  evidence?: string; // الأدلة أو المرفقات
  employeeClarification?: string; // التوضيح أو الرد المقدم من الموظف
  reviewStatus: ViolationReviewStatus; // حالة المراجعة والاعتماد (تحت المراجعة / مخالفة مؤكدة / تم قبول التوضيح / ملغاة)
  reviewedBy?: string; // المسؤول عن المراجعة
  reviewedAt?: string;
  actionTaken?: string; // الإجراء المعتمد
  notes?: string;
  createdAt: string;
}

// ==================== 4. لوحة متابعة أداء الموظفين والتقييم الشهري (Monthly Review) ====================
export interface MonthlyPerformanceReview {
  id: string;
  month: string; // YYYY-MM e.g. "2026-10"
  employeeId: string;
  employeeName: string;
  department: string;
  
  // مؤشرات التاسكات
  totalAssignedTasks: number;
  completedTasks: number;
  tasksCompletionRate: number; // % نسبة الإنجاز
  onTimeDeliveries: number;
  onTimeDeliveryRate: number; // % نسبة التسليم في الموعد
  qualityScore: number; // متوسط الجودة من 5 نجوم أو %
  revisionsRequestedCount: number; // عدد مرات طلب التعديلات
  delayedTasksCount: number;

  // مؤشرات التأخيرات والحضور
  delaysCount: number;
  totalDelayMinutes: number;
  excusedDelaysCount: number;
  unexcusedDelaysCount: number;

  // ملاحظات الأداء
  positiveNotesCount: number;
  negativeNotesCount: number;
  extraWorkCount: number;
  improvementCount: number;
  violationsCount: number;

  // التقييم النهائي الموزون
  overallScore: number; // من 100
  overallRating: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج تحسين' | 'غير مرضٍ';

  // ملاحظات ومتابعة
  strengths: string; // نقاط القوة
  areasForImprovement: string; // الجوانب التي تحتاج إلى تحسين
  nextMonthGoals: string; // أهداف قابلة للمتابعة خلال الشهر التالي
  managerNotes: string; // ملاحظات المدير
  employeeFeedback?: string; // رد الموظف أو توضيحه
  
  status: 'draft' | 'pending_review' | 'approved';
  reviewedBy: string;
  reviewedAt?: string;
  createdAt: string;
}

