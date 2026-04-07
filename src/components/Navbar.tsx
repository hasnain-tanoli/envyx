'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

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
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md shadow-sm">
            <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                    src="/envyx-logo-text-dark.svg"
                    alt="Envyx Logo"
                    width={120}
                    height={40}
                    className="h-14 w-auto"
                />
            </Link>

            <div className="flex items-center gap-6">
                {session ? (
                    <>
                        <Link
                            href="/projects"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${path.startsWith('/projects') ? 'text-indigo-500' : 'text-gray-400'}`}
                        >
                            <LayoutDashboard size={18} />
                            Projects
                        </Link>

                        <Link
                            href="/teams"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-400 ${path.startsWith('/teams') ? 'text-indigo-500' : 'text-gray-400'}`}
                        >
                            <UserIcon size={18} />
                            Teams
                        </Link>

                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <UserIcon size={16} className="text-indigo-400" />
                                </div>
                                <span className="hidden sm:inline">{session.user.name}</span>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Sign Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className={`text-sm font-medium transition-colors hover:text-indigo-400 ${path === '/login' ? 'text-indigo-500' : 'text-gray-400'}`}
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}