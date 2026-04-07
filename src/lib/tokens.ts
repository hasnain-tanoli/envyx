import crypto from 'crypto';

const TOKEN_PREFIX = 'envy_';

/**
 * Generates a secure random token with a prefix.
 * e.g., envy_a1b2c3d4...
 */
export function generateToken(): string {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${TOKEN_PREFIX}${randomBytes}`;
}

/**
 * Hashes a raw token using SHA-256 for secure database storage.
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}
