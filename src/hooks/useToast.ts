import { useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastListeners: Array<(msg: ToastMessage) => void> = [];

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const item: ToastMessage = {
    id: `toast_${Date.now()}_${Math.random()}`,
    type,
    message
  };
  toastListeners.forEach(listener => listener(item));
}

export function useToastManager() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useState(() => {
    const handler = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== msg.id));
      }, 4000);
    };

    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handler);
    };
  });

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, removeToast };
}
