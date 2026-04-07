'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const path = usePathname();

    if (path === '/login' || path === '/register') return null;

    return (
        <footer className="py-12 px-6 border-t border-white/5 text-center bg-[#050505]">
            <p className="text-gray-600 text-sm font-medium uppercase tracking-widest leading-loose">
                &copy; {new Date().getFullYear()} Envyx &mdash; Encrypted Environment Storage.
            </p>
        </footer>
    );
}
