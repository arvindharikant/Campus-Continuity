import React from 'react';
import { Info } from 'lucide-react';

interface SampleNoticeBannerProps {
  title: string;
  description: string;
}

export const SampleNoticeBanner: React.FC<SampleNoticeBannerProps> = ({
  title,
  description,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start gap-3">
      <Info className="h-4 w-4 text-navy-800 shrink-0 mt-0.5" />
      <div className="text-xs leading-relaxed text-slate-600">
        <span className="font-semibold text-navy-900">{title}: </span>
        <span>{description}</span>
      </div>
    </div>
  );
};
