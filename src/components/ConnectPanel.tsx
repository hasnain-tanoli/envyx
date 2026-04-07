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
        showToast('Snippet copied to clipboard', 'success');
        setTimeout(() => setCopied(null), 2000);
    };

    const curlSnippet = `curl -X GET "https://envyx.app/api/projects/${projectId}/env" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`;

    const fetchSnippet = `const res = await fetch('https://envyx.app/api/projects/${projectId}/env', {
  headers: { 'Authorization': 'Bearer YOUR_API_TOKEN' }
});
const envs = await res.json();`;

    return (
        <div className="space-y-8 py-4">
            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                <div>
                    <h4 className="text-amber-500 font-bold text-sm tracking-tight">Security Best Practice</h4>
                    <p className="text-amber-500/80 text-xs leading-relaxed mt-1 font-medium">
                        Never fetch environment variables directly from the browser. Always perform these requests from a secure backend server or during your build process to keep your Master Key safe.
                    </p>
                </div>
            </div>

            {/* Snippets */}
            <div className="space-y-6">
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Terminal size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">cURL / CLI</h3>
                    </div>
                    <div className="relative group">
                        <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                            {curlSnippet}
                        </pre>
                        <button 
                            onClick={() => handleCopy(curlSnippet, 'curl')}
                            className="absolute right-4 top-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            {copied === 'curl' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Code size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Node.js Fetch</h3>
                    </div>
                    <div className="relative group">
                        <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                            {fetchSnippet}
                        </pre>
                        <button 
                            onClick={() => handleCopy(fetchSnippet, 'fetch')}
                            className="absolute right-4 top-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            {copied === 'fetch' ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                </section>
            </div>

            {/* Integration Guides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group">
                    <Globe className="text-indigo-400 mb-3" size={24} />
                    <h4 className="text-white font-bold text-sm">Vercel Integration</h4>
                    <p className="text-gray-500 text-xs mt-1 font-medium">Sync your Envyx variables with Vercel secrets automatically.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer group text-gray-600 grayscale opacity-50">
                    <Terminal className="mb-3" size={24} />
                    <h4 className="font-bold text-sm">Github Actions</h4>
                    <p className="text-xs mt-1 font-medium">Coming soon: Automated secrets injection for CI/CD.</p>
                </div>
            </div>
        </div>
    );
}
