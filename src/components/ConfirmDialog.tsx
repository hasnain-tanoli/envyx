'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    // Focus the confirm button when opened
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => confirmBtnRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const isDanger = variant === 'danger';
    const accentColor = isDanger ? 'text-[#FF6363]' : 'text-[var(--ray-yellow)]';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#07080a]/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Dialog Box */}
            <div
                className="relative ray-card w-full max-w-[360px] p-6 bg-[#101111] shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
                role="alertdialog"
                aria-modal="true"
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 ${accentColor}`}>
                        <AlertTriangle size={24} />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-medium tracking-tight text-[#f9f9f9]">
                            {title}
                        </h2>
                        <p className="text-[#6a6b6c] text-sm leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-2 mt-2">
                        <button
                            ref={confirmBtnRef}
                            onClick={onConfirm}
                            className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-[#f9f9f9] transition-all border border-white/10 ${
                                isDanger ? 'bg-[#FF6363]/80 hover:bg-[#FF6363]' : 'bg-[var(--ray-blue)]/80 hover:bg-[var(--ray-blue)]'
                            }`}
                        >
                            {confirmLabel}
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
