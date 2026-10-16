import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTenantBySlug } from '../data/tenants';
import type { BusinessConfig, Service, Master } from '../../scripts/schema';

interface TenantContextValue {
  tenant: BusinessConfig | null;
  slug: string;
  isLoading: boolean;
  error: string | null;
  updateServices: (services: Service[]) => void;
  updateMasters: (masters: Master[]) => void;
  resetToDefault: () => void;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  slug: '',
  isLoading: true,
  error: null,
  updateServices: () => {},
  updateMasters: () => {},
  resetToDefault: () => {},
});

export function TenantProvider({
  children,
  defaultSlug = 'ayza-beauty-space',
}: {
  children: React.ReactNode;
  defaultSlug?: string;
}) {
  const { slug } = useParams<{ slug: string }>();
  const effectiveSlug = slug || defaultSlug;
  const [tenant, setTenant] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveSlug) {
      setError('Не указан идентификатор студии (slug)');
      setIsLoading(false);
      return;
    }

    const found = getTenantBySlug(effectiveSlug);
    if (!found) {
      setError(`Студия "${effectiveSlug}" не найдена`);
      setTenant(null);
      setIsLoading(false);
      return;
    }

    // Merge custom services and masters from localStorage if present
    let merged: BusinessConfig = { ...found };
    try {
      const customServices = localStorage.getItem(`beauty_custom_services_v2_${found.slug}`);
      if (customServices) {
        merged.services = JSON.parse(customServices);
      }
      const customMasters = localStorage.getItem(`beauty_custom_masters_${found.slug}`);
      if (customMasters) {
        merged.masters = JSON.parse(customMasters);
      }
    } catch (e) {
      console.warn('Failed to parse custom tenant data from localStorage', e);
    }

    setTenant(merged);
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
    root.style.setProperty('--tenant-accent-secondary', found.theme.secondaryAccentColor || '#F5EBE0');
    root.style.setProperty('--tenant-bg', found.theme.bgColor);
    root.style.setProperty('--tenant-card', found.theme.cardBgColor);
    root.style.setProperty('--tenant-card-border', found.theme.borderColor || 'rgba(212, 175, 55, 0.15)');
    root.style.setProperty('--tenant-text', found.theme.textColor);
    root.style.setProperty('--tenant-muted', found.theme.mutedColor);
    root.style.setProperty('--font-heading', found.theme.fontHeading);
    root.style.setProperty('--font-body', found.theme.fontBody);

    // Theme color meta tag
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = found.theme.bgColor;
    }
  }, [effectiveSlug]);

  const updateServices = (services: Service[]) => {
    if (!tenant) return;
    try {
      localStorage.setItem(`beauty_custom_services_v2_${tenant.slug}`, JSON.stringify(services));
    } catch (e) {
      console.error(e);
    }
    setTenant((prev) => (prev ? { ...prev, services } : null));
  };

  const updateMasters = (masters: Master[]) => {
    if (!tenant) return;
    try {
      localStorage.setItem(`beauty_custom_masters_${tenant.slug}`, JSON.stringify(masters));
    } catch (e) {
      console.error(e);
    }
    setTenant((prev) => (prev ? { ...prev, masters } : null));
  };

  const resetToDefault = () => {
    if (!tenant) return;
    try {
      localStorage.removeItem(`beauty_custom_services_v2_${tenant.slug}`);
      localStorage.removeItem(`beauty_custom_masters_${tenant.slug}`);
    } catch (e) {
      console.error(e);
    }
    const found = getTenantBySlug(tenant.slug);
    if (found) setTenant(found);
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        slug: effectiveSlug || '',
        isLoading,
        error,
        updateServices,
        updateMasters,
        resetToDefault,
      }}
    >
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
