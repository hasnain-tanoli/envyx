'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTeamMembers, inviteMember, updateMemberRole, removeMember, getTeams, getTeamProjects } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { 
    ShieldCheck, 
    Trash2, 
    Loader2, 
    ArrowLeft,
    Mail,
    Check,
    Folder,
    ExternalLink,
    UserPlus,
    Users,
    Shield
} from 'lucide-react';
import Link from 'next/link';
import { Project, Team } from '@/types';

type Tab = 'members' | 'projects';

interface Member {
    user_id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
}


export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.id as string;
    const { showToast } = useToast();
    
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('members');
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [newInvite, setNewInvite] = useState({ email: '', role: 'member' });
    const [submitting, setSubmitting] = useState(false);
    
    const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
    const [pendingRemove, setPendingRemove] = useState<Member | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [allTeams, memberData, projectData] = await Promise.all([
                getTeams(),
                getTeamMembers(teamId),
                getTeamProjects(teamId)
            ]);
            
            const currentTeam = allTeams.find((t: Team) => t.id === teamId);
            if (!currentTeam) {
                router.push('/teams');
                return;
            }
            
            setTeam(currentTeam);
            setMembers(memberData);
            setProjects(projectData);
        } catch (error) {
            console.error('Failed to fetch team data:', error);
            showToast('Failed to load team data', 'error');
        } finally {
            setLoading(false);
        }
    }, [teamId, showToast, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await inviteMember(teamId, newInvite.email, newInvite.role);
            showToast(`Invited ${newInvite.email}`, 'success');
            setInviteModalOpen(false);
            setNewInvite({ email: '', role: 'member' });
            fetchData();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Invitation failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        try {
            await updateMemberRole(teamId, memberId, newRole);
            showToast('Role updated', 'success');
            fetchData();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Update failed', 'error');
        }
    };

    const handleRemoveMember = async () => {
        if (!pendingRemove) return;
        try {
            await removeMember(teamId, pendingRemove.user_id);
            showToast('Member removed', 'success');
            setRemoveConfirmOpen(false);
            setPendingRemove(null);
            fetchData();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Removal failed', 'error');
        }
    };

    const isAdmin = team?.role === 'owner' || team?.role === 'admin';

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="text-[var(--ray-blue)] animate-spin" size={32} />
                <p className="text-[#6a6b6c] text-[11px] font-bold uppercase tracking-[0.2em]">Synchronizing Vault Access...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <Link href="/teams" className="inline-flex items-center gap-2 text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors mb-8 group text-xs font-bold uppercase tracking-widest">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Organizations
            </Link>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[var(--ray-blue)] mb-3">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Validated Organization</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-medium text-[#f9f9f9] tracking-tight">{team?.name}</h1>
                        <span className="px-2 py-0.5 bg-[#1b1c1e] border border-white/5 rounded text-[10px] font-bold text-[#6a6b6c] uppercase tracking-wider">@{team?.slug}</span>
                    </div>
                    <p className="text-[#6a6b6c] text-[13px] font-medium mt-2 flex items-center gap-2 leading-tight">
                        Organization Fingerprint: <span className="font-mono text-[11px] opacity-70 italic">{teamId}</span>
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="pill-button pill-button-primary px-6 py-2.5 text-xs"
                    >
                        <UserPlus size={16} className="mr-2" />
                        Add Member
                    </button>
                )}
            </header>

            <div className="flex items-center gap-2 mb-8 bg-[#101111] p-1 rounded-lg border border-white/5 w-fit">
                {(['members', 'projects'] as Tab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md ${
                            activeTab === tab 
                            ? 'bg-[#1b1c1e] text-[#f9f9f9] border border-white/10 shadow-sm' 
                            : 'text-[#6a6b6c] hover:text-[#f9f9f9]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'members' ? (
                <div className="space-y-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    {members.map((member) => (
                        <div key={member.user_id} className="bg-[#101111] hover:bg-[#151616] p-4 flex items-center justify-between group group-hover:first:rounded-t-xl group-hover:last:rounded-b-xl transition-colors border-b border-white/[0.03] last:border-b-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#07080a] border border-white/5 flex items-center justify-center text-[#6a6b6c] shadow-inner group-hover:text-[var(--ray-blue)] transition-colors">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[#f9f9f9]">{member.name}</div>
                                    <div className="text-[11px] text-[#6a6b6c] font-medium flex items-center gap-2">
                                        {member.email}
                                        <span className="text-[8px] opacity-40 uppercase tracking-tighter cursor-default">|</span>
                                        Joined {new Date(member.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    {isAdmin && member.role !== 'owner' ? (
                                        <div className="relative group/role">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                                                className="bg-[#1b1c1e] border border-white/5 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6a6b6c] focus:outline-none focus:border-[var(--ray-blue)]/50 appearance-none hover:text-[#f9f9f9] transition-colors cursor-pointer pr-6"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="member">Member</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                            <Shield size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6a6b6c] pointer-events-none" />
                                        </div>
                                    ) : (
                                        getRoleBadge(member.role)
                                    )}
                                </div>

                                {isAdmin && member.role !== 'owner' && (
                                    <button
                                        onClick={() => {
                                            setPendingRemove(member);
                                            setRemoveConfirmOpen(true);
                                        }}
                                        className="p-2 text-[#6a6b6c] hover:text-[var(--ray-red)] hover:bg-[var(--ray-red)]/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length > 0 ? (
                        projects.map(p => (
                            <Link 
                                key={p.id} 
                                href={`/projects/${p.id}`}
                                className="ray-card p-6 group transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-[#1b1c1e] border border-white/5 flex items-center justify-center text-[var(--ray-blue)] shadow-inner">
                                        <Folder size={22} />
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.1em] border text-[var(--ray-blue)] border-[var(--ray-blue)]/20 bg-[var(--ray-blue)]/5">
                                        {p.environment}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-[#f9f9f9] group-hover:text-[var(--ray-blue)] transition-colors tracking-tight">{p.name}</h3>
                                    <p className="text-[12px] text-[#6a6b6c] font-medium mt-1 leading-tight line-clamp-1 opacity-70 italic">{p.description || 'Secure encrypted vault'}</p>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[#6a6b6c] text-[10px] font-bold uppercase tracking-widest">
                                    <span>Access Project</span>
                                    <ExternalLink size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center ray-card border-dashed border-white/5 flex flex-col items-center gap-6">
                            <div className="p-4 rounded-xl bg-[#1b1c1e] text-[#6a6b6c] border border-white/5 shadow-inner">
                                <Folder size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-[#f9f9f9] mb-2">No projects found</h3>
                                <p className="text-[#6a6b6c] text-[13px] font-medium max-w-xs mx-auto leading-relaxed">
                                    This organization doesn&apos;t have any shared projects yet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
            >
                <div className="mb-12 text-center px-4">
                    <div className="w-12 h-12 bg-[#1b1c1e] rounded-xl flex items-center justify-center text-[var(--ray-blue)] mx-auto mb-6 border border-white/5 shadow-inner">
                        <UserPlus size={22} />
                    </div>
                    <h2 className="text-2xl font-medium text-[#f9f9f9] tracking-tight">Add Member</h2>
                    <p className="text-[#6a6b6c] text-[13px] mt-2 font-medium leading-tight">Grant access to this organization&apos;s secure vaults.</p>
                </div>

                <form onSubmit={handleInvite} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a6b6c]" size={16} />
                            <input
                                required
                                type="email"
                                value={newInvite.email}
                                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                                placeholder="name@example.com"
                                className="w-full bg-[#07080a] border border-white/5 rounded-lg pl-12 pr-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Access Level</label>
                        <select
                            value={newInvite.role}
                            onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium appearance-none"
                        >
                            <option value="member">Member (Can edit)</option>
                            <option value="viewer">Viewer (Read-only)</option>
                            <option value="admin">Admin (Can manage organization)</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="pill-button pill-button-primary w-full py-3.5 text-xs"
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <Check size={16} className="mr-2" />
                                    Confirm Invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={removeConfirmOpen}
                onCancel={() => setRemoveConfirmOpen(false)}
                onConfirm={handleRemoveMember}
                title="Revoke Access"
                message={`Are you sure you want to remove ${pendingRemove?.name} from the organization? They will immediately lose access to all shared vault keys.`}
                confirmLabel="Remove Member"
                variant="danger"
            />
        </div>
    );
}
