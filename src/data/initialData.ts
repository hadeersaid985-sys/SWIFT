import {
  TeamMember,
  Task,
  EmailMessage,
  Lead,
  Deal,
  Meeting,
  ActivityItem,
  AppNotification,
  ReportItem,
  MarketingBoard,
  ClientRenewal,
  MeetingRecording,
  MarketingVideoScript,
  CoachingAlertOffer,
  AttendanceRecord,
  CompanyExpense,
  MonthlySalesCommissionRecord,
  ClientFinancialContract,
  MarketingIdea,
  WrittenThoughtNote,
  PerformanceEvaluationRecord,
  DelayRecord,
  CompanyRule,
  RuleViolationRecord,
  MonthlyPerformanceReview
} from '../types/crm';

// Current logged in user is usually the primary operator
export const CURRENT_USER: TeamMember = {
  id: 'user-1',
  employeeCode: 'SM-101',
  name: 'هدير سعيد',
  role: 'مدير عام النظام والعمليات (المدير)',
  department: 'المبيعات',
  email: 'hadeer.said@swiftmynd.com',
  secondaryEmail: 'hadeer.personal@gmail.com',
  phone: '+966 50 123 4567',
  whatsappNumber: '+966 50 123 4567',
  username: 'hadeer.admin',
  password: 'Admin@Swift2026',
  accessLevel: 'admin',
  isAccountActive: true,
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  status: 'online',
  joinedDate: '2023-01-15', // تاريخ البداية في الشركة (سنتان و9 أشهر)
  salary: 18500, // المرتب الشهري الأساسي
  salaryCurrency: 'ج.م',
  allowances: 3500, // بدلات إشراف وانتقال
  contractType: 'دوام كامل',
  workingHours: '8 ساعات يومياً (من الأحد إلى الخميس)',
  bankIban: 'SA4420000001234567890123',
  bio: 'مسؤولة إدارة العمليات والمبيعات وتنسيق المهام بين فرق العمل.',
  socialAccounts: {
    linkedin: 'linkedin.com/in/hadeer-said',
    slack: '@hadeer.said',
    whatsapp: '+966501234567'
  }
};

export const INITIAL_TEAM: TeamMember[] = [
  CURRENT_USER,
  {
    id: 'user-amira',
    employeeCode: 'SM-110',
    name: 'Amira',
    role: 'account manager',
    department: 'التطوير والتقنية',
    email: 'Amira@swiftmynd.com',
    phone: '+201280075626',
    whatsappNumber: '+201280075626',
    username: 'Amira2',
    password: 'Sw!ftC4gc4i#D6T',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-03-01',
    salary: 7500,
    salaryCurrency: 'ج.م',
    allowances: 800,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA98200000088231940120'
  },
  {
    id: 'user-aya',
    employeeCode: 'SM-103',
    name: 'Aya Gaber',
    role: 'Designer',
    department: 'التطوير والتقنية',
    email: 'Aya@swiftmynd.com',
    phone: '+201556399248',
    whatsappNumber: '+201556399248',
    username: 'Aya',
    password: 'Aya@Swift00026',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-04-15',
    salary: 7000,
    salaryCurrency: 'ج.م',
    allowances: 600,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA45200000047281940121'
  },
  {
    id: 'user-eman',
    employeeCode: 'SM-104',
    name: 'Eman Ashraf',
    role: 'SEO',
    department: 'التطوير والتقنية',
    email: 'Eman@swiftmynd.com',
    phone: '201091620369',
    whatsappNumber: '201091620369',
    username: 'Eman',
    password: 'Eman@Swift27526',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-06-01',
    salary: 8200,
    salaryCurrency: 'ج.م',
    allowances: 1000,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA12200000091827461922'
  },
  {
    id: 'user-maibel',
    employeeCode: 'SM-105',
    name: 'Maibel Emad',
    role: 'Sales',
    department: 'المبيعات',
    email: 'Maibel@swiftmynd.com',
    phone: '+201210811594',
    whatsappNumber: '+201210811594',
    username: 'Maibel',
    password: 'Sw!ftH9Bk2jrwct',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-07-10',
    salary: 8000,
    salaryCurrency: 'ج.م',
    allowances: 1200,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA77200000031827461923'
  },
  {
    id: 'user-mariam',
    employeeCode: 'SM-106',
    name: 'Mariam',
    role: 'Web Developer',
    department: 'التطوير والتقنية',
    email: 'Mariam@swiftmynd.com',
    phone: '201091910719',
    whatsappNumber: '201091910719',
    username: 'Mariam',
    password: 'Sw!ft5J8U%VgqiN',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-09-01',
    salary: 7800,
    salaryCurrency: 'ج.م',
    allowances: 900,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA63200000081827461924'
  },
  {
    id: 'user-yomna',
    employeeCode: 'SM-107',
    name: 'Yomna',
    role: 'SEO',
    department: 'التطوير والتقنية',
    email: 'Yomna@swiftmynd.com',
    phone: '201026093845',
    whatsappNumber: '201026093845',
    username: 'Yomna',
    password: 'Sw!ft5d7dSfz3FE',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-10-15',
    salary: 8000,
    salaryCurrency: 'ج.م',
    allowances: 800,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA91200000021827461925'
  },
  {
    id: 'user-islam',
    employeeCode: 'SM-108',
    name: 'Islam',
    role: 'Video Editor',
    department: 'المبيعات',
    email: 'Islam@swiftmynd.com',
    phone: '201055945337',
    whatsappNumber: '201055945337',
    username: 'Islam',
    password: 'Sw!ftiHaiQ$Cka6',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2023-11-01',
    salary: 7500,
    salaryCurrency: 'ج.م',
    allowances: 700,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA84200000011827461926'
  },
  {
    id: 'user-roaa',
    employeeCode: 'SM-109',
    name: 'roaa_hetemy',
    role: 'content creator',
    department: 'التطوير والتقنية',
    email: 'roaa_hetemy@swiftmynd.com',
    phone: '201271895754',
    whatsappNumber: '201271895754',
    username: 'roaa_hetemy',
    password: 'Sw!ftzg2scMrcNA',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    joinedDate: '2024-01-10',
    salary: 6800,
    salaryCurrency: 'ج.م',
    allowances: 500,
    contractType: 'دوام كامل',
    workingHours: '8 ساعات يومياً',
    bankIban: 'SA39200000091827461927'
  }
];

