'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import EnvItem from '@/components/EnvItem';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import AuditTimeline from '@/components/AuditTimeline';
import ConnectPanel from '@/components/ConnectPanel';
import TrashItem from '@/components/TrashItem';
import { getEnvs, addEnv, deleteEnv, updateEnv, getProject, bulkImportEnvs, getTrashEnvs, restoreEnv, hardDeleteEnv } from '@/lib/api';
import { Environment, Project } from '@/types';
import { useToast } from '@/components/Toast';
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
    Check,
    History,
    Terminal,
    Database,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

type Tab = 'variables' | 'activity' | 'connect' | 'trash';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as string;
    const { showToast } = useToast();
    const [project, setProject] = useState<Project | null>(null);
    const [envs, setEnvs] = useState<Environment[]>([]);
    const [trashEnvs, setTrashEnvs] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('variables');
    const [singleOpen, setSingleOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [newEnv, setNewEnv] = useState({ key: '', value: '' });
    const [envFile, setEnvFile] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [bulkCopied, setBulkCopied] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [confirmEnvOpen, setConfirmEnvOpen] = useState(false);
    const [pendingDeleteEnvId, setPendingDeleteEnvId] = useState<string | null>(null);
    const [confirmHardDeleteOpen, setConfirmHardDeleteOpen] = useState(false);
    const [pendingHardDeleteId, setPendingHardDeleteId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const [projectData, envsData, trashData] = await Promise.all([
                getProject(projectId),
                getEnvs(projectId),
                getTrashEnvs(projectId)
            ]);
            setProject(projectData);
            setEnvs(Array.isArray(envsData) ? envsData : []);
            setTrashEnvs(Array.isArray(trashData) ? trashData : []);
        } catch (error: unknown) {
            console.error('Failed to fetch project data:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
            showToast('Failed to sync with vault', 'error');
        } finally {
            setLoading(false);
        }
    }, [projectId, showToast]);

    useEffect(() => {
        setHasMounted(true);
        fetchData();
    }, [fetchData]);

    const handleAddSingle = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEnv.key || !newEnv.value) return;

        setSubmitting(true);
        try {
            await addEnv(projectId, newEnv.key.toUpperCase(), newEnv.value);
            showToast(`Added ${newEnv.key.toUpperCase()}`, 'success');
            setSingleOpen(false);
            setNewEnv({ key: '', value: '' });
            fetchData();
        } catch {
            showToast('Failed to add variable', 'error');
        } finally {
            setSubmitting(false);
        }
    }, [projectId, newEnv, fetchData, showToast]);

    const handleAddBulk = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!envFile.trim()) return;

        setSubmitting(true);
        try {
            const result = await bulkImportEnvs(projectId, envFile);
            const skippedCount = result.skipped?.length ?? 0;
            if (skippedCount > 0) {
                showToast(`Imported ${result.inserted} variables (${skippedCount} skipped)`, 'success');
            } else {
                showToast(`Imported ${result.inserted} variables`, 'success');
            }
            setBulkOpen(false);
            setEnvFile('');
            fetchData();
        } catch {
            showToast('Bulk import failed', 'error');
        } finally {
            setSubmitting(false);
        }
    }, [projectId, envFile, fetchData, showToast]);

    const handleDelete = useCallback((envId: string) => {
        setPendingDeleteEnvId(envId);
        setConfirmEnvOpen(true);
    }, []);

    const confirmDeleteEnv = useCallback(async () => {
        if (!pendingDeleteEnvId) return;
        setConfirmEnvOpen(false);
        try {
            await deleteEnv(projectId, pendingDeleteEnvId);
            showToast('Variable deleted', 'success');
            fetchData();
        } catch {
            showToast('Delete failed', 'error');
        } finally {
            setPendingDeleteEnvId(null);
        }
    }, [projectId, pendingDeleteEnvId, fetchData, showToast]);

    const handleUpdate = useCallback(async (envId: string, key: string, value: string) => {
        try {
            await updateEnv(projectId, envId, key, value);
            showToast('Updated successfully', 'success');
            fetchData();
        } catch (error) {
            showToast('Update failed', 'error');
            throw error;
        }
    }, [projectId, fetchData, showToast]);

    const handleRestore = useCallback(async (envId: string) => {
        try {
            await restoreEnv(projectId, envId);
            showToast('Variable restored', 'success');
            fetchData();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Restore failed', 'error');
            throw error;
        }
    }, [projectId, fetchData, showToast]);

    const handleConfirmHardDelete = useCallback((envId: string) => {
        setPendingHardDeleteId(envId);
        setConfirmHardDeleteOpen(true);
    }, []);

    const executeHardDelete = useCallback(async () => {
        if (!pendingHardDeleteId) return;
        setConfirmHardDeleteOpen(false);
        try {
            await hardDeleteEnv(projectId, pendingHardDeleteId);
            showToast('Permanently deleted', 'success');
            fetchData();
        } catch {
            showToast('Delete failed', 'error');
        } finally {
            setPendingHardDeleteId(null);
        }
    }, [projectId, pendingHardDeleteId, fetchData, showToast]);

    const handleBulkCopy = useCallback(async () => {
        if (!Array.isArray(envs) || envs.length === 0) return;

        const bulkText = envs
            .map(e => `${e.key}=${e.value}`)
            .join('\n');

        await navigator.clipboard.writeText(bulkText);
        setBulkCopied(true);
        showToast('All variables copied to clipboard', 'success');
        setTimeout(() => setBulkCopied(false), 2000);
    }, [envs, showToast]);

    // OPTIMIZATION: Memoize filter result to prevent recalculation on every re-render
    const filteredEnvs = useMemo(() => {
        if (!Array.isArray(envs)) return [];
        if (!searchTerm) return envs;
        const lowSearch = searchTerm.toLowerCase();
        return envs.filter(e => e.key.toLowerCase().includes(lowSearch));
    }, [envs, searchTerm]);

    const envColors: Record<string, string> = {
        production: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10',
        staging: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10',
        development: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/10'
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Header Area */}
            <div className="mb-10 flex flex-col gap-6">
                <Link href="/projects" className="flex items-center gap-2 text-gray-500 hover:text-indigo-400 transition-colors w-fit font-medium">
                    <ArrowLeft size={18} />
                    Back to Projects
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2 text-indigo-500">
                                <Shield size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Secure Vault</span>
                            </div>
                            {project?.environment && (
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shadow-sm ${envColors[project.environment] || envColors.development}`}>
                                    {project.environment}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">{project?.name || 'Loading Project...'}</h1>
                        <p className="text-gray-500 font-medium mt-1">{project?.description || 'Manage your encrypted secrets and access history.'}</p>
                    </div>

                    <div className="flex gap-4">
                        {hasMounted && activeTab === 'variables' && (
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

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/5 backdrop-blur-sm overflow-x-auto max-w-full">
                {[
                    { id: 'variables', icon: Database, label: 'Variables' },
                    { id: 'activity', icon: History, label: 'Activity' },
                    { id: 'connect', icon: Terminal, label: 'Connect CLI' },
                    { id: 'trash', icon: Trash2, label: 'Trash' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass rounded-[2rem] p-4 sm:p-8 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="text-indigo-500 animate-spin" size={40} />
                        <p className="text-gray-500 font-medium tracking-tight">Accessing Secure Vault...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-400 shadow-inner">
                            <AlertCircle size={40} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Vault Connection Error</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">{error}</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20"
                        >
                            Retry Handshake
                        </button>
                    </div>
                ) : activeTab === 'variables' ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 px-2">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search encrypted keys..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600 font-medium"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                {filteredEnvs.length} Records found
                            </div>
                        </div>

                        {filteredEnvs.length > 0 ? (
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
                    </>
                ) : activeTab === 'activity' ? (
                    <AuditTimeline projectId={projectId} />
                ) : activeTab === 'connect' ? (
                    <ConnectPanel projectId={projectId} />
                ) : (
                    <>
                        <div className="mb-6 px-2">
                            <h3 className="text-xl font-bold text-white mb-2">Trash</h3>
                            <p className="text-sm text-gray-400">Soft-deleted variables are kept here. You can restore them to active use, or permanently delete them along with their audit history.</p>
                        </div>
                        {trashEnvs.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {trashEnvs.map(e => (
                                    <TrashItem
                                        key={e.id}
                                        id={e.id}
                                        keyName={e.key}
                                        deletedAt={e.deleted_at}
                                        onRestore={handleRestore}
                                        onHardDelete={handleConfirmHardDelete}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 flex flex-col items-center gap-4">
                                <div className="p-4 rounded-2xl bg-gray-500/5 text-gray-400/50">
                                    <Trash2 size={40} />
                                </div>
                                <p className="text-gray-500 font-medium">Your trash is empty.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Single Add Modal */}
            <Modal isOpen={singleOpen} onClose={() => setSingleOpen(false)}>
                <div className="mb-8 text-center px-4">
                    <h2 className="text-3xl font-black text-white tracking-tight">New Secret</h2>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Your data will be encrypted before it leaves this client.</p>
                </div>
                <form onSubmit={handleAddSingle} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Key Name</label>
                        <input
                            type="text"
                            required
                            placeholder="DATABASE_URL"
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm placeholder:text-gray-700"
                            value={newEnv.key}
                            onChange={e => setNewEnv(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Secret Value</label>
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
                        {submitting ? 'Performing Handshake...' : 'Seal & Store'}
                    </button>
                </form>
            </Modal>

            {/* Bulk Add Modal */}
            <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)}>
                <div className="mb-8 text-center px-4">
                    <h2 className="text-3xl font-black text-white tracking-tight">Bulk .env Import</h2>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Paste your raw .env file content below. We&apos;ll parse and encrypt each key individually.</p>
                </div>
                <form onSubmit={handleAddBulk} className="space-y-6">
                    <div className="relative">
                        <textarea
                            rows={12}
                            required
                            placeholder="DB_URI=postgres://...&#10;API_KEY=sk_test_..."
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xs placeholder:text-gray-700 leading-relaxed resize-none scrollbar-hide"
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
                        {submitting ? 'Processing Batch...' : 'Import Batch'}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmEnvOpen}
                title="Delete Variable?"
                message="This will move this variable to the Trash. You can restore it later if needed."
                confirmLabel="Move to Trash"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={confirmDeleteEnv}
                onCancel={() => { setConfirmEnvOpen(false); setPendingDeleteEnvId(null); }}
            />

            <ConfirmDialog
                isOpen={confirmHardDeleteOpen}
                title="Permanently Delete?"
                message="This will completely wipe out this variable and its entire audit history from the database. This action cannot be reversed."
                confirmLabel="Delete Forever"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={executeHardDelete}
                onCancel={() => { setConfirmHardDeleteOpen(false); setPendingHardDeleteId(null); }}
            />
        </div>
    );
}