import React from 'react';
import { AlertCircle, Check, Clock, FileEdit, X } from 'lucide-react';

interface StatusTagProps {
  status: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent';
}

const inferTone = (status: string): NonNullable<StatusTagProps['tone']> => {
  const s = status.toLowerCase();
  if (
    s.includes('approved') ||
    s.includes('ready') ||
    s.includes('delivered') ||
    s.includes('completed') ||
    s.includes('settled') ||
    s.includes('production ready')
  ) {
    return 'success';
  }
  if (
    s.includes('pending') ||
    s.includes('awaiting') ||
    s.includes('changes') ||
    s.includes('progress') ||
    s.includes('sampling') ||
    s.includes('scheduled') ||
    s.includes('low') ||
    s.includes('transit')
  ) {
    return 'warning';
  }
  if (s.includes('rejected') || s.includes('paused')) {
    return 'danger';
  }
  if (s.includes('dispatched') || s.includes('qc') || s.includes('pre-production')) {
    return 'accent';
  }
  return 'neutral';
};

const toneStyles: Record<NonNullable<StatusTagProps['tone']>, string> = {
  neutral: 'text-zinc-700 bg-zinc-100 border-zinc-200',
  success: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  warning: 'text-amber-800 bg-amber-50 border-amber-200',
  danger: 'text-red-800 bg-red-50 border-red-200',
  accent: 'text-[#9E1927] bg-[#BC1F2F]/8 border-[#BC1F2F]/25',
};

const ToneIcon: React.FC<{ tone: NonNullable<StatusTagProps['tone']> }> = ({ tone }) => {
  switch (tone) {
    case 'success':
      return <Check className="w-3 h-3 shrink-0" aria-hidden="true" />;
    case 'warning':
      return <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />;
    case 'danger':
      return <X className="w-3 h-3 shrink-0" aria-hidden="true" />;
    case 'accent':
      return <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />;
    default:
      return <FileEdit className="w-3 h-3 shrink-0" aria-hidden="true" />;
  }
};

export const StatusTag: React.FC<StatusTagProps> = ({ status, tone }) => {
  const resolved = tone ?? inferTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border rounded whitespace-nowrap shrink-0 ${toneStyles[resolved]}`}
    >
      <ToneIcon tone={resolved} />
      <span>{status}</span>
    </span>
  );
};
