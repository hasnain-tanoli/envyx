'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getTeams, createTeam } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import { 
    Users, 
    Plus, 
    Shield, 
    ChevronRight, 
    Loader2, 
    Building2,
    Settings,
    UserCircle2
} from 'lucide-react';

interface Team {
    id: string;
    name: string;
    slug: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
}

export default function TeamsPage() {
    const { showToast } = useToast();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', slug: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getTeams();
            setTeams(data);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            showToast('Failed to load teams', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createTeam(newTeam.name, newTeam.slug.toLowerCase());
            showToast('Team created successfully', 'success');
            setCreateModalOpen(false);
            setNewTeam({ name: '', slug: '' });
            fetchTeams();
        } catch (error: any) {
            showToast(error.message || 'Failed to create team', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: any = {
            owner: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
            admin: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
            member: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
            viewer: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${colors[role] || colors.member}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-indigo-400" size={32} />
                        Teams
                    </h1>
                    <p className="text-gray-400 mt-2">Collaborate with your team on shared projects</p>
                </div>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Team
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="animate-spin text-indigo-500" size={40} />
                    <p className="text-gray-500 animate-pulse">Accessing organization vault...</p>
                </div>
            ) : teams.length === 0 ? (
                <div className="glass p-12 text-center rounded-2xl flex flex-col items-center border-dashed border-2 border-white/5">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                        <Building2 className="text-gray-500" size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No teams found</h3>
                    <p className="text-gray-400 max-w-sm mb-8 italic">
                        Create a team to share secrets across your organization securely.
                    </p>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl transition-all border border-white/10 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Get Started
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="group relative glass p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all hover:bg-white/5 shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Shield className="text-indigo-400" size={24} />
                                </div>
                                {getRoleBadge(team.role)}
                            </div>
                            
                            <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                {team.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-mono mt-1">@{team.slug}</p>

                            <div className="mt-8 flex items-center justify-between text-gray-400 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users size={14} />
                                    <span>Manage Members</span>
                                </div>
                                <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Create New Team"
            >
                <form onSubmit={handleCreateTeam} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                        <input
                            required
                            type="text"
                            value={newTeam.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setNewTeam({ 
                                    name, 
                                    slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-') 
                                });
                            }}
                            placeholder="e.g. Engineering, Acme Corp"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2 underline underline-offset-4 decoration-indigo-500/30">Team Slug</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">envyx.com/teams/</span>
                            <input
                                required
                                type="text"
                                value={newTeam.slug}
                                onChange={(e) => setNewTeam({ ...newTeam, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-32 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 px-1 italic">Unique identifier for your team URL.</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating...
                                </>
                            ) : 'Initialize Team'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