// Helper to get formatted date string relative to current time
const today = new Date();
const formatDate = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-mgr-private-1',
    title: '🔒 مراجعة الحسابات وتوزيع مكافآت الربع السنوي (سري للمدير)',
    description: 'مراجعة أرباح صفقات Q3 واعتماد كشوف مكافآت الإنجاز لأعضاء الفريق والتحويلات المالية الحساسة.',
    assignedToId: 'user-1',
    priority: 'urgent',
    status: 'in_progress',
    startDate: formatDate(-1),
    dueDate: formatDate(3),
    dueTime: '14:00',
    category: 'إداري',
    estimatedHours: 5,
    totalLoggedMinutes: 120,
    isTimerRunning: false,
    isPrivate: true, // مهمة سرية خاصة بالمدير فقط
    subtasks: [
      { id: 'sub-p1', title: 'تدقيق أرباح صفقات المبيعات المغلقة', completed: true },
      { id: 'sub-p2', title: 'مراجعة نسب عمولات كريم وأحمد', completed: true },
      { id: 'sub-p3', title: 'اعتماد التحويل المالي من الحساب البنكي الرئيسي', completed: false }
    ],
    timeLogs: [],
    createdAt: formatDate(-1)
  },
  {
    id: 'task-101',
    title: 'إرسال عرض السعر النهائي والتعاقد مع @هدير_سعيد لشركة إعمار المستقبل',
    description: 'مراجعة شروط الدفع بنسبة 40% مقدم وتضمين تكلفة الدعم الفني لمدة عام وإرساله للمدير المالي للشركة.',
    assignedToId: 'user-1',
    priority: 'urgent',
    status: 'in_progress',
    startDate: formatDate(-2), // بدأ العمل من يومين
    dueDate: formatDate(0), // تسليم اليوم
    dueTime: '15:00',
    category: 'مبيعات',
    estimatedHours: 6,
    totalLoggedMinutes: 220, // 3h 40m
    isTimerRunning: true,
    timerStartedAt: Date.now() - 45 * 60 * 1000, // running for 45 mins
    relatedTo: {
      type: 'deal',
      id: 'deal-201',
      name: 'توريد نظام سحابي - إعمار المستقبل'
    },
    timeLogs: [
      {
        id: 'log-1',
        memberId: 'user-1',
        memberName: 'هدير سعيد',
        startDate: formatDate(-2),
        startTime: '10:00',
        endDate: formatDate(-2),
        endTime: '12:15',
        durationMinutes: 135,
        note: 'مراجعة بنود العقد وتعديل جداول الصيانة مع كريم الدسوقي',
        createdAt: formatDate(-2)
      },
      {
        id: 'log-2',
        memberId: 'user-1',
        memberName: 'هدير سعيد',
        startDate: formatDate(-1),
        startTime: '14:00',
        endDate: formatDate(-1),
        endTime: '15:25',
        durationMinutes: 85,
        note: 'تجهيز وثيقة الـ PDF بالختم الرقمي والتواصل مع العميل هاتفياً',
        createdAt: formatDate(-1)
      }
    ],
    subtasks: [
      { id: 'sub-1', title: 'مراجعة الملحق المالي مع كريم', completed: true },
      { id: 'sub-2', title: 'تصدير وثيقة PDF بالختم الرقمي', completed: true },
      { id: 'sub-3', title: 'إرسال البريد الإلكتروني للمدير التنفيذي للعميل', completed: false }
    ],
    comments: [
      {
        id: 'comment-101-1',
        taskId: 'task-101',
        authorId: 'user-2',
        authorName: 'أحمد الشريف',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: '@هدير_سعيد يا فندم تم تدقيق الملحق المالي وجاهز لاعتمادك النهائي لتوقيع العقد وإرساله لشركة إعمار المستقبل.',
        createdAt: '10:30 ص اليوم',
        mentionedUserIds: ['user-1']
      },
      {
        id: 'comment-101-2',
        taskId: 'task-101',
        authorId: 'user-1',
        authorName: 'هدير سعيد',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: '@أحمد_الشريف تم الاطلاع والاعتماد بنجاح، تفضل بإرسال النسخة المعتمدة ومتابعة التحويل البنكي.',
        createdAt: '11:15 ص اليوم',
        mentionedUserIds: ['user-2']
      }
    ],
    createdAt: formatDate(-2)
  },
  {
    id: 'task-102',
    title: 'مكالمة متابعة العرض مع بنك الرياض بالتنسيق مع @طارق_القحطاني',
    description: 'الرد على استفسارات الأمن السيبراني والتشفير والتأكد من توافق المعايير الحكومية.',
    assignedToId: 'user-2',
    priority: 'high',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(1), // Tomorrow
    dueTime: '11:30',
    category: 'مبيعات',
    estimatedHours: 4,
    totalLoggedMinutes: 60,
    isTimerRunning: false,
    relatedTo: {
      type: 'deal',
      id: 'deal-202',
      name: 'مشروع الربط المصرفي'
    },
    timeLogs: [
      {
        id: 'log-3',
        memberId: 'user-2',
        memberName: 'أحمد الشريف',
        startDate: formatDate(0),
        startTime: '09:00',
        endDate: formatDate(0),
        endTime: '10:00',
        durationMinutes: 60,
        note: 'مراجعة بنود الأمان مع المهندس طارق وتجهيز العرض التقديمي',
        createdAt: formatDate(0)
      }
    ],
    subtasks: [
      { id: 'sub-4', title: 'تجهيز ملف شهادات ISO وSOC2', completed: false },
      { id: 'sub-5', title: 'التنسيق مع مهندس الأمن طارق', completed: false }
    ],
    comments: [
      {
        id: 'comment-102-1',
        taskId: 'task-102',
        authorId: 'user-2',
        authorName: 'أحمد الشريف',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: '@طارق_القحطاني محتاجين تقرير شهادات التشفير والأمان قبل اجتماع بنك الرياض الرقمي غداً.',
        createdAt: '09:20 ص اليوم',
        mentionedUserIds: ['user-4']
      }
    ],
    createdAt: formatDate(-1)
  },
  {
    id: 'task-103',
    title: 'تجديد شهادات SSL ومراجعة النسخ الاحتياطية للخوادم',
    description: 'التحقق من سلامة الباك اب الأسبوعي وتجديد شهادات النطاقات عبر خادم Cloudflare.',
    assignedToId: 'user-4',
    priority: 'high',
    status: 'review',
    startDate: formatDate(-3),
    dueDate: formatDate(2),
    dueTime: '18:00',
    category: 'تقني',
    estimatedHours: 8,
    totalLoggedMinutes: 310, // 5h 10m
    isTimerRunning: false,
    timeLogs: [
      {
        id: 'log-4',
        memberId: 'user-4',
        memberName: 'طارق القحطاني',
        startDate: formatDate(-3),
        startTime: '13:00',
        endDate: formatDate(-3),
        endTime: '16:30',
        durationMinutes: 210,
        note: 'تثبيت وتجديد شهادات Wildcard SSL وفحص منافذ السيرفر',
        createdAt: formatDate(-3)
      },
      {
        id: 'log-5',
        memberId: 'user-4',
        memberName: 'طارق القحطاني',
        startDate: formatDate(-2),
        startTime: '11:00',
        endDate: formatDate(-2),
        endTime: '12:40',
        durationMinutes: 100,
        note: 'اختبار النسخ الاحتياطي التلقائي ومزامنة الـ S3 Buckets',
        createdAt: formatDate(-2)
      }
    ],
    subtasks: [
      { id: 'sub-6', title: 'فحص التشفير وحسابات DNS', completed: true },
      { id: 'sub-7', title: 'اختبار استرجاع عينة بيانات تجريبية', completed: true },
      { id: 'sub-8', title: 'توثيق سجل الصيانة في مساحة الفريق', completed: false }
    ],
    createdAt: formatDate(-3)
  },
  {
    id: 'task-104',
    title: 'إطلاق حملة لينكد إن الموجهة لمديري المشتريات بالرياض',
    description: 'توزيع ميزانية 15,000 ريال على حملات Lead Generation المباشرة واستهداف قطاع المقاولات والتجزئة.',
    assignedToId: 'user-3',
    priority: 'medium',
    status: 'in_progress',
    startDate: formatDate(-4),
    dueDate: formatDate(3),
    dueTime: '14:00',
    category: 'تسويق',
    estimatedHours: 10,
    totalLoggedMinutes: 270, // 4h 30m
    isTimerRunning: false,
    timeLogs: [
      {
        id: 'log-6',
        memberId: 'user-3',
        memberName: 'سارة المنصوري',
        startDate: formatDate(-4),
        startTime: '11:00',
        endDate: formatDate(-4),
        endTime: '13:30',
        durationMinutes: 150,
        note: 'إعداد الجمهور المستهدف وصياغة نصوص الإعلانات بالعربية',
        createdAt: formatDate(-4)
      },
      {
        id: 'log-7',
        memberId: 'user-3',
        memberName: 'سارة المنصوري',
        startDate: formatDate(-2),
        startTime: '14:30',
        endDate: formatDate(-2),
        endTime: '16:30',
        durationMinutes: 120,
        note: 'ربط استمارة العملاء المحتملين مع نظام swiftmynd',
        createdAt: formatDate(-2)
      },
      {
        id: 'log-7b',
        memberId: 'user-3',
        memberName: 'سارة المنصوري',
        startDate: formatDate(0),
        startTime: '10:15',
        endDate: formatDate(0),
        endTime: '12:45',
        durationMinutes: 150,
        note: 'تحليل أداء الحملات الإعلانية ومتابعة تكلفة النقرة CPL',
        createdAt: formatDate(0)
      }
    ],
    subtasks: [
      { id: 'sub-9', title: 'تصميم البنرات الإعلانية بالهوية العربية', completed: true },
      { id: 'sub-10', title: 'صياغة نصوص الإعلانات وتدقيقها', completed: true },
      { id: 'sub-11', title: 'ربط استمارة الـ Leads مباشرة مع swiftmynd CRM', completed: false }
    ],
    createdAt: formatDate(-4)
  },
  {
    id: 'task-105',
    title: 'مكالمة ترحيب واستبيان رضا عملاء باقة Pro الجدد',
    description: 'التواصل مع الـ 12 عميلاً الجدد الذين اشتركوا هذا الشهر لتقديم الدعم والترحيب بهم.',
    assignedToId: 'user-5',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(-1),
    dueDate: formatDate(0), // Today
    dueTime: '16:30',
    category: 'دعم',
    estimatedHours: 3,
    totalLoggedMinutes: 125,
    isTimerRunning: false,
    timeLogs: [
      {
        id: 'log-8',
        memberId: 'user-5',
        memberName: 'منى زهران',
        startDate: formatDate(-1),
        startTime: '15:00',
        endDate: formatDate(-1),
        endTime: '15:45',
        durationMinutes: 45,
        note: 'تجهيز قائمة أرقام الاتصال وقالب رسالة الترحيب عبر واتساب',
        createdAt: formatDate(-1)
      },
      {
        id: 'log-8b',
        memberId: 'user-5',
        memberName: 'منى زهران',
        startDate: formatDate(0),
        startTime: '11:00',
        endDate: formatDate(0),
        endTime: '12:20',
        durationMinutes: 80,
        note: 'مكالمة هاتفية مع 4 عملاء وتأكيد رضاهم عن استقرار السيرفرات',
        createdAt: formatDate(0)
      }
    ],
    subtasks: [
      { id: 'sub-12', title: 'تحميل قائمة العملاء الجدد', completed: true },
      { id: 'sub-13', title: 'إرسال رابط استبيان NPS عبر واتساب والبريد', completed: false }
    ],
    createdAt: formatDate(-1)
  },
  {
    id: 'task-106',
    title: 'إعداد ومطابقة الإقرارات الضريبية والفواتير الإلكترونية',
    description: 'الربط مع منصة فاتورة وهيئة الزكاة والضريبة والجمارك ومطابقة مبيعات الشهر الماضي.',
    assignedToId: 'user-6',
    priority: 'urgent',
    status: 'todo',
    startDate: formatDate(-5),
    dueDate: formatDate(-1), // Overdue!
    dueTime: '12:00',
    category: 'إداري',
    estimatedHours: 5,
    totalLoggedMinutes: 120,
    isTimerRunning: false,
    timeLogs: [
      {
        id: 'log-9',
        memberId: 'user-6',
        memberName: 'كريم الدسوقي',
        startDate: formatDate(-5),
        startTime: '10:00',
        endDate: formatDate(-5),
        endTime: '12:00',
        durationMinutes: 120,
        note: 'مطابقة قيود الفواتير مع حسابات البنوك',
        createdAt: formatDate(-5)
      }
    ],
    subtasks: [
      { id: 'sub-14', title: 'تجميع إشعارات القبض والسداد', completed: true },
      { id: 'sub-15', title: 'تدقيق الأرقام الضريبية للعملاء', completed: false }
    ],
    createdAt: formatDate(-5)
  },
  {
    id: 'task-107',
    title: 'تدريب أعضاء قسم المبيعات على ميزة التنبؤات والتحليلات',
    description: 'ورشة عمل داخلية عبر زووم لشرح كيفية تسجيل الفرص البيعية والتوقع الشهري للإيرادات.',
    assignedToId: 'user-1',
    priority: 'low',
    status: 'completed',
    startDate: formatDate(-7),
    dueDate: formatDate(-2),
    dueTime: '10:00',
    category: 'إداري',
    completedAt: formatDate(-2),
    estimatedHours: 4,
    totalLoggedMinutes: 240, // 4 hours
    isTimerRunning: false,
    timeLogs: [
      {
        id: 'log-10',
        memberId: 'user-1',
        memberName: 'هدير سعيد',
        startDate: formatDate(-7),
        startTime: '09:00',
        endDate: formatDate(-7),
        endTime: '11:00',
        durationMinutes: 120,
        note: 'تجهيز المادة التدريبية وسيناريوهات العمل',
        createdAt: formatDate(-7)
      },
      {
        id: 'log-11',
        memberId: 'user-1',
        memberName: 'هدير سعيد',
        startDate: formatDate(-2),
        startTime: '10:00',
        endDate: formatDate(-2),
        endTime: '12:00',
        durationMinutes: 120,
        note: 'تقديم الورشة المباشرة وتسجيلها ورفعها للفريق',
        createdAt: formatDate(-2)
      }
    ],
    subtasks: [
      { id: 'sub-16', title: 'تجهيز السلايدات ودليل المستخدم', completed: true },
      { id: 'sub-17', title: 'تسجيل الورشة وحفظها في درايف الفريق', completed: true }
    ],
    createdAt: formatDate(-7)
  },
  {
    id: 'task-108',
    title: 'متابعة موافقة العرض الفني والمالي مع شركة بوابة الأعمال (متأخرة)',
    description: 'التواصل العاجل مع ممثل المشتريات لإنهاء توقيع العقد وحسم الاستفسارات المعلقة.',
    assignedToId: 'user-2',
    priority: 'urgent',
    status: 'todo',
    startDate: formatDate(-3),
    dueDate: formatDate(-1), // Overdue
    dueTime: '11:00',
    category: 'مبيعات',
    estimatedHours: 4,
    totalLoggedMinutes: 45,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(-3)
  },
  {
    id: 'task-109',
    title: 'إرسال جدول تسليم المراحل والدفعات لشركة أفق السحاب',
    description: 'تجهيز جدول الـ Milestones والاتفاق على الموعد النهائي للمرحلة الأولى قبل نهاية اليوم.',
    assignedToId: 'user-2',
    priority: 'high',
    status: 'in_progress',
    startDate: formatDate(-1),
    dueDate: formatDate(0), // Today
    dueTime: '15:30',
    category: 'مبيعات',
    estimatedHours: 3,
    totalLoggedMinutes: 70,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(-1)
  },
  {
    id: 'task-110',
    title: 'مراجعة تقرير أداء إعلانات جوجل لحملة الرياض (متأخرة)',
    description: 'تحليل معدل النقرات وتكلفة الاكتساب ومطابقتها مع الميزانية المعتمدة.',
    assignedToId: 'user-3',
    priority: 'high',
    status: 'todo',
    startDate: formatDate(-4),
    dueDate: formatDate(-2), // Overdue
    dueTime: '13:00',
    category: 'تسويق',
    estimatedHours: 4,
    totalLoggedMinutes: 30,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(-4)
  },
  {
    id: 'task-111',
    title: 'إعداد ونشر التقرير الأسبوعي وتحديث لوحة الماركيتنج',
    description: 'تجميع بيانات الوصول ونسب التحويل من كافة القنوات ومشاركتها مع الإدارة اليوم.',
    assignedToId: 'user-3',
    priority: 'urgent',
    status: 'in_progress',
    startDate: formatDate(-1),
    dueDate: formatDate(0), // Today
    dueTime: '17:00',
    category: 'تسويق',
    estimatedHours: 5,
    totalLoggedMinutes: 110,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(-1)
  },
  {
    id: 'task-112',
    title: 'فحص ثغرات الحماية الدورية وتحديث شهادات خوادم الإنتاج (متأخرة)',
    description: 'إجراء الفحص الأمني للشبكة وإغلاق المنافذ غير المستخدمة وتحديث الجدار الناري.',
    assignedToId: 'user-4',
    priority: 'urgent',
    status: 'review',
    startDate: formatDate(-3),
    dueDate: formatDate(-1), // Overdue
    dueTime: '12:00',
    category: 'تقني',
    estimatedHours: 6,
    totalLoggedMinutes: 180,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(-3)
  },
  {
    id: 'task-113',
    title: 'مراقبة أداء قواعد البيانات وسرعة استجابة الـ API اليوم',
    description: 'مراجعة استعلامات SQL البطيئة وتحسين الفهارس وضمان استقرار زمن الاستجابة.',
    assignedToId: 'user-4',
    priority: 'high',
    status: 'in_progress',
    startDate: formatDate(0),
    dueDate: formatDate(0), // Today
    dueTime: '16:00',
    category: 'تقني',
    estimatedHours: 4,
    totalLoggedMinutes: 50,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(0)
  },
  {
    id: 'task-114',
    title: 'متابعة تذاكر الدعم العالقة لعملاء باقة Enterprise (متأخرة)',
    description: 'حل استفسارات التكامل وتقديم الحلول الفنية للعملاء المميزين.',
    assignedToId: 'user-5',
    priority: 'urgent',
    status: 'todo',
    startDate: formatDate(-2),
    dueDate: formatDate(-1), // Overdue
    dueTime: '14:00',
    category: 'دعم',
    estimatedHours: 4,
    totalLoggedMinutes: 60,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(-2)
  },
  {
    id: 'task-115',
    title: 'تسوية القيود البنكية ومطابقة تحويلات العملاء لليوم',
    description: 'مطابقة المبالغ المحولة بنكياً مع فواتير الاشتراكات الصادرة وتسجيل سندات القبض.',
    assignedToId: 'user-6',
    priority: 'high',
    status: 'in_progress',
    startDate: formatDate(0),
    dueDate: formatDate(0), // Today
    dueTime: '15:00',
    category: 'إداري',
    estimatedHours: 3,
    totalLoggedMinutes: 40,
    isTimerRunning: false,
    subtasks: [],
    timeLogs: [],
    createdAt: formatDate(0)
  },
  {
    id: 'task-1792938244638',
    title: 'رفع 3 مقالات الدرب',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-eman',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(0),
    dueTime: '18:00',
    category: 'إداري',
    estimatedHours: 2,
    timeLogs: [],
    subtasks: [],
    isPrivate: false,
    mentionedUserIds: ['user-eman'],
    comments: [
      {
        id: 'comment-1792938753743',
        taskId: 'task-1792938244638',
        authorId: 'user-1',
        authorName: 'هدير سعيد',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: '@Eman_Ashraf',
        createdAt: 'اليوم',
        mentionedUserIds: ['user-eman']
      }
    ],
    createdAt: formatDate(0)
  },
  {
    id: 'task-1792934640413',
    title: 'باك لينك ساوث كوست',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-eman',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(3),
    dueTime: '18:00',
    category: 'إداري',
    estimatedHours: 2,
    timeLogs: [],
    subtasks: [],
    isPrivate: false,
    mentionedUserIds: ['user-eman'],
    comments: [],
    createdAt: formatDate(0)
  },
  {
    id: 'task-1792934620837',
    title: 'باك لينك جودلن وابديت للمحتوي',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-eman',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(2),
    dueTime: '18:00',
    category: 'إداري',
    estimatedHours: 2,
    timeLogs: [],
    subtasks: [],
    isPrivate: false,
    mentionedUserIds: ['user-eman'],
    comments: [],
    createdAt: formatDate(0)
  },
  {
    id: 'task-1792934453877',
    title: 'رفع gx المقالات + باك لينك',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-eman',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(1),
    dueTime: '18:00',
    category: 'إداري',
    estimatedHours: 2,
    timeLogs: [],
    subtasks: [],
    isPrivate: false,
    mentionedUserIds: ['user-eman'],
    comments: [],
    createdAt: formatDate(0)
  },
  {
    id: 'task-1792934402381',
    title: 'باك لينك موقع باورتك',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-eman',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(0),
    dueTime: '18:00',
    category: 'إداري',
    estimatedHours: 2,
    timeLogs: [],
    subtasks: [],
    isPrivate: false,
    mentionedUserIds: ['user-eman'],
    comments: [],
    createdAt: formatDate(0)
  },
  {
    id: 'task-1792934381326',
    title: 'رفع 3 مقالات الدرب',
    description: 'مهمة مضافة عبر بورد وقائمة الفريق',
    assignedToId: 'user-eman',
    priority: 'medium',
    status: 'todo',
    startDate: formatDate(0),
    dueDate: formatDate(0),
    dueTime: '18:00',
    category: 'إداري',
    estimatedHours: 2,
    timeLogs: [],
    subtasks: [],
    isPrivate: false,
    mentionedUserIds: ['user-eman'],
    comments: [],
    createdAt: formatDate(0)
  }
];

