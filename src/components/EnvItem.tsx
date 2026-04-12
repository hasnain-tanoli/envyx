'use client';

import { useState, memo } from 'react';
import { Eye, EyeOff, Copy, Check, Trash2, Edit2, AlertTriangle, Loader2 } from 'lucide-react';

interface EnvItemProps {
    id: string;
    keyName: string;
    value: string;
    error?: boolean;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, key: string, value: string) => void;
    disabled?: boolean;
}

function EnvItem({ id, keyName, value, error, onDelete, onUpdate, disabled }: EnvItemProps) {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editKey, setEditKey] = useState(keyName);
    const [editValue, setEditValue] = useState(value);
    const [saving, setSaving] = useState(false);

    async function handleCopy() {
        await navigator.clipboard.writeText(`${keyName}=${value}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleSave() {
        if (!editKey || !editValue) return;
        setSaving(true);
        try {
            await onUpdate?.(id, editKey, editValue);
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setSaving(false);
        }
    }

    if (isEditing) {
        return (
            <div className="ray-card p-5 flex flex-col gap-5 border-[#FF6363]/20 bg-[#101111]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#FF6363] uppercase tracking-widest px-1">Key Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#07080a] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6363]/50 font-mono transition-all"
                            value={editKey}
                            onChange={e => setEditKey(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#FF6363] uppercase tracking-widest px-1">Secret Value</label>
                        <div className="relative">
                            <input 
                                type={revealed ? "text" : "password"} 
                                className="w-full bg-[#07080a] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6363]/50 font-mono transition-all pr-12"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                            />
                            <button 
                                onClick={() => setRevealed(!revealed)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#6a6b6c] hover:text-[#f9f9f9]"
                                type="button"
                            >
                                {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-white/5">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="text-xs font-bold text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="pill-button pill-button-primary text-xs py-2 px-6 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Check className="mr-2" size={14} />}
                        {saving ? 'Encrypting...' : 'Update Secret'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
            <div className="flex flex-col gap-1 min-w-0 pr-4">
                <span className="text-[11px] font-bold text-[var(--ray-blue)] uppercase tracking-wider">{keyName}</span>
                <div className="flex items-center gap-2 font-mono text-sm overflow-hidden">
                    {error && <AlertTriangle className="text-[#FF6363] shrink-0" size={12} />}
                    <span className={`transition-all duration-300 truncate ${error ? 'text-[#FF6363]/80 italic' : revealed ? 'text-[#cecece]' : 'text-white/20 blur-[3px] select-none cursor-default'}`}>
                        {error ? value : (revealed ? value : '••••••••••••••••••••')}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 transition-opacity duration-200 group-hover:opacity-100 opacity-60">
                <button 
                    onClick={() => setRevealed(!revealed)}
                    className="p-2 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
                    title={revealed ? 'Hide' : 'Show'}
                >
                    {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                
                <button 
                    onClick={handleCopy}
                    className={`p-2 transition-colors ${copied ? 'text-[var(--ray-green)]' : 'text-[#6a6b6c] hover:text-[#f9f9f9]'}`}
                    title="Copy"
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>

                {!disabled && (
                    <>
                        <div className="w-[1px] h-4 bg-white/10 mx-1" />

                        <button 
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors"
                            title="Edit"
                        >
                            <Edit2 size={16} />
                        </button>

                        <button 
                            onClick={() => onDelete?.(id)}
                            className="p-2 text-[#6a6b6c] hover:text-[#FF6363] transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default memo(EnvItem);