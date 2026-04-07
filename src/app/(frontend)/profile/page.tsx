'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    Camera
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ProfilePage() {
    const router = useRouter();
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
        } catch (error) {
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
            showToast('Profile updated successfully', 'success');
            // Force refresh or update local state
            fetchProfile();
        } catch (error) {
            showToast('Failed to update profile', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="text-indigo-500 animate-spin" size={40} />
                <p className="text-gray-500 font-medium tracking-tight">Accessing Identity Vault...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <Link href="/projects" className="flex items-center gap-2 text-gray-500 hover:text-indigo-400 transition-colors w-fit font-medium mb-8">
                <ArrowLeft size={18} />
                Back to Dashboard
            </Link>

            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-500 mb-2">
                            <Shield size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Account Security</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Your Profile</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage your identity and account preferences.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Avatar & Quick Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass rounded-[2rem] p-8 flex flex-col items-center text-center border-white/5">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-indigo-500/10 flex items-center justify-center border-2 border-indigo-500/30 overflow-hidden shadow-2xl shadow-indigo-500/20 group-hover:border-indigo-400 transition-all duration-500">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={48} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                                    )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mt-6">{profile?.name}</h2>
                            <p className="text-sm text-gray-500">{profile?.email}</p>
                            
                            <div className="mt-8 pt-8 border-t border-white/5 w-full space-y-4">
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <Calendar size={16} className="text-indigo-500/60" />
                                    <span>Joined {profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <Shield size={16} className="text-green-500/60" />
                                    <span>Two-Factor Auth Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Management Form */}
                    <div className="lg:col-span-2">
                        <div className="glass rounded-[2rem] p-8 border-white/5">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        Personal Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full glass bg-white/5 border-white/10 rounded-2xl pl-11 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                                    value={formData.name}
                                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500/50" size={18} />
                                                <input
                                                    type="email"
                                                    disabled
                                                    className="w-full glass bg-white/5 border-white/10 rounded-2xl pl-11 pr-5 py-4 text-gray-500 cursor-not-allowed font-medium opacity-60"
                                                    value={profile?.email || ''}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-600 ml-1 italic">Email cannot be changed directly for security reasons.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Avatar Image URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            className="w-full glass bg-white/5 border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                            value={formData.image}
                                            onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <p className="text-xs text-gray-500 max-w-xs">
                                        Changes to your display name will be reflected across all shared projects.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {submitting ? 'Updating Vault...' : 'Save Profile Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Additional Sections Placeholder */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass p-6 rounded-3xl border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                                <h4 className="text-white font-bold mb-1">Passkeys & Security</h4>
                                <p className="text-xs text-gray-500">Add hardware keys for biometric login.</p>
                            </div>
                            <div className="glass p-6 rounded-3xl border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                                <h4 className="text-white font-bold mb-1">Audit Logs</h4>
                                <p className="text-xs text-gray-500">Review your recent account activity.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
