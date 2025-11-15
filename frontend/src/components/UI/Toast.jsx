// client/src/components/UI/Toast.jsx
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-green-500 dark:bg-green-600',
  error: 'bg-red-500 dark:bg-red-600',
  warning: 'bg-amber-500 dark:bg-amber-600',
  info: 'bg-blue-500 dark:bg-blue-600',
};

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[toast.type];

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsExiting(false), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm
        bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        hover:shadow-xl
      `}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors[toast.type]} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}