export const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'mail-1',
    senderId: 'user-2',
    senderName: 'أحمد الشريف',
    senderEmail: 'ahmed.sherif@swiftmynd.com',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['hadeer.said@swiftmynd.com'],
    recipientNames: ['هدير سعيد'],
    subject: 'مستجدات صفقة شركة إعمار المستقبل - الموافقة المبدئية',
    body: `السلام عليكم أستاذة هدير،\n\nأود إبلاغك بأننا تلقينا رداً إيجابياً جداً من المهندس سلطان بخصوص العرض المالي المعدل.\nطلبوا فقط تعديل بند الصيانة الدورية لتكون ربع سنوية بدلاً من نصف سنوية.\n\nقمت بتحديث بيانات الصفقة على النظام وتجهيز العقد لترسليه اليوم.\n\nتحياتي وتقديري،\nأحمد الشريف`,
    date: formatDate(0),
    time: '09:42 ص',
    folder: 'inbox',
    isRead: false,
    isStarred: true,
    tag: 'عاجل',
    attachments: [
      { name: 'مسودة_عقد_إعمار_المستقبل_v3.pdf', size: '2.4 MB', type: 'application/pdf' },
      { name: 'جدول_الدفعات_المقترحة.xlsx', size: '420 KB', type: 'application/vnd.ms-excel' }
    ]
  },
  {
    id: 'mail-2',
    senderId: 'user-3',
    senderName: 'سارة المنصوري',
    senderEmail: 'sara.almansoori@swiftmynd.com',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['hadeer.said@swiftmynd.com', 'team@swiftmynd.com'],
    recipientNames: ['فريق العمل'],
    subject: 'تقرير نتائج حملة الربع الحالي - زيادة العملاء المحتملين بنسبة 35%',
    body: `مرحباً بالجميع،\n\nيسرني مشاركتكم التقرير الأسبوعي لحملات المبيعات عبر منصات التواصل والإعلانات الرقمية.\nاستقبلنا حتى اليوم 84 عميلاً محتملاً جديداً ومؤهلاً، وتم توزيعهم تلقائياً على مندوبي المبيعات حسب المنطقة الجغرافية.\n\nبرجاء سرعة التواصل مع العملاء خلال الـ 24 ساعة الأولى لتحقيق أفضل نسبة إغلاق.\n\nدمتم بود،\nسارة`,
    date: formatDate(-1),
    time: '03:15 م',
    folder: 'inbox',
    isRead: true,
    isStarred: false,
    tag: 'تقارير',
    attachments: [
      { name: 'تحليلات_الحملة_التسويقية.pdf', size: '4.8 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'mail-3',
    senderId: 'user-4',
    senderName: 'طارق القحطاني',
    senderEmail: 'tariq.qahtani@swiftmynd.com',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['hadeer.said@swiftmynd.com'],
    recipientNames: ['هدير سعيد'],
    subject: 'اكتمال ربط نظام واتساب للأعمال وWebhooks في نظام CRM',
    body: `أهلاً هدير،\n\nتم الانتهاء بنجاح من إعداد مزود رسائل واتساب Cloud API، الآن أصبح بإمكان المبيعات إرسال رسائل فورية وتنبيهات المهام للعملاء بنقرة واحدة من شاشة العميل.\n\nتم تجربة الإرسال وتأكيد وصول الإشعارات الفورية.\n\nخالص الود،\nطارق`,
    date: formatDate(-2),
    time: '11:20 ص',
    folder: 'inbox',
    isRead: true,
    isStarred: true,
    tag: 'داخلي'
  },
  {
    id: 'mail-4',
    senderId: 'user-1',
    senderName: 'هدير سعيد',
    senderEmail: 'hadeer.said@swiftmynd.com',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['ahmed.sherif@swiftmynd.com'],
    recipientNames: ['أحمد الشريف'],
    subject: 'توجيهات بخصوص زيارة وفد شركة نيو هورايزون القابضة',
    body: `أحمد العزيز،\n\nيرجى تأكيد تجهيز القاعة الرئيسية مع شاشات العرض التفاعلية يوم الخميس القادم الساعة العاشرة صباحاً.\nأرفقت لك العرض التقديمي المخصص لقطاع المقاولات لتدقيقه.\n\nشكراً لجهودك،\nهدير`,
    date: formatDate(-1),
    time: '01:40 م',
    folder: 'sent',
    isRead: true,
    isStarred: false,
    tag: 'داخلي',
    attachments: [
      { name: 'عرض_تقديمي_مؤسسي_2026.pptx', size: '8.2 MB', type: 'application/vnd.ms-powerpoint' }
    ]
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-301',
    name: 'سلطان بن عبدالعزيز',
    company: 'مجموعة المدى للاستثمار والتطوير',
    title: 'مدير العمليات وسلاسل الإمداد',
    email: 'sultan@maddagroup.sa',
    phone: '+966 50 443 2190',
    status: 'مهتم',
    source: 'لينكد إن',
    leadScore: 88,
    assignedToId: 'user-maibel',
    assignedTeamMemberIds: ['user-maibel'], // محدد لمسؤولة المبيعات مايبل Maibel
    estimatedValue: 180000,
    finalPrice: 165000,
    currency: 'ج.م',
    detailedDescription: 'شركة تطوير عقاري وسلاسل إمداد كبرى تبحث عن أتمتة لجميع فروعهم مع ربط نظام المهام والمتابعة اللوجستية وتتبع دقيق للمواعيد.',
    negotiationsHistory: '[2026-10-25 - اجتماع زوم]: تم تقديم عرض سعر مبدئي بقيمة 180,000 ج.م، وطلب العميل خصماً للتعاقد السنوي، وتم الاتفاق المبدئي على 165,000 ج.م شامل الدعم الفني.',
    negotiationEntries: [
      {
        id: 'neg-1',
        date: '2026-10-25',
        type: 'اجتماع زوم',
        summary: 'مناقشة خطة الربط والدعم الفني وطلب تخفيض السعر للدفعة الأولى',
        offeredPrice: 180000,
        finalPrice: 165000,
        currency: 'ج.م',
        outcome: 'موافقة مبدئية',
        authorName: 'Maibel Emad'
      }
    ],
    notes: 'يبحثون عن أتمتة لجميع فروعهم الـ 14 مع تتبع فوري لمواعيد التسليم.',
    followUpDate: formatDate(0), // موعد المتابعة اليوم! 🔔
    followUpTime: '13:00',
    followUpNotes: 'الاتصال الهاتفي النهائي لمناقشة تعديل شروط الدفع وتوقيع العقد المبدئي.',
    createdAt: formatDate(-3)
  },
  {
    id: 'lead-302',
    name: 'فاطمة الزهراء النجار',
    company: 'شركة النور للحلول الطبية',
    title: 'المدير التنفيذي',
    email: 'fatima@alnoormed.com',
    phone: '+20 122 334 5566',
    status: 'جديد',
    source: 'الموقع الإلكتروني',
    leadScore: 92,
    assignedToId: 'user-1',
    assignedTeamMemberIds: ['user-1'], // للأدمن فقط (لا تظهر لمايبل)
    estimatedValue: 95000,
    finalPrice: 90000,
    currency: 'ج.م',
    detailedDescription: 'سلسلة عيادات ومراكز طبية تحتاج لربط برامج العيادات مع نظام إدارة مهام الأطباء ومواعيد الزيارات وسيرفرات سحابية خاصة.',
    negotiationsHistory: '[2026-10-27 - اتصال هاتفي]: تم التحدث مع المديرة التنفيذية وعرض حلول الربط المخصصة، وبانتظار موافقة مجلس الإدارة على السعر النهائي 90,000 ج.م.',
    negotiationEntries: [
      {
        id: 'neg-2',
        date: '2026-10-27',
        type: 'اتصال هاتفي',
        summary: 'مكالمة تمهيدية وتحديد الميزانية الطبية ونطاق العمل',
        offeredPrice: 95000,
        finalPrice: 90000,
        currency: 'ج.م',
        outcome: 'متردد',
        authorName: 'هدير سعيد'
      }
    ],
    notes: 'تحتاج لربط برامج العيادات مع نظام إدارة مهام الأطباء ومواعيد الزيارات.',
    followUpDate: formatDate(0), // موعد المتابعة اليوم!
    followUpTime: '15:30',
    followUpNotes: 'متابعة قرار مجلس الإدارة ومناقشة تفاصيل الربط التقني.',
    createdAt: formatDate(0)
  },
  {
    id: 'lead-303',
    name: 'ماجد الشمري',
    company: 'أبراج نجد للمقاولات العامة',
    title: 'مدير المشتريات والعقود',
    email: 'm.shammari@najdtowers.sa',
    phone: '+966 56 778 9911',
    status: 'تم التواصل',
    source: 'إعلان ممول',
    leadScore: 65,
    assignedToId: 'user-maibel',
    assignedTeamMemberIds: ['user-maibel'], // محدد لمايبل Maibel
    estimatedValue: 240000,
    finalPrice: 220000,
    currency: 'ج.م',
    detailedDescription: 'مؤسسة مقاولات تطلب نظام إدارة عقود ومتابعة المهام الميدانية للمهندسين والمشرفين وربط واتساب فوري.',
    negotiationsHistory: '[2026-10-26 - محادثة واتساب]: أرسلنا بروشور المنظومة، وطلب إعادة الاتصال بعد دراسة الميزانية السنوية الجديدة للشركة.',
    negotiationEntries: [
      {
        id: 'neg-3',
        date: '2026-10-26',
        type: 'محادثة واتساب',
        summary: 'إرسال عروض الأسعار والبروفايل التعريفي وطلب تحديد جلسة ديمو',
        offeredPrice: 240000,
        finalPrice: 220000,
        currency: 'ج.م',
        outcome: 'طلب تخفيض',
        authorName: 'Maibel Emad'
      }
    ],
    notes: 'طلب إعادة الاتصال بعد دراسة الميزانية السنوية الجديدة للشركة.',
    followUpDate: formatDate(1), // غداً
    followUpTime: '11:00',
    followUpNotes: 'مكالمة هاتفية للمتابعة بعد مراجعة الإدارة المالية للميزانية.',
    createdAt: formatDate(-2)
  },
  {
    id: 'lead-304',
    name: 'خالد الهاشمي',
    company: 'شركة الخليج للخدمات اللوجستية',
    title: 'رئيس قسم تكنولوجيا المعلومات',
    email: 'k.hashemi@gulflogistics.ae',
    phone: '+971 52 334 8877',
    status: 'مؤهل',
    source: 'مؤتمر',
    leadScore: 96,
    assignedToId: 'user-1',
    assignedTeamMemberIds: ['user-1'], // للأدمن فقط
    estimatedValue: 310000,
    finalPrice: 295000,
    currency: 'ج.م',
    detailedDescription: 'شركة شحن ونقل دولي ترغب في تطبيق سحابي شامل لإدارة العملاء وسيرفرات مؤمنة وربط الـ API مع أنظمة التتبع.',
    negotiationsHistory: '[2026-10-24 - جلسة تفاوض]: عقد اجتماع في المؤتمر وتقديم عرض فني متكامل، وتم الاتفاق على سعر نهائي 295,000 ج.م بانتظار مسودة العقد.',
    negotiationEntries: [
      {
        id: 'neg-4',
        date: '2026-10-24',
        type: 'جلسة تفاوض',
        summary: 'جلسة تفاوض مباشرة في المؤتمر ومناقشة الدومينات والسيرفرات',
        offeredPrice: 310000,
        finalPrice: 295000,
        currency: 'ج.م',
        outcome: 'تم الاتفاق',
        authorName: 'هدير سعيد'
      }
    ],
    notes: 'طلبوا تجربة عملية ديمو للربط مع نظام إدارة الأسطول والمخازن.',
    createdAt: formatDate(-5)
  }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-201',
    title: 'توريد وتطبيق نظام سحابي لمجموعة إعمار المستقبل',
    company: 'شركة إعمار المستقبل العقارية',
    contactName: 'م. راشد السعيد',
    contactEmail: 'rashid@future-ammar.sa',
    contactPhone: '+966 50 998 7766',
    value: 285000,
    currency: 'ج.م',
    stage: 'تفاوض',
    probability: 85,
    expectedCloseDate: formatDate(5),
    assignedToId: 'user-1',
    createdAt: formatDate(-15),
    notes: 'الصفقة في مرحلة الصياغة القانونية النهائية للعقد.'
  },
  {
    id: 'deal-202',
    title: 'تطوير بوابة الخدمات الرقمية - مصرف الرافدين الدولي',
    company: 'مصرف الرافدين الدولي',
    contactName: 'حسين البصري',
    contactEmail: 'hussain@rafidainbank.com',
    contactPhone: '+964 780 123 4567',
    value: 420000,
    currency: 'ج.م',
    stage: 'عرض سعر',
    probability: 60,
    expectedCloseDate: formatDate(12),
    assignedToId: 'user-2',
    createdAt: formatDate(-10),
    notes: 'العرض يشمل التخصيص والأمان العالي وربط الفروع المصرفية.'
  },
  {
    id: 'deal-203',
    title: 'ترخيص رخص سنوية وإدارة مهام فريق الدعم لـ تكنو سنتر',
    company: 'مركز التقنية المتقدمة',
    contactName: 'نورا الشايع',
    contactEmail: 'noura@technocenter.com',
    contactPhone: '+966 54 221 3344',
    value: 120000,
    currency: 'ج.م',
    stage: 'مؤهل',
    probability: 40,
    expectedCloseDate: formatDate(20),
    assignedToId: 'user-3',
    createdAt: formatDate(-4),
    notes: 'تم تقديم العرض الأولي والمقارنة مع الحلول المنافسة.'
  },
  {
    id: 'deal-204',
    title: 'مشروع الربط اللوجستي ونظام CRM متكامل - أرامكس للشحن',
    company: 'شبكة النقل السريع',
    contactName: 'جمال الصالح',
    contactEmail: 'jamal@quickfreight.com',
    contactPhone: '+966 55 332 1100',
    value: 350000,
    currency: 'ج.م',
    stage: 'مغلقة ناجحة',
    probability: 100,
    expectedCloseDate: formatDate(-3),
    assignedToId: 'user-2',
    createdAt: formatDate(-30),
    notes: 'تم توقيع العقد رسمياً واستلام الدفعة الأولى بنجاح!'
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'الاجتماع الصباحي اليومي لفريق المبيعات (Daily Standup)',
    date: formatDate(0), // Today
    time: '10:00',
    duration: '20 دقيقة',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/zoh-crm-team',
    attendees: ['user-1', 'user-2', 'user-3'],
    notes: 'مراجعة أهداف اليوم، التحديات، ومتابعة التاسكات الحرجة المستحقة.',
    status: 'قادم'
  },
  {
    id: 'meet-2',
    title: 'عرض ديمو تفاعلي مباشر مع مسؤولي بنك الرياض للاستثمار',
    date: formatDate(1), // Tomorrow
    time: '12:30',
    duration: '45 دقيقة',
    location: 'Zoom',
    meetingLink: 'https://zoom.us/j/943269125',
    attendees: ['user-1', 'user-2', 'user-4'],
    clientName: 'بنك الرياض الرقمي',
    notes: 'التركيز على ميزات الأمان، سرعة الاستجابة، وتصدير التقارير الآلية.',
    status: 'قادم'
  },
  {
    id: 'meet-3',
    title: 'جلسة التخطيط المالي وتوزيع ميزانية الربع الرابع',
    date: formatDate(4),
    time: '14:00',
    duration: '60 دقيقة',
    location: 'مقر الشركة',
    attendees: ['user-1', 'user-6'],
    notes: 'مناقشة الحوافز الشهرية لفريق المبيعات ونفقات الحملات الجديدة.',
    status: 'قادم'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-mention-1',
    title: '🔔 منشن لك من أحمد الشريف في مهمة: إرسال عرض السعر النهائي والتعاقد',
    message: '@هدير_سعيد يا فندم تم تدقيق الملحق المالي وجاهز لاعتمادك النهائي لتوقيع العقد وإرساله لشركة إعمار المستقبل.',
    timestamp: 'منذ 10 دقائق',
    type: 'task_mention',
    isRead: false,
    linkTab: 'tasks'
  },
  {
    id: 'notif-mention-2',
    title: '💬 تفاعل ومنشن بين الفريق: أحمد الشريف منشن طارق القحطاني',
    message: '@طارق_القحطاني محتاجين تقرير شهادات التشفير والأمان قبل اجتماع بنك الرياض الرقمي غداً.',
    timestamp: 'منذ 25 دقيقة',
    type: 'task_mention',
    isRead: false,
    linkTab: 'tasks'
  },
  {
    id: 'notif-1',
    title: 'تنبيه موعد مهمة مستحقة اليوم!',
    message: 'مهمة "إرسال عرض السعر المعدل لشركة إعمار" مستحقة اليوم الساعة 03:00 م.',
    timestamp: 'منذ 15 دقيقة',
    type: 'task_deadline',
    isRead: false,
    linkTab: 'tasks'
  },
  {
    id: 'notif-2',
    title: 'بريد جديد من أحمد الشريف',
    message: 'مستجدات صفقة شركة إعمار المستقبل - تلقي موافقة مبدئية.',
    timestamp: 'منذ 40 دقيقة',
    type: 'email',
    isRead: false,
    linkTab: 'mail'
  },
  {
    id: 'notif-3',
    title: 'عميل محتمل جديد تم تسجيله!',
    message: 'قامت فاطمة الزهراء النجار بالتسجيل عبر الموقع بدرجة اهتمام 92%.',
    timestamp: 'منذ ساعتين',
    type: 'lead',
    isRead: false,
    linkTab: 'leads'
  },
  {
    id: 'notif-4',
    title: 'مبروك! إغلاق صفقة ناجحة بقيمة 350,000 ر.س',
    message: 'أحمد الشريف أتم صفقة شبكة النقل السريع بنجاح تام.',
    timestamp: 'أمس',
    type: 'deal_won',
    isRead: true,
    linkTab: 'deals'
  }
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'deal',
    title: 'تم نقل الصفقة إلى مرحلة التفاوض النهائي',
    description: 'صفقة "توريد نظام سحابي لمجموعة إعمار المستقبل" بقيمة 285,000 ر.س',
    timestamp: 'منذ 35 دقيقة',
    userName: 'هدير سعيد',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'act-2',
    type: 'task',
    title: 'تم تحديث حالة المهمة إلى "جاري العمل"',
    description: 'إطلاق حملة لينكد إن الموجهة لمديري المشتريات بالرياض',
    timestamp: 'منذ ساعتين',
    userName: 'سارة المنصوري',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'act-3',
    type: 'email',
    title: 'تم إرسال بريد إلكتروني جديد',
    description: 'تقرير نتائج حملة الربع الحالي لفريق العمل',
    timestamp: 'منذ 4 ساعات',
    userName: 'سارة المنصوري',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'act-4',
    type: 'lead',
    title: 'تم إضافة عميل محتمل جديد',
    description: 'فاطمة الزهراء النجار - شركة النور للحلول الطبية',
    timestamp: 'منذ 5 ساعات',
    userName: 'هدير سعيد',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    title: 'أعلى 10 قوالب حسب معدل النقر',
    description: 'أعلى 10 قوالب حسب النسبة المئوية للمستخدمين والعملاء الذين نقروا على الروابط...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'النظام الآلي'
  },
  {
    id: 'rep-2',
    title: 'أعلى 10 قوالب حسب معدل الفتح',
    description: 'أعلى 10 قوالب حسب النسبة المئوية للمستخدمين الذين فتحوا وقرأوا الرسائل...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'النظام الآلي'
  },
  {
    id: 'rep-3',
    title: 'تقرير تحليلات البريد الإلكتروني والنشاطات',
    description: 'عدد رسائل البريد الإلكتروني المرسلة والمردود عليها والنشاطات المترتبة على التواصل...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'هدير سعيد'
  },
  {
    id: 'rep-4',
    title: 'تقرير تحليلات البريد الإلكتروني والمكالمة',
    description: 'عدد رسائل البريد المرسلة والمردود عليها والمكالمات الهاتفية المرتبطة بكل عميل...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'هدير سعيد'
  },
  {
    id: 'rep-5',
    title: 'أعلى 10 مستخدمين',
    description: 'أعلى 10 مستخدمين حسب معدل البريد المرسل وسرعة الاستجابة والتواصل...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'أحمد الشريف'
  },
  {
    id: 'rep-6',
    title: 'تحليلات البريد الإلكتروني',
    description: 'ملخص، حالة البريد الإلكتروني (مرسل ومرتد ومفتوح وتم الرد)...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'النظام الآلي'
  },
  {
    id: 'rep-7',
    title: 'تقرير الارتداد',
    description: 'ملخص، رسائل البريد الإلكتروني المرتدة، وسبب الارتداد ونظافة السجلات...',
    folder: 'تقارير البريد الإلكتروني',
    lastAccessed: '-',
    createdBy: 'طارق القحطاني'
  },
  {
    id: 'rep-8',
    title: 'الاجتماعات المخططة مقابل المحققة هذا الشهر',
    description: 'اعرف عدد تسجيلات الوصول المخطط لها والتي تحققت بالفعل لفريق المبيعات...',
    folder: 'تقارير الاجتماع',
    lastAccessed: '-',
    createdBy: 'أحمد الشريف'
  },
  {
    id: 'rep-9',
    title: 'عدد تسجيلات الوصول من جانب فرد المبيعات',
    description: 'احصل على عدد تسجيلات الوصول الشهرية للعملاء لكل فرد من مسؤولي المبيعات...',
    folder: 'تقارير الاجتماع',
    lastAccessed: '-',
    createdBy: 'أحمد الشريف'
  },
  {
    id: 'rep-10',
    title: 'عدد تسجيلات الوصول حسب المكان',
    description: 'احصل على إجمالي عدد تسجيلات الوصول الشهرية مصنفة حسب الفروع والمقرات...',
    folder: 'تقارير الاجتماع',
    lastAccessed: '-',
    createdBy: 'منى زهران'
  },
  {
    id: 'rep-11',
    title: 'تسجيلات الوصول حسب المكان',
    description: 'احصل على تفاصيل تسجيل الوصول مصنفة حسب الموقع الجغرافي والمدينة...',
    folder: 'تقارير الاجتماع',
    lastAccessed: '-',
    createdBy: 'منى زهران'
  },
  {
    id: 'rep-12',
    title: 'تسجيلات الوصول للعملاء المحتملين',
    description: 'احصل على تفاصيل تسجيل الوصول لكل عميل محتمل ونسبة تحويله...',
    folder: 'تقارير الاجتماع',
    lastAccessed: '-',
    createdBy: 'سارة المنصوري'
  },
  {
    id: 'rep-13',
    title: 'تسجيلات الوصول للحسابات',
    description: 'احصل على تفاصيل تسجيل الوصول لكل حساب ومؤسسة تجارية مسجلة...',
    folder: 'تقارير الاجتماع',
    lastAccessed: '-',
    createdBy: 'كريم الدسوقي'
  },
  {
    id: 'rep-14',
    title: 'تقرير إنتاجية المهام ومواعيد الاستحقاق (Deadlines)',
    description: 'تتبع معدل الالتزام بمواعيد تسليم المهام والمهام المتأخرة والمنجزة بدقة...',
    folder: 'تقارير المهام والأنشطة',
    lastAccessed: 'اليوم',
    createdBy: 'هدير سعيد'
  },
  {
    id: 'rep-15',
    title: 'تقرير مسار صفقات المبيعات وإيرادات الربع السنوي',
    description: 'ملخص قيم الصفقات حسب المرحلة ومعدل الإغلاق وحجم الإيرادات المتوقعة...',
    folder: 'تقارير المبيعات',
    lastAccessed: 'اليوم',
    createdBy: 'هدير سعيد'
  }
];

