import React from 'react';
import {
  CheckSquare,
  Mail,
  FileSpreadsheet,
  UserCheck,
  Menu,
  Home,
  Clock,
  Megaphone
} from 'lucide-react';
import { useCRM, isTaskAssignedToUser, isUserMentionedInTask } from '../../context/CRMContext';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu, isMenuOpen }) => {
  const {
    activeTab,
    setActiveTab,
    isManager,
    tasks,
    currentUser,
    unreadEmailsCount,
    renewalsDueSoonCount
  } = useCRM();

  // Employee pending tasks count
  const myPendingTasksCount = tasks.filter(
    t => !t.isPrivate && t.status !== 'completed' &&
      ((currentUser && isTaskAssignedToUser(t, currentUser)) || isUserMentionedInTask(t, currentUser))
  ).length;

  // Items for Employee
  const employeeItems = [
    {
      id: 'tasks',
      label: 'المهام',
      icon: CheckSquare,
      badge: myPendingTasksCount > 0 ? myPendingTasksCount : null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'mail',
      label: 'البريد',
      icon: Mail,
      badge: unreadEmailsCount > 0 ? unreadEmailsCount : null,
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'renewals',
      label: 'العملاء',
      icon: FileSpreadsheet,
      badge: null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'profile',
      label: 'حسابي',
      icon: UserCheck,
      badge: null,
      badgeColor: 'bg-blue-600'
    }
  ];

  // Items for Admin / Manager
  const adminItems = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      badge: null,
      badgeColor: 'bg-blue-600'
    },
    {
      id: 'tasks',
      label: 'المهام',
      icon: CheckSquare,
      badge: tasks.filter(t => t.status !== 'completed').length || null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'renewals',
      label: 'تجديدات',
      icon: Clock,
      badge: renewalsDueSoonCount > 0 ? renewalsDueSoonCount : null,
      badgeColor: 'bg-rose-600'
    },
    {
      id: 'marketing',
      label: 'ماركيتنج',
      icon: Megaphone,
      badge: null,
      badgeColor: 'bg-amber-600'
    }
  ];

  const items = isManager ? adminItems : employeeItems;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 flex items-center justify-around safe-bottom"
      aria-label="شريط التنقل السريع في الموبايل"
    >
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id && !isMenuOpen;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`min-w-4 h-4 px-1 ${item.badgeColor} text-white rounded-full text-[9px] font-black absolute -top-1.5 -right-2 flex items-center justify-center shadow-xs ring-2 ring-white`}
                >
                  {item.badge}
                </span>
              )}
            </div>

            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-blue-700' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* 5th Button: القائمة (Opens mobile drawer) */}
      <button
        onClick={onOpenMenu}
        className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl transition-all cursor-pointer relative ${
          isMenuOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        {isMenuOpen && (
          <span className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full" />
        )}
        <div className="relative">
          <Menu className={`w-5 h-5 transition-transform ${isMenuOpen ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
          {renewalsDueSoonCount > 0 && isManager && (
            <span className="w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white absolute top-0 right-0 animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] mt-0.5 tracking-tight ${isMenuOpen ? 'font-black text-blue-700' : 'font-medium'}`}>
          القائمة
        </span>
      </button>
    </nav>
  );
};
