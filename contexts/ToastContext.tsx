import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, X, Loader2, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    loading: (message: string) => string; // Returns ID to dismiss/update later
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.toast;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (type !== 'loading') {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Public API
  const toast = {
    success: (msg: string, dur?: number) => addToast('success', msg, dur),
    error: (msg: string, dur?: number) => addToast('error', msg, dur),
    info: (msg: string, dur?: number) => addToast('info', msg, dur),
    loading: (msg: string) => addToast('loading', msg, 0),
    dismiss
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`
                min-w-[300px] p-4 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3 animate-in slide-in-from-right-10 fade-in duration-300
                ${t.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : ''}
                ${t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : ''}
                ${t.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' : ''}
                ${t.type === 'loading' ? 'bg-white text-gray-800 border border-gray-200' : ''}
              `}
            >
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
              {t.type === 'loading' && <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />}
              
              <span className="flex-1">{t.message}</span>

              {t.type !== 'loading' && (
                <button 
                  onClick={() => dismiss(t.id)}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 opacity-50" />
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
