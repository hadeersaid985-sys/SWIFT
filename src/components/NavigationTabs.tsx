import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Mail,
  Building,
  Briefcase,
  Calendar,
  BarChart3,
  FolderKanban,
  DollarSign,
  Wallet,
  Percent,
  Lightbulb
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export const NavigationTabs: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    pendingTasksCount,
    unreadEmailsCount,
    team,
    leads,
    deals,
    isManager
  } = useCRM();

  const tabs = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      badge: null
    },
    ...(isManager
      ? [
          {
            id: 'finance',
            label: 'المالية والمصروفات',
            icon: Wallet,
            badge: null
          },
          {
            id: 'sales_commissions',
            label: 'عمولات المبيعات',
            icon: Percent,
            badge: null
          },
          {
            id: 'marketing_ideas',
            label: 'أفكار التسويق وتدويناتي',
            icon: Lightbulb,
            badge: null
          },
          {
            id: 'payroll',
            label: 'سجل الحضور والرواتب',
            icon: DollarSign,
            badge: null
          }
        ]
      : []),
    {
      id: 'tasks',
      label: 'المهام ومواعيدها',
      icon: CheckSquare,
      badge: null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'team',
      label: 'فريق العمل (الموظفين)',
      icon: Users,
      badge: team.length,
      badgeColor: 'bg-slate-200 text-slate-700'
    },
    {
      id: 'mail',
      label: 'بريد الفريق (Mail)',
      icon: Mail,
      badge: unreadEmailsCount > 0 ? unreadEmailsCount : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'leads',
      label: 'العملاء المحتملون',
      icon: Building,
      badge: leads.length,
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'deals',
      label: 'صفقات المبيعات',
      icon: Briefcase,
      badge: deals.length,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'meetings',
      label: 'الاجتماعات والمكالمات',
      icon: Calendar,
      badge: null
    },
    {
      id: 'reports',
      label: 'التقارير والتحليلات',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'projects',
      label: 'المشاريع والدعم',
      icon: FolderKanban,
      badge: null
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-xs sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer relative ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center ${
                      tab.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
