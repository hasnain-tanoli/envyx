'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
    const icons = {
        success: <CheckCircle className="text-[var(--ray-green)]" size={16} />,
        error: <AlertCircle className="text-[#FF6363]" size={16} />,
        info: <Info className="text-[var(--ray-blue)]" size={16} />,
    };

    const borders = {
        success: 'border-[var(--ray-green)]/20',
        error: 'border-[#FF6363]/20',
        info: 'border-[var(--ray-blue)]/20',
    };

    return (
        <div className={`pointer-events-auto ray-card flex items-center gap-3.5 px-5 py-3.5 bg-[#101111] border ${borders[toast.type]} shadow-2xl min-w-[320px] animate-in slide-in-from-right-10 duration-300`}>
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="text-sm font-medium text-[#f9f9f9] flex-1">{toast.message}</p>
            <button 
                onClick={onClose} 
                className="p-1 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors hover:bg-white/5 rounded-md"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}
