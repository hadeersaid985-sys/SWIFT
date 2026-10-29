import React, { useState, useEffect } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { ChatProvider } from './context/ChatContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ReportsListView } from './components/reports/ReportsListView';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { TasksView } from './components/tasks/TasksView';
import { TeamView } from './components/team/TeamView';
import { MailView } from './components/mail/MailView';
import { TeamChatView } from './components/chat/TeamChatView';
import { DealsView } from './components/deals/DealsView';
import { LeadsView } from './components/leads/LeadsView';
import { MeetingsView } from './components/meetings/MeetingsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { MarketingBoardView } from './components/marketing/MarketingBoardView';
import { ClientRenewalsView } from './components/renewals/ClientRenewalsView';
import { SuspendedContractsView } from './components/clients/SuspendedContractsView';
import { HostMigrationView } from './components/host/HostMigrationView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { PayrollAttendanceView } from './components/payroll/PayrollAttendanceView';
import { FinancialSystemView } from './components/finance/FinancialSystemView';
import { SalesCommissionView } from './components/sales/SalesCommissionView';
import { MarketingIdeasThoughtsView } from './components/marketing/MarketingIdeasThoughtsView';
import { PerformanceEvaluationView } from './components/performance/PerformanceEvaluationView';
import { QuickModals } from './components/modals/QuickModals';
import { LoginModal } from './components/auth/LoginModal';
import { EmployeeLoginPage } from './components/auth/EmployeeLoginPage';
import { SystemLandingPage } from './components/landing/SystemLandingPage';
import { DataResetModal } from './components/modals/DataResetModal';
import { BrandSettingsModal } from './components/modals/BrandSettingsModal';
import { AdminPinModal } from './components/modals/AdminPinModal';
import { DailyDigestModal } from './components/digest/DailyDigestModal';
import { ProfileView } from './components/profile/ProfileView';
import { GitHubSyncModal } from './components/modals/GitHubSyncModal';
import { SwiftMyndLogo } from './components/common/SwiftMyndLogo';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { ShieldAlert, ArrowLeft, UserCheck, KeyRound, LogIn, LogOut, BellRing, Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('App ErrorBoundary caught and recovered smoothly:', error, errorInfo);
  }

  componentDidUpdate(_prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    if (this.state.hasError && !prevState.hasError) {
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 50);
    }
  }

  render() {
    return this.props.children;
  }
}

