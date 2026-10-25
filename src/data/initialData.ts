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
  CompanyExpense
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
    name: 'Mariam Islam',
    role: 'worspress developer',
    department: 'المبيعات',
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
    password: 'Sw!ftIHaiQ$Cka6',
    accessLevel: 'member',
    isAccountActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
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
    totalLoggedMinutes: 45,
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
  }
];

export const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'mail-1',
    senderId: 'user-2',
    senderName: 'أحمد الشريف',
    senderEmail: 'ahmed.sherif@zohocrm.org',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['hadeer.said@zohocrm.org'],
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
    senderEmail: 'sara.almansoori@zohocrm.org',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['hadeer.said@zohocrm.org', 'team@zohocrm.org'],
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
    senderEmail: 'tariq.qahtani@zohocrm.org',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['hadeer.said@zohocrm.org'],
    recipientNames: ['هدير سعيد'],
    subject: 'اكتمال ربط نظام واتساب للأعمال وWebhooks في زوهم CRM',
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
    senderEmail: 'hadeer.said@zohocrm.org',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    recipientEmails: ['ahmed.sherif@zohocrm.org'],
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
    assignedToId: 'user-2',
    estimatedValue: 180000,
    notes: 'يبحثون عن أتمتة لجميع فروعهم الـ 14 مع تتبع فوري لمواعيد التسليم.',
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
    estimatedValue: 95000,
    notes: 'تحتاج لربط برامج العيادات مع نظام إدارة مهام الأطباء ومواعيد الزيارات.',
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
    assignedToId: 'user-2',
    estimatedValue: 240000,
    notes: 'طلب إعادة الاتصال بعد دراسة الميزانية السنوية الجديدة للشركة.',
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
    assignedToId: 'user-4',
    estimatedValue: 310000,
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
    id: 'ren-1',
    clientName: 'عبدالعزيز العتيبي',
    company: 'شركة الأفق للاستشارات والتقنية (الكويت)',
    phone: '+965 99 881 234',
    whatsappNumber: '+96599881234',
    email: 'al.otaibi@alofuq-kw.com',
    serviceName: 'استضافة وسيرفرات سويفت (2 سيستم + 2 دومين)',
    planCycle: 'سنوي',
    amount: 3200,
    currency: 'ج.م',
    renewalDate: '2026-10-22', // متبقي يومين (تنبيه 4 أيام نشط!)
    status: 'renewing_soon',
    firstSubscribedAt: '2024-10-22 11:30', // تاريخ وساعة أول اشتراك
    totalRenewalsCount: 2,
    lastPaymentDate: '2025-10-22',
    notes: 'تنبيه عاجل: متبقي يومان على التجديد. تم رفع ملفات السيستمين على الهوست بنجاح، بانتظار تأكيد تجديد السيرفر والدومين.',
    managedBy: 'هدير سعيد',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1A-AlofuqTech-Kuwait-2026/edit?usp=sharing',
    sheetTitle: 'شيت متابعة سيرفرات وهندسة الأفق (الكويت)',
    contractNumber: 'CNT-KW-2024-88',
    createdAt: '2024-10-22',
    swiftRequests: [
      'تفعيل باقة 2 دومين وربط شهادات SSL',
      'نقل ملفات ظاهرلي جيو وظاهرلي سوشيال ميديا للهوست',
      'إضافة بوابات الدفع k-net'
    ],
    renewalHistory: [
      { id: 'rh-1', date: '2024-10-22 11:30', cycle: 'الاشتراك التأسيسي', amount: 3200, receiptNumber: 'REC-2024-101', note: 'بدء الاشتراك وحجز السيرفر والدومينات' },
      { id: 'rh-2', date: '2025-10-22 14:15', cycle: 'تجديد سنوي (السنة الثانية)', amount: 3200, receiptNumber: 'REC-2025-342', note: 'تجديد السيرفر وترقية مساحة التخزين' }
    ],
    assignedTeamMemberIds: ['user-1', 'user-2', 'user-4'],
    onboardingStage: 'تسليم ومتابعة مستمرة',
    folderFiles: [
      { id: 'doc-1', name: 'عقد_استضافة_سيرفرات_الأفق_2024.pdf', category: 'عقد', size: '2.4 MB', type: 'application/pdf', uploadedAt: '2024-10-22', uploadedBy: 'أحمد الشريف' },
      { id: 'doc-2', name: 'سند_قبض_وسداد_الاشتراك_التأسيسي.pdf', category: 'فاتورة', size: '640 KB', type: 'application/pdf', uploadedAt: '2024-10-22', uploadedBy: 'هدير سعيد' },
      { id: 'doc-3', name: 'بريف_التهيئة_ونقل_2_سيستم_سويفت.docx', category: 'بريف فني', size: '1.1 MB', type: 'application/vnd.openxmlformats', uploadedAt: '2025-02-15', uploadedBy: 'طارق القحطاني' }
    ],
    clientNotes: [
      { id: 'note-1', text: 'تم نقل ملفات ظاهرلي جيو بنجاح وتجهيز الدومين الثاني والتأكد من شهادة SSL.', authorName: 'طارق القحطاني', date: '2026-10-20' },
      { id: 'note-2', text: 'تواصل مع العميل لتأكيد موعد التجديد، طلب إرسال فاتورة جديدة بصيغة PDF.', authorName: 'أحمد الشريف', date: '2026-10-22' }
    ]
  },
  {
    id: 'ren-2',
    clientName: 'سعود المنصور',
    company: 'مؤسسة إعمار الخليج للمقاولات والتطوير',
    phone: '+966 55 443 2190',
    whatsappNumber: '+966554432190',
    email: 's.mansour@eamar-khaleej.com',
    serviceName: 'باقة ظهور الذكاء الاصطناعي GEO + تحسين محركات البحث SEO',
    planCycle: 'شهري',
    amount: 1850,
    currency: 'ج.م',
    renewalDate: '2026-10-23', // متبقي 3 أيام (تنبيه 4 أيام نشط!)
    status: 'renewing_soon',
    firstSubscribedAt: '2025-01-15 09:45',
    totalRenewalsCount: 9,
    lastPaymentDate: '2026-09-23',
    notes: 'متبقي 3 أيام على التجديد الشهري. حققنا له ظهور قوي على بحث ChatGPT وPerplexity في السوق السعودي.',
    managedBy: 'هدير سعيد',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1B-EamarKhaleej-GEO-Keywords/edit?usp=sharing',
    sheetTitle: 'شيت الكلمات المفتاحية وتقارير GEO لإعمار الخليج',
    contractNumber: 'CNT-SA-2025-114',
    createdAt: '2025-01-15',
    swiftRequests: [
      'تحديث كلمات مفتاحية في ChatGPT وPerplexity',
      'إرسال تقرير الظهور الأسبوعي على واتساب'
    ],
    renewalHistory: [
      { id: 'rh-201', date: '2026-07-23 10:00', cycle: 'تجديد شهري يوليو', amount: 1850, receiptNumber: 'REC-2026-701', note: 'سداد تحويل بنكي فوري' },
      { id: 'rh-202', date: '2026-08-23 11:20', cycle: 'تجديد شهري أغسطس', amount: 1850, receiptNumber: 'REC-2026-815', note: 'سداد مدى إلكتروني' },
      { id: 'rh-203', date: '2026-09-23 16:45', cycle: 'تجديد شهري سبتمبر', amount: 1850, receiptNumber: 'REC-2026-928', note: 'سداد فيزا تجارية' }
    ],
    assignedTeamMemberIds: ['user-1', 'user-3', 'user-5'],
    onboardingStage: 'تسليم ومتابعة مستمرة',
    folderFiles: [
      { id: 'doc-4', name: 'عقد_باقة_GEO_وSEO_الشهري.pdf', category: 'عقد', size: '1.8 MB', type: 'application/pdf', uploadedAt: '2025-01-15', uploadedBy: 'هدير سعيد' },
      { id: 'doc-5', name: 'تقرير_تحليل_الكلمات_المفتاحية_والظهور.xlsx', category: 'بريف فني', size: '890 KB', type: 'application/vnd.ms-excel', uploadedAt: '2026-10-15', uploadedBy: 'سارة المنصوري' }
    ],
    clientNotes: [
      { id: 'note-3', text: 'العميل مهتم جداً بزيادة الكلمات المستهدفة في الرياض وجدة، تم تحديث الشيت ومشاركته مع فريق الماركيتنج.', authorName: 'سارة المنصوري', date: '2026-10-21' }
    ]
  },
  {
    id: 'ren-3',
    clientName: 'فهد الدوسري',
    company: 'مجموعة الدوسري للتجارة والتوريدات',
    phone: '+966 50 771 9922',
    whatsappNumber: '+966507719922',
    email: 'fahad@aldosari-group.com',
    serviceName: 'اشتراك سنوي في سيستم CRM وإدارة المبيعات والتيم',
    planCycle: 'سنوي',
    amount: 4900,
    currency: 'ج.م',
    renewalDate: '2026-10-24', // متبقي 4 أيام بالضبط (تنبيه 4 أيام نشط!)
    status: 'renewing_soon',
    firstSubscribedAt: '2024-10-24 16:20',
    totalRenewalsCount: 2,
    lastPaymentDate: '2025-10-24',
    notes: 'متبقي 4 أيام على التجديد السنوي. تواصل المدير لتأكيد إصدار فاتورة التجديد وتحديث عدد تراخيص الموظفين.',
    managedBy: 'هدير سعيد',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1C-AldosariGroup-CRM-Sales-Tracking/edit?usp=sharing',
    sheetTitle: 'شيت إعداد وتدريب مستخدمي CRM مجموعة الدوسري',
    contractNumber: 'CNT-SA-2024-309',
    createdAt: '2024-10-24',
    swiftRequests: [
      'ترقية عدد مستخدمي النظام من 10 إلى 25 موظف',
      'ربط الفوترة الإلكترونية مع نظام هيئة الزكاة'
    ],
    renewalHistory: [
      { id: 'rh-301', date: '2024-10-24 16:20', cycle: 'الاشتراك التأسيسي', amount: 4900, receiptNumber: 'REC-2024-188', note: 'تفعيل تراخيص سويفت سيلز' },
      { id: 'rh-302', date: '2025-10-24 13:00', cycle: 'التجديد السنوي الثاني', amount: 4900, receiptNumber: 'REC-2025-412', note: 'تجديد التراخيص والصيانة' }
    ]
  },
  {
    id: 'ren-4',
    clientName: 'خالد ناصر الجاسم',
    company: 'متجر دريم هوم (Dream Home Store)',
    phone: '+966 54 321 0000',
    whatsappNumber: '+966543210000',
    email: 'khaled@dreamhome-sa.com',
    serviceName: 'استضافة متجر إلكتروني ودعم فني وصيانة شهرية',
    planCycle: 'شهري',
    amount: 1200,
    currency: 'ج.م',
    renewalDate: '2026-11-18', // ساري (أكثر من 4 أيام)
    status: 'active',
    firstSubscribedAt: '2025-05-18 12:00',
    totalRenewalsCount: 6,
    lastPaymentDate: '2026-10-18',
    notes: 'الاشتراك ساري وحالة السيرفر ممتازة.',
    managedBy: 'هدير سعيد',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1D-DreamHome-Store-Hosting-Ops/edit?usp=sharing',
    sheetTitle: 'شيت مهام وتحديثات متجر دريم هوم',
    contractNumber: 'CNT-SA-2025-055',
    createdAt: '2025-05-18',
    swiftRequests: ['بلاجن سويفت للشحن السريع وتتبع الطلبات'],
    renewalHistory: [
      { id: 'rh-401', date: '2026-09-18 10:15', cycle: 'تجديد شهري سبتمبر', amount: 1200, receiptNumber: 'REC-2026-904', note: 'سداد بطاقة ائتمانية' },
      { id: 'rh-402', date: '2026-10-18 09:30', cycle: 'تجديد شهري أكتوبر', amount: 1200, receiptNumber: 'REC-2026-1018', note: 'سداد إلكتروني مباشر' }
    ]
  },
  {
    id: 'ren-5',
    clientName: 'جاسم الصباح',
    company: 'مكتب الصباح العقاري والتسويق الدولي (الكويت)',
    phone: '+965 66 112 345',
    whatsappNumber: '+96566112345',
    email: 'jassim@alsabah-realestate.kw',
    serviceName: 'نظام إدارة العقارات السحابي + حملات السوشيال ميديا',
    planCycle: 'نصف سنوي',
    amount: 5500,
    currency: 'ج.م',
    renewalDate: '2026-12-15', // ساري
    status: 'active',
    firstSubscribedAt: '2025-06-15 15:10',
    totalRenewalsCount: 3,
    lastPaymentDate: '2026-06-15',
    notes: 'تم تجديد العقد نصف السنوي بنجاح مع إضافة خدمة الحملات الترويجية.',
    managedBy: 'هدير سعيد',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1E-Alsabah-RealEstate-Campaigns/edit?usp=sharing',
    sheetTitle: 'شيت حملات وعقارات مكتب الصباح (الكويت)',
    contractNumber: 'CNT-KW-2025-192',
    createdAt: '2025-06-15',
    swiftRequests: ['ربط دومين الكويت المباشر مع صفحة الهبوط السريعة'],
    renewalHistory: [
      { id: 'rh-501', date: '2025-06-15 15:10', cycle: 'الاشتراك التأسيسي نصف السنوي', amount: 5500, receiptNumber: 'REC-2025-615', note: 'تفعيل السيرفر ونظام العقارات' },
      { id: 'rh-502', date: '2025-12-15 11:00', cycle: 'تجديد نصف سنوي ثاني', amount: 5500, receiptNumber: 'REC-2025-1215', note: 'إضافة باقة إعلانات سناب شات وإنستغرام' },
      { id: 'rh-503', date: '2026-06-15 14:00', cycle: 'تجديد نصف سنوي ثالث', amount: 5500, receiptNumber: 'REC-2026-615', note: 'ترقية نظام تتبع العملاء' }
    ]
  },
  {
    id: 'ren-6',
    clientName: 'م. أحمد كمال',
    company: 'مكتب كمال للهندسة والتصميم',
    phone: '+20 10 998 7766',
    whatsappNumber: '+20109987766',
    email: 'ahmed@kamal-engineering.com',
    serviceName: 'اشتراك نظام المهام ومتابعة المشاريع السحابية',
    planCycle: 'ربع سنوي',
    amount: 1600,
    currency: 'ج.م',
    renewalDate: '2026-10-15', // متأخر 5 أيام
    status: 'overdue',
    firstSubscribedAt: '2025-01-15 11:00',
    totalRenewalsCount: 4,
    lastPaymentDate: '2026-07-15',
    notes: 'متأخر عن موعد التجديد، يرجى الاتصال والتذكير بالسداد.',
    managedBy: 'هدير سعيد',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1F-KamalEngineering-Projects-Tasks/edit?usp=sharing',
    sheetTitle: 'شيت مشاريع وتاسكات مكتب كمال للهندسة',
    contractNumber: 'CNT-EG-2025-072',
    createdAt: '2025-01-15',
    swiftRequests: ['طلب تمديد مهلة السداد وتفعيل إشعار واتساب التلقائي'],
    renewalHistory: [
      { id: 'rh-601', date: '2026-01-15 11:00', cycle: 'الربع الأول 2026', amount: 1600, receiptNumber: 'REC-2026-115', note: 'سداد تحويل بنكي' },
      { id: 'rh-602', date: '2026-04-15 10:30', cycle: 'الربع الثاني 2026', amount: 1600, receiptNumber: 'REC-2026-415', note: 'سداد إلكتروني' },
      { id: 'rh-603', date: '2026-07-15 12:00', cycle: 'الربع الثالث 2026', amount: 1600, receiptNumber: 'REC-2026-715', note: 'سداد فودافون كاش ومطابقة بالسعودي' }
    ]
  }
];

// تسجيلات ميتنج العملاء المهمين (VIP Google Meet Recordings)
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
    memberName: 'Mariam Islam',
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




