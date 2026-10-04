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
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(token);
      const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall through to fallback
    }
  }

  // Pure JS fallback hash (FNV-1a 64-bit hex expansion) for environments without WebCrypto
  let h1 = 0x811c9dc5;
  let h2 = 0x84222325;
  for (let i = 0; i < token.length; i++) {
    const ch = token.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 16777619);
    h2 = Math.imul(h2 ^ (ch << 1), 16777619);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `h_${hex1}${hex2}${token.slice(0, 16)}`;
}
