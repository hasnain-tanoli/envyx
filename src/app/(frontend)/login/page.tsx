'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { 
    Mail, 
    Lock, 
    ArrowRight, 
    Loader2, 
    AlertCircle 
} from 'lucide-react';

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data, error } = await signIn.email({ email, password });
            if (error) {
                setError(error.message ?? 'Login failed. Please check your credentials.');
                return;
            }
            if (data) router.push('/projects');
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen relative isolate flex flex-col items-center justify-center p-6 bg-[#07080a]">
            {/* Minimal Grid Background */}
            <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.02]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#101111] mb-6 border border-white/5 shadow-inner overflow-hidden">
                        <Image 
                            src="/envyx-logo-dark.svg" 
                            alt="Envyx" 
                            width={36} 
                            height={36} 
                        />
                    </div>
                    <h1 className="text-3xl font-medium text-[#f9f9f9] tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-[#6a6b6c] text-sm font-medium">Authentication required to access vaults.</p>
                </div>

                {/* Login Card */}
                <div className="ray-card p-8 sm:p-10 bg-[#101111] border-white/5 shadow-2xl">
                    {error && (
                        <div className="mb-8 p-3 rounded-lg bg-[#FF6363]/10 border border-[#FF6363]/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="text-[#FF6363] shrink-0 mt-0.5" size={14} />
                            <p className="text-[#FF6363] text-[12px] font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em] ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a6b6c] group-focus-within:text-[var(--ray-blue)] transition-colors" size={16} />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-[#07080a] border border-white/5 rounded-lg pl-12 pr-5 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="block text-[10px] font-bold text-[#6a6b6c] uppercase tracking-[0.2em]">Password</label>
                                <Link href="#" className="text-[10px] font-bold text-[var(--ray-blue)] uppercase tracking-wider hover:opacity-80 transition-opacity">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6a6b6c] group-focus-within:text-[var(--ray-blue)] transition-colors" size={16} />
                                <input 
                                    type="password" 
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#07080a] border border-white/5 rounded-lg pl-12 pr-5 py-3 text-[#f9f9f9] text-sm focus:outline-none focus:border-[var(--ray-blue)]/50 transition-all font-medium placeholder:text-[#6a6b6c]/40"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="pill-button pill-button-primary w-full py-3.5 text-sm"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={16} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-[#6a6b6c] text-[13px] font-medium">
                            First time here?{' '}
                            <Link href="/register" className="text-[var(--ray-blue)] hover:opacity-80 transition-opacity font-bold">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
                
                {/* Footer Links */}
                <div className="mt-12 flex justify-center gap-8">
                    <Link href="/" className="text-[#6a6b6c] hover:text-[#f9f9f9] text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
                        Home
                    </Link>
                    <a href="#" className="text-[#6a6b6c] hover:text-[#f9f9f9] text-[10px] font-bold uppercase tracking-[0.2em] transition-colors">
                        Security
                    </a>
                </div>
            </div>
        </div>
    );
}