// Initial Marketing Overview Boards (مطابقة تماماً للصورة المرفقة من تريلو مع المخطط والبلانر)
export const INITIAL_MARKETING_BOARDS: MarketingBoard[] = [
  {
    id: 'board-marketing-overview',
    title: 'Marketing Overview',
    description: 'لوحة التخطيط التسويقي الشاملة لإدارة حملات سويفت، أدوات الذكاء الاصطناعي GEO، وعملاء الكويت والمملكة',
    createdAt: '2026-10-01',
    lists: [
      {
        id: 'list-zaher-ai',
        title: 'ظاهرلي AI',
        cards: [
          {
            id: 'card-zaher-1',
            title: 'ظاهر — بنية تحتية لظهور علامتك التجارية في بحث الذكاء الاصطناعي',
            description: 'قس وحاكِ وحسّن ظهور علامتك التجارية في ChatGPT وPerplexity وGemini وMeta AI... حلول البنية التحتية لمحركات بحث الـ AI (GEO).',
            coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
            linkUrl: 'https://zaher.ai',
            linkLabel: 'zaher.ai ↗',
            labels: [
              { id: 'lbl-1', name: 'AI Search & GEO', color: '#10b981' },
              { id: 'lbl-2', name: 'سيو المحركات الذكية', color: '#3b82f6' }
            ],
            dueDate: '2026-10-25',
            assigneeName: 'هدير سعيد',
            createdAt: '2026-10-15'
          },
          {
            id: 'card-zaher-2',
            title: 'Prepostseo: Free Online SEO Tools',
            description: 'Prepostseo offers free online SEO tools and AI writing assistants such as article rewriter, plagiarism checker and backlink analysis...',
            linkUrl: 'https://www.prepostseo.com',
            linkLabel: 'prepostseo.com ↗',
            labels: [
              { id: 'lbl-3', name: 'SEO Tools', color: '#6366f1' }
            ],
            createdAt: '2026-10-16'
          }
        ]
      },
      {
        id: 'list-dream-home',
        title: 'dream home',
        cards: [
          {
            id: 'card-dream-1',
            title: 'Local Electricians in Milton Keynes | Heath Electrical Services',
            description: 'Highly experienced, qualified electricians offering domestic, commercial and emergency electrical services...',
            linkUrl: 'https://heath-electrical.co.uk',
            linkLabel: 'heath-electrical.co.uk ↗',
            labels: [
              { id: 'lbl-4', name: 'عميل أجنبي / UK', color: '#f59e0b' }
            ],
            createdAt: '2026-10-16'
          }
        ]
      },
      {
        id: 'list-kuwait',
        title: 'الكويت',
        cards: [
          {
            id: 'card-kuwait-1',
            title: 'رسالة التواصل والاستقطاب لعملاء الكويت (GEO + AI Search)',
            description: 'السلام عليكم ورحمه الله وبركاته حياك الله 🌸\nهل عميلك في الكويت لما يبحث عن خدمتك... يوصلك أنت، ولا يروح لمنافسك؟ 👀\nاليوم العميل ما يعتمد على Google فقط، كثير صار يبحث ويسأل أدوات الذكاء الاصطناعي مثل ChatGPT عن أفضل الخيارات. وهذا بالضبط دور SEO + GEO + نخلي نشاطك يظهر في المكان اللي عميلك يبحث فيه، ونزيد زيارات، استفسارات وعملاء.\nعندنا عرض خاص حالياً، ونقدر نرسل لك تحليل سريع لموقعك يوضح فرص الظهور عندك + تفاصيل العرض. إذا حاب، أرسله لك هنا 👌',
            labels: [
              { id: 'lbl-5', name: 'الكويت 🇰🇼', color: '#ec4899' },
              { id: 'lbl-6', name: 'استقطاب ومبيعات', color: '#8b5cf6' }
            ],
            dueDate: '2026-10-24',
            assigneeName: 'هدير سعيد',
            createdAt: '2026-10-18'
          }
        ]
      },
      {
        id: 'list-swift-products',
        title: 'منتجات سويفت',
        cards: [
          {
            id: 'card-swift-1',
            title: 'البلاجنز والربط البرمجي السريع',
            description: 'مكتبة إضافات الربط والتكامل المباشر مع المنظومات والـ API الخارجية.',
            labels: [{ id: 'lbl-7', name: 'سويفت', color: '#0ea5e9' }],
            createdAt: '2026-10-18'
          },
          {
            id: 'card-swift-2',
            title: 'سيستم السيلز وإدارة الصفقات والعملاء المحتملين',
            description: 'مسار المبيعات التفاعلي، متابعة نسب الإغلاق وقيم العقود وتنبيهات الاتصال.',
            labels: [{ id: 'lbl-8', name: 'سيلز', color: '#10b981' }],
            createdAt: '2026-10-18'
          },
          {
            id: 'card-swift-3',
            title: 'سيستم CRM لتنظيم العمل والتاسكات بين التيم',
            description: 'المنظومة الشاملة لتوزيع المهام، تسجيل أوقات العمل الفعلية وحساب ساعات التيم بدقة.',
            labels: [{ id: 'lbl-9', name: 'CRM', color: '#3b82f6' }],
            createdAt: '2026-10-18'
          },
          {
            id: 'card-swift-4',
            title: 'نقل 2 سيستم للهوست و2 دومين ورفع الملفات بالكامل',
            description: 'نقل ملفات الشغل بالكامل إلى استضافة سويفت مع ربط الدومينين وتأمين شهادات SSL ومزامنة النسخ الاحتياطية.',
            labels: [{ id: 'lbl-10', name: 'هوست ودومينات', color: '#f43f5e' }],
            dueDate: '2026-10-22',
            createdAt: '2026-10-19'
          }
        ]
      },
      {
        id: 'list-black-friday',
        title: 'افكار البلاك فرايدى',
        cards: [
          {
            id: 'card-bf-1',
            title: 'عروض وتخفيضات البلاك فرايدي (باقات سويفت وظاهرلي جيو)',
            description: 'خطة إعلانات وحملات البلاك فرايدي مع خصم 30% للاشتراكات السنوية وعروض التجديد للعملاء.',
            labels: [{ id: 'lbl-bf-1', name: 'بلاك فرايدي 🔥', color: '#f43f5e' }],
            dueDate: '2026-11-20',
            createdAt: '2026-10-20'
          }
        ]
      },
      {
        id: 'list-system-proposals',
        title: 'اقتراحات السيستم',
        cards: [
          {
            id: 'card-prop-user-1',
            title: 'ممكن تعمل الاعادادت تحت فيها تعديل اللوجو والاسم واعدادات السيستم الوان ولوجو FZVICON',
            description: 'ويكون سكشن خاص بعاداتا السيستم اسمه والالوان وكل حاجة\nلما يتتنقل الي حساب موظف المهام بتاعته يبقي حساب منفصل عن المدير ميقدرش فوق يدخل لحساب الادمن كل الكونت منفصل محدش يقدر يشوف شغل التاني ولا اكيس التاني الموظف بعيد تماما عن\nلما تعدل عدل علي اخر نسخه بتاعتي متحذفش اي داتا او اي شغل او اي تعديل',
            labels: [
              { id: 'lbl-prop-1', name: 'اقتراحات السيستم ⚙️', color: '#8b5cf6' },
              { id: 'lbl-prop-2', name: 'هيكل وعزل الموظفين 🔒', color: '#0ea5e9' }
            ],
            dueDate: '2026-10-25',
            assigneeName: 'هدير سعيد',
            createdAt: '2026-10-21'
          }
        ]
      }
    ]
  },
  {
    id: 'board-social-media',
    title: 'سوشيال ميديا وحملات المحتوى',
    description: 'جدولة البوستات وفيديوهات الريلز ومتابعة تفاعل الجمهور على منصات التواصل',
    createdAt: '2026-10-05',
    lists: [
      {
        id: 'list-soc-ideas',
        title: 'أفكار محتوى قادمة',
        cards: [
          {
            id: 'card-soc-1',
            title: 'فيديو ريلز: كيف تظهر شركتك أول نتيجة في ChatGPT بدلاً من جوجل؟',
            description: 'شرح مبسط لمفهوم Generative Engine Optimization وطرق استهداف محركات الذكاء الاصطناعي.',
            createdAt: '2026-10-17'
          }
        ]
      },
      {
        id: 'list-soc-design',
        title: 'قيد التصميم والمونتاج',
        cards: [
          {
            id: 'card-soc-2',
            title: 'كاروسيل إنفوجرافيك: مقارنة أداء السيرفرات السحابية وسرعة تحميل المتاجر',
            description: 'تصميم يعرض مزايا استضافة سويفت ودعمها لـ 2 دومين وسرعة الاستجابة.',
            createdAt: '2026-10-18'
          }
        ]
      },
      {
        id: 'list-soc-published',
        title: 'تم النشر وتأكيد الحملة ✅',
        cards: [
          {
            id: 'card-soc-3',
            title: 'إعلان حملة عملاء الكويت لخدمات SEO وGEO المتقدمة',
            description: 'تم النشر وتحقيق 12,000 مشاهدة و45 استفسار مباشر.',
            createdAt: '2026-10-15'
          }
        ]
      }
    ]
  }
];

