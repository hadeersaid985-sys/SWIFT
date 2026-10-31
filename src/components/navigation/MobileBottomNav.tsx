import React from 'react';
import {
  Inbox,
  CheckSquare,
  Mail,
  FileSpreadsheet,
  Menu,
  Home,
  Clock,
  MessagesSquare
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../../context/CRMContext';
import { useChat } from '../../context/ChatContext';
import { isDemoWorkItem } from '../../utils/workQueueUtils';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu, isMenuOpen }) => {
  const { unreadCount: unreadChatCount } = useChat();
  const {
    activeTab,
    setActiveTab,
    isManager,
    tasks,
    currentUser,
    unreadEmailsCount,
    renewalsDueSoonCount
  } = useCRM();

  // Real pending tasks count for current employee
  const myPendingTasksCount = tasks.filter(
    t => !isDemoWorkItem(t.id, t.title, t.clientName) &&
      !t.isPrivate &&
      t.status !== 'completed' &&
      ((currentUser && isTaskAssignedToUser(t, currentUser)) || isUserMentionedInTask(t, currentUser))
  ).length;

  // Real pending tasks count for manager queue
  const managerPendingTasksCount = tasks.filter(
    t => !isDemoWorkItem(t.id, t.title, t.clientName) && t.status !== 'completed'
  ).length;

  // Items for Employee (5 buttons total: 4 primary + 1 menu)
  const employeeItems = [
    {
      id: 'work_queue',
      label: 'قائمة العمل',
      icon: Inbox,
      badge: myPendingTasksCount > 0 ? myPendingTasksCount : null,
      badgeColor: 'bg-orange-500'
    },
    {
      id: 'tasks',
      label: 'المهام',
      icon: CheckSquare,
      badge: null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'chat',
      label: 'الدردشة',
      icon: MessagesSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      badgeColor: 'bg-rose-600'
    },
    {
      id: 'mail',
      label: 'البريد',
      icon: Mail,
      badge: unreadEmailsCount > 0 ? unreadEmailsCount : null,
      badgeColor: 'bg-blue-600'
    }
  ];

  // Items for Admin / Manager (5 buttons total: 4 primary + 1 menu)
  const adminItems = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      badge: null,
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'work_queue',
      label: 'قائمة العمل',
      icon: Inbox,
      badge: managerPendingTasksCount > 0 ? managerPendingTasksCount : null,
      badgeColor: 'bg-orange-500'
    },
    {
      id: 'tasks',
      label: 'المهام',
      icon: CheckSquare,
      badge: null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'chat',
      label: 'الدردشة',
      icon: MessagesSquare,
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      badgeColor: 'bg-rose-600'
    }
  ];

  const items = isManager ? adminItems : employeeItems;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-1.5 py-1 flex items-center justify-between safe-bottom"
      aria-label="شريط التنقل السريع في الموبايل"
    >
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id && !isMenuOpen;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 min-w-0 max-w-[20%] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative touch-manipulation active:scale-95 ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-1 w-7 h-1 bg-blue-600 rounded-full animate-in fade-in" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`min-w-4 h-4 px-1 ${item.badgeColor} text-white rounded-full text-[9px] font-black absolute -top-1.5 -right-2 flex items-center justify-center shadow-xs ring-2 ring-white`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span
              title={item.label}
              className={`text-[10px] mt-0.5 tracking-tight whitespace-nowrap truncate max-w-full text-center ${
                isActive ? 'font-black text-blue-700' : 'font-medium text-slate-600'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* 5th Button: القائمة (Opens mobile drawer) */}
      <button
        type="button"
        onClick={onOpenMenu}
        className={`flex-1 min-w-0 max-w-[20%] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative touch-manipulation active:scale-95 ${
          isMenuOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        {isMenuOpen && (
          <span className="absolute -top-1 w-7 h-1 bg-blue-600 rounded-full animate-in fade-in" />
        )}
        <div className="relative">
          <Menu className={`w-5 h-5 transition-transform ${isMenuOpen ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
          {renewalsDueSoonCount > 0 && isManager && (
            <span className="w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white absolute top-0 right-0 animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] mt-0.5 tracking-tight ${isMenuOpen ? 'font-black text-blue-700' : 'font-medium text-slate-600'}`}>
          القائمة
        </span>
      </button>
    </nav>
  );
};
