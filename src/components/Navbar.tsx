'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from '@/lib/auth-client';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const path = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    async function handleSignOut() {
        await signOut();
        router.push('/login');
    }

    if (path === '/login' || path === '/register') return null;

    return (
        <nav className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-[#07080a]/80 backdrop-blur-md border-b border-white/5">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image 
                    src="/envyx-logo-text-dark.svg" 
                    alt="Envyx" 
                    width={140} 
                    height={40}
                    className="h-8 w-auto"
                />
            </Link>

            <div className="flex items-center gap-8">
                {session ? (
                    <>
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/projects"
                                className={`text-sm font-medium transition-colors hover:text-white ${path.startsWith('/projects') ? 'text-white' : 'text-[#9c9c9d]'}`}
                            >
                                Projects
                            </Link>

                            <Link
                                href="/teams"
                                className={`text-sm font-medium transition-colors hover:text-white ${path.startsWith('/teams') ? 'text-white' : 'text-[#9c9c9d]'}`}
                            >
                                Teams
                            </Link>
                        </div>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 text-sm font-medium text-[#f9f9f9] hover:opacity-80 transition-opacity"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#1b1c1e] flex items-center justify-center border border-white/10">
                                    <UserIcon size={14} className="text-[#9c9c9d]" />
                                </div>
                                <span className="hidden sm:inline">{session.user.name}</span>
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="p-2 text-[#6a6b6c] hover:text-[#FF6363] transition-colors"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-6">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-[#9c9c9d] hover:text-white transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            className="pill-button pill-button-primary text-sm"
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}