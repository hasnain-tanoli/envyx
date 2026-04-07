'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTeamMembers, inviteMember, updateMemberRole, removeMember, getTeams } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { 
    Users, 
    UserPlus, 
    Shield, 
    ShieldCheck, 
    ShieldAlert,
    Trash2, 
    Loader2, 
    ArrowLeft,
    Mail,
    Check,
    Folder
} from 'lucide-react';
import Link from 'next/link';
import { getTeamProjects } from '@/lib/api';

type Tab = 'members' | 'projects';

interface Member {
    user_id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    joined_at: string;
}

interface Team {
    id: string;
    name: string;
    slug: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
}

export default function TeamDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.id as string;
    const { showToast } = useToast();
    
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
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
        } catch (error: any) {
            showToast(error.message || 'Failed to invite member', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        try {
            await updateMemberRole(teamId, memberId, newRole);
            showToast('Role updated', 'success');
            fetchData();
        } catch (error: any) {
            showToast(error.message || 'Failed to update role', 'error');
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
        } catch (error: any) {
            showToast(error.message || 'Failed to remove member', 'error');
        }
    };

    const isAdmin = team?.role === 'owner' || team?.role === 'admin';

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <ShieldAlert className="text-amber-400" size={16} />;
            case 'admin': return <ShieldCheck className="text-purple-400" size={16} />;
            case 'member': return <Shield className="text-indigo-400" size={16} />;
            default: return <Users className="text-emerald-400" size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-gray-500">Decrypting member directory...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <Link href="/teams" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Teams
            </Link>

            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        {team?.name}
                        <span className="text-sm font-mono text-gray-500 font-normal">@{team?.slug}</span>
                    </h1>
                    <p className="text-gray-400 mt-2 italic px-1">Organization Vault ID: {teamId.slice(0, 8)}...</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Add Member
                    </button>
                )}
            </div>

            <div className="flex items-center gap-8 mb-8 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'members' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Members
                    {activeTab === 'members' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'projects' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Projects
                    {activeTab === 'projects' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                </button>
            </div>

            {activeTab === 'members' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined At</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => (
                                <tr key={member.user_id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <Users size={20} className="text-indigo-400/70" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{member.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            {isAdmin && member.role !== 'owner' ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="member">Member</option>
                                                    <option value="viewer">Viewer</option>
                                                </select>
                                            ) : (
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest text-gray-400">
                                                    {getRoleIcon(member.role)}
                                                    {member.role}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-500">
                                        {new Date(member.joined_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {isAdmin && member.role !== 'owner' && (
                                            <button
                                                onClick={() => {
                                                    setPendingRemove(member);
                                                    setRemoveConfirmOpen(true);
                                                }}
                                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Remove Member"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length > 0 ? (
                        projects.map(p => (
                            <Link 
                                key={p.id} 
                                href={`/projects/${p.id}`}
                                className="group glass-item p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col gap-4 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                        <Folder size={24} className="text-indigo-400" />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400">
                                        {p.environment}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{p.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">{p.description || 'Secure encrypted vault'}</p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center glass rounded-2xl border border-white/5 flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-white/5 text-gray-500">
                                <Folder size={32} />
                            </div>
                            <p className="text-gray-400 font-medium">No projects shared with this team yet.</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                title="Add Team Member"
            >
                <form onSubmit={handleInvite} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">User Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                required
                                type="email"
                                value={newInvite.email}
                                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                                placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Initial Role</label>
                        <select
                            value={newInvite.role}
                            onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        >
                            <option value="member">Member (Can edit)</option>
                            <option value="viewer">Viewer (Read-only masked)</option>
                            <option value="admin">Admin (Can manage members)</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setInviteModalOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            Invite Member
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={removeConfirmOpen}
                onCancel={() => setRemoveConfirmOpen(false)}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                message={`Are you sure you want to remove ${pendingRemove?.name} from the team? They will lose access to all shared projects.`}
                confirmLabel="Remove"
                variant="danger"
            />
        </div>
    );
}
