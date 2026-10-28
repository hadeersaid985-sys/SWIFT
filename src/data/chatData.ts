import { ChatChannel, ChatMessage } from '../types/crm';

export const INITIAL_CHAT_CHANNELS: ChatChannel[] = [
  {
    id: 'general',
    name: 'عام الفريق',
    description: 'المناقشات العامة لفريق العمل، التنسيق اليومي، ومشاركة الإنجازات',
    icon: '💬',
    department: 'عام',
    createdAt: '2026-01-01'
  },
  {
    id: 'sales',
    name: 'المبيعات والعملاء',
    description: 'متابعة الصفقات، عروض الأسعار، وتجديدات اشتراكات العملاء',
    icon: '💼',
    department: 'المبيعات',
    createdAt: '2026-01-01'
  },
  {
    id: 'technical',
    name: 'التطوير والتقنية والتصميم',
    description: 'مشاريع البرمجة، تصاميم السوشيال ميديا، السيو، وإدارة السيرفرات',
    icon: '💻',
    department: 'التطوير والتقنية',
    createdAt: '2026-01-01'
  },
  {
    id: 'announcements',
    name: 'إعلانات الإدارة العليا',
    description: 'التوجيهات والقرارات الرسمية من الإدارة العامة لسويفت مايند',
    icon: '📢',
    department: 'الإدارة',
    createdAt: '2026-01-01'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  // Channel: general
  {
    id: 'msg-gen-1',
    channelId: 'general',
    senderId: 'user-1',
    senderName: 'هدير سعيد',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'مدير عام النظام والعمليات',
    senderDepartment: 'الإدارة',
    text: 'صباح الخير جميعاً يا شباب ☀️! أتمنى لكم يوماً موفقاً وممتلئاً بالإنجازات.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    reactions: [
      { emoji: '☀️', count: 4, userIds: ['user-amira', 'user-aya', 'user-eman', 'user-maibel'] },
      { emoji: '❤️', count: 3, userIds: ['user-amira', 'user-aya', 'user-maibel'] }
    ]
  },
  {
    id: 'msg-gen-2',
    channelId: 'general',
    senderId: 'user-amira',
    senderName: 'Amira',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'account manager',
    senderDepartment: 'التطوير والتقنية',
    text: 'صباح النور أ. هدير 🌸! بنراجع حالياً كل تسليمات ومواعيد اليوم مع العملاء.',
    timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    reactions: [
      { emoji: '👍', count: 2, userIds: ['user-1', 'user-aya'] }
    ]
  },
  {
    id: 'msg-gen-3',
    channelId: 'general',
    senderId: 'user-aya',
    senderName: 'Aya Gaber',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Designer',
    senderDepartment: 'التطوير والتقنية',
    text: 'تم الانتهاء من تصاميم السوشيال ميديا وبوستات باقة الـ GEO وجاري رفعها للعميل للمراجعة النهائية 🎨✨.',
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    reactions: [
      { emoji: '🔥', count: 3, userIds: ['user-1', 'user-amira', 'user-eman'] },
      { emoji: '👏', count: 2, userIds: ['user-1', 'user-maibel'] }
    ]
  },
  {
    id: 'msg-gen-4',
    channelId: 'general',
    senderId: 'user-1',
    senderName: 'هدير سعيد',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'مدير عام النظام والعمليات',
    senderDepartment: 'الإدارة',
    text: 'تسلم إيدك يا آية، شغل ممتاز جداً كالعادة 👏. شباب لا تنسوا تشغيل تايمر المهام لتسجيل ساعات العمل بدقة.',
    timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
    replyTo: {
      id: 'msg-gen-3',
      senderName: 'Aya Gaber',
      text: 'تم الانتهاء من تصاميم السوشيال ميديا وبوستات باقة الـ GEO...'
    },
    reactions: [
      { emoji: '🫡', count: 3, userIds: ['user-aya', 'user-eman', 'user-maibel'] }
    ]
  },

  // Channel: sales
  {
    id: 'msg-sal-1',
    channelId: 'sales',
    senderId: 'user-maibel',
    senderName: 'Maibel Emad',
    senderAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Sales',
    senderDepartment: 'المبيعات',
    text: 'تحديث المبيعات 🚀: تم التواصل مع شركة الأفق التقنية وطلبوا عرض سعر لباقة الـ GEO مع السيستم.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    reactions: [
      { emoji: '🚀', count: 2, userIds: ['user-1', 'user-amira'] }
    ]
  },
  {
    id: 'msg-sal-2',
    channelId: 'sales',
    senderId: 'user-1',
    senderName: 'هدير سعيد',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'مدير عام النظام والعمليات',
    senderDepartment: 'المبيعات',
    text: 'ممتاز يا مايبل، جهزي العرض على السيستم واختاري موعد المتابعة، وإذا محتاجة أي دعم في الاتفاق بلّغيني.',
    timestamp: new Date(Date.now() - 3600000 * 3.2).toISOString(),
    reactions: [
      { emoji: '👍', count: 1, userIds: ['user-maibel'] }
    ]
  },

  // Channel: technical
  {
    id: 'msg-tech-1',
    channelId: 'technical',
    senderId: 'user-eman',
    senderName: 'Eman Ashraf',
    senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'SEO',
    senderDepartment: 'التطوير والتقنية',
    text: 'تقرير السيو الشهري تم تحديثه، كلمات البحث في الصفحة الأولى زادت بنسبة 35% بالمقارنة مع الشهر السابق 📈.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    reactions: [
      { emoji: '🔥', count: 3, userIds: ['user-1', 'user-amira', 'user-aya'] }
    ]
  },

  // Channel: announcements
  {
    id: 'msg-ann-1',
    channelId: 'announcements',
    senderId: 'user-1',
    senderName: 'هدير سعيد',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'مدير عام النظام والعمليات',
    senderDepartment: 'الإدارة',
    text: '📢 تنبيه هام: تم إضافة ميزة "التقرير اليومي لشغل وتاسكات التيم" وتفعيل "الدردشة والتواصل الفوري" داخل المنظومة لتعزيز التنسيق وسرعة إنجاز العمل.',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    isPinned: true,
    reactions: [
      { emoji: '🎉', count: 5, userIds: ['user-amira', 'user-aya', 'user-eman', 'user-maibel', 'user-1'] }
    ]
  },

  // Direct Messages between User 1 (Hadeer) and Amira
  {
    id: 'dm-1',
    senderId: 'user-amira',
    recipientId: 'user-1',
    senderName: 'Amira',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    senderRole: 'account manager',
    text: 'مساء الخير أستاذة هدير، بخصوص تجديد اشتراك عميل الكويت تم إرسال رسالة التذكير عبر الواتساب ومتابعين معهم.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    reactions: [{ emoji: '👍', count: 1, userIds: ['user-1'] }]
  },
  {
    id: 'dm-2',
    senderId: 'user-1',
    recipientId: 'user-amira',
    senderName: 'هدير سعيد',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'مدير عام النظام والعمليات',
    text: 'الله يعطيك العافية يا أميرة، لو فيه أي استفسار عن الفاتورة أو الحساب البنكي أنا معاكِ.',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
  },

  // Direct Messages with Aya
  {
    id: 'dm-3',
    senderId: 'user-aya',
    recipientId: 'user-1',
    senderName: 'Aya Gaber',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    senderRole: 'Designer',
    text: 'أ. هدير، هل فيه أي تعديل على الهيدر الجديد أو الشعار الخاص بالنظام؟',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'dm-4',
    senderId: 'user-1',
    recipientId: 'user-aya',
    senderName: 'هدير سعيد',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    senderRole: 'مدير عام النظام والعمليات',
    text: 'التصميم معتمد وممتاز جداً يا آية، استمري على هذا النمط 🌟.',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString()
  }
];
