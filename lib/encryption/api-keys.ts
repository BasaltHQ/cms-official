import crypto from 'crypto';

// Use environment variable for encryption key, fallback to a default (CHANGE IN PRODUCTION!)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY;

// Removed top-level throw to prevent build failures. 
// Validation happens inside the functions.
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts an API key using AES-256-CBC
 * @param apiKey - The plain text API key to encrypt
 * @returns The encrypted API key in format: iv:encryptedData
 */
export function encryptApiKey(apiKey: string): string {
    if (!apiKey) {
        throw new Error('API key cannot be empty');
    }

    if (!ENCRYPTION_KEY) {
        throw new Error('CRITICAL: API_KEY_ENCRYPTION_KEY is missing from environment variables.');
    }

    // Ensure the encryption key is 32 bytes for AES-256
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher and encrypt
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data (need IV for decryption)
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an encrypted API key
 * @param encryptedApiKey - The encrypted API key in format: iv:encryptedData
 * @returns The decrypted plain text API key
 */
export function decryptApiKey(encryptedApiKey: string): string {
    if (!encryptedApiKey) {
        throw new Error('Encrypted API key cannot be empty');
    }

    try {
        // Split IV and encrypted data
        const parts = encryptedApiKey.split(':');
        if (parts.length !== 2) {
            // Do not log this error as it is likely a legacy unencrypted key
            throw new Error('Invalid encrypted API key format');
        }

        const [ivHex, encryptedHex] = parts;

        // Convert hex strings back to buffers
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        if (!ENCRYPTION_KEY) {
            throw new Error('CRITICAL: API_KEY_ENCRYPTION_KEY is missing from environment variables.');
        }

        // Derive the same key used for encryption
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

        // Create decipher and decrypt
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (error) {
        // console.error('Decryption error:', error); // Silenced for legacy keys
        throw new Error('Failed to decrypt API key');
    }
}

/**
 * Masks an API key for display purposes
 * Shows first 8 characters and last 4 characters
 * @param apiKey - The plain text API key to mask
 * @returns The masked API key string
 */
export function maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 12) {
        return '••••••••••••';
    }

    const prefix = apiKey.substring(0, 8);
    const suffix = apiKey.substring(apiKey.length - 4);
    const maskedMiddle = '•'.repeat(Math.min(apiKey.length - 12, 20));

    return `${prefix}${maskedMiddle}${suffix}`;
}

/**
 * Validates the format of a Google API key
 * @param apiKey - The API key to validate
 * @returns True if valid format, false otherwise
 */
export function validateGoogleApiKey(apiKey: string): boolean {
    if (!apiKey) return false;

    // Google API keys typically start with "AIza" and are 39 characters long
    // This is a basic validation - actual validation happens when making API calls
    const googleApiKeyPattern = /^AIza[0-9A-Za-z\-_]{35}$/;

    return googleApiKeyPattern.test(apiKey);
}
