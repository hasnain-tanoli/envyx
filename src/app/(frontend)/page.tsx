'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import { 
    ShieldCheck, 
    Zap, 
    ArrowRight, 
    CheckCircle2,
    Terminal,
    Fingerprint
} from 'lucide-react';

export default function Page() {
    const { data: session } = useSession();

    return (
        <div className="relative isolate flex flex-col items-center overflow-x-hidden">
            {/* Dramatic Background Grid */}
            <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute inset-0 bg-[#07080a] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Hero Section */}
            <section className="px-6 pt-32 pb-40 sm:pt-48 sm:pb-56 text-center max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[var(--ray-blue)] text-[10px] font-bold uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ShieldCheck size={14} />
                    Zero-Knowledge Encryption Standard
                </div>
                
                <h1 className="text-6xl sm:text-8xl lg:text-9xl font-medium text-[#f9f9f9] tracking-[-0.04em] mb-10 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    Precision <br />
                    Secret Management.
                </h1>
                
                <p className="text-[#6a6b6c] text-lg sm:text-xl max-w-xl mx-auto font-medium mb-14 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                    The ultra-minimal vault for environment variables. <br className="hidden sm:block" /> 
                    Secure by default. Local-first speed. API-ready.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                    {session ? (
                        <Link 
                            href="/projects" 
                            className="pill-button pill-button-primary px-10 py-3.5 text-sm"
                        >
                            Open Dashboard
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    ) : (
                        <>
                            <Link 
                                href="/register" 
                                className="pill-button pill-button-primary px-10 py-3.5 text-sm"
                            >
                                Start Building
                            </Link>
                            <Link 
                                href="/login" 
                                className="pill-button pill-button-secondary px-10 py-3.5 text-sm"
                            >
                                Sign In
                            </Link>
                        </>
                    )}
                </div>
            </section>

            {/* Features Hub */}
            <section className="px-6 py-24 sm:py-32 w-full max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon={<Fingerprint size={24} />}
                        title="AES-256-GCM"
                        description="Military-grade encryption at rest and in transit. Your master key never leaves your device."
                        accent="var(--ray-blue)"
                    />
                    <FeatureCard 
                        icon={<Terminal size={24} />}
                        title="Atomic CLI"
                        description="Inject secrets directly into your development workflow with zero configuration required."
                        accent="var(--ray-yellow)"
                    />
                    <FeatureCard 
                        icon={<Zap size={24} />}
                        title="Edge Native"
                        description="Lightning fast global retrieval with sub-50ms latency for all edge-native environments."
                        accent="var(--ray-green)"
                    />
                </div>
            </section>

            {/* Bottom Section */}
            <section className="w-full max-w-7xl px-6 py-32 border-t border-white/5">
                <div className="ray-card p-12 bg-[#101111] flex flex-col md:flex-row items-center justify-between gap-16 overflow-hidden relative">
                    {/* Decorative shadow inside card */}
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-[var(--ray-blue)]/10 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="max-w-xl relative">
                        <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#f9f9f9] mb-8">Built for the <br /> modern engineer.</h2>
                        <div className="space-y-6">
                            <FeatureItem icon={<CheckCircle2 className="text-[var(--ray-green)]" size={18} />} text="Zero-visibility architecture" />
                            <FeatureItem icon={<CheckCircle2 className="text-[var(--ray-green)]" size={18} />} text="Cross-project workspace" />
                            <FeatureItem icon={<CheckCircle2 className="text-[var(--ray-green)]" size={18} />} text="Team-first collaboration" />
                        </div>
                    </div>
                    
                    <div className="relative group shrink-0">
                        <div className="ray-card p-8 bg-[#07080a] border-white/5 w-full sm:w-[380px] shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-[#101111] border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
                                    <Image 
                                        src="/envyx-logo-dark.svg" 
                                        alt="Envyx" 
                                        width={32} 
                                        height={32} 
                                    />
                                </div>
                                <div>
                                    <h4 className="text-[#f9f9f9] font-medium text-sm">Beta Access</h4>
                                    <p className="text-[#6a6b6c] text-[10px] font-bold uppercase tracking-widest mt-0.5">Scale with Envyx</p>
                                </div>
                            </div>
                            <p className="text-[#cecece] text-[13px] leading-relaxed font-medium italic">
                                &quot;Envyx is the standard for our development lifecycle. Its minimal footprint and robust security are unmatched.&quot;
                            </p>
                            <div className="flex gap-1 mt-6 text-[#FF6363]">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <span key={i} className="text-[12px]">★</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-3.5 text-[#6a6b6c] text-sm font-medium tracking-tight">
            {icon}
            {text}
        </div>
    );
}

function FeatureCard({ icon, title, description, accent }: { icon: React.ReactNode, title: string, description: string, accent: string }) {
    return (
        <div className="ray-card p-10 bg-[#101111] transition-all group hover:bg-[#1b1c1e] cursor-default border-white/5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all mb-8 bg-[#07080a] border border-white/5 shadow-inner" style={{ color: accent }}>
                {icon}
            </div>
            <h3 className="text-xl font-medium tracking-tight text-[#f9f9f9] mb-4">{title}</h3>
            <p className="text-[#6a6b6c] text-sm font-medium leading-relaxed group-hover:text-[#9c9c9d] transition-colors">
                {description}
            </p>
        </div>
    );
}
