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
    Building2
} from 'lucide-react';

import { Team } from '@/types';

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
            showToast('Team created', 'success');
            setCreateModalOpen(false);
            setNewTeam({ name: '', slug: '' });
            fetchTeams();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Creation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            owner: 'text-[var(--ray-yellow)] border-[var(--ray-yellow)]/20 bg-[var(--ray-yellow)]/5',
            admin: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
            member: 'text-[var(--ray-blue)] border-[var(--ray-blue)]/20 bg-[var(--ray-blue)]/5',
            viewer: 'text-[#6a6b6c] border-white/5 bg-[#1b1c1e]',
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.1em] border ${colors[role] || colors.member}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[var(--ray-blue)] mb-3">
                        <Users size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Organization Control</span>
                    </div>
                    <h1 className="text-3xl font-medium text-[#f9f9f9] tracking-tight">Teams</h1>
                    <p className="text-[#6a6b6c] text-[13px] font-medium mt-2 leading-tight">Collaborate securely across shared cryptographic vaults.</p>
                </div>
                
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="pill-button pill-button-primary px-6 py-2.5 text-xs"
                >
                    <Plus size={16} className="mr-2" />
                    New Team
                </button>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <Loader2 className="text-[var(--ray-blue)] animate-spin" size={32} />
                    <p className="text-[#6a6b6c] text-[11px] font-bold uppercase tracking-[0.2em]">Synchronizing Organizations...</p>
                </div>
            ) : teams.length === 0 ? (
                <div className="ray-card p-24 text-center flex flex-col items-center gap-8 border-dashed border-white/5">
                    <div className="p-4 rounded-xl bg-[#1b1c1e] text-[#6a6b6c] border border-white/5 shadow-inner">
                        <Building2 size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-[#f9f9f9] mb-2">No teams found</h3>
                        <p className="text-[#6a6b6c] text-[13px] font-medium max-w-sm mx-auto leading-relaxed">
                            Create an organization to start sharing and managing projects with team members securely.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="text-[var(--ray-blue)] text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                    >
                        Initialize First Team &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="ray-card p-6 group transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-[#1b1c1e] border border-white/5 flex items-center justify-center text-[var(--ray-blue)] shadow-inner">
                                    <Shield size={22} />
                                </div>
                                {getRoleBadge(team.role || 'member')}
                            </div>
                            
                            <h3 className="text-lg font-medium text-[#f9f9f9] group-hover:text-[var(--ray-blue)] transition-colors tracking-tight">
                                {team.name}
                            </h3>
                            <p className="text-[11px] text-[#6a6b6c] font-medium mt-1 uppercase tracking-wider">@{team.slug}</p>

                            <div className="mt-8 flex items-center justify-between text-[#6a6b6c] text-[10px] font-bold uppercase tracking-widest pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <Users size={12} />
                                    <span>Manage Members</span>
                                </div>
                                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            >
                <div className="mb-12 text-center px-4">
                    <div className="w-12 h-12 bg-[#1b1c1e] rounded-xl flex items-center justify-center text-[var(--ray-blue)] mx-auto mb-6 border border-white/5 shadow-inner">
                        <Building2 size={22} />
                    </div>
                    <h2 className="text-2xl font-medium text-[#f9f9f9] tracking-tight">Create Team</h2>
                    <p className="text-[#6a6b6c] text-[13px] mt-2 font-medium leading-tight">Initialize a new secure organization keychain.</p>
                </div>

                <form onSubmit={handleCreateTeam} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Team Name</label>
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
                            placeholder="e.g. Engineering Team"
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Unique Slug</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={newTeam.slug}
                                onChange={(e) => setNewTeam({ ...newTeam, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                                className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40"
                            />
                        </div>
                        <p className="text-[10px] text-[#6a6b6c] mt-2 px-1 font-medium italic opacity-70">A global identifier for your team vault.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="pill-button pill-button-primary w-full py-3.5 text-xs"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
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
