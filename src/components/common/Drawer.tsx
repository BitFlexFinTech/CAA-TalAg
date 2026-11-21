import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = 'max-w-2xl',
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="fixed inset-0 bg-black/35 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full ${widthClass} bg-white border-l border-zinc-200 h-full flex flex-col shadow-2xl`}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            {subtitle && (
              <p className="text-xs font-mono-tabular text-zinc-500 mb-0.5 truncate">{subtitle}</p>
            )}
            <h2 className="text-lg font-semibold text-zinc-900 leading-snug">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors shrink-0"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
