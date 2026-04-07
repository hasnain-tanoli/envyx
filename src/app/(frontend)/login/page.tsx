'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        const { data, error } = await signIn.email({ email, password });
        if (error) {
            setError(error.message ?? 'Login failed');
            return;
        }
        if (data) router.push('/projects');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form className="bg-white p-8 rounded shadow-md w-full max-w-md" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
                <input className="w-full p-2 border rounded mb-3" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" className="w-full p-2 border rounded mb-4" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Login</button>
            </form>
        </div>
    );
}