import React, { useRef } from 'react';
import { useTenant } from '../context/TenantContext';
import { MapPin, Phone, Clock, CalendarPlus, Sparkle, ShieldCheck } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onBookClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBookClick }) => {
  const { tenant } = useTenant();
  const heroRef = useRef<HTMLDivElement>(null);

  if (!tenant) return null;

  const isSample = tenant.status === 'sample';

  const handleHeroBookClick = () => {
    if (onBookClick) {
      onBookClick();
    } else {
      const el = document.getElementById('booking-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="relative w-full overflow-hidden bg-black border-b border-white/10 safe-top">
      {/* Sample Banner if tenant is in sample mode */}
      {isSample && (
        <div className="bg-blue-950/80 border-b border-blue-500/30 px-4 py-1.5 text-center text-xs text-blue-200 flex items-center justify-center gap-2">
          <Sparkle size={14} className="text-blue-400" />
          <span>Режим образца: демонстрационный прототип студии</span>
        </div>
      )}

      {/* Hero Photo Container (button moves with the photo) */}
      <div ref={heroRef} className="relative h-64 sm:h-80 w-full overflow-hidden select-none">
        {tenant.assets.hero ? (
          <img
            src={tenant.assets.hero}
            alt={tenant.name}
            className="w-full h-full object-cover object-center filter brightness-[0.55] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black" />
        )}

        {/* Gradient overlays for depth & text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />

        {/* Top bar with Owner link */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          <Link
            to={`/s/${tenant.slug}/owner/login`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white border border-white/15 transition-colors"
          >
            <ShieldCheck size={14} style={{ color: 'var(--tenant-accent, #4690FF)' }} />
            <span>Кабинет студии</span>
          </Link>
        </div>

        {/* Wide Glass Booking Button Moving With The Photo */}
        <div className="absolute bottom-5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 max-w-sm sm:w-80 mx-auto">
          <button
            type="button"
            onClick={handleHeroBookClick}
            className="glass-btn w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-white font-semibold text-sm sm:text-base tracking-wide border border-white/20 shadow-2xl cursor-pointer group"
          >
            <CalendarPlus
              size={20}
              weight="bold"
              className="text-blue-400 group-hover:scale-110 transition-transform"
              style={{ color: 'var(--tenant-accent, #4690FF)' }}
            />
            <span className="relative z-10 text-white font-semibold drop-shadow-sm">
              Записаться онлайн
            </span>
          </button>
        </div>
      </div>

      {/* Studio Header Card */}
      <div className="relative px-4 pb-6 pt-3 max-w-lg mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center">
          {tenant.name}
        </h1>

        {tenant.tagline && (
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mt-2 max-w-md mx-auto text-center">
            {tenant.tagline}
          </p>
        )}

        {/* Studio Contacts & Schedule */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs text-neutral-300 pt-3 mt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <MapPin size={15} className="text-neutral-400" />
            <span>{tenant.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={15} className="text-neutral-400" />
            <a href={`tel:${tenant.phone}`} className="hover:text-white transition-colors underline-offset-2 hover:underline">
              {tenant.phone}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-neutral-400" />
            <span>10:00 – 22:00</span>
          </div>
        </div>
      </div>
    </header>
  );
};
