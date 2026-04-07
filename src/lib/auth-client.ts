import { createAuthClient } from 'better-auth/react';

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!appUrl && process.env.NODE_ENV !== 'development') {
    // Fail loudly at startup so misconfigured deploys surface immediately
    throw new Error(
        '[Envyx] NEXT_PUBLIC_APP_URL is not set. ' +
        'Auth will break in production. Add it to your deployment environment variables.'
    );
}

export const authClient = createAuthClient({
    baseURL: appUrl || 'http://localhost:3000',
});

export const { signIn, signUp, signOut, useSession } = authClient;

