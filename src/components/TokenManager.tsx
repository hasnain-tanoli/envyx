'use client';

import { useState, useEffect } from 'react';
import { Key, Trash2, Copy, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Token {
    id: string;
    name: string;
    expires_at: string;
    last_used_at: string | null;
    created_at: string;
}

export function TokenManager({ projectId }: { projectId: string }) {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [creating, setCreating] = useState(false);
    const [newToken, setNewToken] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        fetchTokens();
    }, [projectId]);

    const fetchTokens = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/tokens`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setTokens(data);
        } catch (e) {
            showToast('Failed to load tokens', 'error');
        } finally {
            setLoading(false);
        }
    };

    const createToken = async () => {
        if (!name) return;
        setCreating(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (res.ok) {
                setNewToken(data.token);
                setName('');
                fetchTokens();
                showToast('Token created successfully', 'success');
            } else {
                showToast(data.error || 'Failed to create token', 'error');
            }
        } catch (e) {
            showToast('Failed to create token', 'error');
        } finally {
            setCreating(false);
        }
    };

    const revokeToken = async (tokenId: string) => {
        try {
            const res = await fetch(`/api/tokens/${tokenId}`, { method: 'DELETE' });
            if (res.ok) {
                setTokens(tokens.filter(t => t.id !== tokenId));
                showToast('Token revoked', 'success');
            }
        } catch (e) {
            showToast('Failed to revoke token', 'error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    return (
        <div className="glass rounded-[2rem] p-8 border-white/5 bg-white/5 backdrop-blur-xl transition-all h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                    <Key size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">API Tokens</h3>
                    <p className="text-sm text-gray-500 font-medium">Generate scoped tokens for CLI and CI/CD access. Tokens are read-only for this project.</p>
                </div>
            </div>

            <div className="space-y-6">
                {newToken ? (
                    <div className="p-6 border rounded-2xl bg-amber-500/10 border-amber-500/30 space-y-4 shadow-xl shadow-amber-500/5">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <AlertCircle className="w-4 h-4" />
                            Copy your token now
                        </div>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            For security, we won&apos;t show this token again. Store it securely.
                        </p>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-black/40 px-4 py-3 rounded-xl border border-white/10 font-mono text-xs break-all text-gray-200 select-all">
                                {newToken}
                            </div>
                            <button
                                onClick={() => copyToClipboard(newToken)}
                                className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all border border-white/5"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black py-4 rounded-xl transition-all active:scale-[0.98]"
                            onClick={() => setNewToken(null)}
                        >
                            I&apos;ve safely stored it
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <input
                            placeholder="Token Name (e.g. GitHub Actions)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium placeholder:text-gray-700"
                        />
                        <button
                            onClick={createToken}
                            disabled={creating || !name}
                            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-black px-8 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95"
                        >
                            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Create
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-3 text-gray-600">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm font-bold uppercase tracking-widest">Loading Access Keys...</span>
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="text-center text-gray-600 py-12 text-sm font-medium border-2 border-dashed border-white/5 rounded-[2rem]">
                            No active tokens for this project
                        </div>
                    ) : (
                        tokens.map(token => (
                            <div key={token.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                                <div className="space-y-1.5">
                                    <div className="text-base font-bold text-gray-100">{token.name}</div>
                                    <div className="text-[10px] text-gray-500 flex gap-4 font-black uppercase tracking-widest leading-none">
                                        <span className="flex items-center gap-1">Created: <span className="text-gray-400">{new Date(token.created_at).toLocaleDateString()}</span></span>
                                        <span className="flex items-center gap-1">Expires: <span className="text-gray-400">{new Date(token.expires_at).toLocaleDateString()}</span></span>
                                        {token.last_used_at && (
                                            <span className="flex items-center gap-1">Last seen: <span className="text-gray-400">{new Date(token.last_used_at).toLocaleDateString()}</span></span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="p-3 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-400/10 md:opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                                    onClick={() => revokeToken(token.id)}
                                    title="Revoke Token"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
