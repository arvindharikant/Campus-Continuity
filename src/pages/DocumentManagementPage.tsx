import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileText, Trash2, UploadCloud } from 'lucide-react';
import { SampleNoticeBanner } from '../components/SampleNoticeBanner';
import { DocumentExtension, Project, ProjectDocument } from '../types/campus';

interface DocumentManagementPageProps {
  projects: Project[];
  selectedProjectId: string;
  documents: ProjectDocument[];
  onAddDocuments: (docs: ProjectDocument[]) => void;
  onRemoveDocument: (docId: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectExtension(filename: string): DocumentExtension | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'PDF';
  if (lower.endsWith('.docx')) return 'DOCX';
  if (lower.endsWith('.txt')) return 'TXT';
  return null;
}

export const DocumentManagementPage: React.FC<DocumentManagementPageProps> = ({
  projects,
  selectedProjectId,
  documents,
  onAddDocuments,
  onRemoveDocument,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(selectedProjectId);

  useEffect(() => {
    setTargetProjectId(selectedProjectId);
  }, [selectedProjectId]);
  const [category, setCategory] = useState<string>('Handover Notes');
  const [uploaderName, setUploaderName] = useState<string>('Marcus Chen');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

 
const processFiles = async (fileList: FileList | null) => {
  if (!fileList || fileList.length === 0) return;

  setUploadError(null);
  setLastFeedback(null);

  const accepted: ProjectDocument[] = [];
  const rejected: string[] = [];

  for (const file of Array.from(fileList)) {
    const ext = detectExtension(file.name);

    if (!ext) {
      rejected.push(file.name);
      continue;
    }

    if (file.size > 10 * 1024 * 1024) {
      rejected.push(`${file.name} (over 10 MB)`);
      continue;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8001/upload-document",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Upload failed");
      }

      accepted.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        projectId: targetProjectId,
        name: file.name,
        fileType: ext,
        sizeLabel: formatBytes(file.size),
        uploadedBy: uploaderName.trim() || "Student Member",
        uploadedAt: new Date().toISOString().slice(0, 10),
        status: "Sample Indexed",
        category,
        extractedText: result.extracted_text || "",
aiSummary: result.ai_summary || "",
      });
    } catch (error) {
      rejected.push(
        `${file.name} (${error instanceof Error ? error.message : "Upload failed"})`
      );
    }
  }

  if (accepted.length > 0) {
    onAddDocuments(accepted);
    setLastFeedback(
      `Successfully uploaded ${accepted.length} file(s) to the backend.`
    );
  }

  if (rejected.length > 0) {
    setUploadError(
      `Upload failed or unsupported files: ${rejected.join(", ")}`
    );
  }
};
 

  const visibleDocs =
    filterProjectId === 'all'
      ? documents
      : documents.filter((d) => d.projectId === filterProjectId);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="font-display text-2xl font-bold text-navy-900">Document Management</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select PDF, DOCX, and TXT project files such as architecture specs, lab logs, and meeting notes for handover indexing.
        </p>
      </div>

      <SampleNoticeBanner
        title="Local File Selection Only"
        description="Selecting files reads their metadata in your browser session and displays them in the document table. Actual file storage and AI extraction require connecting the Python FastAPI + PostgreSQL backend."
      />

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label htmlFor="doc-project" className="block text-xs font-semibold text-navy-900 mb-1.5">
              Target Project
            </label>
            <select
              id="doc-project"
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-category" className="block text-xs font-semibold text-navy-900 mb-1.5">
              Document Category
            </label>
            <select
              id="doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              <option value="Architecture Spec">Architecture Spec</option>
              <option value="Lab Test Log">Lab Test Log</option>
              <option value="Handover Notes">Handover Notes</option>
              <option value="Operations SOP">Operations SOP</option>
              <option value="Hardware Reference">Hardware Reference</option>
            </select>
          </div>

          <div>
            <label htmlFor="doc-uploader" className="block text-xs font-semibold text-navy-900 mb-1.5">
              Student Uploader
            </label>
            <input
              id="doc-uploader"
              type="text"
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              placeholder="e.g. Marcus Chen"
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            processFiles(e.dataTransfer.files);
          }}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? 'border-teal-600 bg-teal-50/50'
              : 'border-slate-200 bg-slate-50/60 hover:border-navy-700/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            multiple
            onChange={(e) => {
              processFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />

          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-navy-900 text-white">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="mt-3 font-display text-sm font-semibold text-navy-900">
            Drag and drop project files here, or browse from your computer
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Supported formats: PDF (.pdf), Word (.docx), and Plain Text (.txt)
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Select PDF, DOCX, or TXT Files</span>
          </button>
        </div>

        {lastFeedback && (
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs text-teal-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{lastFeedback}</span>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {uploadError}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div>
            <h3 className="font-display text-base font-semibold text-navy-900">
              Uploaded Project Documents ({visibleDocs.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Files available for handover reference and upcoming backend extraction
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="doc-filter" className="text-xs text-slate-500 whitespace-nowrap">
              Filter by project:
            </label>
            <select
              id="doc-filter"
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-navy-900 focus:border-teal-600 focus:outline-none"
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

        {visibleDocs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No documents uploaded for this project yet. Use the file selector above to add PDF, DOCX, or TXT files.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-5">Document Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Size</th>
                  <th className="py-3 px-4">Upload Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {visibleDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-semibold text-navy-900">{doc.name}</div>
                      <div className="text-slate-500 mt-0.5">
                        {doc.category} · {doc.uploadedAt}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-navy-800">
                      {doc.fileType}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {projectMap.get(doc.projectId) ?? 'Unlinked Project'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{doc.uploadedBy}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                      {doc.sizeLabel}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          doc.status === 'Sample Indexed'
                            ? 'text-teal-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveDocument(doc.id)}
                        aria-label={`Remove ${doc.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
