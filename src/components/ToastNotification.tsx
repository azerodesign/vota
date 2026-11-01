import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, Trash2, Sparkles, AlertCircle, Info, X } from 'lucide-react';
import { sfx } from '../lib/soundEffects';

export type ToastType = 'success' | 'delete' | 'cleanup' | 'info' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  badge?: string; // e.g., "+3.7 GB Dibebaskan" or "4 Berkas Dihapus"
  durationMs?: number;
  createdAt: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  showSuccess: (title: string, message?: string, badge?: string) => string;
  showDelete: (title: string, message?: string, badge?: string) => string;
  showCleanup: (title: string, message?: string, badge?: string) => string;
  showError: (title: string, message?: string) => string;
  showInfo: (title: string, message?: string) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id' | 'createdAt'>): string => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = {
        ...item,
        id,
        durationMs: item.durationMs ?? 4000,
        createdAt: Date.now(),
      };

      // Play corresponding SFX
      switch (item.type) {
        case 'delete':
          sfx.playDelete();
          break;
        case 'cleanup':
        case 'success':
          sfx.playSuccess();
          break;
        case 'error':
          sfx.playWarning();
          break;
        case 'info':
          sfx.playClick();
          break;
      }

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts
      return id;
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message?: string, badge?: string) => {
      return showToast({ type: 'success', title, message, badge });
    },
    [showToast]
  );

  const showDelete = useCallback(
    (title: string, message?: string, badge?: string) => {
      return showToast({ type: 'delete', title, message, badge });
    },
    [showToast]
  );

  const showCleanup = useCallback(
    (title: string, message?: string, badge?: string) => {
      return showToast({ type: 'cleanup', title, message, badge });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'error', title, message });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      return showToast({ type: 'info', title, message });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showDelete,
        showCleanup,
        showError,
        showInfo,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.durationMs || 4000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const styleConfig = {
    delete: {
      border: 'border-rose-500/40 shadow-rose-950/20',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      progressBar: 'bg-rose-500',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      Icon: Trash2,
    },
    cleanup: {
      border: 'border-emerald-500/40 shadow-emerald-950/20',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      progressBar: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      Icon: Sparkles,
    },
    success: {
      border: 'border-emerald-500/40 shadow-emerald-950/20',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      progressBar: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      Icon: CheckCircle2,
    },
    error: {
      border: 'border-amber-500/40 shadow-amber-950/20',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      progressBar: 'bg-amber-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      Icon: AlertCircle,
    },
    info: {
      border: 'border-cyan-500/40 shadow-cyan-950/20',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      progressBar: 'bg-cyan-500',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      Icon: Info,
    },
  }[toast.type];

  const { Icon } = styleConfig;

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-zinc-950/95 backdrop-blur-xl border ${styleConfig.border} shadow-2xl p-4 transition-all duration-300 animate-slide-in-right hover:scale-[1.01]`}
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon pill */}
        <div className={`p-2 rounded-xl shrink-0 ${styleConfig.iconBg}`}>
          <Icon className="w-5 h-5 animate-pulse" />
        </div>

        {/* Content body */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-white text-sm tracking-tight">{toast.title}</h4>
            {toast.badge && (
              <span
                className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${styleConfig.badgeBg}`}
              >
                {toast.badge}
              </span>
            )}
          </div>
          {toast.message && (
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed break-words font-sans">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800/60 transition-colors shrink-0"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/40 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${styleConfig.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
