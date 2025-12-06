import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, Info, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all animate-slide-in-right
              ${toast.type === 'success' ? 'bg-green-500 text-white' : 
                toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}
            `}
          >
            {toast.type === 'success' && <Check className="w-5 h-5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {toast.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};