import React, { useState } from 'react';
import { CheckSquare, Download, FileCheck2, Plus, Printer, RefreshCw, Square } from 'lucide-react';
import { SampleNoticeBanner } from '../components/SampleNoticeBanner';
import { StatusText } from '../components/StatusText';
import {
  AIProjectSummaryData,
  ApprovalState,
  HandoverReviewState,
  KnowledgeGap,
  Project,
  ProjectDecision,
  ProjectTask,
} from '../types/campus';

interface HandoverReportPageProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  tasks: ProjectTask[];
  decisions: ProjectDecision[];
  gaps: KnowledgeGap[];
  summaries: Record<string, AIProjectSummaryData>;
  handovers: Record<string, HandoverReviewState>;
  onUpdateHandover: (projectId: string, patch: Partial<HandoverReviewState>) => void;
}

export const HandoverReportPage: React.FC<HandoverReportPageProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  tasks,
  decisions,
  gaps,
  summaries,
  handovers,
  onUpdateHandover,
}) => {
  const [generatedAt, setGeneratedAt] = useState<string>('2026-11-13 · Session Preview');
  const [newStepText, setNewStepText] = useState('');

  const project = projects.find((p) => p.id === selectedProjectId) ?? projects[0];
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'Completed');
  const pendingTasks = projectTasks.filter((t) => t.status !== 'Completed');
  const projectDecisions = decisions.filter((d) => d.projectId === project.id);
  const projectGaps = gaps.filter((g) => g.projectId === project.id && !g.resolved);
  const summary = summaries[project.id];

  const review: HandoverReviewState = handovers[project.id] ?? {
    projectId: project.id,
    incomingRecipient: project.incomingLead,
    outgoingPresenter: project.outgoingLead,
    facultyAdvisor: 'Faculty Advisor Pending',
    approvalState: 'Draft',
    reviewNotes: '',
    nextSteps: [
      'Confirm incoming lead access to repository and lab locker.',
      'Review pending tasks and assign unassigned deliverables.',
    ],
    checklist: [
      { id: 'chk-1', label: 'Project documents uploaded', checked: false },
      { id: 'chk-2', label: 'Decisions and rationale logged', checked: false },
      { id: 'chk-3', label: 'Open risks reviewed with incoming lead', checked: false },
    ],
  };

  const handleGeneratePreview = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setGeneratedAt(`2026-11-13 at ${timeStr} · Generated from current frontend state`);
  };

  const handleToggleChecklist = (itemId: string) => {
    const nextChecklist = review.checklist.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateHandover(project.id, { checklist: nextChecklist });
  };

  const handleAddNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    onUpdateHandover(project.id, {
      nextSteps: [...review.nextSteps, newStepText.trim()],
    });
    setNewStepText('');
  };

  const handleDownloadMarkdown = () => {
    const lines = [
      `# CampusContinuity Handover Report: ${project.name}`,
      `Department: ${project.department} | Semester: ${project.semester}`,
      `Generated: ${generatedAt}`,
      `Approval Status: ${review.approvalState}`,
      '',
      `Outgoing Lead: ${review.outgoingPresenter}`,
      `Incoming Lead: ${review.incomingRecipient}`,
      `Faculty / Advisor: ${review.facultyAdvisor}`,
      '',
      '## 1. Project Overview',
      summary?.overview ?? project.description,
      '',
      '## 2. Completed Work',
      ...(completedTasks.length > 0
        ? completedTasks.map((t) => `- ${t.title} (${t.assignedMember})`)
        : ['- No completed tasks logged yet.']),
      '',
      '## 3. Pending Tasks',
      ...(pendingTasks.length > 0
        ? pendingTasks.map(
            (t) => `- [${t.status}] ${t.title} — Owner: ${t.assignedMember} | Due: ${t.deadline}`
          )
        : ['- All project tasks are completed.']),
      '',
      '## 4. Important Decisions',
      ...(projectDecisions.length > 0
        ? projectDecisions.map((d) => `- ${d.title} (${d.decidedBy}, ${d.date}): ${d.rationale}`)
        : ['- No decisions recorded.']),
      '',
      '## 5. Risks & Dependencies',
      ...(projectGaps.length > 0
        ? projectGaps.map((g) => `- [${g.severity}] ${g.title}: ${g.detail}`)
        : ['- No unresolved knowledge gaps flagged.']),
      ...pendingTasks
        .filter((t) => t.dependencies && t.dependencies !== 'None')
        .map((t) => `- Dependency for "${t.title}": ${t.dependencies}`),
      '',
      '## 6. Next Steps',
      ...review.nextSteps.map((step, i) => `${i + 1}. ${step}`),
      '',
      '## 7. Review & Approval Notes',
      review.reviewNotes || 'No review notes added yet.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_handover_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5 no-print">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Handover Report</h2>
          <p className="mt-1 text-sm text-slate-600">
            Compile project overview, completed work, open tasks, decisions, risks, and incoming lead approval into a formal packet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            aria-label="Select project for handover report"
            value={project.id}
            onChange={(e) => onSelectProject(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-navy-900 focus:border-teal-600 focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleGeneratePreview}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors whitespace-nowrap"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Generate Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Download .MD</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 text-xs font-semibold text-white hover:bg-navy-800 transition-colors whitespace-nowrap"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Packet</span>
          </button>
        </div>
      </div>

      <div className="no-print">
        <SampleNoticeBanner
          title="Handover Report Preview"
          description="This report assembles sample project data together with your current session edits. Approval state and notes remain in browser memory until connected to PostgreSQL."
        />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
        {/* Report Header */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-teal-700">
              CampusContinuity Handover Packet · {project.semester}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold text-navy-900">
              {project.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {project.department} · Compiled {generatedAt}
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-1.5">
            <StatusText status={review.approvalState} />
            <span className="text-xs font-mono tabular-nums text-slate-500">
              Progress: {project.progress}%
            </span>
          </div>
        </div>

        {/* 1. Project Overview */}
        <section className="p-6 sm:p-8">
          <h4 className="font-display text-base font-bold text-navy-900">
            01. Project Overview
          </h4>
          <p className="mt-2.5 text-sm text-slate-700 leading-relaxed max-w-4xl">
            {summary?.overview ?? project.description}
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Outgoing Presenter</span>
              <span className="font-semibold text-navy-900 mt-0.5 block">
                {review.outgoingPresenter}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Incoming Recipient</span>
              <span className="font-semibold text-navy-900 mt-0.5 block">
                {review.incomingRecipient}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Faculty / Club Advisor</span>
              <span className="font-semibold text-navy-900 mt-0.5 block">
                {review.facultyAdvisor}
              </span>
            </div>
          </div>
        </section>

        {/* 2. Completed Work & 3. Pending Tasks */}
        <section className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-display text-base font-bold text-navy-900">
              02. Completed Work ({completedTasks.length})
            </h4>
            {completedTasks.length === 0 ? (
              <p className="mt-2.5 text-xs text-slate-500">No completed tasks recorded.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {completedTasks.map((task) => (
                  <li key={task.id} className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-navy-900">{task.title}</span>
                    <span className="text-slate-500">
                      {' '}
                      · {task.assignedMember} · Completed by {task.deadline}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-navy-900">
              03. Pending Tasks ({pendingTasks.length})
            </h4>
            {pendingTasks.length === 0 ? (
              <p className="mt-2.5 text-xs text-slate-500">All tasks are complete.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {pendingTasks.map((task) => (
                  <li key={task.id} className="text-xs text-slate-700 leading-relaxed">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-navy-900">{task.title}</span>
                      <StatusText status={task.status} />
                    </div>
                    <span className="text-slate-500">
                      Owner: {task.assignedMember} · Due {task.deadline}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 4. Decisions & 5. Risks and Dependencies */}
        <section className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-display text-base font-bold text-navy-900">
              04. Decisions ({projectDecisions.length})
            </h4>
            {projectDecisions.length === 0 ? (
              <p className="mt-2.5 text-xs text-slate-500">No decisions documented yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {projectDecisions.map((dec) => (
                  <li key={dec.id} className="text-xs">
                    <p className="font-semibold text-navy-900">{dec.title}</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{dec.rationale}</p>
                    <p className="text-slate-400 font-mono mt-0.5">
                      {dec.decidedBy} · {dec.date}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-navy-900">
              05. Risks &amp; Dependencies
            </h4>
            <ul className="mt-3 space-y-2.5 text-xs">
              {projectGaps.map((gap) => (
                <li key={gap.id} className="text-slate-700 leading-relaxed">
                  <span className="font-semibold text-red-700">[{gap.severity} Risk] </span>
                  <span className="font-semibold text-navy-900">{gap.title}: </span>
                  <span>{gap.detail}</span>
                </li>
              ))}
              {pendingTasks
                .filter((t) => t.dependencies && t.dependencies !== 'None')
                .map((task) => (
                  <li key={`dep-${task.id}`} className="text-slate-700 leading-relaxed">
                    <span className="font-semibold text-navy-800">[Dependency] </span>
                    <span>
                      "{task.title}" depends on <span className="font-medium">{task.dependencies}</span>.
                    </span>
                  </li>
                ))}
              {projectGaps.length === 0 &&
                pendingTasks.every((t) => !t.dependencies || t.dependencies === 'None') && (
                  <li className="text-slate-500">No open risks or blocking dependencies flagged.</li>
                )}
            </ul>
          </div>
        </section>

        {/* 6. Next Steps */}
        <section className="p-6 sm:p-8">
          <h4 className="font-display text-base font-bold text-navy-900">06. Next Steps</h4>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-xs text-slate-700">
            {review.nextSteps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>

          <form onSubmit={handleAddNextStep} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-xl no-print">
            <input
              type="text"
              value={newStepText}
              onChange={(e) => setNewStepText(e.target.value)}
              placeholder="Add an onboarding next step for incoming students..."
              aria-label="Add next step"
              className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-navy-900 hover:bg-slate-50 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Step</span>
            </button>
          </form>
        </section>

        {/* 7. Review and Approval Section */}
        <section className="p-6 sm:p-8 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-teal-700" />
              <h4 className="font-display text-base font-bold text-navy-900">
                07. Review &amp; Approval
              </h4>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg no-print">
              {(['Draft', 'Pending Review', 'Approved'] as ApprovalState[]).map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() =>
                    onUpdateHandover(project.id, {
                      approvalState: state,
                      approvedDate: state === 'Approved' ? '2026-11-13' : undefined,
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    review.approvalState === state
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-navy-900 mb-2.5">
                Handover Readiness Checklist
              </p>
              <ul className="space-y-2">
                {review.checklist.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(item.id)}
                      className="flex items-center gap-2.5 text-xs text-left text-slate-700 hover:text-navy-900"
                    >
                      {item.checked ? (
                        <CheckSquare className="h-4 w-4 text-teal-600 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className={item.checked ? 'line-through text-slate-500' : ''}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="handover-notes"
                  className="block text-xs font-semibold text-navy-900 mb-1.5"
                >
                  Sign-Off &amp; Reviewer Notes
                </label>
                <textarea
                  id="handover-notes"
                  rows={3}
                  value={review.reviewNotes}
                  onChange={(e) =>
                    onUpdateHandover(project.id, { reviewNotes: e.target.value })
                  }
                  placeholder="Record walkthrough notes, lab locker locations, or conditions for final approval..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              {review.approvalState === 'Approved' && (
                <p className="text-xs font-medium text-emerald-700">
                  Approved for semester transition on {review.approvedDate ?? '2026-11-13'} (Session Preview).
                </p>
              )}
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};
