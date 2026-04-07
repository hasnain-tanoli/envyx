'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import EnvItem from '@/components/EnvItem';
import Modal from '@/components/Modal';
import { getEnvs, addEnv, deleteEnv, updateEnv } from '@/lib/api';
import { Environment } from '@/types';
import { 
    Plus, 
    ArrowLeft, 
    Search, 
    FileText, 
    Loader2, 
    Save, 
    AlertCircle,
    Shield,
    Rocket,
    Copy,
    Check
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [envs, setEnvs] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Add Single/Bulk Modals
    const [singleOpen, setSingleOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    
    // Form States
    const [newEnv, setNewEnv] = useState({ key: '', value: '' });
    const [envFile, setEnvFile] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [bulkCopied, setBulkCopied] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    const fetchEnvs = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getEnvs(projectId);
            setEnvs(Array.isArray(data) ? data : []);
        } catch (error: unknown) {
            console.error('Failed to fetch envs:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        setHasMounted(true);
        fetchEnvs();
    }, [fetchEnvs]);

    async function handleAddSingle(e: React.FormEvent) {
        e.preventDefault();
        if (!newEnv.key || !newEnv.value) return;
        
        setSubmitting(true);
        try {
            await addEnv(projectId, newEnv.key, newEnv.value);
            setSingleOpen(false);
            setNewEnv({ key: '', value: '' });
            fetchEnvs();
        } catch (error) {
            console.error('Error adding env:', error);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleAddBulk(e: React.FormEvent) {
        e.preventDefault();
        if (!envFile.trim()) return;

        setSubmitting(true);
        try {
            // Simple .env parser
            const lines = envFile.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) continue;
                
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^['"](.*)['"]$/, '$1');
                    await addEnv(projectId, key.trim(), value);
                }
            }
            setBulkOpen(false);
            setEnvFile('');
            fetchEnvs();
        } catch (error) {
            console.error('Error adding bulk envs:', error);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(envId: string) {
        if (!confirm('Are you sure you want to delete this variable?')) return;
        try {
            await deleteEnv(projectId, envId);
            fetchEnvs();
        } catch (error) {
            console.error('Error deleting env:', error);
        }
    }

    async function handleUpdate(envId: string, key: string, value: string) {
        try {
            await updateEnv(projectId, envId, key, value);
            fetchEnvs();
        } catch (error) {
            console.error('Error updating env:', error);
            throw error; // Let EnvItem handle the error UI if it wants
        }
    }

    async function handleBulkCopy() {
        if (!Array.isArray(envs) || envs.length === 0) return;
        
        const bulkText = envs
            .map(e => `${e.key}=${e.value}`)
            .join('\n');
            
        await navigator.clipboard.writeText(bulkText);
        setBulkCopied(true);
        setTimeout(() => setBulkCopied(false), 2000);
    }

    const filteredEnvs = Array.isArray(envs) 
        ? envs.filter(e => e.key.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 animate-in">
            {/* Header Area */}
            <div className="mb-10 flex flex-col gap-6">
                <Link href="/projects" className="flex items-center gap-2 text-gray-500 hover:text-indigo-400 transition-colors w-fit font-medium">
                    <ArrowLeft size={18} />
                    Back to Projects
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-500">
                            <Shield size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Secure Vault</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Project Variables</h1>
                    </div>

                    <div className="flex gap-4">
                        {hasMounted && (
                            <>
                                <button 
                                    onClick={handleBulkCopy}
                                    disabled={!envs?.length || bulkCopied}
                                    className={`glass px-5 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all border ${bulkCopied ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'text-gray-300 hover:text-white hover:bg-white/10 border-white/5 disabled:opacity-30'}`}
                                >
                                    {bulkCopied ? <Check size={18} /> : <Copy size={18} />}
                                    {bulkCopied ? 'Copied' : 'Bulk Copy'}
                                </button>
                                <button 
                                    onClick={() => setBulkOpen(true)}
                                    className="glass px-5 py-3 rounded-2xl flex items-center gap-2 font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all border-white/5"
                                >
                                    <FileText size={18} />
                                    Bulk Import
                                </button>
                                <button 
                                    onClick={() => setSingleOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    <Plus size={18} />
                                    Add Single
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="glass rounded-[2rem] p-4 sm:p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 px-2">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter by key..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                        {filteredEnvs.length} Variables Found
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="text-indigo-500 animate-spin" size={40} />
                        <p className="text-gray-500 font-medium">Decrypting your vault...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-400">
                            <AlertCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Decryption Failed</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">{error}</p>
                            <p className="text-xs text-gray-600 mt-4 italic">Tip: This usually happens if the encryption key was changed or is invalid.</p>
                        </div>
                        <button 
                            onClick={() => fetchEnvs()}
                            className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold transition-all"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : filteredEnvs.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {filteredEnvs.map(e => (
                            <EnvItem 
                                key={e.id} 
                                id={e.id}
                                keyName={e.key} 
                                value={e.value} 
                                error={e.error}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 flex flex-col items-center gap-4">
                        <div className="p-4 rounded-2xl bg-indigo-500/5 text-indigo-400/50">
                            <AlertCircle size={40} />
                        </div>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">
                            {searchTerm ? `No variables matching "${searchTerm}"` : "This vault is empty. Start adding secure variables."}
                        </p>
                    </div>
                )}
            </div>

            {/* Single Add Modal */}
            <Modal isOpen={singleOpen} onClose={() => setSingleOpen(false)}>
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-black text-white">Add Variable</h2>
                    <p className="text-gray-400 text-sm mt-1">Key-value pair will be encrypted before storage.</p>
                </div>
                <form onSubmit={handleAddSingle} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Key Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="DATABASE_URL"
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm placeholder:text-gray-700"
                            value={newEnv.key}
                            onChange={e => setNewEnv(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Value</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••••••••••"
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm placeholder:text-gray-700"
                            value={newEnv.value}
                            onChange={e => setNewEnv(prev => ({ ...prev, value: e.target.value }))}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {submitting ? 'Encrypting...' : 'Save Variable'}
                    </button>
                </form>
            </Modal>

            {/* Bulk Add Modal */}
            <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)}>
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-black text-white">Bulk .env Import</h2>
                    <p className="text-gray-400 text-sm mt-1">Paste your .env file content. Comments and empty lines are skipped.</p>
                </div>
                <form onSubmit={handleAddBulk} className="space-y-6">
                    <div className="relative">
                        <textarea 
                            rows={12}
                            required
                            placeholder="DB_URI=postgres://...&#10;API_KEY=sk_test_..."
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs placeholder:text-gray-700 leading-relaxed resize-none"
                            value={envFile}
                            onChange={e => setEnvFile(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
                        {submitting ? 'Parsing & Encrypting...' : 'Import Everything'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}