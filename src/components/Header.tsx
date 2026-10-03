import { useTenant } from '../context/TenantContext';
import { MapPin, Phone, Clock, Star, Sparkles, ShieldCheck } from 'lucide-react';
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
      <div className="relative px-4 pb-5 -mt-14 max-w-lg mx-auto">
        <div className="flex items-end gap-3.5 mb-3">
          {/* Logo / Badge */}
          <div
            className="w-20 h-20 rounded-2xl p-0.5 shadow-xl flex-shrink-0 bg-neutral-900 border border-neutral-700/80 overflow-hidden relative group"
            style={{ borderColor: 'var(--tenant-accent)' }}
          >
            {tenant.assets.logo ? (
              <img src={tenant.assets.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                <Sparkles className="w-8 h-8" style={{ color: 'var(--tenant-accent)' }} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 mr-1" />
                4.98 (380+ отзывов)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-neutral-100 truncate tracking-tight">
              {tenant.name}
            </h1>
          </div>
        </div>

        {tenant.tagline && (
          <p className="text-xs text-neutral-400 leading-relaxed mb-3">
            {tenant.tagline}
          </p>
        )}

        {/* Location & Contacts */}
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
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
