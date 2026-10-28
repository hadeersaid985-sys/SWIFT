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

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

