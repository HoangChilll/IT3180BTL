import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setItems((prev) => [...prev.slice(-3), { id, type, title, description }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const toast = {
    success: (title: string, description?: string) => push('success', title, description),
    error: (title: string, description?: string) => push('error', title, description),
    warning: (title: string, description?: string) => push('warning', title, description),
    info: (title: string, description?: string) => push('info', title, description),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="no-print fixed top-4 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
        {items.map((item) => {
          const styles = {
            success: {
              border: 'border-emerald-200 bg-white',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            },
            error: {
              border: 'border-red-200 bg-white',
              icon: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
            },
            warning: {
              border: 'border-amber-200 bg-white',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            },
            info: {
              border: 'border-sky-200 bg-white',
              icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
            },
          }[item.type];

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${styles.border} p-4 shadow-lg shadow-slate-900/10 transition-all`}
            >
              {styles.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(item.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.toast;
}
