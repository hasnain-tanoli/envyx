'use client';

import { useState, useEffect, useCallback } from 'react';
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

    const fetchTokens = useCallback(async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/tokens`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setTokens(data);
        } catch {
            showToast('Failed to load tokens', 'error');
        } finally {
            setLoading(false);
        }
    }, [projectId, showToast]);

    useEffect(() => {
        fetchTokens();
    }, [fetchTokens]);

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
                showToast('Token created', 'success');
            } else {
                showToast(data.error || 'Failed to create token', 'error');
            }
        } catch {
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
        } catch {
            showToast('Failed to revoke token', 'error');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    return (
        <div className="ray-card p-6 bg-[#101111] transition-all h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-[#1b1c1e] border border-white/5 text-[var(--ray-yellow)] shadow-inner">
                    <Key size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-[#f9f9f9]">API Tokens</h3>
                    <p className="text-[13px] text-[#6a6b6c] font-medium leading-tight mt-1">Generate scoped keys for automated access.</p>
                </div>
            </div>

            <div className="space-y-6">
                {newToken ? (
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-[var(--ray-yellow)]/20 space-y-4 shadow-2xl">
                        <div className="flex items-center gap-2 text-[var(--ray-yellow)] text-xs font-bold uppercase tracking-wider">
                            <AlertCircle size={14} />
                            Critical: Copy your token
                        </div>
                        <p className="text-[#6a6b6c] text-[13px] font-medium leading-relaxed">
                            This token will never be shown again. Please store it in a secure location.
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-[#07080a] px-4 py-2.5 rounded-lg border border-white/5 font-mono text-[13px] break-all text-[#cecece] select-all">
                                {newToken}
                            </div>
                            <button
                                onClick={() => copyToClipboard(newToken)}
                                className="p-2.5 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors hover:bg-white/5 rounded-lg"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <button
                            className="w-full bg-[var(--ray-yellow)]/80 hover:bg-[var(--ray-yellow)] text-black font-bold py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all"
                            onClick={() => setNewToken(null)}
                        >
                            Stored Safely
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            placeholder="Unique Token Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1 bg-[#07080a] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-yellow)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40"
                        />
                        <button
                            onClick={createToken}
                            disabled={creating || !name}
                            className="pill-button pill-button-secondary text-[11px] px-6 py-2.5 disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                            <span className="ml-2 font-bold uppercase tracking-wider">Create</span>
                        </button>
                    </div>
                )}

                <div className="space-y-0.5 border-t border-white/5 pt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 gap-3 text-[#6a6b6c]">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Refreshing tokens...</span>
                        </div>
                    ) : tokens.length === 0 ? (
                        <div className="text-center text-[#6a6b6c] py-10 text-[13px] font-medium border border-dashed border-white/5 rounded-xl">
                            No active tokens created yet.
                        </div>
                    ) : (
                        tokens.map(token => (
                            <div key={token.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-[#f9f9f9]">{token.name}</div>
                                    <div className="text-[10px] text-[#6a6b6c] flex flex-wrap gap-x-4 gap-y-1 font-bold uppercase tracking-widest">
                                        <span>Created: <span className="text-[#cecece]">{new Date(token.created_at).toLocaleDateString()}</span></span>
                                        <span>Expires: <span className="text-[#cecece]">{new Date(token.expires_at).toLocaleDateString()}</span></span>
                                        {token.last_used_at && (
                                            <span>Last active: <span className="text-[#cecece]">{new Date(token.last_used_at).toLocaleDateString()}</span></span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="p-2 text-[#6a6b6c] hover:text-[#FF6363] opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => revokeToken(token.id)}
                                    title="Revoke Access"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
