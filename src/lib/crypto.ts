/**
 * Cryptographic token generator and SHA-256 hash helper for passwordless client access.
 * Works uniformly in browser (window.crypto) and server/node environments.
 */

export function generateClientAccessToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function hashTokenSha256(token: string): Promise<string> {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : (globalThis as any).crypto;
  if (cryptoObj && cryptoObj.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('WebCrypto subtle digest not available');
}
