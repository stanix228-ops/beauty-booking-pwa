/**
 * Owner credentials management & authentication verification.
 * Supports custom login and password changes in the Owner Cabinet.
 */

export interface OwnerCredentials {
  email: string;
  password: string;
}

export function getOwnerCredentials(slug: string): OwnerCredentials {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(`beauty_owner_auth_${slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password) {
          return {
            email: parsed.email.trim(),
            password: parsed.password.trim(),
          };
        }
      }
    } catch {}
  }

  // Default credentials if not yet customized
  if (slug === 'ayza-beauty-space') {
    return { email: 'admin@ayza.kz', password: 'ayza' };
  }
  return { email: 'admin@beauty-studio.ru', password: 'admin' };
}

export function saveOwnerCredentials(slug: string, email: string, password: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(
        `beauty_owner_auth_${slug}`,
        JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        })
      );
    } catch {}
  }
}

export function verifyOwnerLogin(slug: string, inputEmail: string, inputPassword: string): boolean {
  const current = getOwnerCredentials(slug);
  return (
    inputEmail.trim().toLowerCase() === current.email.trim().toLowerCase() &&
    inputPassword.trim() === current.password.trim()
  );
}
