import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  FileBarChart2,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Share2,
  Shield,
  Sparkles,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useEcosystem } from '../context/EcosystemContext';
import { MODULE_METADATA, ROLE_LIST, ROLE_POLICIES } from '../data/rbac';
import type { ModuleId, UserRole } from '../types/ecosystem';
import { AdminModule } from './modules/AdminModule';
import { AssessmentsModule } from './modules/AssessmentsModule';
import { ExecutiveOverviewModule } from './modules/ExecutiveOverviewModule';
import { FinancialModule } from './modules/FinancialModule';
import { IntelligenceModule } from './modules/IntelligenceModule';
import { OrganizationsModule } from './modules/OrganizationsModule';
import { ProfessionalsModule } from './modules/ProfessionalsModule';
import { ReferralsModule } from './modules/ReferralsModule';
import { ReportingModule } from './modules/ReportingModule';

const MODULE_ICONS: Record<ModuleId, React.FC<{ className?: string }>> = {
  overview: LayoutDashboard,
  assessments: ClipboardList,
  professionals: Users,
  referrals: Share2,
  organizations: Building2,
  intelligence: Sparkles,
  financial: CreditCard,
  reporting: FileBarChart2,
  admin: Shield,
};

export const WorkspaceShell: React.FC = () => {
  const {
    theme,
    toggleTheme,
    exitToLanding,
    activeRole,
    setActiveRole,
    activeModule,
    setActiveModule,
    setCommandPaletteOpen,
    settings,
    notifications,
    markAllNotificationsRead,
  } = useEcosystem();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const policy = ROLE_POLICIES[activeRole];
  const unreadCount = notifications.filter((n) => n.unread).length;

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <ExecutiveOverviewModule />;
      case 'assessments':
        return <AssessmentsModule />;
      case 'professionals':
        return <ProfessionalsModule />;
      case 'referrals':
        return <ReferralsModule />;
      case 'organizations':
        return <OrganizationsModule />;
      case 'intelligence':
        return <IntelligenceModule />;
      case 'financial':
        return <FinancialModule />;
      case 'reporting':
        return <ReportingModule />;
      case 'admin':
        return <AdminModule />;
      default:
        return <ExecutiveOverviewModule />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 border-b border-zinc-200/80 dark:border-slate-800 flex items-center justify-between">
        <span className="font-display text-base font-semibold tracking-tight text-zinc-950 dark:text-white whitespace-nowrap truncate">
          {settings.brandTitle}
        </span>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          aria-label="Close navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {policy.allowedModules.map((modId) => {
          const meta = MODULE_METADATA[modId];
          const Icon = MODULE_ICONS[modId];
          const isActive = activeModule === modId;
          return (
            <button
              key={modId}
              onClick={() => {
                setActiveModule(modId);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-800 text-white dark:bg-indigo-600'
                  : 'text-zinc-600 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800/70 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{meta.shortLabel}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200/80 dark:border-slate-800 space-y-3">
        <div className="text-[11px] text-zinc-500 dark:text-slate-400 truncate">
          {policy.actorName} · {policy.shortLabel}
        </div>
        <button
          onClick={exitToLanding}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-slate-700 text-zinc-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-[#18181B] dark:bg-[#0B0F17] dark:text-[#F8FAFC]">
      <aside className="hidden lg:block w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-zinc-200/80 dark:border-slate-800 sticky top-0 h-screen no-print">
        {sidebarContent}
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-56 h-full bg-white dark:bg-slate-900 border-r border-zinc-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 px-6 lg:px-10 bg-[#FAF9F6]/90 dark:bg-[#0B0F17]/90 backdrop-blur-md border-b border-zinc-200/70 dark:border-slate-800 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-zinc-200 dark:border-slate-700 text-zinc-600 dark:text-slate-300"
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="font-display text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {MODULE_METADATA[activeModule].label}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <span className="font-mono-num text-[11px] opacity-70">⌘K</span>
            </button>

            <select
              aria-label="Switch active user role"
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-900 dark:text-slate-100 max-w-[165px] cursor-pointer"
            >
              {(['Platform Governance', 'Clinical Network', 'Client & Family', 'Enterprise Clients'] as const).map(
                (groupName) => (
                  <optgroup key={groupName} label={groupName}>
                    {ROLE_LIST.filter((r) => r.group === groupName).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((p) => !p)}
                className="relative p-2 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-700 text-white text-[10px] font-mono-num flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 shadow-xl p-3 space-y-2 z-30">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-zinc-950 dark:text-white">Notifications</span>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Mark read
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (policy.allowedModules.includes(n.module)) {
                          setActiveModule(n.module);
                        }
                        setNotifOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${n.unread ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-zinc-400">{n.timeAgo}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-slate-400 mt-0.5">{n.detail}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-zinc-600 dark:text-slate-300 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
              aria-label="Toggle Light/Dark theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};
