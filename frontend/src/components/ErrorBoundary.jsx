// client/src/components/ErrorBoundary.jsx
import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      console.error('Error caught by boundary:', error, errorInfo);
      setHasError(true);
      setError(error);
      setErrorInfo(errorInfo);
      setRenderCount(prev => prev + 1);
    };

    // Add error event listener
    const errorHandler = (event) => {
      handleError(event.error, event.error?.stack);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', (event) => {
      handleError(event.reason, 'Unhandled Promise Rejection');
    });

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  useEffect(() => {
    // Reset after 5 seconds if stuck in loop
    if (renderCount > 10) {
      const timer = setTimeout(() => {
        setHasError(false);
        setError(null);
        setErrorInfo(null);
        setRenderCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [renderCount]);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    setErrorInfo(null);
    setRenderCount(0);
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Rendering Error
          </h2>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Component stuck in infinite loop. The page will reload automatically.
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-left">
              <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                {error.toString()}
              </p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reload Application
          </button>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            If the problem persists, please contact support
          </p>
        </div>
      </div>
    );
  }

  return children;
}