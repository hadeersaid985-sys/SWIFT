import React, { useState, useEffect } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ReportsListView } from './components/reports/ReportsListView';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { TasksView } from './components/tasks/TasksView';
import { TeamView } from './components/team/TeamView';
import { MailView } from './components/mail/MailView';
import { DealsView } from './components/deals/DealsView';
import { LeadsView } from './components/leads/LeadsView';
import { MeetingsView } from './components/meetings/MeetingsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { WorkQueueView } from './components/workqueue/WorkQueueView';
import { MarketingBoardView } from './components/marketing/MarketingBoardView';
import { ClientRenewalsView } from './components/renewals/ClientRenewalsView';
import { HostMigrationView } from './components/host/HostMigrationView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { QuickModals } from './components/modals/QuickModals';
import { LoginModal } from './components/auth/LoginModal';
import { EmployeeLoginPage } from './components/auth/EmployeeLoginPage';
import { SystemLandingPage } from './components/landing/SystemLandingPage';
import { DataResetModal } from './components/modals/DataResetModal';
import { BrandSettingsModal } from './components/modals/BrandSettingsModal';
import { AdminPinModal } from './components/modals/AdminPinModal';
import { DailyDigestModal } from './components/digest/DailyDigestModal';
import { SwiftMyndLogo } from './components/common/SwiftMyndLogo';
import { ShieldAlert, ArrowLeft, UserCheck, KeyRound, LogIn, BellRing, Sparkles } from 'lucide-react';

