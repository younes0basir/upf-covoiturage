import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-white border-l-4 border-green-500 text-green-700',
  error:   'bg-white border-l-4 border-red-500   text-red-700',
  info:    'bg-white border-l-4 border-blue-500  text-blue-700',
};

const ICON_BG = {
  success: 'bg-green-50 text-green-600',
  error:   'bg-red-50   text-red-600',
  info:    'bg-blue-50  text-blue-600',
};

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    if (toast.type !== 'confirm') {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.type, onRemove]);

  const handleAction = () => {
    if (toast.onAction) toast.onAction();
    onRemove(toast.id);
  };

  return (
    <div
      className={`
        flex items-start gap-4 px-5 py-4 rounded-2xl shadow-2xl border
        min-w-[320px] max-w-sm pointer-events-auto
        animate-toast-in ${STYLES[toast.type] || 'bg-white border-slate-200'}
      `}
      role="alert"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ICON_BG[toast.type] || 'bg-slate-100 text-slate-600'}`}>
        {ICONS[toast.type] || ICONS.info}
      </div>
      <div className="flex-1 pt-0.5">
        {toast.title && (
          <p className="text-sm font-bold text-slate-900 mb-1">{toast.title}</p>
        )}
        <p className="text-sm font-medium text-slate-600 leading-snug">{toast.message}</p>
        
        {toast.type === 'confirm' && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleAction}
              className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition active:scale-95"
            >
              Confirmer
            </button>
            <button
              onClick={() => onRemove(toast.id)}
              className="px-4 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition active:scale-95"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      {!toast.onAction && (
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 text-slate-300 hover:text-slate-500 transition mt-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, message, duration, onAction }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, duration, onAction }]);
  }, []);

  // Convenience helpers
  toast.success = (message, title) => toast({ type: 'success', message, title });
  toast.error   = (message, title) => toast({ type: 'error',   message, title });
  toast.info    = (message, title) => toast({ type: 'info',    message, title });
  toast.confirm = (message, onAction, title = 'Confirmation') => 
    toast({ type: 'confirm', message, title, onAction });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast portal — always fixed top-right */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