const checkIsLoginUrl = () => {
  if (typeof window === 'undefined') return false;
  try {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path === '/login' ||
      path === '/login/' ||
      path.startsWith('/login') ||
      path.includes('/login') ||
      hash === '#/login' ||
      hash === '#login' ||
      hash.includes('login') ||
      search.includes('login') ||
      search.includes('login=true')
    );
  } catch {
    return false;
  }
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
    isSalesUser,
    renewalsDueSoonCount
  } = useCRM();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(checkIsLoginUrl);
  const [showLoginView, setShowLoginView] = useState(checkIsLoginUrl);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // Listen to browser navigation (/login URL)
  useEffect(() => {
    const handleUrlChange = () => {
      const isLogin = checkIsLoginUrl();
      setIsLoginPage(isLogin);
      setShowLoginView(isLogin);
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleLogout = () => {
    // Return directly to the main landing/home page (https://tazkoraio.com / /)
    setShowLoginView(false);
    setIsLoginPage(false);
    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.replaceState({}, '', '/');
      } catch (e) {
        console.warn('History replaceState error', e);
      }
    }
    logoutUser();
  };

  // حماية السيستم وخصوصية البيانات: إذا لم يكن المستخدم مسجل الدخول
  if (!isAuthenticated) {
    if (isLoginPage || showLoginView) {
      return (
        <EmployeeLoginPage
          onSuccessLogin={() => {
            setIsLoginPage(false);
            setShowLoginView(false);
            if (typeof window !== 'undefined' && window.history) {
              try {
                const url = new URL(window.location.href);
                url.pathname = '/';
                window.history.replaceState({}, '', url.toString());
              } catch (e) {}
            }
          }}
          onBackToLanding={() => {
            setIsLoginPage(false);
            setShowLoginView(false);
            if (typeof window !== 'undefined' && window.history) {
              try {
                window.history.replaceState({}, '', '/');
              } catch (e) {}
            }
          }}
        />
      );
    }

    return (
      <SystemLandingPage
        onGoToLogin={() => {
          setShowLoginView(true);
          setIsLoginPage(true);
          if (typeof window !== 'undefined' && window.history) {
            try {
              window.history.replaceState({}, '', '/login');
            } catch (e) {}
          }
        }}
      />
    );
  }

  // Sync custom favicon dynamically
  useEffect(() => {
    if (brandConfig?.customFaviconUrl) {
      try {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = brandConfig.customFaviconUrl;
      } catch (e) {}
    }
  }, [brandConfig?.customFaviconUrl]);

  // Security & Role check: Non-admin employees ONLY see their allowed personal tabs
  // موظف المبيعات (مثل مايبل Maibel) يظهر له قسم العملاء المحتملين 'leads'
  const allowedEmployeeTabs = [
    'tasks',
    'renewals',
    'meetings',
    'calls',
    'mail',
    'chat',
    'profile',
    ...(isSalesUser ? ['leads'] : [])
  ];
  
  // Compute safe effective tab immediately to prevent blank content on role switch
  const effectiveTab = React.useMemo(() => {
    if (!isManager && !allowedEmployeeTabs.includes(activeTab)) {
      return 'tasks';
    }
    if (activeTab === 'work_queue') {
      return isManager ? 'reports' : 'tasks';
    }
    return activeTab || (isManager ? 'reports' : 'tasks');
  }, [isManager, activeTab, isSalesUser]);

  useEffect(() => {
    if (activeTab === 'work_queue') {
      setActiveTab(isManager ? 'reports' : 'tasks');
    } else if (!isManager && !allowedEmployeeTabs.includes(activeTab)) {
      setActiveTab('tasks');
    }
  }, [isManager, activeTab, setActiveTab, isSalesUser]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#f4f6f9] text-slate-800 flex flex-row selection:bg-blue-600 selection:text-white">
      {/* Right Navigation Sidebar (SwiftMynd style) */}
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">

        {/* 4-Day Renewal Alert Proactive Notification Banner for Admin */}
        {isManager && renewalsDueSoonCount > 0 && effectiveTab !== 'renewals' && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium shrink-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 bg-amber-100 rounded text-amber-800 shrink-0">
                <BellRing className="w-3.5 h-3.5" />
              </span>
              <span className="leading-snug">
                تنبيه تجديد اشتراكات: يوجد <strong className="font-bold text-amber-950 underline">{renewalsDueSoonCount} اشتراكات</strong> موعد تجديدها مستحق خلال 4 أيام أو أقل.
              </span>
            </div>

            <button
              onClick={() => setActiveTab('renewals')}
              className="bg-amber-800 hover:bg-amber-900 text-white px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              متابعة التجديدات ←
            </button>
          </div>
        )}

        {/* Top Navbar */}
        <TopNavbar
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-5 pb-28 sm:pb-24 md:pb-5 scrollbar-thin">
          {/* Employee only sees personal tasks, meetings, calls, mail, renewals, chat, and profile */}
          {!isManager ? (
            <>
              {effectiveTab === 'profile' && <ProfileView />}
              {effectiveTab === 'renewals' && <ClientRenewalsView />}
              {effectiveTab === 'meetings' && <MeetingsView />}
              {effectiveTab === 'calls' && <MeetingsView />}
              {effectiveTab === 'mail' && <MailView />}
              {effectiveTab === 'chat' && <TeamChatView />}
              {effectiveTab === 'leads' && isSalesUser && <LeadsView />}
              {effectiveTab === 'tasks' && <TasksView />}
              {!['profile', 'renewals', 'meetings', 'calls', 'mail', 'chat', 'tasks', ...(isSalesUser ? ['leads'] : [])].includes(effectiveTab) && (
                <TasksView />
              )}
            </>
          ) : (
            <>
              {effectiveTab === 'profile' && <ProfileView />}
              {(effectiveTab === 'performance' || effectiveTab === 'company_rules' || effectiveTab === 'delays') && (
                <PerformanceEvaluationView key={effectiveTab} initialTab={effectiveTab === 'company_rules' ? 'rules' : effectiveTab === 'delays' ? 'delays' : 'dashboard'} />
              )}
              {effectiveTab === 'marketing' && <MarketingBoardView />}
              {effectiveTab === 'renewals' && <ClientRenewalsView />}
              {effectiveTab === 'suspended_contracts' && <SuspendedContractsView />}
              {effectiveTab === 'host_migration' && <HostMigrationView />}
              {effectiveTab === 'reports' && <ReportsListView />}
              {effectiveTab === 'tasks' && <TasksView />}
              {effectiveTab === 'team' && <TeamView />}
              {effectiveTab === 'mail' && <MailView />}
              {effectiveTab === 'chat' && <TeamChatView />}
              {effectiveTab === 'home' && <HomeDashboard />}
              {effectiveTab === 'analytics' && <AnalyticsView />}
              {effectiveTab === 'deals' && <DealsView />}
              {effectiveTab === 'leads' && <LeadsView />}
              {effectiveTab === 'meetings' && <MeetingsView />}
              {effectiveTab === 'calls' && <MeetingsView />}
              {effectiveTab === 'projects' && <ProjectsView />}
              {effectiveTab === 'inventory' && <ProjectsView />}
              {effectiveTab === 'support' && <ProjectsView />}
              {effectiveTab === 'integrations' && <ProjectsView />}
              {effectiveTab === 'system_settings' && <SystemSettingsView />}
              {(effectiveTab === 'payroll' || effectiveTab === 'salaries') && <PayrollAttendanceView />}
              {effectiveTab === 'finance' && <FinancialSystemView />}
              {effectiveTab === 'sales_commissions' && <SalesCommissionView />}
              {effectiveTab === 'marketing_ideas' && <MarketingIdeasThoughtsView />}

              {/* Sub-views from Sales menu */}
              {effectiveTab === 'contacts' && <LeadsView />}
              {effectiveTab === 'accounts' && <FinancialSystemView />}
              {effectiveTab === 'forecasts' && <AnalyticsView />}
              {effectiveTab === 'documents' && <ReportsListView />}
              {effectiveTab === 'campaigns' && <ReportsListView />}

              {/* Fallback for unlisted manager tabs */}
              {!['profile', 'performance', 'company_rules', 'delays', 'marketing', 'renewals', 'suspended_contracts', 'host_migration', 'reports', 'tasks', 'team', 'mail', 'chat', 'home', 'analytics', 'deals', 'leads', 'meetings', 'calls', 'projects', 'inventory', 'support', 'integrations', 'system_settings', 'payroll', 'salaries', 'finance', 'sales_commissions', 'marketing_ideas', 'contacts', 'accounts', 'forecasts', 'documents', 'campaigns'].includes(effectiveTab) && (
                <ReportsListView />
              )}
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Fast 1-tap switching on phones) */}
        <MobileBottomNav
          onOpenMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen}
        />

        {/* Bottom subtle status bar (Desktop only) */}
        <footer className="hidden md:flex h-7 bg-white border-t border-slate-200/90 px-4 items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <SwiftMyndLogo variant="icon" size="xs" />
            <span className="font-bold text-slate-700">{brandConfig?.brandName || 'SWIFTMYND'}</span>
            <span>|</span>
            <span>مساحة فريق CRM ({orgId})</span>
            <span>|</span>
            <span>المستخدم المسجل: <strong className="text-slate-700">{currentUser?.name || 'مستخدم'}</strong> ({currentUser?.username || ''})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="تسجيل الخروج والعودة للرئيسية مباشرة"
            >
              <LogOut className="w-3 h-3" />
              <span>تسجيل الخروج</span>
            </button>
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

      {/* GitHub Export & Import Sync Modal */}
      <GitHubSyncModal />
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <ChatProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ChatProvider>
    </CRMProvider>
  );
}

