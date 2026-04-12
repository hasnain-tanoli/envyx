'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const path = usePathname();

    if (path === '/login' || path === '/register') return null;

    return (
        <footer className="w-full py-12 px-6 border-t border-white/5 bg-[#07080a]">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-[#6a6b6c] font-medium tracking-tight">
                    &copy; {new Date().getFullYear()} Envyx — Precision Secret Vault.
                </p>
                <div className="flex gap-8">
                    <a href="#" className="text-sm text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors font-medium">Privacy</a>
                    <a href="#" className="text-sm text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors font-medium">Security</a>
                    <a href="#" className="text-sm text-[#6a6b6c] hover:text-[#f9f9f9] transition-colors font-medium">Github</a>
                </div>
            </div>
        </footer>
    );
}
