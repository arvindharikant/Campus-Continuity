import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  helperText: string;
  accent?: 'navy' | 'teal' | 'amber' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  helperText,
  accent = 'neutral',
}) => {
  const valueColor =
    accent === 'teal'
      ? 'text-teal-700'
      : accent === 'amber'
        ? 'text-amber-700'
        : accent === 'navy'
          ? 'text-navy-900'
          : 'text-slate-900';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold tracking-tight tabular-nums ${valueColor}`}>
        {value}
      </p>
      <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
    </div>
  );
};