// Initial Client Renewals (مواعيد وتفاصيل كل اكونت من ساعات اشترك وجدد معانا والتنبيهات بـ 4 أيام - للأدمن فقط)
export const INITIAL_CLIENT_RENEWALS: ClientRenewal[] = [
  {
    "clientName": "عمر",
    "company": "الدرب",
    "projectDescription": "",
    "phone": "",
    "whatsappNumber": "",
    "email": "",
    "serviceName": "باقة السيو",
    "planCycle": "شهري",
    "amount": 0,
    "currency": "ج.م",
    "renewalDate": "2026-11-06",
    "monthlyDeliveryDate": "2026-11-06",
    "status": "renewing_soon",
    "notes": "",
    "managedBy": "هدير سعيد",
    "accountManagerId": "user-1",
    "accountManagerName": "هدير سعيد",
    "monthlyTasks": [
      {
        "id": "mt-db-1",
        "title": "بناء 15 رابطاً خلفياً عالي الجودة والباكلينك الخارجي",
        "month": "2026-10",
        "category": "سيو ومقالات",
        "completed": true,
        "completedAt": "2026-10-25",
        "completedByName": "Yomna",
        "deliverableCount": "15 باكلينك",
        "assignedToId": "user-yomna",
        "assignedToName": "Yomna",
        "assignedToRole": "SEO",
        "dueDate": "2026-10-26",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-db-2",
        "title": "إعداد التقرير الإداري ومراجعة تجديد باقة السيو",
        "month": "2026-10",
        "category": "تقارير وتحليلات",
        "completed": false,
        "deliverableCount": "تقرير تحليلي",
        "assignedToId": "user-1",
        "assignedToName": "هدير سعيد",
        "assignedToRole": "مدير عام النظام والعمليات",
        "dueDate": "2026-11-04",
        "createdAt": "2026-10-01"
      }
    ],
    "assignedTeamMemberIds": [
      "user-1",
      "user-amira",
      "user-eman",
      "user-yomna",
      "user-aya",
      "user-roaa"
    ],
    "id": "ren-1793024696154",
    "createdAt": "2026-10-26",
    "folderFiles": []
  },
  {
    "clientName": "ا/ محمد الخميس",
    "company": "ساوث كوست",
    "projectDescription": "",
    "phone": "",
    "whatsappNumber": "",
    "email": "",
    "serviceName": "باقة سيو ",
    "planCycle": "شهري",
    "amount": 0,
    "currency": "ج.م",
    "renewalDate": "2026-11-18",
    "monthlyDeliveryDate": "2026-10-31",
    "status": "renewing_soon",
    "notes": "",
    "managedBy": "Amira",
    "accountManagerId": "user-amira",
    "accountManagerName": "Amira",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/1sP-P6xSXhAFLCipLoi508Jh2QsEqR8HAxUlsadx1wTg/edit?gid=0#gid=0",
    "monthlyTasks": [
      {
        "id": "mt-sc-1",
        "title": "إعداد خطة الكلمات المفتاحية وسيو الموقع لشهر أكتوبر",
        "month": "2026-10",
        "category": "سيو ومقالات",
        "completed": true,
        "completedAt": "2026-10-18",
        "completedByName": "Yomna",
        "deliverableCount": "شيت الكلمات",
        "assignedToId": "user-yomna",
        "assignedToName": "Yomna",
        "assignedToRole": "SEO",
        "dueDate": "2026-10-20",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-sc-2",
        "title": "تصميم 12 بوست سوشيال ميديا وهوية بصرية للحملة",
        "month": "2026-10",
        "category": "تصميم جرافيك",
        "completed": true,
        "completedAt": "2026-10-24",
        "completedByName": "Aya Gaber",
        "deliverableCount": "12 بوست",
        "assignedToId": "user-aya",
        "assignedToName": "Aya Gaber",
        "assignedToRole": "Designer",
        "dueDate": "2026-10-25",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-sc-3",
        "title": "كتابة ونشر 8 مقالات حصرية متوافقة مع محركات البحث",
        "month": "2026-10",
        "category": "سيو ومقالات",
        "completed": true,
        "completedAt": "2026-10-27",
        "completedByName": "Eman Ashraf",
        "deliverableCount": "8 مقالات",
        "assignedToId": "user-eman",
        "assignedToName": "Eman Ashraf",
        "assignedToRole": "SEO",
        "dueDate": "2026-10-27",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-sc-4",
        "title": "مونتاج 4 فيديوهات ريلز وتيك توك عالية التفاعل",
        "month": "2026-10",
        "category": "ريلز ومونتاج",
        "completed": false,
        "deliverableCount": "4 ريلز",
        "assignedToId": "user-aya",
        "assignedToName": "Aya Gaber",
        "assignedToRole": "Designer",
        "dueDate": "2026-10-30",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-sc-5",
        "title": "تقرير أداء نتائج السيو والظهور في محركات البحث",
        "month": "2026-10",
        "category": "تقارير وتحليلات",
        "completed": false,
        "deliverableCount": "تقرير شهري",
        "assignedToId": "user-yomna",
        "assignedToName": "Yomna",
        "assignedToRole": "SEO",
        "dueDate": "2026-10-31",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-sc-6",
        "title": "جلسة مراجعة الأداء الشهري مع العميل والتجديد",
        "month": "2026-10",
        "category": "إداري ومتابعة",
        "completed": false,
        "deliverableCount": "اجتماع زوم",
        "assignedToId": "user-amira",
        "assignedToName": "Amira",
        "assignedToRole": "Account Manager",
        "dueDate": "2026-10-31",
        "createdAt": "2026-10-01"
      }
    ],
    "assignedTeamMemberIds": [
      "user-amira",
      "user-eman",
      "user-yomna",
      "user-1",
      "user-aya"
    ],
    "id": "ren-1793024639515",
    "createdAt": "2026-10-26",
    "folderFiles": []
  },
  {
    "clientName": "ا/اسلام",
    "company": "جولدن",
    "projectDescription": "",
    "phone": "",
    "whatsappNumber": "",
    "email": "",
    "serviceName": "باقة سيو ",
    "planCycle": "سنوي",
    "amount": 2500,
    "currency": "ج.م",
    "renewalDate": "2026-11-18",
    "monthlyDeliveryDate": "2026-10-30",
    "status": "renewing_soon",
    "notes": "",
    "managedBy": "Amira",
    "accountManagerId": "user-amira",
    "accountManagerName": "Amira",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/1FT-TV50lOvk_gFCZmUBTa0bPitAZrdpMA6tq_7I90fs/edit?gid=0#gid=0",
    "sheetTitle": "جولدن",
    "monthlyTasks": [
      {
        "id": "mt-gd-1",
        "title": "فحص وتدقيق السيو التقني للمتجر وإصلاح الروابط التالفة",
        "month": "2026-10",
        "category": "سيو ومقالات",
        "completed": true,
        "completedAt": "2026-10-22",
        "completedByName": "Eman Ashraf",
        "deliverableCount": "تدقيق فني",
        "assignedToId": "user-eman",
        "assignedToName": "Eman Ashraf",
        "assignedToRole": "SEO",
        "dueDate": "2026-10-24",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-gd-2",
        "title": "تصميم 6 بنرات إعلانية للعروض الترويجية",
        "month": "2026-10",
        "category": "تصميم جرافيك",
        "completed": true,
        "completedAt": "2026-10-26",
        "completedByName": "Aya Gaber",
        "deliverableCount": "6 بنرات",
        "assignedToId": "user-aya",
        "assignedToName": "Aya Gaber",
        "assignedToRole": "Designer",
        "dueDate": "2026-10-26",
        "createdAt": "2026-10-01"
      },
      {
        "id": "mt-gd-3",
        "title": "كتابة سكريبت فيديو إعلاني للمنتجات الأكثر طلباً",
        "month": "2026-10",
        "category": "محتوى وبوستات",
        "completed": false,
        "deliverableCount": "سكريبت فيديو",
        "assignedToId": "user-roaa",
        "assignedToName": "Roaa",
        "assignedToRole": "Content Writer",
        "dueDate": "2026-10-31",
        "createdAt": "2026-10-01"
      }
    ],
    "assignedTeamMemberIds": [
      "user-1",
      "user-aya",
      "user-yomna",
      "user-eman",
      "user-amira"
    ],
    "id": "ren-1793024552370",
    "createdAt": "2026-10-26",
    "folderFiles": []
  },
  {
    "clientName": "دكتور عماد",
    "company": "الكشفيه ",
    "projectDescription": "باقة سيو 20 مقاله",
    "phone": "",
    "whatsappNumber": "",
    "email": "",
    "serviceName": "باقة سيو 20 مقاله",
    "planCycle": "شهري",
    "amount": 0,
    "currency": "ج.م",
    "renewalDate": "2026-11-27",
    "status": "renewing_soon",
    "notes": "",
    "managedBy": "اميره",
    "assignedTeamMemberIds": [
      "user-1",
      "user-amira",
      "user-yomna",
      "user-roaa",
      "user-aya"
    ],
    "id": "ren-1793024486658",
    "createdAt": "2026-10-26",
    "folderFiles": []
  },
  {
    "clientName": "موقع gx",
    "company": "gxp way",
    "projectDescription": "باقة سيو 20 مقاله ",
    "phone": "",
    "whatsappNumber": "",
    "email": "",
    "serviceName": "باقة سيو 20 مقاله",
    "planCycle": "شهري",
    "amount": 0,
    "currency": "ج.م",
    "renewalDate": "2026-10-27",
    "status": "renewing_soon",
    "notes": "https://docs.google.com/spreadsheets/d/1tt3BDSaNEgZa5wCf7PGHTbhrr9irsIDN08K_izNKTNI/edit?gid=1314647522#gid=1314647522",
    "managedBy": "اميره",
    "sheetUrl": "https://docs.google.com/spreadsheets/d/1tt3BDSaNEgZa5wCf7PGHTbhrr9irsIDN08K_izNKTNI/edit?gid=1314647522#gid=1314647522",
    "sheetTitle": "gxpway",
    "assignedTeamMemberIds": [
      "user-1",
      "user-aya",
      "user-amira",
      "user-eman",
      "user-yomna",
      "user-roaa"
    ],
    "id": "ren-1793022923682",
    "createdAt": "2026-10-26",
    "folderFiles": [
      {
        "id": "doc-1793022955994",
        "uploadedAt": "2026-10-26",
        "uploadedBy": "هدير سعيد",
        "name": "شيت العميل",
        "category": "بريف فني",
        "url": "https://docs.google.com/spreadsheets/d/1tt3BDSaNEgZa5wCf7PGHTbhrr9irsIDN08K_izNKTNI/edit?gid=1314647522#gid=1314647522",
        "size": "1.4 MB",
        "type": "pdf",
        "allowedTeamMemberIds": []
      }
    ],
    "startDate": "2026-10-26",
    "googleSheets": [
      {
        "id": "sheet-gx-1",
        "title": "gxpway",
        "url": "https://docs.google.com/spreadsheets/d/1tt3BDSaNEgZa5wCf7PGHTbhrr9irsIDN08K_izNKTNI/edit?gid=1314647522#gid=1314647522"
      }
    ]
  },
  {
    "id": "ren-suspended-1",
    "clientName": "أحمد بن تركي",
    "company": "مؤسسة الأفق للتجارة والتقنية",
    "projectDescription": "استضافة وسيرفرات سويفت وباقة سيو GEO محركات الذكاء الاصطناعي",
    "phone": "+966501234567",
    "whatsappNumber": "966501234567",
    "email": "ahmed@alofuq.com",
    "serviceName": "استضافة وسيرفرات سويفت (2 دومين)",
    "planCycle": "شهري",
    "amount": 3500,
    "currency": "ج.م",
    "renewalDate": "2026-10-15",
    "startDate": "2026-06-01",
    "status": "suspended",
    "suspensionReason": "طلب العميل تجميد الخدمة مؤقتاً لمدة شهرين لحين الانتهاء من تجديد السجل التجاري وإعادة هيكلة النشاط",
    "suspensionCategory": "client_request",
    "suspendedAt": "2026-10-15",
    "suspensionNotes": "العميل مسدد لكافة المستحقات السابقة، طلب الاحتفاظ بملفات السيرفر لحين استئناف الحملات.",
    "expectedResumeDate": "2026-12-01",
    "managedBy": "هدير سعيد",
    "createdAt": "2026-06-01",
    "folderFiles": []
  },
  {
    "id": "ren-suspended-2",
    "clientName": "م/ شريف عثمان",
    "company": "تك سوليوشنز للتطوير الرقمي",
    "projectDescription": "باقة ذكاء اصطناعي GEO متقدمة وإدارة مسار المبيعات",
    "phone": "+201098765432",
    "whatsappNumber": "201098765432",
    "email": "sherif@techsolutions.net",
    "serviceName": "باقة ذكاء اصطناعي GEO + سويفت سيلز",
    "planCycle": "شهري",
    "amount": 2800,
    "currency": "ج.م",
    "renewalDate": "2026-10-10",
    "startDate": "2026-07-15",
    "status": "suspended",
    "suspensionReason": "تعثر مالي وتأخر في سداد الدفعة الشهرية لأكثر من 15 يوماً - جاري التنسيق لجدولة السداد",
    "suspensionCategory": "financial",
    "suspendedAt": "2026-10-10",
    "suspensionNotes": "تم التواصل مع المحاسب المالي وجاري إرسال إشعار دفع مجدول، طلب تفعيل الخدمة فور التحويل البنكي.",
    "expectedResumeDate": "2026-11-05",
    "managedBy": "هدير سعيد",
    "createdAt": "2026-07-15",
    "folderFiles": []
  }
];

export const INITIAL_MEETING_RECORDINGS: MeetingRecording[] = [
  {
    id: 'rec-1',
    meetingTitle: 'جلسة استراتيجية تسليم ملفات الهوست والدومينات والربط مع شركة الأفق',
    clientName: 'عبدالعزيز العتيبي',
    company: 'شركة الأفق للاستشارات والتقنية (الكويت)',
    isVipClient: true,
    date: '2026-10-18',
    time: '14:00',
    duration: '48 دقيقة',
    googleMeetLink: 'https://meet.google.com/zoh-vip-otaibi',
    recordingUrl: 'https://drive.google.com/file/d/1Otaibi_Geo_Host_2026_Rec/view',
    keyTakeaways: [
      'تم اعتماد نقل ملفات السيستمين (ظاهرلي جيو + ظاهرلي سوشيال ميديا) للهوست الرئيسي.',
      'تجهيز السيرفر لاستيعاب 2 دومين مستقلين مع شهادات الحماية SSL المجانية.',
      'العميل طلب جدول زمني محدد للتجديد السنوي لتأمين الميزانية.'
    ],
    actionItems: [
      'تصدير باك أب كامل لملفات الشغل والكمبيوتر ورفعها للهوست.',
      'إرسال إشعار التجديد السنوي قبل 4 أيام عبر الواتساب والبريد.'
    ],
    hostName: 'هدير سعيد',
    tags: ['VIP عميل كويتي', 'الهوست والدومين', 'ظاهرلي جيو', 'تجديد سنوي'],
    notes: 'تسجيل عالي الأهمية، يوضح موافقة العميل على تفاصيل العقد والسيرفرات.',
    createdAt: '2026-10-18'
  },
  {
    id: 'rec-2',
    meetingTitle: 'عرض نتائج ظهور الذكاء الاصطناعي GEO على ChatGPT وPerplexity',
    clientName: 'سعود المنصور',
    company: 'مؤسسة إعمار الخليج للمقاولات والتطوير',
    isVipClient: true,
    date: '2026-10-16',
    time: '11:30',
    duration: '35 دقيقة',
    googleMeetLink: 'https://meet.google.com/eamar-geo-review',
    recordingUrl: 'https://drive.google.com/file/d/1Eamar_Khaleej_GEO_ChatGPT_Rec/view',
    keyTakeaways: [
      'عرض تقرير تفاعلي يثبت ظهور إعمار الخليج في أول إجابة عند سؤال الذكاء الاصطناعي عن أفضل مقاولي الرياض.',
      'العميل أبدى رضاه التام وقرر تجديد الباقة الشهرية وتوسيعها لتشمل المنطقة الشرقية.'
    ],
    actionItems: [
      'تحديث كلمات مفتاحية جديدة في ملفات الماركيتنج.',
      'إرسال رابط الدفع قبل موعد التجديد بـ 4 أيام.'
    ],
    hostName: 'هدير سعيد',
    tags: ['VIP عميل سعودي', 'نتائج GEO', 'ChatGPT Search', 'تجديد شهري'],
    notes: 'تسجيل موثق للديمو يمكن عرضه كنماذج نجاح لعملاء جدد.',
    createdAt: '2026-10-16'
  },
  {
    id: 'rec-3',
    meetingTitle: 'جلسة كوتشنج واستشارات إغلاق الصفقات وإدارة خط أنابيب المبيعات',
    clientName: 'فهد الدوسري',
    company: 'مجموعة الدوسري للتجارة والتوريدات',
    isVipClient: true,
    date: '2026-10-12',
    time: '16:00',
    duration: '60 دقيقة',
    googleMeetLink: 'https://meet.google.com/dosari-coaching-sales',
    recordingUrl: 'https://drive.google.com/file/d/1Dosari_Coaching_Sales_Masterclass/view',
    keyTakeaways: [
      'تدريب فريق المبيعات على استخدام نظام سويفت في تسجيل الصفقات ومتابعة العملاء.',
      'تخصيص خطة كوتشنج أسبوعية لمراجعة أداء المناديب وتدقيق الاعتراضات البيعية.'
    ],
    actionItems: [
      'إرسال ملخص الكوتشنج وقوالب الرسائل الجاهزة.',
      'تفعيل التنبيهات الدورية للجلسات القادمة.'
    ],
    hostName: 'هدير سعيد',
    tags: ['VIP كوتشنج', 'استشارات مبيعات', 'تدريب سويفت'],
    notes: 'الجلسة ممتازة وتم الاتفاق على تجديد العقد السنوي للعام القادم.',
    createdAt: '2026-10-12'
  }
];

// بنك اسكربتات الفيديوهات وأفكار الماركيتنج (Video Scripts & Marketing Idea Bank)
export const INITIAL_MARKETING_SCRIPTS: MarketingVideoScript[] = [
  {
    id: 'script-1',
    title: 'فيديو ريلز: إزاي تخلي نشاطك يظهر أول نتيجة في ChatGPT وPerplexity بدلاً من جوجل التقليدي؟',
    platform: 'Instagram Reels',
    productCategory: 'ظاهرلي جيو (GEO)',
    targetDuration: '50 ثانية',
    status: 'جاهز للتصوير',
    hook: 'هل عميلك لما يسأل ChatGPT: "مين أحسن شركة تقدم خدمتك في مدينته؟".. بيجاوب باسمك إنت.. ولا باسم منافسك؟ 😱',
    problem: 'أغلب أصحاب البيزنس بيصرفوا آلاف على إعلانات جوجل وجوجل مابس، بينما اليوم أكثر من 40% من العملاء بقوا يسألوا الذكاء الاصطناعي مباشرة ويثقوا في ترشيحاته، وموقعك مش ظاهر في الرادار ده خالص!',
    solution: 'هنا بيجي دور خدمة "ظاهرلي جيو (GEO)": بنبني البنية التحتية اللي تخلي محركات الذكاء الاصطناعي تفهم تخصصك وتثق فيك كخيار أول في بحث ChatGPT وPerplexity وGemini.',
    callToAction: 'علق بكلمة "ظاهر" أو راسلنا على الواتساب، وهنعملك فحص مجاني يوضح نسبة ظهور نشاطك في بحث الـ AI حالياً وفرصتك الذهبية!',
    visualNotes: 'تصوير سيلفي أو كاميرا أمامية + لقطة شاشة B-Roll للـ ChatGPT وهو بيجاوب باسم العميل مع دوائر خضراء.',
    tags: ['GEO', 'بحث الذكاء الاصطناعي', 'ريلز', 'ظاهرلي'],
    createdAt: '2026-10-18'
  },
  {
    id: 'script-2',
    title: 'تيك توك لعملاء الكويت: حل أزمة العميل اللي يروح لمنافسك',
    platform: 'TikTok',
    productCategory: 'ظاهرلي سوشيال ميديا',
    targetDuration: '40 ثانية',
    status: 'تم التصوير',
    hook: 'أصحاب البيزنس والشركات في الكويت.. اسمعوني 30 ثانية بس! 🇰🇼',
    problem: 'العميل الكويتي سريع وقراره لحظي.. لو بحث وما لقاك في أول 3 ثواني، خلاص راح للشركة اللي بعدك.',
    solution: 'مع باقة ظاهرلي سوشيال ميديا وسيرفرات سويفت السريعة، موقعك بيفتح في رمشة عين ورسائلك التسويقية بتوصل لعملاء الكويت في الوقت والمكان الصح مع دومين محلي واستضافة فورية.',
    callToAction: 'اضغط على الرابط في البايو أو تواصل معانا واتساب واستلم دراسة حالة سريعة مجاناً.',
    visualNotes: 'لقطات من شوارع وأبراج الكويت + سرعة فتح صفحة الهبوط على الجوال.',
    tags: ['الكويت', 'سوشيال ميديا', 'تيك توك'],
    createdAt: '2026-10-17'
  },
  {
    id: 'script-3',
    title: 'يوتيوب شورتس: أسرار إغلاق الصفقات عبر سيستم سويفت سيلز السحابي',
    platform: 'YouTube Shorts',
    productCategory: 'سويفت سيلز',
    targetDuration: '60 ثانية',
    status: 'فكرة',
    hook: 'ليه 70% من المبيعات بتضيع بعد أول مكالمة؟ السبب مش السعر.. السبب المتابعة! 📉',
    problem: 'الموظف بيكلم العميل، ينسى يتابع بعد يومين، العميل يبرد ويشتري من غيرك.. وما فيش سيستم يراقب.',
    solution: 'سيستم سويفت بيعطيك خط سير كامل، تنبيه قبل ما العميل يبرد، تسجيل كل مكالمة وميتنج مع لينك التسجيل، وإدارة كاملة للمرتبات وتاسكات الفريق.',
    callToAction: 'جرب النسخة التجريبية لسويفت سيلز اليوم من الرابط في الوصف!',
    visualNotes: 'عرض واجهة سويفت سيلز والشاشات التفاعلية مع شارة SwiftMynd.',
    tags: ['سويفت سيلز', 'إدارة المبيعات', 'CRM'],
    createdAt: '2026-10-19'
  }
];

