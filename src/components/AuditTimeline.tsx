'use client';

import { useEffect, useState } from 'react';
import { Loader2, History, User, AlertCircle } from 'lucide-react';

interface AuditLog {
    id: string;
    action: string; // 'create' | 'update' | 'delete'
    user_id: string;
    env_id: string;
    key_name: string;
    created_at: string;
}

export default function AuditTimeline({ projectId }: { projectId: string }) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/audit`);
                if (!res.ok) throw new Error('Failed to fetch audit logs');
                const data = await res.json();
                setLogs(Array.isArray(data) ? data : []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="text-[var(--ray-blue)] animate-spin" size={24} />
                <p className="text-[#6a6b6c] text-sm font-medium">Fetching secure logs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-[#FF6363]">
                <AlertCircle size={24} />
                <p className="font-medium text-sm">{error}</p>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-20 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-[#6a6b6c] mb-4">
                    <History size={20} />
                </div>
                <p className="text-[#6a6b6c] text-sm font-medium tracking-tight">No activity logs found for this project.</p>
            </div>
        );
    }

    return (
        <div className="space-y-0 py-2">
            {logs.map((log) => (
                <div key={log.id} className="relative group flex gap-5 p-4 border-l border-white/5 hover:bg-white/[0.02] transition-colors">
                    {/* Status Pip */}
                    <div className={`shrink-0 w-2.5 h-2.5 mt-1.5 rounded-full border-2 border-[#101111] ${
                        log.action === 'create' ? 'bg-[var(--ray-green)] shadow-[0_0_8px_var(--ray-green)]' :
                        log.action === 'delete' ? 'bg-[#FF6363] shadow-[0_0_8px_#FF6363]' :
                        'bg-[var(--ray-blue)] shadow-[0_0_8px_var(--ray-blue)]'
                    }`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="text-[#f9f9f9] text-sm font-medium tracking-tight">
                                <span className="capitalize">{log.action}</span>
                                <span className="text-[#6a6b6c] font-normal lowercase ml-1.5">affected variable</span>
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#6a6b6c]">
                                {new Date(log.created_at).toLocaleString('en-US', { 
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                            </span>
                        </div>

                        {/* Variable Detail */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-mono text-[11px] font-bold text-[#cecece] px-2 py-0.5 bg-white/5 rounded border border-white/5">
                                {log.key_name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#6a6b6c]">
                                <User size={10} className="text-[#6a6b6c]/50" />
                                <span>Actor: {log.user_id.substring(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
