'use client';
import { useState } from 'react';
import { Trash2, Key, Clock, RotateCcw } from 'lucide-react';

interface TrashItemProps {
    id: string;
    keyName: string;
    deletedAt?: Date | string | null;
    onRestore: (id: string) => Promise<void>;
    onHardDelete: (id: string) => void;
    disabled?: boolean;
}

export default function TrashItem({ id, keyName, deletedAt, onRestore, onHardDelete, disabled }: TrashItemProps) {
    const [restoring, setRestoring] = useState(false);

    const handleRestore = async () => {
        setRestoring(true);
        try {
            await onRestore(id);
        } catch {
            // Error is handled by the parent typically, but we catch to stop loading state
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#1b1c1e] border border-white/5 text-[#9c9c9d] shadow-inner shadow-white/5">
                    <Key size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-mono text-sm font-bold text-[#cecece] truncate tracking-tight">{keyName}</span>
                    <span className="text-[11px] text-[#6a6b6c] font-medium flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} />
                        Deleted {deletedAt ? new Date(deletedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                </div>
            </div>

            {!disabled && (
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleRestore}
                        disabled={restoring}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1b1c1e] border border-white/5 text-[#9c9c9d] hover:text-[#f9f9f9] rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <RotateCcw size={12} className={restoring ? 'animate-spin' : ''} />
                        {restoring ? 'Restoring...' : 'Restore'}
                    </button>
                    <button
                        onClick={() => onHardDelete(id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1b1c1e] border border-white/5 text-[#6a6b6c] hover:text-[#FF6363] rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider"
                    >
                        <Trash2 size={12} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
