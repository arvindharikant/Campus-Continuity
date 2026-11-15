import React, { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { SampleNoticeBanner } from '../components/SampleNoticeBanner';
import { StatusText } from '../components/StatusText';
import {
  GapCategory,
  KnowledgeGap,
  PageId,
  Project,
  ProjectTask,
} from '../types/campus';

interface KnowledgeGapPageProps {
  projects: Project[];
  tasks: ProjectTask[];
  gaps: KnowledgeGap[];
  onToggleGapResolved: (gapId: string) => void;
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: PageId) => void;
}

const GAP_CATEGORIES: GapCategory[] = [
  'Missing task owners',
  'Unclear task statuses',
  'Conflicting information',
  'Missing project details',
];

export const KnowledgeGapPage: React.FC<KnowledgeGapPageProps> = ({
  projects,
  tasks,
  gaps,
  onToggleGapResolved,
  onSelectProject,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | GapCategory>('All');
  const [showResolved, setShowResolved] = useState(false);

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  // Derive live gaps from tasks created or edited in the session if not already covered by sample gaps
  const existingTaskIds = new Set(gaps.map((g) => g.relatedTaskId).filter(Boolean));

  const dynamicTaskGaps: KnowledgeGap[] = [];
  tasks.forEach((task) => {
    if (existingTaskIds.has(task.id)) return;
    if (task.assignedMember === 'Unassigned' && task.status !== 'Completed') {
      dynamicTaskGaps.push({
        id: `dyn-owner-${task.id}`,
        projectId: task.projectId,
        category: 'Missing task owners',
        severity: 'High',
        title: `Task "${task.title}" has no assigned owner`,
        detail: `Due ${task.deadline}. Assign an incoming or continuing student before member handover.`,
        sourceReference: 'Live Workspace Task Check',
        relatedTaskId: task.id,
        resolved: false,
      });
    }
    if (task.status === 'Unclear') {
      dynamicTaskGaps.push({
        id: `dyn-status-${task.id}`,
        projectId: task.projectId,
        category: 'Unclear task statuses',
        severity: 'Medium',
        title: `Unclear status on "${task.title}"`,
        detail: `Assigned to ${task.assignedMember}. Clarify whether work is complete, in progress, or blocked.`,
        sourceReference: 'Live Workspace Task Check',
        relatedTaskId: task.id,
        resolved: false,
      });
    }
  });

  const combinedGaps = [...gaps, ...dynamicTaskGaps];

  const countByCategory = (cat: GapCategory) =>
    combinedGaps.filter((g) => g.category === cat && !g.resolved).length;

  const filteredGaps = combinedGaps.filter((gap) => {
    const matchesCategory = selectedCategory === 'All' || gap.category === selectedCategory;
    const matchesResolved = showResolved ? true : !gap.resolved;
    return matchesCategory && matchesResolved;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            Knowledge Gap Detector
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Identify missing owners, unclear task statuses, conflicting notes, and undocumented lab details before handoff.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          />
          <span>Show resolved gaps</span>
        </label>
      </div>

      <SampleNoticeBanner
        title="Sample Rule Checks + Live Task State"
        description="Conflicting information and missing detail findings come from sample data. Unassigned tasks and Unclear statuses also update live from your Task & Decision Management edits."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {GAP_CATEGORIES.map((category) => {
          const openCount = countByCategory(category);
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(isActive ? 'All' : category)}
              className={`text-left rounded-xl border p-4 transition-colors ${
                isActive
                  ? 'border-teal-600 bg-teal-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-medium text-slate-500">{category}</p>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums text-navy-900">
                {openCount}
              </p>
              <p className="mt-1 text-xs text-teal-700 font-medium">
                {isActive ? 'Showing category · Click to clear' : 'Click to filter'}
              </p>
            </button>
          );
        })}
      </section>

      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {(['All', ...GAP_CATEGORIES] as const).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-display text-base font-semibold text-navy-900">
            Detected Knowledge Gaps ({filteredGaps.length})
          </h3>
        </div>

        {filteredGaps.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-navy-900">
              No open knowledge gaps in this view
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Everything in this category is resolved or filtered out.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredGaps.map((gap) => {
              const isDynamic = gap.id.startsWith('dyn-');
              return (
                <li
                  key={gap.id}
                  className={`px-5 py-4 transition-colors ${
                    gap.resolved ? 'bg-slate-50/70 opacity-75' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-navy-900">
                          {projectMap.get(gap.projectId) ?? 'Project'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{gap.category}</span>
                        <span aria-hidden="true">·</span>
                        <StatusText status={gap.severity} />
                        {gap.resolved && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-semibold">Resolved</span>
                          </>
                        )}
                      </div>

                      <h4 className="font-display text-sm font-bold text-navy-900">
                        {gap.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {gap.detail}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        Source: {gap.sourceReference}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {gap.relatedTaskId && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(gap.projectId);
                            onNavigate('tasks');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-navy-900 hover:bg-slate-50 whitespace-nowrap"
                        >
                          Open Task
                        </button>
                      )}

                      {!isDynamic && (
                        <button
                          type="button"
                          onClick={() => onToggleGapResolved(gap.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                            gap.resolved
                              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                              : 'bg-teal-600 text-white hover:bg-teal-700'
                          }`}
                        >
                          {gap.resolved ? (
                            <>
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Reopen</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Resolved</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
