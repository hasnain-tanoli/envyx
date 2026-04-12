'use client';
import { useEffect, useState, useCallback } from 'react';
import ProjectCard from '@/components/ProjectCard';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';
import { Project } from '@/types';
import { Plus, Rocket, LayoutGrid, Loader2, ShieldCheck, Globe, Code } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function Page() {
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', environment: 'development' });
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            showToast('Failed to sync projects', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newProject.name) return;
        
        setSubmitting(true);
        try {
            if (editingProject) {
                await updateProject(editingProject, newProject.name, newProject.description, newProject.environment);
                showToast('Project updated', 'success');
            } else {
                await createProject(newProject.name, newProject.description, newProject.environment);
                showToast('Project created', 'success');
            }
            setModalOpen(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            console.error('Failed to save project:', error);
            showToast('Save failed', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    function handleDeleteProject(id: string) {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    }

    async function confirmDeleteProject() {
        if (!pendingDeleteId) return;
        setConfirmOpen(false);
        try {
            await deleteProject(pendingDeleteId);
            showToast('Project deleted', 'success');
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
            showToast('Delete failed', 'error');
        } finally {
            setPendingDeleteId(null);
        }
    }

    function handleEditMode(id: string, name: string, description: string, environment: string) {
        setEditingProject(id);
        setNewProject({ name, description, environment: environment || 'development' });
        setModalOpen(true);
    }

    function resetForm() {
        setEditingProject(null);
        setNewProject({ name: '', description: '', environment: 'development' });
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-medium tracking-tight text-[#f9f9f9] mb-1.5">Projects</h1>
                    <p className="text-[#6a6b6c] text-[13px] font-medium leading-tight">Manage your encrypted environment repositories.</p>
                </div>
                
                <button 
                    onClick={() => {
                        resetForm();
                        setModalOpen(true);
                    }}
                    className="pill-button pill-button-primary px-6 py-2.5 text-xs"
                >
                    <Plus size={16} className="mr-2" />
                    New Project
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="text-[var(--ray-blue)] animate-spin" size={32} />
                    <p className="text-[#6a6b6c] text-[11px] font-bold uppercase tracking-[0.2em]">Synchronizing Vaults...</p>
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <ProjectCard 
                            key={p.id} 
                            {...p} 
                            onEdit={handleEditMode}
                            onDelete={handleDeleteProject}
                        />
                    ))}
                </div>
            ) : (
                <div className="ray-card p-20 text-center flex flex-col items-center gap-8 bg-[#101111] border-dashed border-white/5">
                    <div className="p-4 rounded-xl bg-[#1b1c1e] text-[#6a6b6c] border border-white/5 shadow-inner">
                        <Rocket size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium text-[#f9f9f9] mb-2">No projects found</h2>
                        <p className="text-[#6a6b6c] text-[13px] font-medium max-w-sm mx-auto leading-relaxed">
                            Create your first project to start storing and managing your environment variables with zero-knowledge encryption.
                        </p>
                    </div>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="text-[var(--ray-blue)] text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                    >
                        Create First Project &rarr;
                    </button>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="mb-10 text-center px-4">
                    <div className="w-12 h-12 bg-[#1b1c1e] rounded-xl flex items-center justify-center text-[var(--ray-blue)] mx-auto mb-6 border border-white/5 shadow-inner">
                        <LayoutGrid size={22} />
                    </div>
                    <h2 className="text-2xl font-medium text-[#f9f9f9] tracking-tight">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                    <p className="text-[#6a6b6c] text-[13px] mt-2 font-medium leading-tight">{editingProject ? 'Modify project settings and access.' : 'Initialize a new secure variable vault.'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Project Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. production-api"
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40"
                            value={newProject.name}
                            onChange={e => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Environment Tier</label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { id: 'production', label: 'Production', icon: ShieldCheck, color: 'text-[#FF6363]', active: 'border-[#FF6363]/40 bg-[#FF6363]/5 text-[#FF6363]' },
                                { id: 'staging', label: 'Staging', icon: Globe, color: 'text-[var(--ray-yellow)]', active: 'border-[var(--ray-yellow)]/40 bg-[var(--ray-yellow)]/5 text-[var(--ray-yellow)]' },
                                { id: 'development', label: 'Development', icon: Code,  color: 'text-[var(--ray-blue)]', active: 'border-[var(--ray-blue)]/40 bg-[var(--ray-blue)]/5 text-[var(--ray-blue)]' }
                            ].map(tier => (
                                <button
                                    key={tier.id}
                                    type="button"
                                    onClick={() => setNewProject(prev => ({ ...prev, environment: tier.id }))}
                                    className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all ${
                                        newProject.environment === tier.id 
                                        ? tier.active 
                                        : 'bg-[#07080a] border-white/5 text-[#6a6b6c] hover:bg-white/5'
                                    }`}
                                >
                                    <tier.icon size={18} className={newProject.environment === tier.id ? tier.color : 'text-[#6a6b6c]'} />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{tier.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Description (Optional)</label>
                        <textarea 
                            rows={3}
                            placeholder="Project scope and details..."
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40 resize-none"
                            value={newProject.description}
                            onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="pill-button pill-button-primary w-full py-3.5 text-xs mt-4"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={16} /> : (editingProject ? 'Update Project' : 'Create Vault')}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                title="Delete Project?"
                message="This will permanently delete the project and all its encrypted variables. This action cannot be undone."
                confirmLabel="Yes, Delete"
                cancelLabel="Keep It"
                variant="danger"
                onConfirm={confirmDeleteProject}
                onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
            />
        </div>
    );
}