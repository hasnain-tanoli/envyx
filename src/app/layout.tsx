import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Envyx — Secure Environment Variable Manager',
    description: 'Securely store and manage your project environment variables with Envyx.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
            <body className="min-h-full flex flex-col bg-[#050505] text-white selection:bg-indigo-500/30">
                <Navbar />
                <main className="flex-1 overflow-x-hidden">{children}</main>
                <footer className="py-12 px-6 border-t border-white/5 text-center">
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-widest leading-loose">
                        &copy; {new Date().getFullYear()} Envyx &mdash; Encrypted Environment Storage.
                    </p>
                </footer>
            </body>
        </html>
    );
}
