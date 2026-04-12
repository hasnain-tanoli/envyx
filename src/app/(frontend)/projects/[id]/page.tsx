'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import EnvItem from '@/components/EnvItem';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import AuditTimeline from '@/components/AuditTimeline';
import ConnectPanel from '@/components/ConnectPanel';
import TrashItem from '@/components/TrashItem';
import { TokenManager } from '@/components/TokenManager';
import { ExportPanel } from '@/components/ExportPanel';
import { getEnvs, addEnv, deleteEnv, updateEnv, getProject, bulkImportEnvs, getTrashEnvs, restoreEnv, hardDeleteEnv, updateProject, deleteProject } from '@/lib/api';
import { Environment, Project, Team } from '@/types';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';
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
    Terminal,
    Database,
    Trash2,
    Settings as SettingsIcon,
    Users,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { getTeams } from '@/lib/api';

type Tab = 'variables' | 'activity' | 'connect' | 'access' | 'trash' | 'settings';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
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
    const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
    const [projectSettings, setProjectSettings] = useState({ name: '', description: '', environment: '', team_id: '' as string | null });

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const [projectData, envsData, trashData, teamsData] = await Promise.all([
                getProject(projectId),
                getEnvs(projectId),
                getTrashEnvs(projectId),
                getTeams().catch(() => [])
            ]);
            setProject(projectData);
            setProjectSettings({
                name: projectData.name,
                description: projectData.description || '',
                environment: projectData.environment || 'development',
                team_id: projectData.team_id
            });
            setEnvs(Array.isArray(envsData) ? envsData : []);
            setTrashEnvs(Array.isArray(trashData) ? trashData : []);
            setAvailableTeams(teamsData);
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

    const filteredEnvs = useMemo(() => {
        if (!Array.isArray(envs)) return [];
        if (!searchTerm) return envs;
        const lowSearch = searchTerm.toLowerCase();
        return envs.filter(e => e.key.toLowerCase().includes(lowSearch));
    }, [envs, searchTerm]);

    const envColors: Record<string, string> = {
        production: 'text-[#FF6363] border-[#FF6363]/20 bg-[#FF6363]/5',
        staging: 'text-[var(--ray-yellow)] border-[var(--ray-yellow)]/20 bg-[var(--ray-yellow)]/5',
        development: 'text-[var(--ray-blue)] border-[var(--ray-blue)]/20 bg-[var(--ray-blue)]/5'
    };

    const isAdmin = project?.role === 'owner' || project?.role === 'admin';
    const isOwner = project?.role === 'owner';
    const isViewer = project?.role === 'viewer';

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateProject(
                projectId,
                projectSettings.name,
                projectSettings.description,
                projectSettings.environment,
                projectSettings.team_id || undefined
            );
            showToast('Settings saved', 'success');
            fetchData();
        } catch {
            showToast('Update failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!isOwner) return;
        try {
            await deleteProject(projectId);
            showToast('Project destroyed', 'success');
            router.push('/projects');
        } catch {
            showToast('Failed to delete project', 'error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="mb-12 flex flex-col gap-8">
                <Link href="/projects" className="flex items-center gap-2 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors w-fit text-[11px] font-bold uppercase tracking-widest group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 text-[var(--ray-blue)]">
                                <Shield size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Vault</span>
                            </div>
                            {project?.environment && (
                                <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded border ${envColors[project.environment] || envColors.development}`}>
                                    {project.environment}
                                </span>
                            )}
                            {project?.role && (
                                <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded border border-white/5 bg-[#1b1c1e] text-[#6a6b6c]`}>
                                    {project.role}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-medium text-[#f9f9f9] tracking-tight">{project?.name || 'Loading Vault...'}</h1>
                        <p className="text-[#6a6b6c] text-[13px] font-medium mt-2 leading-tight max-w-lg">{project?.description || 'Manage your encrypted secrets and access history with zero-knowledge security.'}</p>
                    </div>

                    <div className="flex gap-3">
                        {hasMounted && activeTab === 'variables' && !isViewer && (
                            <>
                                <button
                                    onClick={handleBulkCopy}
                                    disabled={!envs?.length || bulkCopied}
                                    className={`pill-button px-4 py-2 text-[10px] ${bulkCopied ? 'text-[#3BD671]' : 'text-[#6a6b6c] hover:text-[#f9f9f9]'}`}
                                >
                                    {bulkCopied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                                    {bulkCopied ? 'Copied' : 'Copy All'}
                                </button>
                                <button
                                    onClick={() => setBulkOpen(true)}
                                    className="pill-button px-4 py-2 text-[10px] text-[#6a6b6c] hover:text-[#f9f9f9]"
                                >
                                    <FileText size={14} className="mr-2" />
                                    Bulk Import
                                </button>
                                <button
                                    onClick={() => setSingleOpen(true)}
                                    className="pill-button pill-button-primary px-5 py-2 text-[10px]"
                                >
                                    <Plus size={14} className="mr-2" />
                                    Add Secret
                                </button>
                            </>
                        )}
                        {isViewer && activeTab === 'variables' && (
                            <div className="flex items-center gap-2 text-[var(--ray-yellow)] bg-[var(--ray-yellow)]/5 px-4 py-2 rounded-lg border border-[var(--ray-yellow)]/10 text-[9px] font-bold uppercase tracking-[0.2em]">
                                <AlertCircle size={12} />
                                View Only Mode
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 mb-8 border-b border-white/5 overflow-x-auto no-scrollbar">
                {[
                    { id: 'variables', icon: Database, label: 'Variables' },
                    { id: 'activity', icon: Activity, label: 'Activity' },
                    { id: 'connect', icon: Terminal, label: 'CLI' },
                    { id: 'access', icon: Shield, label: 'Export' },
                    { id: 'trash', icon: Trash2, label: 'Trash' },
                    ...(isAdmin ? [{ id: 'settings', icon: SettingsIcon, label: 'Settings' }] : [])
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex items-center gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-all border-b-2 ${activeTab === tab.id
                            ? 'text-[#f9f9f9] border-[var(--ray-blue)]'
                            : 'text-[#6a6b6c] border-transparent hover:text-[#f9f9f9]'
                            }`}
                    >
                        <tab.icon size={13} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <Loader2 className="text-[var(--ray-blue)] animate-spin" size={32} />
                        <p className="text-[#6a6b6c] text-[11px] font-bold uppercase tracking-[0.2em]">Synchronizing Vault...</p>
                    </div>
                ) : error ? (
                    <div className="ray-card p-20 flex flex-col items-center justify-center text-center gap-8">
                        <div className="p-4 rounded-xl bg-[#FF6363]/5 text-[#FF6363] border border-[#FF6363]/10 shadow-inner">
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <h3 className="text-[#f9f9f9] font-medium text-lg">Vault Connection Error</h3>
                            <p className="text-[#6a6b6c] text-[13px] mt-2 max-w-sm font-medium leading-relaxed">{error}</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="pill-button pill-button-primary px-8 py-2.5 text-[10px]"
                        >
                            Retry Handshake
                        </button>
                    </div>
                ) : activeTab === 'variables' ? (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                            <div className="relative w-full sm:max-w-xs group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a6b6c] group-focus-within:text-[var(--ray-blue)] transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search encrypted keys..."
                                    className="w-full bg-[#101111] border border-white/5 rounded-lg pl-11 pr-4 py-2.5 text-[13px] text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-blue)]/30 transition-all placeholder:text-[#6a6b6c]/40 font-medium"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-[9px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] bg-[#101111] px-4 py-2 rounded-lg border border-white/5 shadow-inner">
                                {filteredEnvs.length} Records found
                            </div>
                        </div>

                        {filteredEnvs.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {filteredEnvs.map(e => (
                                    <EnvItem
                                        key={e.id}
                                        id={e.id}
                                        keyName={e.key}
                                        value={e.value}
                                        error={e.error}
                                        onDelete={handleDelete}
                                        onUpdate={handleUpdate}
                                        disabled={isViewer}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="ray-card p-32 text-center flex flex-col items-center gap-6">
                                <div className="p-4 rounded-xl bg-[#1b1c1e] text-[#6a6b6c] border border-white/5 shadow-inner">
                                    <Database size={32} />
                                </div>
                                <p className="text-[#6a6b6c] text-[13px] font-medium max-w-xs mx-auto leading-relaxed">
                                    {searchTerm ? `No records matching "${searchTerm}"` : "This cryptographic vault is currently empty."}
                                </p>
                            </div>
                        )}
                    </>
                ) : activeTab === 'activity' ? (
                    <AuditTimeline projectId={projectId} />
                ) : activeTab === 'connect' ? (
                    <ConnectPanel projectId={projectId} />
                ) : activeTab === 'access' ? (
                    <div className="space-y-12">
                        <ExportPanel projectId={projectId} />
                        {!isViewer && <TokenManager projectId={projectId} />}
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="max-w-xl mx-auto py-8">
                        <div className="mb-12">
                            <h3 className="text-xl font-medium text-[#f9f9f9] mb-2 tracking-tight">Vault Configuration</h3>
                            <p className="text-[#6a6b6c] text-[13px] font-medium">Manage deployment target and organizational access.</p>
                        </div>

                        <form onSubmit={handleUpdateSettings} className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Project Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#101111] border border-white/5 rounded-lg px-4 py-3 text-[13px] text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium"
                                    value={projectSettings.name}
                                    onChange={e => setProjectSettings(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Environment Tier</label>
                                <select
                                    className="w-full bg-[#101111] border border-white/5 rounded-lg px-4 py-3 text-[13px] text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium appearance-none cursor-pointer"
                                    value={projectSettings.environment}
                                    onChange={e => setProjectSettings(prev => ({ ...prev, environment: e.target.value }))}
                                >
                                    <option value="development">Development</option>
                                    <option value="staging">Staging</option>
                                    <option value="production">Production</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Team Ownership</label>
                                <div className="bg-[#101111] border border-white/5 rounded-lg flex items-center group focus-within:border-[var(--ray-blue)]/50 transition-all">
                                    <div className="pl-4 text-[#6a6b6c] group-focus-within:text-[var(--ray-blue)] transition-colors">
                                        <Users size={16} />
                                    </div>
                                    <select
                                        className="bg-transparent text-[#f9f9f9] text-[13px] font-medium focus:outline-none w-full px-4 py-3 appearance-none cursor-pointer"
                                        value={projectSettings.team_id || ''}
                                        onChange={e => setProjectSettings(prev => ({ ...prev, team_id: e.target.value || null }))}
                                    >
                                        <option value="">Personal Vault (No Team)</option>
                                        {availableTeams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} (@{t.slug})</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-[10px] text-[#6a6b6c] mt-3 font-medium italic px-1 opacity-70">Transferring to a team will migrate all cryptographic nodes to the organizational keychain.</p>
                            </div>

                            <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="pill-button pill-button-primary flex-1 py-3 text-[10px]"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="mr-2" />}
                                    Save Configuration
                                </button>

                                {isOwner && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('Are you SURE you want to destroy this vault? This action is irreversible.')) {
                                                handleDeleteProject();
                                            }
                                        }}
                                        className="pill-button px-8 py-3 text-[10px] text-[#FF6363] border-[#FF6363]/20 bg-[#FF6363]/5 hover:bg-[#FF6363]/10"
                                    >
                                        Destroy Vault
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h3 className="text-xl font-medium text-[#f9f9f9] mb-2 tracking-tight">Soft-Deleted Variables</h3>
                            <p className="text-[13px] text-[#6a6b6c] font-medium leading-tight">Variables kept in trash can be restored or purged permanently.</p>
                        </div>
                        {trashEnvs.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {trashEnvs.map(e => (
                                    <TrashItem
                                        key={e.id}
                                        id={e.id}
                                        keyName={e.key}
                                        deletedAt={e.deleted_at}
                                        onRestore={handleRestore}
                                        onHardDelete={handleConfirmHardDelete}
                                        disabled={isViewer}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="ray-card p-32 text-center flex flex-col items-center gap-6">
                                <div className="p-4 rounded-xl bg-[#1b1c1e] text-[#6a6b6c] border border-white/5 shadow-inner">
                                    <Trash2 size={32} />
                                </div>
                                <p className="text-[#6a6b6c] text-[13px] font-medium">Your cryptographic trash is currently empty.</p>
                            </div>
                        )}
                    </>
                )
                }
            </div>

            {/* Single Add Modal */}
            <Modal isOpen={singleOpen} onClose={() => setSingleOpen(false)}>
                <div className="mb-12 text-center px-4">
                    <div className="w-12 h-12 bg-[#1b1c1e] rounded-xl flex items-center justify-center text-[var(--ray-blue)] mx-auto mb-6 border border-white/5 shadow-inner">
                        <Database size={22} />
                    </div>
                    <h2 className="text-2xl font-medium text-[#f9f9f9] tracking-tight">Add Secret</h2>
                    <p className="text-[#6a6b6c] text-[13px] mt-2 font-medium leading-tight">Data is encrypted locally before transmission.</p>
                </div>
                <form onSubmit={handleAddSingle} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Key Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. STRIPE_SECRET_KEY"
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[13px] text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-mono placeholder:text-[#6a6b6c]/40 uppercase"
                            value={newEnv.key}
                            onChange={e => setNewEnv(prev => ({ ...prev, key: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Secret Value</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••••••••••"
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[13px] text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-mono placeholder:text-[#6a6b6c]/40"
                            value={newEnv.value}
                            onChange={e => setNewEnv(prev => ({ ...prev, value: e.target.value }))}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="pill-button pill-button-primary w-full py-3.5 text-[10px] mt-4"
                    >
                        {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                        {submitting ? 'Encrypting...' : 'Seal & Store'}
                    </button>
                </form>
            </Modal>

            {/* Bulk Add Modal */}
            <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)}>
                <div className="mb-10 text-center px-4">
                    <div className="w-12 h-12 bg-[#1b1c1e] rounded-xl flex items-center justify-center text-[var(--ray-blue)] mx-auto mb-6 border border-white/5 shadow-inner">
                        <FileText size={22} />
                    </div>
                    <h2 className="text-2xl font-medium text-[#f9f9f9] tracking-tight">Bulk Import</h2>
                    <p className="text-[#6a6b6c] text-[13px] mt-2 font-medium leading-tight">Paste your .env raw text below. We will parse and seal each node.</p>
                </div>
                <form onSubmit={handleAddBulk} className="space-y-6">
                    <div className="relative">
                        <textarea
                            rows={10}
                            required
                            placeholder="STRIPE_SECRET=sk_live_...&#10;AWS_REGION=us-east-1"
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[12px] text-[#f9f9f9] focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-mono placeholder:text-[#6a6b6c]/40 leading-relaxed resize-none no-scrollbar"
                            value={envFile}
                            onChange={e => setEnvFile(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="pill-button pill-button-primary w-full py-4 text-[10px] mt-4"
                    >
                        {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Rocket size={16} className="mr-2" />}
                        {submitting ? 'Sealing Records...' : 'Import Batch'}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmEnvOpen}
                title="Move to Trash?"
                message="This will deactivate the secret and move it to the trash vault. You can restore it later if needed."
                confirmLabel="Move to Trash"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={confirmDeleteEnv}
                onCancel={() => { setConfirmEnvOpen(false); setPendingDeleteEnvId(null); }}
            />

            <ConfirmDialog
                isOpen={confirmHardDeleteOpen}
                title="Wipe Forever?"
                message="This will completely purge this record and its entire audit lineage. This action is irreversible."
                confirmLabel="Purge Forever"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={executeHardDelete}
                onCancel={() => { setConfirmHardDeleteOpen(false); setPendingHardDeleteId(null); }}
            />
        </div>
    );
}