const checkIsLoginUrl = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/login' ||
    path === '/login/' ||
    path.startsWith('/login') ||
    hash === '#/login' ||
    hash === '#login' ||
    search.includes('login=true')
  );
};

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    orgId,
    orgName,
    currentUser,
    isAuthenticated,
    logoutUser,
    isImpersonating,
    returnToAdmin,
    brandConfig,
    isManager,
    renewalsDueSoonCount
  } = useCRM();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(checkIsLoginUrl);
  const [showLoginView, setShowLoginView] = useState(false);

  // Listen to browser navigation (/login URL)
  useEffect(() => {
    const handleUrlChange = () => {
      const isLogin = checkIsLoginUrl();
      setIsLoginPage(isLogin);
      if (isLogin) {
        setShowLoginView(true);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // حماية السيستم وخصوصية البيانات: إذا لم يكن المستخدم مسجل الدخول:
  // إذا كان على مسار /login أو ضغط على زر تسجيل الدخول، تفتح شاشة الدخول
  // وإلا تعرض الصفحة الرئيسية التعريفية بالمنظومة مع زر تسجيل الدخول
  if (!isAuthenticated) {
    if (isLoginPage || showLoginView) {
      return (
        <EmployeeLoginPage
          onSuccessLogin={() => {
            setIsLoginPage(false);
            setShowLoginView(false);
          }}
          onBackToLanding={() => {
            setIsLoginPage(false);
            setShowLoginView(false);
            if (typeof window !== 'undefined' && window.history) {
              window.history.pushState({}, '', '/');
            }
          }}
        />
      );
    }

    return (
      <SystemLandingPage
        onGoToLogin={() => {
          setShowLoginView(true);
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState({}, '', '/login');
          }
        }}
      />
    );
  }

  // Sync custom favicon dynamically
  useEffect(() => {
    if (brandConfig?.customFaviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = brandConfig.customFaviconUrl;
    }
  }, [brandConfig?.customFaviconUrl]);

  // Security & Role check: Non-admin employees ONLY see their allowed personal tabs (tasks, work queue, meetings, calls, mail)
  useEffect(() => {
    const allowedEmployeeTabs = ['tasks', 'work_queue', 'meetings', 'calls', 'mail'];
    if (!isManager && !allowedEmployeeTabs.includes(activeTab)) {
      setActiveTab('tasks');
    }
  }, [isManager, activeTab, setActiveTab]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4f6f9] text-slate-800 flex flex-row selection:bg-blue-600 selection:text-white">
      {/* Right Navigation Sidebar (Zoho / swiftmynd style) */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

        {/* 4-Day Renewal Alert Proactive Notification Banner for Admin */}
        {isManager && renewalsDueSoonCount > 0 && activeTab !== 'renewals' && (
          <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white px-4 py-2 flex items-center justify-between text-xs font-bold shadow-md shrink-0 z-40 animate-in slide-in-from-top">
            <div className="flex items-center gap-2.5">
              <span className="p-1 bg-white/20 rounded-md animate-pulse">
                <BellRing className="w-4 h-4 text-yellow-200" />
              </span>
              <span>
                🚨 تنبيه عاجل للأدمن (تجديد قبل 4 أيام): يوجد <strong className="underline text-yellow-200">{renewalsDueSoonCount} اشتراكات عملاء</strong> موعد تجديدها مستحق خلال 4 أيام أو أقل!
              </span>
            </div>

            <button
              onClick={() => setActiveTab('renewals')}
              className="bg-white hover:bg-amber-50 text-rose-950 px-3.5 py-1 rounded-lg text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 hover:scale-102"
            >
              <span>متابعة التجديدات والتواصل مع العملاء عبر واتساب فوراً ←</span>
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <TopNavbar onOpenLoginModal={() => setIsLoginModalOpen(true)} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5">
          {/* Employee only sees tasks, work queue, meetings, calls, mail */}
          {!isManager ? (
            <>
              {activeTab === 'tasks' && <TasksView />}
              {activeTab === 'work_queue' && <WorkQueueView />}
              {activeTab === 'meetings' && <MeetingsView />}
              {activeTab === 'calls' && <MeetingsView />}
              {activeTab === 'mail' && <MailView />}
            </>
          ) : (
            <>
              {activeTab === 'marketing' && <MarketingBoardView />}
              {activeTab === 'renewals' && <ClientRenewalsView />}
              {activeTab === 'host_migration' && <HostMigrationView />}
              {activeTab === 'work_queue' && <WorkQueueView />}
              {activeTab === 'reports' && <ReportsListView />}
              {activeTab === 'tasks' && <TasksView />}
              {activeTab === 'team' && <TeamView />}
              {activeTab === 'mail' && <MailView />}
              {activeTab === 'home' && <HomeDashboard />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'deals' && <DealsView />}
              {activeTab === 'leads' && <LeadsView />}
              {activeTab === 'meetings' && <MeetingsView />}
              {activeTab === 'calls' && <MeetingsView />}
              {activeTab === 'projects' && <ProjectsView />}
              {activeTab === 'inventory' && <ProjectsView />}
              {activeTab === 'support' && <ProjectsView />}
              {activeTab === 'integrations' && <ProjectsView />}
              {activeTab === 'system_settings' && <SystemSettingsView />}

              {/* Sub-views from Sales menu */}
              {activeTab === 'contacts' && <LeadsView />}
              {activeTab === 'accounts' && <LeadsView />}
              {activeTab === 'forecasts' && <AnalyticsView />}
              {activeTab === 'documents' && <ReportsListView />}
              {activeTab === 'campaigns' && <ReportsListView />}
              {activeTab === 'mcp' && <AnalyticsView />}
            </>
          )}
        </main>

        {/* Bottom subtle status bar */}
        <footer className="h-7 bg-white border-t border-slate-200/90 px-4 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <SwiftMyndLogo variant="icon" size="xs" />
            <span className="font-bold text-slate-700">{brandConfig?.brandName || 'SWIFTMYND'}</span>
            <span>|</span>
            <span>مساحة فريق CRM ({orgId})</span>
            <span>|</span>
            <span>المستخدم المسجل: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.username})</span>
          </div>

          <div className="flex items-center gap-3">
            {isManager ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>تبديل الحساب / تسجيل الدخول</span>
              </button>
            ) : (
              <button
                onClick={() => logoutUser()}
                className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>تسجيل الخروج</span>
              </button>
            )}
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>المزامنة السحابية متصلة ومباشرة</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Quick Modals Manager */}
      <QuickModals />

      {/* Login & User Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Data Reset & Wipe Modal */}
      <DataResetModal />

      {/* Brand & Logo Customization Modal for Admin */}
      <BrandSettingsModal />

      {/* Admin Security PIN Modal for Employee Account Lock */}
      <AdminPinModal />

      {/* Daily Digest Modal for Employee Login Summary */}
      <DailyDigestModal />
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}
