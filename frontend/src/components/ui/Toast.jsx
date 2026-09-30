import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback({
    success: (message, duration) => addToast({ type: 'success', message, duration }),
    error: (message, duration) => addToast({ type: 'error', message, duration: duration || 6000 }),
    info: (message, duration) => addToast({ type: 'info', message, duration }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-purple-400 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    info: 'border-purple-500/30',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-lg border ${borderColors[toast.type]} bg-slate-900 dark:bg-slate-900 px-4 py-3 shadow-xl text-sm text-slate-200 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-toast-in'
      }`}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 leading-relaxed">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="text-slate-500 hover:text-slate-200 transition-colors shrink-0 mt-0.5"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ToastProvider;
