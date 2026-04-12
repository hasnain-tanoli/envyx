'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export default function Modal({ children, isOpen, onClose, title }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-[#07080a]/80 backdrop-blur-sm transition-opacity duration-300" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative ray-card w-full max-w-lg p-6 bg-[#101111] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    {title && <h2 className="text-xl font-medium tracking-tight text-[#f9f9f9]">{title}</h2>}
                    <button 
                        className="p-1.5 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors ml-auto rounded-md hover:bg-white/5" 
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
                
                <div className="text-[#cecece]">
                    {children}
                </div>
            </div>
        </div>
    );
}