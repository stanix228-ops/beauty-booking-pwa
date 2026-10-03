import { useTenant } from '../context/TenantContext';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { tenant } = useTenant();
  if (!tenant) return null;

  return (
    <header className="relative w-full overflow-hidden bg-neutral-950 border-b border-neutral-800/80 safe-top">
      {/* Background Hero Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        {tenant.assets.hero ? (
          <img
            src={tenant.assets.hero}
            alt={tenant.name}
            className="w-full h-full object-cover object-center filter brightness-[0.45] transform scale-105 transition-transform duration-700 hover:scale-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

        {/* Top bar with Owner link */}
        <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
          <Link
            to={`/s/${tenant.slug}/owner/`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900/80 backdrop-blur-md text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
            <span>Кабинет студии</span>
          </Link>
        </div>
      </div>

      {/* Studio Info Card */}
      <div className="relative px-4 pb-5 -mt-12 max-w-lg mx-auto text-center">
        <div className="mb-2">
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-neutral-100 truncate tracking-tight text-center">
            {tenant.name}
          </h1>
        </div>

        {tenant.tagline && (
          <p className="text-xs text-neutral-400 leading-relaxed mb-3 max-w-md mx-auto text-center">
            {tenant.tagline}
          </p>
        )}

        {/* Location & Contacts */}
        <div
          className="flex flex-wrap items-center justify-center gap-y-1.5 gap-x-4 text-xs text-neutral-400 pt-2 border-t"
          style={{ borderColor: 'var(--tenant-card-border, rgba(212, 175, 55, 0.15))' }}
        >
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
            <span>{tenant.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-neutral-500" />
            <a href={`tel:${tenant.phone}`} className="hover:text-neutral-200 transition-colors">
              {tenant.phone}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>10:00 – 22:00</span>
          </div>
        </div>
      </div>
    </header>
  );
}
