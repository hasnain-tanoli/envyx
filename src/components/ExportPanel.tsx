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
        } catch (e) {
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
        } catch (e) {
            showToast('Failed to copy', 'error');
        }
    };

    return (
        <div className="glass rounded-[2rem] p-8 border-white/5 bg-white/5 backdrop-blur-xl transition-all h-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 shadow-inner">
                    <Share2 size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Export Artifacts</h3>
                    <p className="text-sm text-gray-500 font-medium">Download or copy your encrypted variables in multiple formats for local development.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => downloadFormat('env')}
                    disabled={downloading}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all group active:scale-95 disabled:opacity-50"
                >
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                        {downloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileCode className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-gray-200">Standard .env</span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Download</span>
                    </div>
                </button>

                <button
                    onClick={() => downloadFormat('json')}
                    disabled={downloading}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all group active:scale-95 disabled:opacity-50"
                >
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                        {downloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileJson className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-gray-200">Structured JSON</span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Download</span>
                    </div>
                </button>

                <button
                    onClick={copyToClipboard}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group active:scale-95"
                >
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                        <Copy className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-bold text-gray-200">Raw Clipboard</span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Copy All</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
