'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

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

    // Focus the cancel button when opened (safer default)
    useEffect(() => {
        if (isOpen) {
            // Small delay to let animation settle
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

    const accentColor = isDanger
        ? { ring: 'ring-red-500/30', bg: 'bg-red-500/10', icon: 'text-red-400', btn: 'bg-red-600 hover:bg-red-700 shadow-red-600/20', glow: 'shadow-red-500/10' }
        : { ring: 'ring-amber-500/30', bg: 'bg-amber-500/10', icon: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20', glow: 'shadow-amber-500/10' };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Dialog Box */}
            <div
                className={`relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f1117] shadow-2xl ${accentColor.glow} animate-in zoom-in-95 fade-in duration-200`}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
            >
                {/* Close X */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Cancel"
                >
                    <X size={18} />
                </button>

                <div className="p-8">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${accentColor.bg}`}>
                        <AlertTriangle className={accentColor.icon} size={28} />
                    </div>

                    {/* Title */}
                    <h2
                        id="confirm-title"
                        className="text-xl font-black text-white tracking-tight mb-2"
                    >
                        {title}
                    </h2>

                    {/* Message */}
                    <p
                        id="confirm-message"
                        className="text-gray-400 text-sm leading-relaxed font-medium"
                    >
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-2xl font-bold text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            ref={confirmBtnRef}
                            onClick={onConfirm}
                            className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white shadow-xl transition-all active:scale-95 ${accentColor.btn}`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
