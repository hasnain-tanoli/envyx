'use client';
import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

export default function Modal({ children, isOpen, onClose, title }: ModalProps) {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative glass w-full max-w-lg rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                    <button 
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all ml-auto" 
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}