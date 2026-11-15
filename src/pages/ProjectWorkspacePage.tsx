import React, { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { StatusText } from '../components/StatusText';
import { PageId, Project, ProjectStatus } from '../types/campus';

interface ProjectWorkspacePageProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  onOpenNewProject: () => void;
  onNavigate: (page: PageId) => void;
}

const STATUS_FILTERS: Array<'All' | ProjectStatus> = [
  'All',
  'Active',
  'Handover In Progress',
  'At Risk',
  'Completed',
];

export const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onUpdateProjectStatus,
  onOpenNewProject,
  onNavigate,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      project.name.toLowerCase().includes(q) ||
      project.department.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Project Workspace</h2>
          <p className="mt-1 text-sm text-slate-600">
            Track student project teams, outgoing and incoming leads, completion progress, and transition readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-800 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Project</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or departments..."
            aria-label="Search projects"
            className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-navy-900">No matching projects found</p>
          <p className="mt-1 text-xs text-slate-500">
            Adjust your status filter or create a new student project workspace.
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 inline-flex items-center rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-navy-900 hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            return (
              <article
                key={project.id}
                className={`rounded-xl border bg-white p-6 flex flex-col justify-between transition-colors ${
                  isSelected ? 'border-teal-600 ring-1 ring-teal-600/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        {project.department} <span aria-hidden="true">·</span> {project.semester}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-bold text-navy-900">
                        {project.name}
                      </h3>
                    </div>
                    <StatusText status={project.status} />
                  </div>

                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">Project Progress</span>
                      <span className="font-mono font-semibold text-navy-900 tabular-nums">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          project.status === 'At Risk'
                            ? 'bg-amber-600'
                            : project.status === 'Completed'
                              ? 'bg-emerald-600'
                              : 'bg-teal-600'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-navy-900 mb-2.5">
                      <Users className="h-3.5 w-3.5 text-teal-600" />
                      <span>Project Members ({project.members.length})</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {project.members.map((member) => (
                        <li
                          key={member.id}
                          className="rounded-lg bg-slate-50 px-3 py-2 text-xs border border-slate-100"
                        >
                          <div className="font-semibold text-navy-900 truncate">{member.name}</div>
                          <div className="text-slate-500 truncate">
                            {member.role} · {member.year}
                          </div>
                          {member.transitionNote && (
                            <div className="mt-0.5 text-[11px] font-medium text-teal-700 truncate">
                              {member.transitionNote}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`status-${project.id}`} className="text-xs text-slate-500">
                      Status:
                    </label>
                    <select
                      id={`status-${project.id}`}
                      value={project.status}
                      onChange={(e) =>
                        onUpdateProjectStatus(project.id, e.target.value as ProjectStatus)
                      }
                      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-navy-900 focus:border-teal-600 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Handover In Progress">Handover In Progress</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(project.id);
                        onNavigate('summary');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      AI Summary
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(project.id);
                        onNavigate('handover');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 transition-colors whitespace-nowrap"
                    >
                      Handover Report
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
