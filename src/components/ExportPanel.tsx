'use client';

import { useState } from 'react';
import { FileJson, FileCode, Copy, Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

export function ExportPanel({ projectId }: { projectId: string }) {
    const [downloading, setDownloading] = useState(false);
    const { showToast } = useToast();

    const downloadFormat = async (format: 'env' | 'json') => {
        setDownloading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/export?format=${format}`);
            if (!res.ok) throw new Error('Failed to export');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `envyx_export_${projectId.slice(0, 8)}.${format === 'env' ? 'env' : 'json'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast(`Exported as ${format.toUpperCase()}`, 'success');
        } catch {
            showToast('Failed to export variables', 'error');
        } finally {
            setDownloading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/export?format=env`);
            if (!res.ok) throw new Error();
            const text = await res.text();
            await navigator.clipboard.writeText(text);
            showToast('Copied .env to clipboard', 'success');
        } catch {
            showToast('Failed to copy', 'error');
        }
    };

    return (
        <div className="ray-card p-6 bg-[#101111] transition-all h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-xl bg-[#1b1c1e] border border-white/5 text-[var(--ray-blue)] shadow-inner">
                    <Share2 size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-[#f9f9f9]">Export Artifacts</h3>
                    <p className="text-[13px] text-[#6a6b6c] font-medium leading-tight mt-1">Download or copy for local development.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                    onClick={() => downloadFormat('env')}
                    disabled={downloading}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--ray-green)]/30 transition-all group active:scale-[0.98] disabled:opacity-50"
                >
                    <div className="p-3 rounded-xl bg-white/5 text-[var(--ray-green)] group-hover:scale-105 transition-transform border border-white/5">
                        {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCode className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-medium text-[#cecece]">Standard .env</span>
                        <span className="text-[10px] text-[#6a6b6c] font-bold uppercase tracking-widest mt-1">Download</span>
                    </div>
                </button>

                <button
                    onClick={() => downloadFormat('json')}
                    disabled={downloading}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--ray-yellow)]/30 transition-all group active:scale-[0.98] disabled:opacity-50"
                >
                    <div className="p-3 rounded-xl bg-white/5 text-[var(--ray-yellow)] group-hover:scale-105 transition-transform border border-white/5">
                        {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-medium text-[#cecece]">Structured JSON</span>
                        <span className="text-[10px] text-[#6a6b6c] font-bold uppercase tracking-widest mt-1">Download</span>
                    </div>
                </button>

                <button
                    onClick={copyToClipboard}
                    className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[var(--ray-blue)]/30 transition-all group active:scale-[0.98]"
                >
                    <div className="p-3 rounded-xl bg-white/5 text-[var(--ray-blue)] group-hover:scale-105 transition-transform border border-white/5">
                        <Copy className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-medium text-[#cecece]">Clipboard</span>
                        <span className="text-[10px] text-[#6a6b6c] font-bold uppercase tracking-widest mt-1">Copy All</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
