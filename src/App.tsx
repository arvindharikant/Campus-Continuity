import { useMemo, useState } from 'react';
import { NewProjectModal } from './components/NewProjectModal';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import {
  INITIAL_ACTIVITIES,
  INITIAL_DECISIONS,
  INITIAL_DOCUMENTS,
  INITIAL_GAPS,
  INITIAL_HANDOVERS,
  INITIAL_PROJECTS,
  INITIAL_SUMMARIES,
  INITIAL_TASKS,
} from './data/sampleData';
import { AISummaryPage } from './pages/AISummaryPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentManagementPage } from './pages/DocumentManagementPage';
import { HandoverReportPage } from './pages/HandoverReportPage';
import { KnowledgeGapPage } from './pages/KnowledgeGapPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { TaskDecisionPage } from './pages/TaskDecisionPage';
import {
  ActivityItem,
  HandoverReviewState,
  KnowledgeGap,
  PageId,
  Project,
  ProjectDecision,
  ProjectDocument,
  ProjectStatus,
  ProjectTask,
  AIProjectSummaryData
} from './types/campus';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [documents, setDocuments] = useState<ProjectDocument[]>(INITIAL_DOCUMENTS);
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_TASKS);
  const [decisions, setDecisions] = useState<ProjectDecision[]>(INITIAL_DECISIONS);
  const [gaps, setGaps] = useState<KnowledgeGap[]>(INITIAL_GAPS);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [handovers, setHandovers] = useState<Record<string, HandoverReviewState>>(INITIAL_HANDOVERS);
  const [summaries, setSummaries] = useState<Record<string, AIProjectSummaryData>>(INITIAL_SUMMARIES);
  const unresolvedGapCount = useMemo(() => {
    const baseUnresolved = gaps.filter((g) => !g.resolved).length;
    const trackedTaskIds = new Set(gaps.map((g) => g.relatedTaskId).filter(Boolean));
    const liveTaskGaps = tasks.filter(
      (t) =>
        !trackedTaskIds.has(t.id) &&
        ((t.assignedMember === 'Unassigned' && t.status !== 'Completed') ||
          t.status === 'Unclear')
    ).length;
    return baseUnresolved + liveTaskGaps;
  }, [gaps, tasks]);

  const handleCreateProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    setSelectedProjectId(project.id);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: project.id,
        projectName: project.name,
        actor: project.outgoingLead,
        action: 'initialized a new project workspace in this session',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    setActivePage('projects');
  };

  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, status, progress: status === 'Completed' ? 100 : p.progress }
          : p
      )
    );
  };

  const handleAddDocuments = (newDocs: ProjectDocument[]) => {
  setDocuments((prev) => [...newDocs, ...prev]);

  const first = newDocs[0];

  if (first) {
    const projName =
      projects.find((p) => p.id === first.projectId)?.name ?? 'Project';

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: first.projectId,
        projectName: projName,
        actor: first.uploadedBy,
        action: `Uploaded ${newDocs.length} document(s)`,
        timestamp: 'Just now',
      },
      ...prev,
    ]);

    if (first.aiSummary?.trim()) {
      setSummaries((prev) => ({
        ...prev,
        [first.projectId]: {
          projectId: first.projectId,
          lastSampleRefresh: 'Generated from uploaded document',
          overview: first.aiSummary!,
          completedWork: [],
          pendingWork: [],
          importantDecisions: [],
          projectRisks: [],
        },
      }));
    }
  }
};

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleAddTask = (task: ProjectTask) => {
    setTasks((prev) => [task, ...prev]);
    const projName = projects.find((p) => p.id === task.projectId)?.name ?? 'Project';
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: task.projectId,
        projectName: projName,
        actor: task.assignedMember === 'Unassigned' ? 'Team Member' : task.assignedMember,
        action: `added task "${task.title}"`,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleUpdateTask = (taskId: string, patch: Partial<ProjectTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
    );
  };

  const handleAddDecision = (decision: ProjectDecision) => {
    setDecisions((prev) => [decision, ...prev]);
    const projName =
      projects.find((p) => p.id === decision.projectId)?.name ?? 'Project';
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        projectId: decision.projectId,
        projectName: projName,
        actor: decision.decidedBy,
        action: `logged decision "${decision.title}"`,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  };

  const handleToggleGapResolved = (gapId: string) => {
    setGaps((prev) =>
      prev.map((g) => (g.id === gapId ? { ...g, resolved: !g.resolved } : g))
    );
  };

  const handleUpdateHandover = (
    projectId: string,
    patch: Partial<HandoverReviewState>
  ) => {
    setHandovers((prev) => {
      const project = projects.find((p) => p.id === projectId);
      const existing: HandoverReviewState = prev[projectId] ?? {
        projectId,
        incomingRecipient: project?.incomingLead ?? 'Incoming Lead',
        outgoingPresenter: project?.outgoingLead ?? 'Outgoing Lead',
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

      return {
        ...prev,
        [projectId]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        unresolvedGapCount={unresolvedGapCount}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activePage={activePage}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNewProject={() => setNewProjectModalOpen(true)}
          onNavigate={setActivePage}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              projects={projects}
              tasks={tasks}
              activities={activities}
              gaps={gaps}
              onNavigate={setActivePage}
              onSelectProject={setSelectedProjectId}
            />
          )}

          {activePage === 'projects' && (
            <ProjectWorkspacePage
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onOpenNewProject={() => setNewProjectModalOpen(true)}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'documents' && (
            <DocumentManagementPage
              projects={projects}
              selectedProjectId={selectedProjectId}
              documents={documents}
              onAddDocuments={handleAddDocuments}
              onRemoveDocument={handleRemoveDocument}
            />
          )}

          {activePage === 'summary' && (
            <AISummaryPage
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              summaries={summaries}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'tasks' && (
            <TaskDecisionPage
              projects={projects}
              selectedProjectId={selectedProjectId}
              tasks={tasks}
              decisions={decisions}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onAddDecision={handleAddDecision}
            />
          )}

          {activePage === 'gaps' && (
            <KnowledgeGapPage
              projects={projects}
              tasks={tasks}
              gaps={gaps}
              onToggleGapResolved={handleToggleGapResolved}
              onSelectProject={setSelectedProjectId}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'handover' && (
            <HandoverReportPage
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              tasks={tasks}
              decisions={decisions}
              gaps={gaps}
              summaries={INITIAL_SUMMARIES}
              handovers={handovers}
              onUpdateHandover={handleUpdateHandover}
            />
          )}
        </main>
      </div>

      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
