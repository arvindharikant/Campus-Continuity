import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project, ProjectStatus } from '../types/campus';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('Spring 2027');
  const [description, setDescription] = useState('');
  const [outgoingLead, setOutgoingLead] = useState('');
  const [incomingLead, setIncomingLead] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const outName = outgoingLead.trim() || 'Outgoing Student Lead';
    const inName = incomingLead.trim() || 'Incoming Student Lead';

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      department: department.trim() || 'Student Engineering Team',
      semester: semester.trim() || 'Spring 2027',
      description:
        description.trim() ||
        'Student project workspace created to document architecture, tasks, and transition notes.',
      status,
      progress: status === 'Completed' ? 100 : 15,
      outgoingLead: outName,
      incomingLead: inName,
      updatedAt: '2026-11-13',
      members: [
        {
          id: `mem-${Date.now()}-1`,
          name: outName,
          role: 'Outgoing Lead',
          year: 'Senior',
          transitionNote: 'Preparing handover',
        },
        {
          id: `mem-${Date.now()}-2`,
          name: inName,
          role: 'Incoming Lead',
          year: 'Junior',
          transitionNote: 'Onboarding',
        },
      ],
    };

    onCreateProject(newProject);
    setName('');
    setDepartment('');
    setDescription('');
    setOutgoingLead('');
    setIncomingLead('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-[1px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-modal-title"
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 id="new-project-modal-title" className="font-display text-base font-bold text-navy-900">
            Create New Project Workspace
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="proj-name" className="block text-xs font-semibold text-navy-900 mb-1">
              Project Name
            </label>
            <input
              id="proj-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Autonomous Drone Battery Swap Station"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-dept" className="block text-xs font-semibold text-navy-900 mb-1">
                Club or Department
              </label>
              <input
                id="proj-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Aerospace Society"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="proj-semester" className="block text-xs font-semibold text-navy-900 mb-1">
                Semester
              </label>
              <input
                id="proj-semester"
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="proj-desc" className="block text-xs font-semibold text-navy-900 mb-1">
              Project Description
            </label>
            <textarea
              id="proj-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize goals, hardware/software stack, and what incoming students need to continue..."
              className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="proj-out" className="block text-xs font-semibold text-navy-900 mb-1">
                Outgoing Lead
              </label>
              <input
                id="proj-out"
                type="text"
                value={outgoingLead}
                onChange={(e) => setOutgoingLead(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="proj-in" className="block text-xs font-semibold text-navy-900 mb-1">
                Incoming Lead
              </label>
              <input
                id="proj-in"
                type="text"
                value={incomingLead}
                onChange={(e) => setIncomingLead(e.target.value)}
                placeholder="e.g. Samira Patel"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="proj-status" className="block text-xs font-semibold text-navy-900 mb-1">
              Initial Status
            </label>
            <select
              id="proj-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-teal-600 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Handover In Progress">Handover In Progress</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-navy-900 text-xs font-semibold text-white hover:bg-navy-800"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
