import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { PageId, Project } from '../types/campus';

interface TopBarProps {
  activePage: PageId;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenMobileNav: () => void;
  onOpenNewProject: () => void;
  onNavigate: (page: PageId) => void;
}

const PAGE_LABELS: Record<PageId, string> = {
  dashboard: 'Dashboard',
  projects: 'Project Workspace',
  documents: 'Document Management',
  summary: 'AI Project Summary',
  tasks: 'Task & Decision Management',
  gaps: 'Knowledge Gap Detector',
  handover: 'Handover Report',
};

export const TopBar: React.FC<TopBarProps> = ({
  activePage,
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenMobileNav,
  onOpenNewProject,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="hidden sm:inline font-medium text-slate-500 hover:text-navy-900 whitespace-nowrap shrink-0 transition-colors"
          >
            Workspace
          </button>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">
            /
          </span>
          <h1 className="font-display font-semibold text-navy-900 truncate">
            {PAGE_LABELS[activePage]}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden md:flex items-center gap-2">
          <label htmlFor="active-project-select" className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Active Project
          </label>
          <select
            id="active-project-select"
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="h-9 max-w-[230px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-navy-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>
    </header>
  );
};
