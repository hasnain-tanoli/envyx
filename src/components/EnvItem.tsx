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
            <div className="group glass-item bg-indigo-500/5 border-indigo-500/20 p-4 rounded-2xl flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 shadow-sm">Key</label>
                        <input 
                            type="text" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                            value={editKey}
                            onChange={e => setEditKey(e.target.value.toUpperCase())}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Value</label>
                        <div className="relative">
                            <input 
                                type={revealed ? "text" : "password"} 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono transition-all pr-10"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                            />
                            <button 
                                onClick={() => setRevealed(!revealed)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white"
                                type="button"
                            >
                                {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button 
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={12} /> : <Check size={12} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group glass-item bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="flex flex-col gap-1 min-w-0 pr-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{keyName}</span>
                <div className="flex items-center gap-2 font-mono text-sm overflow-hidden">
                    {error && <AlertTriangle className="text-red-400 shrink-0" size={14} />}
                    <span className={`transition-all duration-300 truncate ${error ? 'text-red-400/80 italic font-sans' : revealed ? 'text-gray-200' : 'text-gray-600 blur-sm select-none'}`}>
                        {error ? value : (revealed ? value : '••••••••••••••••')}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button 
                    onClick={() => setRevealed(!revealed)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    title={revealed ? 'Hide Value' : 'Show Value'}
                >
                    {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                
                <button 
                    onClick={handleCopy}
                    className={`p-2 rounded-xl transition-all ${copied ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Copy as KEY=VALUE"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>

                {!disabled && (
                    <>
                        <div className="w-[1px] h-6 bg-white/10 mx-1" />

                        <button 
                            onClick={() => setIsEditing(true)}
                            className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all"
                            title="Edit Variable"
                        >
                            <Edit2 size={18} />
                        </button>

                        <button 
                            onClick={() => onDelete?.(id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            title="Delete Variable"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default memo(EnvItem);