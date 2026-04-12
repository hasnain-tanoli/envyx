'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { 
    User as UserIcon, 
    Mail, 
    Calendar, 
    Save, 
    Loader2, 
    Shield, 
    ArrowLeft,
    Camera,
    Plus,
    Activity,
    Lock,
    Key,
    Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState<{
        id: string;
        name: string;
        email: string;
        image: string | null;
        createdAt: string;
    } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUserProfile();
            setProfile(data);
            setFormData({
                name: data.name,
                image: data.image || ''
            });
        } catch {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateUserProfile({
                name: formData.name,
                image: formData.image || undefined
            });
            showToast('Profile updated', 'success');
            fetchProfile();
        } catch {
            showToast('Update failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="text-[var(--ray-blue)] animate-spin" size={32} />
                <p className="text-[#6a6b6c] text-[11px] font-bold uppercase tracking-[0.2em]">Synchronizing Identity Vault...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[var(--ray-blue)] mb-3">
                        <Lock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Identity Management</span>
                    </div>
                    <h1 className="text-3xl font-medium text-[#f9f9f9] tracking-tight">Security & Profile</h1>
                    <p className="text-[#6a6b6c] text-[13px] font-medium mt-2 leading-tight">Manage your cryptographic identity and account preferences.</p>
                </div>
                
                <Link href="/projects" className="pill-button px-6 py-2.5 text-xs text-[#6a6b6c] hover:text-[#f9f9f9]">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Identity Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="ray-card p-8 flex flex-col items-center text-center">
                        <div className="relative group mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-[#07080a] border border-white/5 flex items-center justify-center text-[var(--ray-blue)] shadow-inner overflow-hidden group-hover:border-[var(--ray-blue)]/50 transition-all duration-500">
                                {formData.image ? (
                                    <Image 
                                        src={formData.image} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                        width={96}
                                        height={96}
                                        unoptimized
                                    />
                                ) : (
                                    <UserIcon size={40} className="opacity-40 group-hover:scale-110 transition-transform duration-500" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-[#1b1c1e] border border-white/5 rounded-lg text-[#6a6b6c] hover:text-[#f9f9f9] cursor-pointer transition-colors shadow-xl">
                                <Camera size={14} />
                            </div>
                        </div>
                        
                        <h2 className="text-lg font-medium text-[#f9f9f9] tracking-tight">{profile?.name}</h2>
                        <p className="text-[11px] text-[#6a6b6c] font-medium uppercase tracking-wider mt-1">{profile?.email}</p>
                        
                        <div className="mt-10 pt-8 border-t border-white/5 w-full space-y-4 text-left">
                            <div className="flex items-center justify-between text-[11px] font-medium">
                                <div className="flex items-center gap-2 text-[#6a6b6c]">
                                    <Calendar size={12} />
                                    <span>Identity Created</span>
                                </div>
                                <span className="text-[#f9f9f9] opacity-60">
                                    {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'Recently'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-medium">
                                <div className="flex items-center gap-2 text-[#6a6b6c]">
                                    <Shield size={12} className="text-[var(--ray-green)] opacity-70" />
                                    <span>Validation Status</span>
                                </div>
                                <span className="text-[var(--ray-green)] font-bold uppercase tracking-tighter text-[9px]">Verified</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-medium">
                                <div className="flex items-center gap-2 text-[#6a6b6c]">
                                    <Fingerprint size={12} />
                                    <span>MFA Integration</span>
                                </div>
                                <span className="text-[#6a6b6c] opacity-60 italic text-[9px]">Provisioned</span>
                            </div>
                        </div>
                    </div>

                    <div className="ray-card p-4 flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] px-2 mb-2">Quick Actions</h4>
                        <button className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-[11px] font-medium text-[#f9f9f9] transition-all group">
                            <div className="flex items-center gap-3">
                                <Activity size={14} className="text-[#6a6b6c]" />
                                <span>Export Identity</span>
                            </div>
                            <Plus size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                        </button>
                        <button className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-[11px] font-medium text-[#f9f9f9] transition-all group">
                            <div className="flex items-center gap-3">
                                <Key size={14} className="text-[#6a6b6c]" />
                                <span>Rotate Recovery Key</span>
                            </div>
                            <Plus size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                        </button>
                    </div>
                </div>

                {/* Right: Detailed Configuration */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="ray-card p-8">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div>
                                <h3 className="text-xs font-bold text-[#6a6b6c] uppercase tracking-[0.2em] mb-8 border-b border-white/5 pb-4">Personal Configuration</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Display Identity</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a6b6c]" size={16} />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-[#07080a] border border-white/5 rounded-lg pl-12 pr-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium"
                                                value={formData.name}
                                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Primary Email</label>
                                        <div className="relative opacity-60">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a6b6c]" size={16} />
                                            <input
                                                type="email"
                                                disabled
                                                className="w-full bg-[#07080a] border border-white/5 rounded-lg pl-12 pr-4 py-3 text-[#f9f9f9] text-sm cursor-not-allowed font-medium"
                                                value={profile?.email || ''}
                                            />
                                        </div>
                                        <p className="text-[9px] text-[#6a6b6c] ml-1 flex items-center gap-1 font-medium italic opacity-70">
                                            <Shield size={10} /> Immutable via Identity Provider.
                                        </p>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Avatar Resource Locator</label>
                                        <input
                                            type="url"
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full bg-[#07080a] border border-white/5 rounded-lg px-4 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/30"
                                            value={formData.image}
                                            onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex gap-4 items-center">
                                    <div className="p-2 bg-[var(--ray-blue)]/10 rounded-lg text-[var(--ray-blue)]">
                                        <Shield size={16} />
                                    </div>
                                    <p className="text-[11px] text-[#6a6b6c] font-medium leading-tight max-w-[240px]">
                                        Your identity information is used for audit logs and team collaboration signatures.
                                    </p>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="pill-button pill-button-primary w-full md:w-auto px-10 py-3.5 text-xs"
                                >
                                    {submitting ? (
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                    ) : (
                                        <Save size={16} className="mr-2" />
                                    )}
                                    {submitting ? 'Updating Vault...' : 'Commit Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="ray-card p-6 flex items-start gap-4 hover:bg-[#151616] transition-colors cursor-pointer group">
                            <div className="p-3 bg-[#1b1c1e] rounded-xl border border-white/5 text-[#6a6b6c] group-hover:text-[var(--ray-blue)] transition-colors">
                                <Fingerprint size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-[#f9f9f9] mb-1">Passkeys & Security</h4>
                                <p className="text-[11px] text-[#6a6b6c] font-medium leading-snug">Manage biometric access keys and cryptographic hardware tokens.</p>
                            </div>
                        </div>
                        <div className="ray-card p-6 flex items-start gap-4 hover:bg-[#151616] transition-colors cursor-pointer group">
                            <div className="p-3 bg-[#1b1c1e] rounded-xl border border-white/5 text-[#6a6b6c] group-hover:text-[var(--ray-yellow)] transition-colors">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-[#f9f9f9] mb-1">Audit Stream</h4>
                                <p className="text-[11px] text-[#6a6b6c] font-medium leading-snug">Review your chronological history of vault interactions and logins.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
