import React from 'react';
import {
  AlertTriangle,
  ClipboardCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  X,
} from 'lucide-react';
import { PageId } from '../types/campus';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unresolvedGapCount: number;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  unresolvedGapCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Project Workspace', icon: FolderKanban },
    { id: 'documents', label: 'Document Management', icon: FileText },
    { id: 'summary', label: 'AI Project Summary', icon: Sparkles },
    { id: 'tasks', label: 'Tasks & Decisions', icon: ListChecks },
    {
      id: 'gaps',
      label: 'Knowledge Gaps',
      icon: AlertTriangle,
      badgeCount: unresolvedGapCount,
    },
    { id: 'handover', label: 'Handover Report', icon: ClipboardCheck },
  ];

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col bg-slate-50/80 border-r border-slate-200">
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white font-display font-bold text-sm">
            CC
          </span>
          <span className="font-display text-base font-bold tracking-tight text-navy-900 whitespace-nowrap">
            CampusContinuity
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Primary Sidebar" className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                isActive
                  ? 'bg-navy-900 text-white'
                  : 'text-slate-700 hover:bg-slate-200/60 hover:text-navy-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-teal-400' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                <span
                  className={`tabular-nums text-xs font-mono shrink-0 ${
                    isActive ? 'text-teal-300' : 'text-amber-700 font-semibold'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 bg-white">
        <p className="text-xs font-medium text-navy-900">Frontend Preview Mode</p>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Using sample student project data. FastAPI &amp; PostgreSQL sync will connect in the next phase.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-white shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
