// Path: ./src/contexts/ToastContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType, ToastContainer } from '@/components/Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const showToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Convenience methods
  const showSuccess = (title: string, message?: string) => {
    showToast('success', title, message);
  };

  const showError = (title: string, message?: string) => {
    showToast('error', title, message);
  };

  const showWarning = (title: string, message?: string) => {
    showToast('warning', title, message);
  };

  const showInfo = (title: string, message?: string) => {
    showToast('info', title, message);
  };

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;