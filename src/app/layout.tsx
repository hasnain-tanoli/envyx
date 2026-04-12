import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Envyx — Precision Secret Management',
    description: 'The ultra-minimal vault for environment variables. Secure by default. Local-first speed. API-ready.',
    icons: {
        icon: '/envyx-logo-dark.svg',
        apple: '/envyx-logo-dark.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased dark`}>
            <body className="min-h-full flex flex-col bg-[#07080a] text-[#f9f9f9] selection:bg-[#FF6363]/30">
                <ToastProvider>
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden">{children}</main>
                    <Footer />
                </ToastProvider>
            </body>
        </html>
    );
}
