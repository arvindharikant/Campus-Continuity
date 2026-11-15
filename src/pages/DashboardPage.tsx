import React from 'react';
import { ArrowRight, FileText, FolderKanban } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { StatusText } from '../components/StatusText';
import { SampleNoticeBanner } from '../components/SampleNoticeBanner';
import {
  ActivityItem,
  KnowledgeGap,
  PageId,
  Project,
  ProjectTask,
} from '../types/campus';

interface DashboardPageProps {
  projects: Project[];
  tasks: ProjectTask[];
  activities: ActivityItem[];
  gaps: KnowledgeGap[];
  onNavigate: (page: PageId) => void;
  onSelectProject: (projectId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  projects,
  tasks,
  activities,
  gaps,
  onNavigate,
  onSelectProject,
}) => {
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const unresolvedGaps = gaps.filter((g) => !g.resolved);

  const projectNameById = new Map(projects.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-teal-700">Fall 2026 Semester Transition</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-navy-900 text-balance">
            Welcome back to CampusContinuity
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Preserve project architecture, open tasks, and technical decisions as senior team members graduate and new student leads step in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('documents')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span>Upload Documents</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('handover')}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-800 transition-colors whitespace-nowrap"
          >
            <span>Prepare Handover Report</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <SampleNoticeBanner
        title="Sample Workspace Preview"
        description="Metrics, activity logs, and knowledge gap alerts below use realistic student project sample data. Persistence, authentication, and live AI analysis will connect when the FastAPI and PostgreSQL backend is integrated."
      />

      <section aria-label="Workspace overview metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={projects.length}
          helperText="Across engineering & civic clubs"
          accent="navy"
        />
        <StatCard
          label="Completed Tasks"
          value={completedTasksCount}
          helperText="Verified & closed deliverables"
          accent="teal"
        />
        <StatCard
          label="Pending Tasks"
          value={pendingTasksCount}
          helperText="In progress, pending, blocked, or unclear"
          accent="neutral"
        />
        <StatCard
          label="Knowledge Gap Alerts"
          value={unresolvedGaps.length}
          helperText="Open risks before member handoff"
          accent="amber"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h3 className="font-display text-base font-semibold text-navy-900">
                Recent Project Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest document uploads, decisions, and handover milestones
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              View Projects
            </button>
          </div>

          <ul className="divide-y divide-slate-100">
            {activities.map((item) => (
              <li key={item.id} className="px-5 py-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(item.projectId);
                      onNavigate('projects');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-teal-700 text-left"
                  >
                    <FolderKanban className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    <span>{item.projectName}</span>
                  </button>
                  <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                  <span className="font-medium text-slate-900">{item.actor}</span>{' '}
                  {item.action}.
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h3 className="font-display text-base font-semibold text-navy-900">
                Knowledge Gap Alerts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Items that could stall incoming student teams
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('gaps')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap"
            >
              Inspect All
            </button>
          </div>

          {unresolvedGaps.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-navy-900">No unresolved knowledge gaps</p>
              <p className="mt-1 text-xs text-slate-500">
                All flagged handover risks in this session have been marked resolved.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {unresolvedGaps.slice(0, 4).map((gap) => (
                <li key={gap.id} className="px-5 py-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 truncate">
                      {projectNameById.get(gap.projectId) ?? 'Project'} · {gap.category}
                    </span>
                    <StatusText status={gap.severity} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-navy-900">{gap.title}</p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {gap.detail}
                  </p>
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(gap.projectId);
                        onNavigate('gaps');
                      }}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      Review gap details →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
