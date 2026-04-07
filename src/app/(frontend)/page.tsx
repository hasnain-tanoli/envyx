'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { 
    ShieldCheck, 
    Lock, 
    Zap, 
    ArrowRight, 
    CheckCircle2,
    Layers
} from 'lucide-react';

export default function Page() {
    const { data: session } = useSession();

    return (
        <div className="relative isolate flex flex-col items-center">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[50%] top-0 h-[800px] w-[800px] -translate-x-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
                <div className="absolute right-0 top-[20%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-bounce-subtle">
                    <ShieldCheck size={14} />
                    Military Grade Encryption
                </div>
                
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-[1.1]">
                    Your Environment <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x underline decoration-indigo-500/30">Variables</span>, Secured.
                </h1>
                
                <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium mb-12 leading-relaxed">
                    Envyx is the ultimate secure vault for your project&apos;s sensitive secrets. 
                    Store, manage, and retrieve environment variables with ease and peace of mind.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {session ? (
                        <Link 
                            href="/projects" 
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                        >
                            Go to Dashboard
                            <ArrowRight size={20} />
                        </Link>
                    ) : (
                        <>
                            <Link 
                                href="/register" 
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                            >
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                            <Link 
                                href="/login" 
                                className="w-full sm:w-auto glass hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all border-white/10 flex items-center justify-center gap-3"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 py-24 sm:py-32 w-full max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Lock size={28} />}
                        title="End-to-End Encryption"
                        description="AES-256-GCM encryption ensures your variables are only readable by you. Even we can't see them."
                    />
                    <FeatureCard 
                        icon={<Zap size={28} />}
                        title="Instant Retrieval"
                        description="Access your project variables anywhere, anytime with our lightning-fast interface."
                    />
                    <FeatureCard 
                        icon={<Layers size={28} />}
                        title="Project Isolation"
                        description="Keenly organized vaults for each project, environment, and team member."
                    />
                </div>
            </section>

            {/* Social Proof / Call to Action */}
            <section className="w-full bg-white/5 border-y border-white/5 py-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">Built for Modern Teams</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400 font-medium">
                                <CheckCircle2 className="text-indigo-500" size={20} />
                                Zero-Knowledge Architecture
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 font-medium">
                                <CheckCircle2 className="text-indigo-500" size={20} />
                                Multi-Project Workspace support
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 font-medium">
                                <CheckCircle2 className="text-indigo-500" size={20} />
                                Seamless UI/UX workflow
                            </li>
                        </ul>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <div className="relative glass p-8 rounded-3xl border-white/10 flex flex-col gap-6 w-full sm:w-[400px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">E</div>
                                <div>
                                    <h4 className="text-white font-bold">Envyx Enterprise</h4>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Incoming Early 2025</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                &quot;Envyx has completely transformed how we manage our secrets. It&apos;s the standard for our development lifecycle.&quot;
                            </p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="text-indigo-500">★</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="glass p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 transition-all group hover:-translate-y-2">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all mb-8 shadow-inner shadow-white/5">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">
                {description}
            </p>
        </div>
    );
}