// عروض وتنبيهات الكوتشن لإرسالها للعملاء
export const INITIAL_COACHING_OFFERS: CoachingAlertOffer[] = [
  {
    id: 'offer-1',
    title: 'تنبيه موعد جلسة الكوتشنج التوجيهية وتطوير المبيعات',
    type: 'coaching_session',
    targetClients: 'عملاء الاشتراكات السنوية والـ VIP',
    validUntil: '2026-10-31',
    isSent: false,
    messageTemplate: `مرحباً بك عزيزي {clientName} 🌸
نود تذكيرك بموعد جلسة الكوتشنج والاستشارات الخاصة بنشاطكم التجاري في شركة {company}.
محاور الجلسة: مراجعة خط أنابيب المبيعات، تحليل نتائج الظهور في الذكاء الاصطناعي، وتدريب الفريق.
رابط قاعة Google Meet: {meetLink}
يسعدنا حضوركم وتأكيد الموعد عبر الرد على هذه الرسالة 👌`,
    createdAt: '2026-10-18'
  },
  {
    id: 'offer-2',
    title: 'عرض التجديد المبكر بخصم 20% + دومين واستضافة مجانية إضافية',
    type: 'renewal_discount',
    targetClients: 'العملاء المستحقين للتجديد خلال الـ 4 أيام القادمة',
    discountPercent: 20,
    validUntil: '2026-10-25',
    isSent: false,
    messageTemplate: `حياك الله أستاذ {clientName} 🌟
تقديراً لشراكتكم المميزة معنا في {company}، يسعدنا تقديم عرض التجديد المبكر لاشتراككم:
خصم خاص 20% على باقة {serviceName} + شهر استضافة إضافي مجاناً عند تأكيد التجديد قبل موعد الاستحقاق!
قيمة التجديد بعد الخصم: {discountedAmount} {currency}.
للتأكيد الفوري عبر واتساب أو استلام رابط الدفع المباشر، تفضل بالرد هنا.`,
    createdAt: '2026-10-19'
  },
  {
    id: 'offer-3',
    title: 'باقة الظهور الشامل: دمج ظاهرلي جيو (GEO) مع سوشيال ميديا سويفت',
    type: 'bundle_offer',
    targetClients: 'عملاء باقات السوشيال ميديا الحالية وعملاء الكويت',
    discountPercent: 30,
    validUntil: '2026-11-05',
    isSent: false,
    messageTemplate: `السلام عليكم ورحمة الله أستاذ {clientName} 🌸
هل تعلم أن ظهور موقعك في ChatGPT وبحث الذكاء الاصطناعي بيضاعف مبيعات السوشيال ميديا 3 أضعاف؟
عندنا عرض الحزمة المدمجة: إضافة باقة "ظاهرلي جيو GEO" إلى حسابكم في {company} بخصم 30% مع ربط 2 دومين ورفع الملفات بالكامل.
إذا حابب نرسل لك دراسة جدوى مبسطة، رد علينا بكلمة "مهتم" لنبدأ فوراً 👌`,
    createdAt: '2026-10-19'
  }
];

// Initial Attendance Records (سجلات الحضور والغياب والتأخيرات الافتراضية)
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    memberId: 'user-1',
    memberName: 'هدير سعيد',
    date: '2026-10-25',
    status: 'present',
    checkInTime: '08:45',
    checkOutTime: '17:15',
    notes: 'حضور مبكر ومنتظم'
  },
  {
    id: 'att-2',
    memberId: 'user-amira',
    memberName: 'Amira',
    date: '2026-10-25',
    status: 'present',
    checkInTime: '09:00',
    checkOutTime: '17:00'
  },
  {
    id: 'att-3',
    memberId: 'user-aya',
    memberName: 'Aya Gaber',
    date: '2026-10-25',
    status: 'present',
    checkInTime: '09:05',
    checkOutTime: '17:00'
  },
  {
    id: 'att-4',
    memberId: 'user-eman',
    memberName: 'Eman Ashraf',
    date: '2026-10-25',
    status: 'late',
    checkInTime: '09:45',
    checkOutTime: '17:30',
    lateMinutes: 45,
    notes: 'تأخير في المواصلات - تم الاستئذان المسبق',
    isExcused: true
  },
  {
    id: 'att-5',
    memberId: 'user-maibel',
    memberName: 'Maibel Emad',
    date: '2026-10-25',
    status: 'present',
    checkInTime: '08:55',
    checkOutTime: '17:00'
  },
  {
    id: 'att-6',
    memberId: 'user-mariam',
    memberName: 'Mariam',
    date: '2026-10-25',
    status: 'absent',
    notes: 'غياب بدون إذن مسبق'
  },
  {
    id: 'att-7',
    memberId: 'user-yomna',
    memberName: 'Yomna',
    date: '2026-10-25',
    status: 'present',
    checkInTime: '09:00',
    checkOutTime: '17:00'
  },
  {
    id: 'att-8',
    memberId: 'user-islam',
    memberName: 'Islam',
    date: '2026-10-25',
    status: 'late',
    checkInTime: '09:35',
    checkOutTime: '17:00',
    lateMinutes: 35,
    notes: 'تأخير 35 دقيقة'
  },
  {
    id: 'att-9',
    memberId: 'user-roaa',
    memberName: 'roaa_hetemy',
    date: '2026-10-25',
    status: 'present',
    checkInTime: '09:00',
    checkOutTime: '17:00'
  }
];

// Initial Company Operating Expenses (المصروفات التشغيلية للشركة لحساب صافي الربح والمكسب)
export const INITIAL_EXPENSES: CompanyExpense[] = [
  {
    id: 'exp-1',
    title: 'حملات إعلانات جوجل أدز وتيك توك الترويجية',
    amount: 4500,
    currency: 'ج.م',
    category: 'تسويق وإعلانات',
    date: '2026-10-05',
    notes: 'حملة استقطاب عملاء جدد لخدمات GEO'
  },
  {
    id: 'exp-2',
    title: 'سيرفرات سحابية، استضافة، وتراخيص OpenAI & Anthropic API',
    amount: 1850,
    currency: 'ج.م',
    category: 'سيرفرات وأدوات تقنية',
    date: '2026-10-10',
    notes: 'تجديد شهري للبنية التحتية'
  },
  {
    id: 'exp-3',
    title: 'إيجار المقر ومصروفات الضيافة وإنترنت الألياف الضوئية',
    amount: 3200,
    currency: 'ج.م',
    category: 'إيجار ومقر',
    date: '2026-10-01',
    notes: 'مصاريف المقر الإداري'
  },
  {
    id: 'exp-4',
    title: 'اشتراكات برمجيات المحاسبة وتراخيص Google Workspace',
    amount: 750,
    currency: 'ج.م',
    category: 'سيرفرات وأدوات تقنية',
    date: '2026-10-15',
    notes: 'تراخيص إيميلات الفريق'
  }
];

// ==================== بيانات عمولات المبيعات الشهرية المنفصلة ====================
export const INITIAL_SALES_COMMISSIONS: MonthlySalesCommissionRecord[] = [
  {
    id: 'comm-2026-10-maibel',
    month: '2026-10',
    memberId: 'user-maibel',
    memberName: 'Maibel Emad',
    memberAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    monthlyTarget: 100000,
    achievedSales: 115000,
    achievementRate: 115,
    dealsCount: 4,
    baseCommissionRate: 5,
    baseCommissionAmount: 5750,
    targetBonusAmount: 2000,
    customAdjustmentAmount: 500,
    totalCommission: 8250,
    currency: 'ج.م',
    payoutStatus: 'approved',
    payoutDate: '2026-10-30',
    paymentMethod: 'تحويل بنكي',
    notes: 'أداء استثنائي وتجاوز التارجت بنسبة 115% - تم اعتماد الصرف',
    deals: [
      {
        id: 'cd-1',
        dealId: 'deal-101',
        clientName: 'شركة النخبة للمقاولات والاستثمار',
        dealValue: 45000,
        currency: 'ج.م',
        closedDate: '2026-10-08',
        commissionRate: 5,
        commissionAmount: 2250,
        notes: 'باقة نظام CRM سنوي كامل مع تدريب'
      },
      {
        id: 'cd-2',
        dealId: 'deal-102',
        clientName: 'مجموعة المدى الطبية المتخصصة',
        dealValue: 35000,
        currency: 'ج.م',
        closedDate: '2026-10-14',
        commissionRate: 5,
        commissionAmount: 1750,
        notes: 'باقة تسويق وظهور جيو GEO 6 أشهر'
      },
      {
        id: 'cd-3',
        dealId: 'deal-103',
        clientName: 'أكاديمية المستقبل للغات',
        dealValue: 20000,
        currency: 'ج.م',
        closedDate: '2026-10-21',
        commissionRate: 5,
        commissionAmount: 1000,
        notes: 'تطوير موقع وتكامل إداري'
      },
      {
        id: 'cd-4',
        dealId: 'deal-104',
        clientName: 'مؤسسة الأفق للحلول الرقمية',
        dealValue: 15000,
        currency: 'ج.م',
        closedDate: '2026-10-25',
        commissionRate: 5,
        commissionAmount: 750,
        notes: 'عقد استضافة وسيرفرات وحماية'
      }
    ],
    updatedAt: '2026-10-26T14:30:00Z'
  },
  {
    id: 'comm-2026-09-maibel',
    month: '2026-09',
    memberId: 'user-maibel',
    memberName: 'Maibel Emad',
    memberAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    monthlyTarget: 90000,
    achievedSales: 94000,
    achievementRate: 104.4,
    dealsCount: 3,
    baseCommissionRate: 5,
    baseCommissionAmount: 4700,
    targetBonusAmount: 1500,
    customAdjustmentAmount: 0,
    totalCommission: 6200,
    currency: 'ج.م',
    payoutStatus: 'paid',
    payoutDate: '2026-09-30',
    paymentMethod: 'تحويل بنكي',
    notes: 'تم صرف العمولة بالكامل مع راتب شهر سبتمبر',
    deals: [
      {
        id: 'cd-09-1',
        clientName: 'سلسلة مطاعم الذواقة',
        dealValue: 40000,
        currency: 'ج.م',
        closedDate: '2026-09-12',
        commissionRate: 5,
        commissionAmount: 2000,
        notes: 'نظام إدارة ومتابعة ليدز'
      },
      {
        id: 'cd-09-2',
        clientName: 'مكتب الرواد للاستشارات القانونية',
        dealValue: 30000,
        currency: 'ج.م',
        closedDate: '2026-09-19',
        commissionRate: 5,
        commissionAmount: 1500,
        notes: 'باقة تسويق سنوية'
      },
      {
        id: 'cd-09-3',
        clientName: 'تطبيق فاست إكسبريس للشحن',
        dealValue: 24000,
        currency: 'ج.م',
        closedDate: '2026-09-27',
        commissionRate: 5,
        commissionAmount: 1200,
        notes: 'عقد استضافة وحماية دومينات'
      }
    ],
    updatedAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'comm-2026-11-maibel',
    month: '2026-11',
    memberId: 'user-maibel',
    memberName: 'Maibel Emad',
    memberAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    monthlyTarget: 120000,
    achievedSales: 28000,
    achievementRate: 23.3,
    dealsCount: 1,
    baseCommissionRate: 5,
    baseCommissionAmount: 1400,
    targetBonusAmount: 0,
    customAdjustmentAmount: 0,
    totalCommission: 1400,
    currency: 'ج.م',
    payoutStatus: 'draft',
    notes: 'شهر قادم قيد التنفيذ والمتابعة لصفقات منتصف الشهر',
    deals: [
      {
        id: 'cd-11-1',
        clientName: 'مجموعة الأندلس التجارية',
        dealValue: 28000,
        currency: 'ج.م',
        closedDate: '2026-11-03',
        commissionRate: 5,
        commissionAmount: 1400,
        notes: 'دفعة مقدمة لعقد سنوي'
      }
    ],
    updatedAt: '2026-11-04T09:00:00Z'
  }
];

