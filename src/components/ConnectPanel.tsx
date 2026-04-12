'use client';

import { useState } from 'react';
import { Terminal, Copy, Check, ShieldAlert, Code, Globe } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function ConnectPanel({ projectId }: { projectId: string }) {
    const { showToast } = useToast();
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        showToast('Snippet copied', 'success');
        setTimeout(() => setCopied(null), 2000);
    };

    const curlSnippet = `curl -X GET "https://envyx.app/api/projects/${projectId}/env" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`;

    const fetchSnippet = `const res = await fetch('https://envyx.app/api/projects/${projectId}/env', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});
const data = await res.json();`;

    return (
        <div className="space-y-8 py-2">
            {/* Warning Banner */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--ray-yellow)]/20 flex gap-4">
                <ShieldAlert className="text-[var(--ray-yellow)] shrink-0" size={20} />
                <div className="space-y-1">
                    <h4 className="text-[var(--ray-yellow)] font-bold text-xs uppercase tracking-wider">Security First</h4>
                    <p className="text-[#6a6b6c] text-[13px] leading-relaxed font-medium">
                        Never fetch secrets client-side. Always route through a secure backend or build process to maintain zero-visibility for end-users.
                    </p>
                </div>
            </div>

            {/* Snippets */}
            <div className="space-y-6">
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[#6a6b6c]">
                        <Terminal size={14} />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">cURL / CLI</h3>
                    </div>
                    <div className="relative group">
                        <pre className="p-5 rounded-xl bg-[#07080a] border border-white/5 font-mono text-[13px] text-[var(--ray-blue)] overflow-x-auto leading-relaxed shadow-inner">
                            {curlSnippet}
                        </pre>
                        <button 
                            onClick={() => handleCopy(curlSnippet, 'curl')}
                            className="absolute right-3 top-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[#6a6b6c] hover:text-[#f9f9f9] transition-all opacity-0 group-hover:opacity-100"
                        >
                            {copied === 'curl' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-[#6a6b6c]">
                        <Code size={14} />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Node.js Fetch</h3>
                    </div>
                    <div className="relative group">
                        <pre className="p-5 rounded-xl bg-[#07080a] border border-white/5 font-mono text-[13px] text-[var(--ray-blue)] overflow-x-auto leading-relaxed shadow-inner">
                            {fetchSnippet}
                        </pre>
                        <button 
                            onClick={() => handleCopy(fetchSnippet, 'fetch')}
                            className="absolute right-3 top-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[#6a6b6c] hover:text-[#f9f9f9] transition-all opacity-0 group-hover:opacity-100"
                        >
                            {copied === 'fetch' ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </section>
            </div>

            {/* Integration Guides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[var(--ray-blue)]/30 hover:bg-white/[0.04] transition-all cursor-pointer group">
                    <Globe className="text-[var(--ray-blue)] mb-3 opacity-80" size={20} />
                    <h4 className="text-[#f9f9f9] font-medium text-sm">Vercel Integration</h4>
                    <p className="text-[#6a6b6c] text-[12px] mt-1 font-medium">Auto-sync secrets to Vercel production environments.</p>
                </div>
                <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 transition-all text-[#6a6b6c]/40 cursor-not-allowed">
                    <Code size={20} className="mb-3" />
                    <h4 className="font-medium text-sm">GitHub Actions</h4>
                    <p className="text-[12px] mt-1 font-medium">Coming soon: CLI-less secrets injection for pipelines.</p>
                </div>
            </div>
        </div>
    );
}
