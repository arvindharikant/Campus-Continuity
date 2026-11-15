import React, { useState } from 'react';
import { Check, Copy, FileOutput } from 'lucide-react';
import { SampleNoticeBanner } from '../components/SampleNoticeBanner';
import { StatusText } from '../components/StatusText';
import { AIProjectSummaryData, PageId, Project } from '../types/campus';

interface AISummaryPageProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  summaries: Record<string, AIProjectSummaryData>;
  onNavigate: (page: PageId) => void;
}

export const AISummaryPage: React.FC<AISummaryPageProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  summaries,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);

  const project = projects.find((p) => p.id === selectedProjectId) ?? projects[0];
  const summary: AIProjectSummaryData = summaries[project.id] ?? {
    projectId: project.id,
    lastSampleRefresh: 'Sample Template · Newly Created Project',
    overview: `${project.name} (${project.department}) is tracked in CampusContinuity for ${project.semester}. Upload project documents and log initial tasks to prepare a full AI-generated handover brief once the backend is connected.`,
    completedWork: ['Workspace initialized and outgoing/incoming student leads assigned.'],
    pendingWork: ['Upload initial architecture specs and sprint documents.', 'Log active project tasks and dependencies.'],
    importantDecisions: ['No technical decisions logged in this sample preview yet.'],
    projectRisks: ['No automated risk analysis run yet; awaiting FastAPI backend connection.'],
  };

  const handleCopySummary = async () => {
    const formatted = [
      `${project.name} — Sample AI Project Summary`,
      `Status: ${project.status} (${project.progress}%)`,
      '',
      'PROJECT OVERVIEW:',
      summary.overview,
      '',
      'COMPLETED WORK:',
      ...summary.completedWork.map((item) => `- ${item}`),
      '',
      'PENDING WORK:',
      ...summary.pendingWork.map((item) => `- ${item}`),
      '',
      'IMPORTANT DECISIONS:',
      ...summary.importantDecisions.map((item) => `- ${item}`),
      '',
      'PROJECT RISKS:',
      ...summary.projectRisks.map((item) => `- ${item}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">AI Project Summary</h2>
          <p className="mt-1 text-sm text-slate-600">
            Structured project brief designed so incoming student members can grasp context in minutes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            aria-label="Select project summary"
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
            onClick={handleCopySummary}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Brief' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('handover')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3.5 text-xs font-semibold text-white hover:bg-navy-800 transition-colors whitespace-nowrap"
          >
            <FileOutput className="h-3.5 w-3.5" />
            <span>Open Handover Report</span>
          </button>
        </div>
      </div>

      <SampleNoticeBanner
        title="Sample AI Summary Data"
        description="This page displays realistic pre-authored sample summaries. Live LLM document synthesis and automated summary regeneration will activate once connected to the Python FastAPI backend."
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500">
              {project.department} · {project.semester} · {summary.lastSampleRefresh}
            </p>
            <h3 className="mt-1 font-display text-lg font-bold text-navy-900">
              Project Overview
            </h3>
          </div>
          <StatusText status={project.status} />
        </div>
        <p className="mt-4 text-sm text-slate-700 leading-relaxed max-w-4xl">
          {summary.overview}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-navy-900 pb-3 border-b border-slate-100">
            Completed Work
          </h3>
          <ul className="mt-4 space-y-3">
            {summary.completedWork.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="font-mono text-xs font-semibold text-teal-700 mt-0.5 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-navy-900 pb-3 border-b border-slate-100">
            Pending Work
          </h3>
          <ul className="mt-4 space-y-3">
            {summary.pendingWork.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="font-mono text-xs font-semibold text-navy-800 mt-0.5 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-navy-900 pb-3 border-b border-slate-100">
            Important Decisions
          </h3>
          <ul className="mt-4 space-y-3">
            {summary.importantDecisions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="font-mono text-xs font-semibold text-teal-700 mt-0.5 tabular-nums">
                  D{idx + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-navy-900 pb-3 border-b border-slate-100">
            Project Risks
          </h3>
          <ul className="mt-4 space-y-3">
            {summary.projectRisks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                <span className="font-mono text-xs font-semibold text-amber-700 mt-0.5 tabular-nums">
                  R{idx + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
