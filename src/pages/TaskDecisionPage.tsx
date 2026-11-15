import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { StatusText } from '../components/StatusText';
import {
  Project,
  ProjectDecision,
  ProjectTask,
  TaskStatus,
} from '../types/campus';

interface TaskDecisionPageProps {
  projects: Project[];
  selectedProjectId: string;
  tasks: ProjectTask[];
  decisions: ProjectDecision[];
  onAddTask: (task: ProjectTask) => void;
  onUpdateTask: (taskId: string, patch: Partial<ProjectTask>) => void;
  onAddDecision: (decision: ProjectDecision) => void;
}

const TASK_STATUSES: TaskStatus[] = [
  'Completed',
  'In Progress',
  'Pending',
  'Blocked',
  'Unclear',
];

export const TaskDecisionPage: React.FC<TaskDecisionPageProps> = ({
  projects,
  selectedProjectId,
  tasks,
  decisions,
  onAddTask,
  onUpdateTask,
  onAddDecision,
}) => {
  const [projectFilter, setProjectFilter] = useState<string>(selectedProjectId);
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDecisionForm, setShowDecisionForm] = useState(false);

  // Add Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProjectId, setTaskProjectId] = useState(selectedProjectId);
  const [taskAssignee, setTaskAssignee] = useState('Unassigned');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('Pending');
  const [taskDeadline, setTaskDeadline] = useState('2026-12-01');
  const [taskDependencies, setTaskDependencies] = useState('None');

  // Add Decision form state
  const [decTitle, setDecTitle] = useState('');
  const [decProjectId, setDecProjectId] = useState(selectedProjectId);
  const [decRationale, setDecRationale] = useState('');
  const [decOwner, setDecOwner] = useState('');
  const [decImpact, setDecImpact] = useState('Architecture');

  useEffect(() => {
    setProjectFilter(selectedProjectId);
    setTaskProjectId(selectedProjectId);
    setDecProjectId(selectedProjectId);
  }, [selectedProjectId]);

  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const activeFilterProject = projectMap.get(projectFilter);

  const visibleTasks = tasks.filter((task) => {
    const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesProject && matchesStatus;
  });

  const visibleDecisions = decisions.filter(
    (d) => projectFilter === 'all' || d.projectId === projectFilter
  );

  const memberOptionsForProject = (pid: string): string[] => {
    const proj = projectMap.get(pid);
    if (!proj) return ['Unassigned'];
    return ['Unassigned', ...proj.members.map((m) => m.name)];
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onAddTask({
      id: `task-${Date.now()}`,
      projectId: taskProjectId,
      title: taskTitle.trim(),
      assignedMember: taskAssignee,
      status: taskStatus,
      deadline: taskDeadline,
      dependencies: taskDependencies.trim() || 'None',
    });
    setTaskTitle('');
    setTaskDependencies('None');
    setShowTaskForm(false);
  };

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decTitle.trim() || !decRationale.trim()) return;
    onAddDecision({
      id: `dec-${Date.now()}`,
      projectId: decProjectId,
      title: decTitle.trim(),
      rationale: decRationale.trim(),
      decidedBy: decOwner.trim() || 'Student Team',
      date: '2026-11-13',
      impactArea: decImpact.trim() || 'General',
    });
    setDecTitle('');
    setDecRationale('');
    setDecOwner('');
    setShowDecisionForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">
            Task &amp; Decision Management
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Track task ownership, deadlines, upstream dependencies, and technical decisions so context stays intact.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowDecisionForm((prev) => !prev);
              setShowTaskForm(false);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Decision</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowTaskForm((prev) => !prev);
              setShowDecisionForm(false);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 text-xs font-semibold text-white hover:bg-navy-800 transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {showTaskForm && (
        <form
          onSubmit={handleCreateTask}
          className="rounded-xl border border-teal-200 bg-teal-50/40 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-navy-900">Add New Project Task</h3>
            <button
              type="button"
              onClick={() => setShowTaskForm(false)}
              className="text-slate-500 hover:text-navy-900"
              aria-label="Close task form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="new-task-title" className="block text-xs font-semibold text-navy-900 mb-1">
                Task Name
              </label>
              <input
                id="new-task-title"
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Verify ultrasonic rangefinder waterproofing seal"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="new-task-project" className="block text-xs font-semibold text-navy-900 mb-1">
                Project
              </label>
              <select
                id="new-task-project"
                value={taskProjectId}
                onChange={(e) => {
                  setTaskProjectId(e.target.value);
                  setTaskAssignee('Unassigned');
                }}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-task-assignee" className="block text-xs font-semibold text-navy-900 mb-1">
                Assigned Member
              </label>
              <select
                id="new-task-assignee"
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                {memberOptionsForProject(taskProjectId).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-task-status" className="block text-xs font-semibold text-navy-900 mb-1">
                Status
              </label>
              <select
                id="new-task-status"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-task-deadline" className="block text-xs font-semibold text-navy-900 mb-1">
                Deadline
              </label>
              <input
                id="new-task-deadline"
                type="date"
                value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="new-task-deps" className="block text-xs font-semibold text-navy-900 mb-1">
                Dependencies
              </label>
              <input
                id="new-task-deps"
                type="text"
                value={taskDependencies}
                onChange={(e) => setTaskDependencies(e.target.value)}
                placeholder="e.g. Chassis wiring harness complete"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowTaskForm(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Save Task (Session)
            </button>
          </div>
        </form>
      )}

      {showDecisionForm && (
        <form
          onSubmit={handleCreateDecision}
          className="rounded-xl border border-navy-200 bg-navy-50/50 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-navy-900">
              Log Important Technical Decision
            </h3>
            <button
              type="button"
              onClick={() => setShowDecisionForm(false)}
              className="text-slate-500 hover:text-navy-900"
              aria-label="Close decision form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="dec-title" className="block text-xs font-semibold text-navy-900 mb-1">
                Decision Summary
              </label>
              <input
                id="dec-title"
                type="text"
                required
                value={decTitle}
                onChange={(e) => setDecTitle(e.target.value)}
                placeholder="e.g. Use 24V LiFePO4 cells instead of LiPo for indoor lab compliance"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="dec-project" className="block text-xs font-semibold text-navy-900 mb-1">
                Project
              </label>
              <select
                id="dec-project"
                value={decProjectId}
                onChange={(e) => setDecProjectId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dec-owner" className="block text-xs font-semibold text-navy-900 mb-1">
                Decided By
              </label>
              <input
                id="dec-owner"
                type="text"
                value={decOwner}
                onChange={(e) => setDecOwner(e.target.value)}
                placeholder="e.g. Elena Rostova & Marcus Chen"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="dec-rationale" className="block text-xs font-semibold text-navy-900 mb-1">
                Rationale &amp; Context for Future Members
              </label>
              <textarea
                id="dec-rationale"
                rows={2}
                required
                value={decRationale}
                onChange={(e) => setDecRationale(e.target.value)}
                placeholder="Explain why this option was chosen and what alternatives were rejected..."
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="dec-impact" className="block text-xs font-semibold text-navy-900 mb-1">
                Impact Area
              </label>
              <input
                id="dec-impact"
                type="text"
                value={decImpact}
                onChange={(e) => setDecImpact(e.target.value)}
                placeholder="e.g. Power Systems"
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDecisionForm(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-navy-900 text-xs font-semibold text-white hover:bg-navy-800"
            >
              Save Decision (Session)
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {(['All', ...TASK_STATUSES] as const).map((status) => (
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

        <div className="flex items-center gap-2">
          <label htmlFor="task-project-filter" className="text-xs text-slate-500 whitespace-nowrap">
            Project Scope:
          </label>
          <select
            id="task-project-filter"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-navy-900 focus:border-teal-600 focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-navy-900">
              Project Tasks ({visibleTasks.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeFilterProject ? activeFilterProject.name : 'All student projects'} · Reassign owners or update status directly
            </p>
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No tasks match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-5">Task Name</th>
                  <th className="py-3 px-4">Assigned Member</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-5">Dependencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {visibleTasks.map((task) => {
                  const members = memberOptionsForProject(task.projectId);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 min-w-[240px]">
                        <div className="font-semibold text-navy-900">{task.title}</div>
                        <div className="text-slate-500 mt-0.5">
                          {projectMap.get(task.projectId)?.name ?? 'Project'}
                          {task.notes ? ` · ${task.notes}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          aria-label={`Assign member for ${task.title}`}
                          value={task.assignedMember}
                          onChange={(e) =>
                            onUpdateTask(task.id, { assignedMember: e.target.value })
                          }
                          className={`h-8 rounded-md border px-2 text-xs font-medium focus:border-teal-600 focus:outline-none ${
                            task.assignedMember === 'Unassigned'
                              ? 'border-amber-300 bg-amber-50 text-amber-800'
                              : 'border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          {members.map((member) => (
                            <option key={member} value={member}>
                              {member}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            aria-label={`Status for ${task.title}`}
                            value={task.status}
                            onChange={(e) =>
                              onUpdateTask(task.id, { status: e.target.value as TaskStatus })
                            }
                            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-navy-900 focus:border-teal-600 focus:outline-none"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className="hidden xl:inline-block">
                            <StatusText status={task.status} />
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {task.deadline}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 min-w-[180px]">
                        {task.dependencies}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-display text-base font-semibold text-navy-900">
            Important Decisions ({visibleDecisions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural and operational trade-offs preserved for future semesters
          </p>
        </div>

        {visibleDecisions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No decisions logged for this scope yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visibleDecisions.map((decision) => (
              <li key={decision.id} className="px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-medium text-teal-700">
                    {projectMap.get(decision.projectId)?.name ?? 'Project'} · {decision.impactArea}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-400">
                    {decision.date} · {decision.decidedBy}
                  </span>
                </div>
                <h4 className="mt-1 font-display text-sm font-bold text-navy-900">
                  {decision.title}
                </h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {decision.rationale}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
