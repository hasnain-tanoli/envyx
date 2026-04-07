'use client';

import { useEffect, useState } from 'react';
import { Loader2, History, User, Activity, AlertCircle } from 'lucide-react';

interface AuditLog {
    id: string;
    action: string;
    user_id: string;
    env_id: string;
    old_value: string | null;
    new_value: string | null;
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
                <Loader2 className="text-indigo-500 animate-spin" size={32} />
                <p className="text-gray-500 font-medium">Loading history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-red-400">
                <AlertCircle size={32} />
                <p className="font-medium text-sm">{error}</p>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-gray-600 mb-4">
                    <History size={24} />
                </div>
                <p className="text-gray-500 font-medium tracking-tight">No activity recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 py-4">
            {logs.map((log, i) => (
                <div key={log.id} className="relative flex gap-4">
                    {/* Vertical line connector */}
                    {i !== logs.length - 1 && (
                        <div className="absolute left-[21px] top-10 bottom-[-32px] w-[2px] bg-white/5" />
                    )}
                    
                    {/* Icon Circle */}
                    <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                        log.action === 'CREATE' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        log.action === 'DELETE' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                        {log.action === 'CREATE' ? <Activity size={18} /> : 
                         log.action === 'DELETE' ? <Activity size={18} /> : 
                         <Activity size={18} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <h4 className="text-white font-bold tracking-tight">
                                {log.action}{' '}
                                <span className="text-gray-500 font-medium lowercase">variable change</span>
                            </h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 px-2 py-1 bg-white/5 rounded border border-white/5">
                                {new Date(log.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-3">
                            <User size={12} className="text-indigo-500/50" />
                            <span>ID: {log.user_id.substring(0, 8)}...</span>
                        </div>
                        
                        {(log.old_value !== null || log.new_value !== null) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {log.old_value !== null && (
                                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                        <p className="text-[10px] font-bold text-red-500/50 uppercase tracing-widest mb-1">Before</p>
                                        <code className="text-xs text-red-400 font-mono break-all">{log.old_value || 'Empty'}</code>
                                    </div>
                                )}
                                {log.new_value !== null && (
                                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                        <p className="text-[10px] font-bold text-green-500/50 uppercase tracing-widest mb-1">After</p>
                                        <code className="text-xs text-green-400 font-mono break-all">{log.new_value || 'Empty'}</code>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
