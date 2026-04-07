'use client';
import { useEffect, useState, useCallback } from 'react';
import ProjectCard from '@/components/ProjectCard';
import Modal from '@/components/Modal';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';
import { Project } from '@/types';
import { Plus, Rocket, LayoutGrid, Loader2 } from 'lucide-react';

export default function Page() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProjects();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!newProject.name) return;
        
        setSubmitting(true);
        try {
            if (editingProject) {
                await updateProject(editingProject, newProject.name, newProject.description);
            } else {
                await createProject(newProject.name, newProject.description);
            }
            setModalOpen(false);
            resetForm();
            fetchProjects();
        } catch (error) {
            console.error('Failed to save project:', error);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteProject(id: string) {
        if (!confirm('Are you sure? This will delete the project and all its variables.')) return;
        try {
            await deleteProject(id);
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    }

    function handleEditMode(id: string, name: string, description: string) {
        setEditingProject(id);
        setNewProject({ name, description });
        setModalOpen(true);
    }

    function resetForm() {
        setEditingProject(null);
        setNewProject({ name: '', description: '' });
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 animate-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Projects Dashboard</h1>
                    <p className="text-gray-400 font-medium">Manage your encrypted environment variables securely.</p>
                </div>
                
                <button 
                    onClick={() => {
                        resetForm();
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                    <Plus size={20} />
                    Create New Project
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="text-indigo-500 animate-spin" size={40} />
                    <p className="text-gray-500 font-medium">Loading your projects...</p>
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
                <div className="glass rounded-[2.5rem] p-12 text-center flex flex-col items-center gap-6 border-dashed">
                    <div className="p-6 rounded-3xl bg-indigo-500/10 text-indigo-400">
                        <Rocket size={48} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white mb-2">No projects yet</h2>
                        <p className="text-gray-400 max-w-sm mx-auto">
                            Start by creating your first project to store and manage your environment variables securely.
                        </p>
                    </div>
                    <button 
                        onClick={() => setModalOpen(true)}
                        className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                    >
                        Click here to get started &rarr;
                    </button>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4">
                        <LayoutGrid size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                    <p className="text-gray-400 text-sm mt-1">{editingProject ? 'Update your secure vault settings.' : 'Set up a secure vault for your envs.'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Project Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. My Awesome App"
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-600"
                            value={newProject.name}
                            onChange={e => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Description (Optional)</label>
                        <textarea 
                            rows={3}
                            placeholder="What is this project about?"
                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-600 resize-none"
                            value={newProject.description}
                            onChange={e => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 mt-4"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : (editingProject ? 'Save Changes' : 'Create Project Vault')}
                    </button>
                </form>
            </Modal>
        </div>
    );
}