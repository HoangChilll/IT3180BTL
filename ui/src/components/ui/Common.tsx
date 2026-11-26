import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'navy';

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
  warning: 'bg-amber-50 text-[#D97706] border-amber-200',
  danger: 'bg-red-50 text-[#DC2626] border-red-200',
  info: 'bg-sky-50 text-[#0284C7] border-sky-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  navy: 'bg-blue-50 text-[#1E3A8A] border-blue-200',
};

export const Badge: React.FC<{
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'neutral', children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${BADGE_CLASSES[variant]} ${className}`}
  >
    {children}
  </span>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Pagination: React.FC<{
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (next: number) => void;
}> = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-600 rounded-b-xl">
      <span className="tabular-nums">
        Hiển thị <strong className="text-slate-900">{from}–{to}</strong> /{' '}
        <strong className="text-slate-900">{total}</strong> bản ghi
      </span>
      <div className="flex items-center gap-1.5">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Trước
        </button>
        <span className="px-2.5 py-1 font-semibold text-slate-800 tabular-nums">
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Sau <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
