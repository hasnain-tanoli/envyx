import { useState } from 'react';
import { Trash2, RotateCcw, Key, Clock } from 'lucide-react';

interface TrashItemProps {
    id: string;
    keyName: string;
    deletedAt?: Date | string | null;
    onRestore: (id: string) => Promise<void>;
    onHardDelete: (id: string) => void;
}

export default function TrashItem({ id, keyName, deletedAt, onRestore, onHardDelete }: TrashItemProps) {
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
        <div className="group relative bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all hover:bg-white/[0.07] overflow-hidden flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gray-500/10 text-gray-400 group-hover:text-gray-300 transition-colors shadow-inner flex-shrink-0">
                    <Key size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-mono text-sm font-bold text-gray-300 truncate tracking-tight">{keyName}</span>
                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
                        <Clock size={10} />
                        Deleted {deletedAt ? new Date(deletedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity justify-end pl-14 sm:pl-0 mt-2 sm:mt-0">
                <button
                    onClick={handleRestore}
                    disabled={restoring}
                    className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-all font-bold text-xs"
                    title="Restore Variable"
                >
                    <RotateCcw size={16} className={restoring ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">{restoring ? 'Restoring...' : 'Restore'}</span>
                </button>
                <button
                    onClick={() => onHardDelete(id)}
                    className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all font-bold text-xs"
                    title="Permanently Delete"
                >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete Forever</span>
                </button>
            </div>
            
            {/* Soft decorative background element */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-gray-500/5 rounded-full blur-3xl -z-10 group-hover:bg-gray-500/10 transition-colors pointer-events-none" />
        </div>
    );
}
