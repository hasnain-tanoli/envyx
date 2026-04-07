import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

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
                <div className="fixed-bg" />
                <ToastProvider>
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden">{children}</main>
                    <Footer />
                </ToastProvider>
            </body>
        </html>
    );
}
