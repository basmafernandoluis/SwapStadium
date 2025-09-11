import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AppErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  fatal?: boolean;
  extra?: Record<string, any>;
}

interface ErrorContextType {
  errors: AppErrorInfo[];
  reportError: (err: unknown, extra?: Record<string, any>) => void;
  clearError: (id: string) => void;
  clearAll: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useErrorTracker = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useErrorTracker must be used within ErrorProvider');
  return ctx;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<AppErrorInfo[]>([]);

  const reportError = useCallback((err: unknown, extra?: Record<string, any>) => {
    let message = 'Unknown error';
    let stack: string | undefined;
    if (err instanceof Error) {
      message = err.message;
      stack = err.stack;
    } else if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object') {
      message = JSON.stringify(err);
    }
    const errorObj: AppErrorInfo = {
      id: Math.random().toString(36).slice(2),
      message,
      stack,
      timestamp: Date.now(),
      extra,
    };
    setErrors(prev => [errorObj, ...prev].slice(0,50));
    console.warn('🛑 [ErrorTracker]', message, extra || '');
  }, []);

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAll = useCallback(() => setErrors([]), []);

  return (
    <ErrorContext.Provider value={{ errors, reportError, clearError, clearAll }}>
      {children}
    </ErrorContext.Provider>
  );
};