// ==================== سيستم العقود والمدفوعات وباقي دفع العملاء ====================
export const INITIAL_FINANCIAL_CONTRACTS: ClientFinancialContract[] = [
  {
    id: 'fc-1',
    clientId: 'client-101',
    clientName: 'د. يوسف التميمي',
    companyName: 'مجمع التميمي لطب الأسنان الحديث',
    serviceTitle: 'باقة سيو جيو الذكية وحملات التواصل المتكاملة',
    contractTotalValue: 36000,
    currency: 'ج.م',
    totalPaidAmount: 24000,
    remainingBalance: 12000,
    contractStartDate: '2026-08-01',
    contractEndDate: '2027-02-01',
    nextPaymentDueDate: '2026-11-01',
    paymentPlan: 'أقساط شهرية',
    paymentStatus: 'متبقي مبالغ',
    phone: '+201023456789',
    whatsappNumber: '+201023456789',
    notes: 'العميل ملتزم جداً، القسط الأخير مستحق أول نوفمبر',
    payments: [
      {
        id: 'pay-1',
        clientContractId: 'fc-1',
        clientName: 'د. يوسف التميمي',
        amount: 12000,
        currency: 'ج.م',
        paymentDate: '2026-08-01',
        paymentMethod: 'تحويل بنكي',
        referenceNumber: 'TRX-88210',
        note: 'الدفعة الأولى عند توقيع العقد',
        receivedBy: 'هدير سعيد',
        createdAt: '2026-08-01T12:00:00Z'
      },
      {
        id: 'pay-2',
        clientContractId: 'fc-1',
        clientName: 'د. يوسف التميمي',
        amount: 12000,
        currency: 'ج.م',
        paymentDate: '2026-09-15',
        paymentMethod: 'فودافون كاش',
        referenceNumber: 'VF-392019',
        note: 'الدفعة الثانية',
        receivedBy: 'هدير سعيد',
        createdAt: '2026-09-15T15:20:00Z'
      }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'fc-2',
    clientId: 'client-102',
    clientName: 'م. طارق العريان',
    companyName: 'العريان هوم للديكور والتصميم الداخلي',
    serviceTitle: 'منظومة سويفت مايند CRM وإدارة المبيعات والتيم',
    contractTotalValue: 28000,
    currency: 'ج.م',
    totalPaidAmount: 28000,
    remainingBalance: 0,
    contractStartDate: '2026-07-15',
    contractEndDate: '2027-07-15',
    nextPaymentDueDate: '2027-07-15',
    paymentPlan: 'دفعة واحدة',
    paymentStatus: 'خالص بالكامل',
    phone: '+201198765432',
    whatsappNumber: '+201198765432',
    notes: 'تم سداد كامل قيمة العقد السنوي بنجاح',
    payments: [
      {
        id: 'pay-3',
        clientContractId: 'fc-2',
        clientName: 'م. طارق العريان',
        amount: 28000,
        currency: 'ج.م',
        paymentDate: '2026-07-15',
        paymentMethod: 'تحويل بنكي',
        referenceNumber: 'CIB-902188',
        note: 'سداد كامل العقد السنوي دفعة واحدة',
        receivedBy: 'هدير سعيد',
        createdAt: '2026-07-15T11:00:00Z'
      }
    ],
    createdAt: '2026-07-15T10:00:00Z'
  },
  {
    id: 'fc-3',
    clientId: 'client-103',
    clientName: 'أ. هاني عبدالحميد',
    companyName: 'برستيج لتجارة السيارات المستوردة',
    serviceTitle: 'حملات إعلانات ممولة مستهدفة مع لاندنج بيج ومتابعة واتساب',
    contractTotalValue: 40000,
    currency: 'ج.م',
    totalPaidAmount: 20000,
    remainingBalance: 20000,
    contractStartDate: '2026-09-01',
    contractEndDate: '2026-12-01',
    nextPaymentDueDate: '2026-10-25',
    paymentPlan: 'دفعتين',
    paymentStatus: 'متأخر في السداد',
    phone: '+201255544433',
    whatsappNumber: '+201255544433',
    notes: 'تنبيه: الدفعة الثانية متأخرة 3 أيام - جاري التواصل معه عبر واتساب',
    payments: [
      {
        id: 'pay-4',
        clientContractId: 'fc-3',
        clientName: 'أ. هاني عبدالحميد',
        amount: 20000,
        currency: 'ج.م',
        paymentDate: '2026-09-01',
        paymentMethod: 'تحويل بنكي',
        referenceNumber: 'NBE-44129',
        note: 'مقدم التعاقد 50%',
        receivedBy: 'هدير سعيد',
        createdAt: '2026-09-01T14:00:00Z'
      }
    ],
    createdAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'fc-4',
    clientId: 'client-104',
    clientName: 'دكتورة ميادة الشريف',
    companyName: 'مركز فيولا للتجميل والعناية بالبشرة',
    serviceTitle: 'إدارة السوشيال ميديا وتصوير 16 ريلز احترافي شهرياً',
    contractTotalValue: 22000,
    currency: 'ج.م',
    totalPaidAmount: 15000,
    remainingBalance: 7000,
    contractStartDate: '2026-09-20',
    contractEndDate: '2026-11-20',
    nextPaymentDueDate: '2026-11-05',
    paymentPlan: 'أقساط شهرية',
    paymentStatus: 'متبقي مبالغ',
    phone: '+201088776655',
    whatsappNumber: '+201088776655',
    notes: 'الدفعة الأخيرة مستحقة في 5 نوفمبر القادم',
    payments: [
      {
        id: 'pay-5',
        clientContractId: 'fc-4',
        clientName: 'دكتورة ميادة الشريف',
        amount: 15000,
        currency: 'ج.م',
        paymentDate: '2026-09-20',
        paymentMethod: 'كاش نقدياً',
        referenceNumber: 'CASH-REC-109',
        note: 'دفعة أولى باليد في مقر الشركة',
        receivedBy: 'هدير سعيد',
        createdAt: '2026-09-20T16:30:00Z'
      }
    ],
    createdAt: '2026-09-20T12:00:00Z'
  }
];

// ==================== بنك أفكار الماركيتنج والحملات ====================
export const INITIAL_MARKETING_IDEAS: MarketingIdea[] = [
  {
    id: 'midea-1',
    title: 'سلسلة ريلز وتيك توك: "ليه شركتك مش ظاهرة على ChatGPT لما العميل يدور عليك؟" (GEO Marketing)',
    channel: 'تيك توك وريلز',
    targetAudience: 'أصحاب الشركات، العيادات، مكاتب المحاماة، ومقدمي الخدمات المميزة',
    concept: 'فيديو قصير ومباشر مع تجربة حية على الشاشة يكتب فيها الشخص سؤالاً في ChatGPT ويظهر كيف نبرمج اسم شركته ليظهر كأول ترشيح للذكاء الاصطناعي مع إظهار الدليل بالأرقام.',
    goal: 'جذب ليدز ومبيعات',
    estimatedBudget: 3500,
    currency: 'ج.م',
    status: 'قيد التجهيز والتخطيط',
    priority: 'urgent',
    tags: ['ذكاء اصطناعي', 'GEO', 'ريلز', 'تريند'],
    notes: 'تم كتابة الاسكربت بالكامل وجاري التنسيق مع إسلام لتصوير الشاشة وتجهيز المونتاج السريع',
    createdAt: '2026-10-18T10:00:00Z'
  },
  {
    id: 'midea-2',
    title: 'حملة إعلانات ممولة فيسبوك & إنستجرام باستهداف مدراء المبيعات في مصر والخليج',
    channel: 'فيسبوك وإعلانات',
    targetAudience: 'مدراء المبيعات والتسويق ورؤساء مجلس الإدارة للشركات من 10 إلى 100 موظف',
    concept: 'إعلان فيديو يوضح الفوضى الحاصلة في ضياع التارجت والمهام المفقودة في الواتساب، والحل الفوري عبر منصة سويفت مايند لإدارة الموظفين والمهام وحساب ساعات العمل بدقة.',
    goal: 'جذب ليدز ومبيعات',
    estimatedBudget: 6000,
    currency: 'ج.م',
    status: 'قيد الاختبار',
    priority: 'high',
    tags: ['إعلانات ممولة', 'CRM', 'سيلز', 'B2B'],
    notes: 'اختبار نسختين من الإعلان A/B Testing لمقارنة تكلفة الليد CPL وتجهيز لاندنج بيج مخصصة',
    createdAt: '2026-10-15T12:00:00Z'
  },
  {
    id: 'midea-3',
    title: 'دراسة حالة مصورة (Case Study): كيف ضاعفنا مبيعات عميل عيادات الأسنان 3 أضعاف خلال 60 يوماً',
    channel: 'لينكد إن',
    targetAudience: 'الأطباء، رواد الأعمال، وأصحاب المراكز الطبية والخدمية الراقية',
    concept: 'بوست تفصيلي ومقروء بالأرقام والرسوم البيانية يوضح الخطوات الثلاث التي طبقناها مع عميلنا: سيو جيو، تكامل المبيعات، ومتابعة العملاء الفورية عبر سويفت.',
    goal: 'بناء ثقة',
    estimatedBudget: 1500,
    currency: 'ج.م',
    status: 'مطبقة وناجحة',
    priority: 'medium',
    tags: ['دراسة حالة', 'B2B', 'لينكد إن', 'موثوقية'],
    notes: 'حققت أكثر من 45 ألف وصول وأتت بـ 6 عملاء VIP مباشرة في الرسائل الخاصة',
    createdAt: '2026-10-05T09:30:00Z'
  },
  {
    id: 'midea-4',
    title: 'سلسلة إيميلات أوتوميشن ترحيبية وتثقيفية لليدز الجدد (Email Drip Campaign)',
    channel: 'إيميل ماركتنج',
    targetAudience: 'كل من يسجل في لاندنج بيج الموقع أو يحمّل الدليل المجاني للظهور في محركات الذكاء الاصطناعي',
    concept: 'سلسلة مكونة من 5 إيميلات تُرسل كل يومين، تبدأ بالترحيب، ثم تقديم هدية عملية، ثم قصص نجاح، ثم عرض خاص محدود لحجز ميتنج استشاري مجاني مع المدير.',
    goal: 'إعادة استهداف العملاء',
    estimatedBudget: 800,
    currency: 'ج.م',
    status: 'فكرة جديدة',
    priority: 'high',
    tags: ['إيميل', 'أوتوميشن', 'نيرتشرينج'],
    notes: 'التجهيز للتكامل عبر Brevo / Mailchimp وربطه بالليدز الجديدة تلقائياً',
    createdAt: '2026-10-24T15:00:00Z'
  }
];

// ==================== أفكاري الاستراتيجية والتدوينات المكتوبة ====================
export const INITIAL_WRITTEN_THOUGHTS: WrittenThoughtNote[] = [
  {
    id: 'thought-1',
    title: 'استراتيجية تسريع إغلاق صفقات السيلز وتطبيق "عربون الحجز الفوري"',
    content: `ملاحظة هامة جداً لزيادة تحصيل السيولة النقدية:
1. عند التفاوض مع العميل المتردد، يجب ألا نخرج من الميتنج بدون حجز مبدئي حتى لو بمبلغ رمزي (عربون 15-20%) لتأكيد الجدية.
2. تزويد فريق السيلز بباقة "العرض السريع": خصم 10% إضافي في حالة السداد خلال 24 ساعة فقط.
3. ربط عمولة موظف السيلز بسرعة التحصيل (كلما تم التحصيل في الأسبوع الأول زادت العمولة 1%).`,
    category: 'استراتيجية المبيعات',
    isPinned: true,
    color: '#eff6ff',
    tags: ['سيلز', 'تحصيل كاش', 'استراتيجية', 'بونص'],
    updatedAt: '2026-10-25T11:00:00Z',
    createdAt: '2026-10-25T11:00:00Z'
  },
  {
    id: 'thought-2',
    title: 'خطة إطلاق باقة "GEO Elite" للشركات الكبرى بالخليج (الربع الأول 2027)',
    content: `فكرة تطوير منتج وخدمة ممتازة:
- الطلب على خدمات تحسين محركات الذكاء الاصطناعي التوليدي (ChatGPT, Claude, Perplexity) يتضاعف شهرياً.
- سنبني باقة سنوية بقيمة تبدأ من 50,000 ج.م / 15,000 ر.س تتضمن:
  * إدراج العلامة التجارية في 15 منصة ذكاء اصطناعي.
  * إدارة سمعة وتدريب روبوتات المحادثة على اسم الشركة.
  * لوحة تتبع ومتابعة شهرية مع تقرير تحليلي مصور.
- الخطوة القادمة: تجهيز برزنتيشن احترافي مع نماذج حية لعملاء كويتيين وسعوديين.`,
    category: 'أفكار منتجات وتطوير',
    isPinned: true,
    color: '#fef3c7',
    tags: ['تطوير', 'منتج جديد', 'الخليج', 'سيو جيو'],
    updatedAt: '2026-10-22T16:40:00Z',
    createdAt: '2026-10-22T16:40:00Z'
  },
  {
    id: 'thought-3',
    title: 'ملاحظات تحسين كفاءة فريق العمل والانضباط في تتبع التايمر',
    content: `نقاط إدارية للمتابعة في اجتماع الأحد القادم:
- التأكد من تشغيل التايمر لكل مهمة بمجرد البدء فيها وعدم الاعتماد على التدوين اليدوي بنهاية اليوم.
- ربط مكافأة "أفضل موظف للشهر" بأعلى دقة في إنجاز المهام قبل الموعد النهائي Deadline.
- ضرورة التزام الفريق بكتابة ملخص تفصيلي في خانة تعليقات المهمة عند تسليمها، مع إرفاق الروابط الخاصة بالعميل.`,
    category: 'كفاءة الفريق والعمل',
    isPinned: false,
    color: '#ecfdf5',
    tags: ['إدارة', 'إنتاجية', 'تايمر', 'تيم'],
    updatedAt: '2026-10-20T14:15:00Z',
    createdAt: '2026-10-20T14:15:00Z'
  },
  {
    id: 'thought-4',
    title: 'تأمين المصروفات التشغيلية والحفاظ على هامش ربح لا يقل عن 55%',
    content: `قواعد مالية صارمة للإدارة:
- سقف المصروفات التسويقية لا يجب أن يتجاوز 25% من إجمالي الإيرادات المحصلة.
- الرواتب والأجور تشكل 20-25% من التدفق النقدي.
- ترحيل 15% من صافي أرباح كل شهر إلى حساب "احتياطي الطوارئ والتطوير".
- مراجعة اشتراكات السيرفرات والأدوات المدفوعة كل 3 أشهر لإلغاء أي أداة غير مستخدمة بكثافة.`,
    category: 'تطوير الشركة',
    isPinned: false,
    color: '#fdf2f8',
    tags: ['مالية', 'أرباح', 'تحكم في المصاريف', 'استدامة'],
    updatedAt: '2026-10-18T08:00:00Z',
    createdAt: '2026-10-18T08:00:00Z'
  }
];

// ==================== 1. سجلات تقييم أداء الموظفين الأولية ====================
export const INITIAL_PERFORMANCE_EVALUATIONS: PerformanceEvaluationRecord[] = [
  {
    id: 'eval-1',
    employeeId: 'user-amira',
    employeeName: 'Amira',
    department: 'التطوير والتقنية',
    date: '2026-10-26',
    type: 'positive',
    category: 'quality',
    description: 'تسليم ومتابعة متطلبات حساب "جولدن" باحترافية وسرعة استجابة ملموسة نالت رضا العميل.',
    relatedTaskId: 'mt-gd-1',
    relatedTaskTitle: 'فحص وتدقيق السيو التقني للمتجر وإصلاح الروابط التالفة',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-26T11:00:00Z',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-26T12:00:00Z',
    actionTaken: 'شكر وتقدير في اجتماع الفريق الأسبوعي',
    pointsWeight: 5
  },
  {
    id: 'eval-2',
    employeeId: 'user-amira',
    employeeName: 'Amira',
    department: 'التطوير والتقنية',
    date: '2026-10-24',
    type: 'extra_work',
    category: 'teamwork',
    description: 'المبادرة بمساعدة الزميلة آية جابر في تجهيز أبعاد التصاميم وحل مشكلة ضيق الوقت لتسليم البوستات.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-24T14:30:00Z',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-24T16:00:00Z',
    actionTaken: 'إشادة وتقدير بروح التعاون المتميزة',
    pointsWeight: 5
  },
  {
    id: 'eval-3',
    employeeId: 'user-aya',
    employeeName: 'Aya Gaber',
    department: 'التطوير والتقنية',
    date: '2026-10-25',
    type: 'positive',
    category: 'quality',
    description: 'إبداع لافت في تصاميم الحملة الجديدة لعميل الشعلة مع التزام دقيق بألوان الهوية البصرية.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-25T13:00:00Z',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-25T15:00:00Z',
    actionTaken: 'اعتماد التصاميم بدون طلب أي تعديلات',
    pointsWeight: 5
  },
  {
    id: 'eval-4',
    employeeId: 'user-aya',
    employeeName: 'Aya Gaber',
    department: 'التطوير والتقنية',
    date: '2026-10-22',
    type: 'improvement',
    category: 'communication',
    description: 'تحسين سرعة إخطار فريق إدارة الحسابات عند الانتهاء من التعديلات الطفيفة على التصاميم.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-22T10:00:00Z',
    status: 'approved',
    employeeClarification: 'تم تفعيل إشعارات المنشن وتثبيت الشات للمتابعة الفورية.',
    employeeClarificationDate: '2026-10-22T12:30:00Z',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-22T14:00:00Z',
    actionTaken: 'متابعة دورية بدون خصم أو تأثير سلبي',
    followUpDate: '2026-11-05'
  },
  {
    id: 'eval-5',
    employeeId: 'user-eman',
    employeeName: 'Eman Ashraf',
    department: 'التطوير والتقنية',
    date: '2026-10-27',
    type: 'positive',
    category: 'commitment',
    description: 'تسليم 8 مقالات حصرية متوافقة مع معايير السيو والذكاء الاصطناعي في الموعد المحدد تماماً.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-27T16:00:00Z',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-27T17:00:00Z',
    actionTaken: 'إشادة بجودة البحث ودقة المصطلحات',
    pointsWeight: 5
  },
  {
    id: 'eval-6',
    employeeId: 'user-eman',
    employeeName: 'Eman Ashraf',
    department: 'التطوير والتقنية',
    date: '2026-10-21',
    type: 'negative',
    category: 'commitment',
    description: 'تأخر يومين في تحديث حالة مقالات السيو على السيستم رغم إنهائها على ملفات الوورد.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-21T09:00:00Z',
    status: 'approved',
    employeeClarification: 'حدث انقطاع مؤقت في الإنترنت وتم تسليم الملفات عبر البريد أولاً وتحديث السيستم فور عودة الاتصال.',
    employeeClarificationDate: '2026-10-21T10:30:00Z',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-21T11:00:00Z',
    actionTaken: 'تنبيه ودي بضرورة إشعار الإدارة فوراً عبر الهاتف عند انقطاع الإنترنت، وتم قبول التوضيح.',
    pointsWeight: -2
  },
  {
    id: 'eval-7',
    employeeId: 'user-islam',
    employeeName: 'Islam',
    department: 'التطوير والتقنية',
    date: '2026-10-26',
    type: 'extra_work',
    category: 'initiative',
    description: 'مونتاج نسختين إضافيتين من الفيديو بمقاسات تيك توك وستوري إنستجرام مع مؤثرات صوتية مبتكرة.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-26T15:00:00Z',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-26T16:00:00Z',
    actionTaken: 'شكر وتقدير ومكافأة بونص إنتاجية إضافي',
    pointsWeight: 6
  },
  {
    id: 'eval-8',
    employeeId: 'user-maibel',
    employeeName: 'Maibel Emad',
    department: 'المبيعات',
    date: '2026-10-28',
    type: 'positive',
    category: 'initiative',
    description: 'تحقيق 115% من التارجت الشهري للمبيعات وتأمين تعاقد جديد مع عميل متميز.',
    createdById: 'user-1',
    createdByName: 'هدير سعيد',
    createdAt: '2026-10-28T12:00:00Z',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-28T13:00:00Z',
    actionTaken: 'اعتماد عمولة المبيعات وبونص تخطي التارجت',
    pointsWeight: 8
  }
];

// ==================== 2. سجلات التأخيرات المنظمة الأولية ====================
export const INITIAL_DELAYS: DelayRecord[] = [
  {
    id: 'delay-1',
    employeeId: 'user-eman',
    employeeName: 'Eman Ashraf',
    department: 'التطوير والتقنية',
    date: '2026-10-25',
    scheduledStartTime: '09:00',
    actualArrivalTime: '09:45',
    delayMinutes: 45,
    delayRange: '30+',
    reasonCategory: 'traffic_commute',
    reasonDetails: 'ازدحام مروري شديد ناتج عن أعمال صيانة في الطريق الرئيسي، مع تقديم استئذان مسبق قبل بدء الدوام.',
    reviewStatus: 'excused',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-25T10:15:00Z',
    actionTaken: 'تم اعتماد العذر لوجود استئذان مسبق وبدون تطبيق أي خصم.',
    createdAt: '2026-10-25T09:45:00Z'
  },
  {
    id: 'delay-2',
    employeeId: 'user-islam',
    employeeName: 'Islam',
    department: 'التطوير والتقنية',
    date: '2026-10-25',
    scheduledStartTime: '09:00',
    actualArrivalTime: '09:35',
    delayMinutes: 35,
    delayRange: '30+',
    reasonCategory: 'emergency',
    reasonDetails: 'ظرف صحي عائلي طارئ في الصباح الباكر.',
    reviewStatus: 'reviewed',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-25T11:00:00Z',
    actionTaken: 'قيد مراجعة تقديم الإفادة وتعويض الدقائق نهاية الدوام.',
    createdAt: '2026-10-25T09:35:00Z'
  },
  {
    id: 'delay-3',
    employeeId: 'user-aya',
    employeeName: 'Aya Gaber',
    department: 'التطوير والتقنية',
    date: '2026-10-22',
    scheduledStartTime: '09:00',
    actualArrivalTime: '09:12',
    delayMinutes: 12,
    delayRange: '6-15',
    reasonCategory: 'attendance_device_issue',
    reasonDetails: 'خلل تقني في تسجيل الدخول بالبوابة وتم إبلاغ الدعم وتأكيد الحضور فوراً.',
    reviewStatus: 'excused',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-22T09:30:00Z',
    actionTaken: 'تم اعتماد العذر وتعديل السجل وتأكيد صحة الموعد الفعلي.',
    createdAt: '2026-10-22T09:12:00Z'
  },
  {
    id: 'delay-4',
    employeeId: 'user-amira',
    employeeName: 'Amira',
    department: 'التطوير والتقنية',
    date: '2026-10-18',
    scheduledStartTime: '09:00',
    actualArrivalTime: '09:08',
    delayMinutes: 8,
    delayRange: '6-15',
    reasonCategory: 'traffic_commute',
    reasonDetails: 'تأخر طفيف في المواصلات الصباحية.',
    reviewStatus: 'excused',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-18T09:30:00Z',
    actionTaken: 'ضمن الحدود المسموح بها شهرياً (سماحية التأخير الطفيف).',
    createdAt: '2026-10-18T09:08:00Z'
  }
];

// ==================== 3. مكتبة قواعد وسياسات الشركة الأولية ====================
export const INITIAL_COMPANY_RULES: CompanyRule[] = [
  {
    id: 'rule-1',
    title: 'مواعيد العمل الرسمية وضوابط الحضور والانصراف',
    category: 'attendance',
    description: 'يبدأ الدوام الرسمي في تمام الساعة 09:00 صباحاً وحتى 05:00 مساءً. توجد فترة سماح 10 دقائق للطوارئ، ويجب إخطار الإدارة بأي تأخير مسبقاً عبر الشات المخصص.',
    targetDepartment: 'كل الشركة',
    effectiveDate: '2026-01-01',
    approvedBy: 'هدير سعيد (مدير العمليات)',
    version: 'v2.1',
    lastModified: '2026-09-01',
    violationProcedure: 'التأخير الأول يتم التنبيه ودياً، التأخير المتكرر بدون عذر يخضع لمراجعة الإدارة واعتماد الإجراء المناسب وفق اللائحة.',
    severityLevel: 'high',
    acknowledgments: [
      { employeeId: 'user-amira', employeeName: 'Amira', acknowledgedAt: '2026-09-02T08:30:00Z' },
      { employeeId: 'user-aya', employeeName: 'Aya Gaber', acknowledgedAt: '2026-09-02T09:15:00Z' },
      { employeeId: 'user-eman', employeeName: 'Eman Ashraf', acknowledgedAt: '2026-09-02T09:00:00Z' },
      { employeeId: 'user-maibel', employeeName: 'Maibel Emad', acknowledgedAt: '2026-09-02T08:45:00Z' },
      { employeeId: 'user-islam', employeeName: 'Islam', acknowledgedAt: '2026-09-03T10:00:00Z' }
    ],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'rule-2',
    title: 'معايير جودة التنفيذ والتدقيق المسبق للمهام',
    category: 'work_quality',
    description: 'يجب مراجعة وتدقيق جميع المخرجات (تصاميم، مقالات سيو، أكواد، تقارير) ذاتياً قبل رفعها للاعتماد، والتأكد من مطابقتها الكاملة لهوية العميل ومتطلبات التكليف.',
    targetDepartment: 'التطوير والتقنية والتسويق',
    effectiveDate: '2026-02-15',
    approvedBy: 'هدير سعيد',
    version: 'v1.4',
    lastModified: '2026-08-20',
    violationProcedure: 'طلب تعديل فوري مع توجيه الموظف، وتسجيل ملاحظة تحسين جودة في ملف الأداء عند التكرار.',
    severityLevel: 'high',
    acknowledgments: [
      { employeeId: 'user-amira', employeeName: 'Amira', acknowledgedAt: '2026-08-21T09:00:00Z' },
      { employeeId: 'user-aya', employeeName: 'Aya Gaber', acknowledgedAt: '2026-08-21T09:30:00Z' },
      { employeeId: 'user-eman', employeeName: 'Eman Ashraf', acknowledgedAt: '2026-08-21T10:00:00Z' }
    ],
    createdAt: '2026-02-15T00:00:00Z'
  },
  {
    id: 'rule-3',
    title: 'تحديث حالة المهام وتسجيل فترات العمل على السيستم',
    category: 'task_delivery',
    description: 'يلتزم كل موظف بتحديث حالة مهامه (قيد التنفيذ / قيد المراجعة / مكتملة) أولاً بأول، وتشغيل مؤقت الوقت الفعلي أو تسجيل فترات العمل اليومية قبل مغادرة الدوام.',
    targetDepartment: 'كل الشركة',
    effectiveDate: '2026-03-01',
    approvedBy: 'هدير سعيد',
    version: 'v2.0',
    lastModified: '2026-09-10',
    violationProcedure: 'تنبيه شفهي في المرة الأولى، وفي حالة التكرار تسجل كحالة تحتاج مراجعة دون خصم فوري.',
    severityLevel: 'medium',
    acknowledgments: [
      { employeeId: 'user-amira', employeeName: 'Amira', acknowledgedAt: '2026-09-11T08:00:00Z' },
      { employeeId: 'user-aya', employeeName: 'Aya Gaber', acknowledgedAt: '2026-09-11T09:00:00Z' },
      { employeeId: 'user-eman', employeeName: 'Eman Ashraf', acknowledgedAt: '2026-09-11T08:30:00Z' },
      { employeeId: 'user-islam', employeeName: 'Islam', acknowledgedAt: '2026-09-11T10:15:00Z' }
    ],
    createdAt: '2026-03-01T00:00:00Z'
  },
  {
    id: 'rule-4',
    title: 'السرية التامة لبيانات العملاء والمعلومات المالية والتقنية',
    category: 'confidentiality',
    description: 'يُحظر تماماً مشاركة بيانات العملاء، كلمات المرور، ملفات العقود، شيتات الرواتب، أو أي معلومات داخلية مع أي طرف ثالث خارج الشركة دون تصريح خطي صريح من الإدارة.',
    targetDepartment: 'كل الشركة',
    effectiveDate: '2026-01-01',
    approvedBy: 'الإدارة العليا ومجلس الإدارة',
    version: 'v1.0',
    lastModified: '2026-01-01',
    violationProcedure: 'مخالفة جسيمة تستوجب الإيقاف الفوري والمساءلة القانونية واتخاذ الإجراءات التأديبية القصوى.',
    severityLevel: 'critical',
    acknowledgments: [
      { employeeId: 'user-amira', employeeName: 'Amira', acknowledgedAt: '2026-01-02T09:00:00Z' },
      { employeeId: 'user-aya', employeeName: 'Aya Gaber', acknowledgedAt: '2026-01-02T09:00:00Z' },
      { employeeId: 'user-eman', employeeName: 'Eman Ashraf', acknowledgedAt: '2026-01-02T09:00:00Z' },
      { employeeId: 'user-maibel', employeeName: 'Maibel Emad', acknowledgedAt: '2026-01-02T09:00:00Z' },
      { employeeId: 'user-islam', employeeName: 'Islam', acknowledgedAt: '2026-01-02T09:00:00Z' },
      { employeeId: 'user-yomna', employeeName: 'Yomna', acknowledgedAt: '2026-01-02T09:00:00Z' }
    ],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'rule-5',
    title: 'الاستخدام المهني لأدوات الشركة واشتراكات الذكاء الاصطناعي',
    category: 'tools_usage',
    description: 'تُستخدم حسابات البريد الرسمي وأدوات الذكاء الاصطناعي والسيرفرات السحابية للأغراض المتعلقة بمهام الشركة فقط مع ترشيد الاستهلاك والحفاظ على أمان المفاتيح.',
    targetDepartment: 'كل الشركة',
    effectiveDate: '2026-04-01',
    approvedBy: 'هدير سعيد',
    version: 'v1.2',
    lastModified: '2026-07-15',
    violationProcedure: 'إلغاء الصلاحية ومراجعة الاستخدام مع المسؤول التقني والإدارة.',
    severityLevel: 'medium',
    acknowledgments: [
      { employeeId: 'user-amira', employeeName: 'Amira', acknowledgedAt: '2026-07-16T10:00:00Z' },
      { employeeId: 'user-aya', employeeName: 'Aya Gaber', acknowledgedAt: '2026-07-16T11:00:00Z' },
      { employeeId: 'user-islam', employeeName: 'Islam', acknowledgedAt: '2026-07-17T09:30:00Z' }
    ],
    createdAt: '2026-04-01T00:00:00Z'
  },
  {
    id: 'rule-6',
    title: 'آداب التواصل المهني والاحترام المتبادل في بيئة العمل',
    category: 'communication',
    description: 'الحرص على التواصل الراقي والتعاون البنّاء بين الزملاء في الشات وقنوات العمل والاجتماعات، وتوجيه أي خلافات إدارية للإدارة المباشرة لحلها باحترافية.',
    targetDepartment: 'كل الشركة',
    effectiveDate: '2026-01-01',
    approvedBy: 'هدير سعيد',
    version: 'v1.1',
    lastModified: '2026-06-01',
    violationProcedure: 'جلسة تسوية ودية مع الإدارة، وفي حالة التكرار لفت نظر كتابي.',
    severityLevel: 'guideline',
    acknowledgments: [
      { employeeId: 'user-amira', employeeName: 'Amira', acknowledgedAt: '2026-06-02T09:00:00Z' },
      { employeeId: 'user-aya', employeeName: 'Aya Gaber', acknowledgedAt: '2026-06-02T09:00:00Z' },
      { employeeId: 'user-eman', employeeName: 'Eman Ashraf', acknowledgedAt: '2026-06-02T09:00:00Z' },
      { employeeId: 'user-maibel', employeeName: 'Maibel Emad', acknowledgedAt: '2026-06-02T09:00:00Z' },
      { employeeId: 'user-islam', employeeName: 'Islam', acknowledgedAt: '2026-06-02T09:00:00Z' }
    ],
    createdAt: '2026-01-01T00:00:00Z'
  }
];

// ==================== 4. سجل حالات عدم الالتزام الأولية ====================
export const INITIAL_RULE_VIOLATIONS: RuleViolationRecord[] = [
  {
    id: 'viol-1',
    ruleId: 'rule-3',
    ruleTitle: 'تحديث حالة المهام وتسجيل فترات العمل على السيستم',
    employeeId: 'user-eman',
    employeeName: 'Eman Ashraf',
    department: 'التطوير والتقنية',
    incidentDate: '2026-10-21',
    description: 'تأخر تحديث حالة 3 مقالات سيو منجزة على السيستم لمدة 48 ساعة.',
    employeeClarification: 'تم إنجاز العمل في موعده وتسليمه عبر البريد بسبب عطل إنترنت محلي، وتم التحديث فوراً عند عودة الشبكة.',
    reviewStatus: 'excused',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-10-21T11:00:00Z',
    actionTaken: 'تم قبول التوضيح واعتبار الموقف معذوراً مع التوجيه باستخدام الشات الاحتياطي للإشعار.',
    createdAt: '2026-10-21T09:30:00Z'
  }
];

// ==================== 5. سجل التقييمات الشهرية المعتمدة الأولية ====================
export const INITIAL_MONTHLY_PERFORMANCE_REVIEWS: MonthlyPerformanceReview[] = [
  {
    id: 'mpr-2026-09-amira',
    month: '2026-09',
    employeeId: 'user-amira',
    employeeName: 'Amira',
    department: 'التطوير والتقنية',
    totalAssignedTasks: 18,
    completedTasks: 18,
    tasksCompletionRate: 100,
    onTimeDeliveries: 17,
    onTimeDeliveryRate: 94.4,
    qualityScore: 4.8,
    revisionsRequestedCount: 1,
    delayedTasksCount: 1,
    delaysCount: 1,
    totalDelayMinutes: 10,
    excusedDelaysCount: 1,
    unexcusedDelaysCount: 0,
    positiveNotesCount: 4,
    negativeNotesCount: 0,
    extraWorkCount: 2,
    improvementCount: 1,
    violationsCount: 0,
    overallScore: 96,
    overallRating: 'ممتاز',
    strengths: 'إتقان استثنائي في إدارة الحسابات، مهارات تواصل راقية مع العملاء، ومبادرة دائمة في مساعدة الزملاء.',
    areasForImprovement: 'الاستمرار في أتمتة تقارير التسليم الشهرية لتوفير الوقت.',
    nextMonthGoals: 'زيادة معدل تجديد الاشتراكات بنسبة 15% ومتابعة عملاء الربع الأخير.',
    managerNotes: 'من أكفأ وأفضل أعضاء الفريق التزاماً ومسؤولية، تستحق كل التقدير.',
    employeeFeedback: 'شكراً جزيلاً للإدارة على الدعم المتواصل وبيئة العمل المحفزة.',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-09-30T14:00:00Z',
    createdAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'mpr-2026-09-maibel',
    month: '2026-09',
    employeeId: 'user-maibel',
    employeeName: 'Maibel Emad',
    department: 'المبيعات',
    totalAssignedTasks: 14,
    completedTasks: 14,
    tasksCompletionRate: 100,
    onTimeDeliveries: 13,
    onTimeDeliveryRate: 92.8,
    qualityScore: 4.9,
    revisionsRequestedCount: 0,
    delayedTasksCount: 1,
    delaysCount: 0,
    totalDelayMinutes: 0,
    excusedDelaysCount: 0,
    unexcusedDelaysCount: 0,
    positiveNotesCount: 5,
    negativeNotesCount: 0,
    extraWorkCount: 2,
    improvementCount: 0,
    violationsCount: 0,
    overallScore: 98,
    overallRating: 'ممتاز',
    strengths: 'تجاوز تارجت المبيعات وتحقيق 104% في سبتمبر، إغلاق صفقات نوعية، ومتابعة دقيقة للعملاء المحتملين.',
    areasForImprovement: 'توسيع شبكة التواصل مع القطاعات الطبية والهندسية.',
    nextMonthGoals: 'استهداف صفقات سنوية كبرى لباقات GEO وسويفت مايند.',
    managerNotes: 'أداء مبيعات باهر ونموذج في الالتزام والنشاط.',
    status: 'approved',
    reviewedBy: 'هدير سعيد',
    reviewedAt: '2026-09-30T15:00:00Z',
    createdAt: '2026-09-30T11:00:00Z'
  }
];





