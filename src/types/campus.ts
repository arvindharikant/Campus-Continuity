export type PageId =
  | 'dashboard'
  | 'projects'
  | 'documents'
  | 'summary'
  | 'tasks'
  | 'gaps'
  | 'handover';

export type ProjectStatus = 'Active' | 'Handover In Progress' | 'At Risk' | 'Completed';

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
  year: string;
  transitionNote?: string;
}

export interface Project {
  id: string;
  name: string;
  department: string;
  semester: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  outgoingLead: string;
  incomingLead: string;
  members: ProjectMember[];
  updatedAt: string;
}

export type DocumentExtension = 'PDF' | 'DOCX' | 'TXT';
export type UploadStatus = 'Sample Indexed' | 'Selected Locally (Pending Backend Sync)' | 'Queued for Upload' | 'In Progress' | 'Pending' | 'Blocked' | 'Unclear' | 'Uploaded Successfully';
export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  fileType: DocumentExtension;
  sizeLabel: string;
  uploadedBy: string;
  uploadedAt: string;
  status: UploadStatus;
  category: string;
  extractedText?: string;
  aiSummary?: string;
}

export type TaskStatus = 'Completed' | 'In Progress' | 'Pending' | 'Blocked' | 'Unclear';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedMember: string;
  status: TaskStatus;
  deadline: string;
  dependencies: string;
  notes?: string;
}

export interface ProjectDecision {
  id: string;
  projectId: string;
  title: string;
  rationale: string;
  decidedBy: string;
  date: string;
  impactArea: string;
}

export type GapCategory =
  | 'Missing task owners'
  | 'Unclear task statuses'
  | 'Conflicting information'
  | 'Missing project details';

export type GapSeverity = 'High' | 'Medium' | 'Low';

export interface KnowledgeGap {
  id: string;
  projectId: string;
  category: GapCategory;
  severity: GapSeverity;
  title: string;
  detail: string;
  sourceReference: string;
  relatedTaskId?: string;
  resolved: boolean;
}

export interface AIProjectSummaryData {
  projectId: string;
  lastSampleRefresh: string;
  overview: string;
  completedWork: string[];
  pendingWork: string[];
  importantDecisions: string[];
  projectRisks: string[];
}

export interface ActivityItem {
  id: string;
  projectId: string;
  projectName: string;
  actor: string;
  action: string;
  timestamp: string;
}

export type ApprovalState = 'Draft' | 'Pending Review' | 'Approved';

export interface HandoverChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface HandoverReviewState {
  projectId: string;
  incomingRecipient: string;
  outgoingPresenter: string;
  facultyAdvisor: string;
  approvalState: ApprovalState;
  reviewNotes: string;
  approvedDate?: string;
  nextSteps: string[];
  checklist: HandoverChecklistItem[];
}
