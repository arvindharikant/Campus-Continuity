import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  HelpCircle,
  PauseCircle,
} from 'lucide-react';
import { ApprovalState, GapSeverity, ProjectStatus, TaskStatus } from '../types/campus';

type StatusValue = ProjectStatus | TaskStatus | GapSeverity | ApprovalState;

interface StatusTextProps {
  status: StatusValue;
}

export const StatusText: React.FC<StatusTextProps> = ({ status }) => {
  switch (status) {
    case 'Completed':
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Active':
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Handover In Progress':
    case 'Pending Review':
    case 'Pending':
    case 'Medium':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'At Risk':
    case 'Blocked':
    case 'High':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Unclear':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 whitespace-nowrap">
          <HelpCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Draft':
    case 'Low':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
          <PauseCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
  }
};
