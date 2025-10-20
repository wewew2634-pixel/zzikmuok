/**
 * Cryptography utilities for OAuth token encryption
 * Uses AES-256-GCM for encryption with unique IV per operation
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment variable
 * In production, this should be stored in a secure secrets manager (AWS Secrets Manager, Google Secret Manager, etc.)
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set');
  }

  // Derive a consistent 256-bit key from the secret using scrypt
  const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'zzik-default-salt-2025', 'utf-8');
  return scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Encrypt sensitive data (OAuth tokens, etc.) using AES-256-GCM
 * 
 * @param plaintext - Data to encrypt
 * @returns Encrypted data in format: iv:authTag:ciphertext (hex-encoded)
 * 
 * @example
 * ```typescript
 * const accessToken = 'user-access-token-12345';
 * const encrypted = encrypt(accessToken);
 * console.log(encrypted); // "a1b2c3d4...:e5f6g7h8...:i9j0k1l2..."
 * ```
 */
export function encrypt(plaintext: string): string {
  try {
    // Generate random IV for each encryption (CRITICAL for security)
    const iv = randomBytes(IV_LENGTH);
    
    // Get encryption key
    const key = getEncryptionKey();
    
    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    // Get authentication tag (for GCM mode)
    const authTag = cipher.getAuthTag();
    
    // Return format: iv:authTag:ciphertext (all hex-encoded)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data encrypted with encrypt()
 * 
 * @param encrypted - Encrypted data in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext
 * 
 * @example
 * ```typescript
 * const encrypted = "a1b2c3d4...:e5f6g7h8...:i9j0k1l2...";
 * const decrypted = decrypt(encrypted);
 * console.log(decrypted); // "user-access-token-12345"
 * ```
 */
export function decrypt(encrypted: string): string {
  try {
    // Parse encrypted data
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const [ivHex, authTagHex, ciphertext] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Get encryption key
    const key = getEncryptionKey();
    
    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt OAuth token object
 * 
 * @param tokenData - OAuth token data to encrypt
 * @returns Encrypted token data
 * 
 * @example
 * ```typescript
 * const tokens = {
 *   access_token: 'secret-access-token',
 *   refresh_token: 'secret-refresh-token',
 *   expires_at: Date.now() + 3600000,
 * };
 * const encrypted = encryptTokens(tokens);
 * // Store encrypted in database
 * ```
 */
export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
}

export interface EncryptedTokens {
  access_token_encrypted: string;
  refresh_token_encrypted?: string;
  expires_at?: number;
  scope?: string;
}

export function encryptTokens(tokens: OAuthTokens): EncryptedTokens {
  const encrypted: EncryptedTokens = {
    access_token_encrypted: encrypt(tokens.access_token),
    expires_at: tokens.expires_at,
    scope: tokens.scope,
  };
  
  if (tokens.refresh_token) {
    encrypted.refresh_token_encrypted = encrypt(tokens.refresh_token);
  }
  
  return encrypted;
}

/**
 * Decrypt OAuth token object
 * 
 * @param encrypted - Encrypted token data
 * @returns Decrypted token data
 * 
 * @example
 * ```typescript
 * const encrypted = {
 *   access_token_encrypted: '...',
 *   refresh_token_encrypted: '...',
 *   expires_at: 1234567890,
 * };
 * const tokens = decryptTokens(encrypted);
 * // Use tokens.access_token for API calls
 * ```
 */
export function decryptTokens(encrypted: EncryptedTokens): OAuthTokens {
  const tokens: OAuthTokens = {
    access_token: decrypt(encrypted.access_token_encrypted),
    expires_at: encrypted.expires_at,
    scope: encrypted.scope,
  };
  
  if (encrypted.refresh_token_encrypted) {
    tokens.refresh_token = decrypt(encrypted.refresh_token_encrypted);
  }
  
  return tokens;
}

/**
 * Generate a random state parameter for OAuth flow
 * Used to prevent CSRF attacks
 * 
 * @returns Random state string (32 bytes, hex-encoded)
 */
export function generateState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate state parameter from OAuth callback
 * In production, store state in session/database and validate against it
 * 
 * @param receivedState - State parameter from OAuth callback
 * @param expectedState - State stored before OAuth redirect
 * @returns True if states match
 */
export function validateState(receivedState: string, expectedState: string): boolean {
  // Use timing-safe comparison to prevent timing attacks
  if (receivedState.length !== expectedState.length) {
    return false;
  }
  
  let mismatch = 0;
  for (let i = 0; i < receivedState.length; i++) {
    mismatch |= receivedState.charCodeAt(i) ^ expectedState.charCodeAt(i);
  }
  
  return mismatch === 0;
}

/**
 * Hash sensitive data for logging (one-way)
 * Used for logging user IDs, emails without exposing actual values
 * 
 * @param data - Data to hash
 * @returns First 16 characters of SHA-256 hash
 */
export function hashForLogging(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
}
