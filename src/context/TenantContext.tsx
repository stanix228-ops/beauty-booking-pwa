import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTenantBySlug } from '../data/tenants';
import type { BusinessConfig } from '../../scripts/schema';

interface TenantContextValue {
  tenant: BusinessConfig | null;
  slug: string;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  slug: '',
  isLoading: true,
  error: null,
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Не указан идентификатор студии (slug)');
      setIsLoading(false);
      return;
    }

    const found = getTenantBySlug(slug);
    if (!found) {
      setError(`Студия "${slug}" не найдена`);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    setTenant(found);
    setError(null);
    setIsLoading(false);

    // Dynamic Title & Meta
    document.title = `${found.name} — Онлайн-запись`;

    // Dynamic PWA Manifest link
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = `/tenants/${found.slug}/manifest.webmanifest`;

    // Dynamic CSS Custom Properties
    const root = document.documentElement;
    root.style.setProperty('--tenant-accent', found.theme.accentColor);
    root.style.setProperty('--tenant-bg', found.theme.bgColor);
    root.style.setProperty('--tenant-card', found.theme.cardBgColor);
    root.style.setProperty('--tenant-text', found.theme.textColor);
    root.style.setProperty('--tenant-muted', found.theme.mutedColor);
    root.style.setProperty('--font-heading', found.theme.fontHeading);
    root.style.setProperty('--font-body', found.theme.fontBody);

    // Theme color meta tag
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = found.theme.bgColor;
    }
  }, [slug]);

  return (
    <TenantContext.Provider value={{ tenant, slug: slug || '', isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
