'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import Link from 'next/link';
import { 
    Shield, 
    User, 
    Mail, 
    Lock, 
    ArrowRight, 
    Loader2, 
    AlertCircle 
} from 'lucide-react';

export default function Page() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data, error } = await signUp.email({ name, email, password });
            if (error) {
                setError(error.message ?? 'Registration failed. Please try again.');
                return;
            }
            if (data) router.push('/login');
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen relative isolate flex items-center justify-center p-6 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10 bg-[#0a0a0c]">
                <div className="absolute left-[50%] top-[30%] h-[600px] w-[600px] -translate-x-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
            </div>

            <div className="w-full max-w-md animate-in">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-500 mb-6 border border-indigo-500/20 shadow-inner shadow-white/5">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Create Account</h1>
                    <p className="text-gray-500 font-medium">Start securing your project secrets today.</p>
                </div>

                {/* Register Card */}
                <div className="glass rounded-[2.5rem] p-8 sm:p-10 border-white/5 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-shake">
                            <AlertCircle className="text-red-400 shrink-0" size={18} />
                            <p className="text-red-400 text-sm font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    required
                                    placeholder="John Doe"
                                    className="w-full glass bg-white/5 border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-700"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="name@company.com"
                                    className="w-full glass bg-white/5 border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-700"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full glass bg-white/5 border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-gray-700"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Create Vault Account
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-sm font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold">
                                Sign In &rarr;
                            </Link>
                        </p>
                    </div>
                </div>
                
                {/* Footer Links */}
                <div className="mt-8 flex justify-center gap-6">
                    <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs font-bold uppercase tracking-widest transition-colors">
                        Home
                    </Link>
                    <span className="text-gray-800">•</span>
                    <a href="#" className="text-gray-600 hover:text-gray-400 text-xs font-bold uppercase tracking-widest transition-colors">
                        Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
}