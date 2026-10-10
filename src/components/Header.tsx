import React, { useRef } from 'react';
import { useTenant } from '../context/TenantContext';
import { getAssetUrl } from '../lib/assets';
import { MapPin, Phone, Clock, CalendarPlus, Sparkle, ShieldCheck, DeviceMobile } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onBookClick?: () => void;
  onInstallClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBookClick, onInstallClick }) => {
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
    <header className="relative w-full overflow-hidden bg-[#050507] border-b border-white/10 safe-top">
      {/* Sample Banner if tenant is in sample mode */}
      {isSample && (
        <div className="bg-neutral-900/90 border-b border-white/15 px-4 py-1.5 text-center text-xs text-neutral-300 flex items-center justify-center gap-2">
          <Sparkle size={14} className="text-white" />
          <span className="tracking-wide">Режим образца: демонстрационный прототип студии</span>
        </div>
      )}

      {/* Hero Photo Container (button moves with the photo) */}
      <div ref={heroRef} className="relative h-68 sm:h-84 w-full overflow-hidden select-none">
        {tenant.assets.hero ? (
          <img
            src={getAssetUrl(tenant.assets.hero)}
            alt={tenant.name}
            className="w-full h-full object-cover object-center filter brightness-[0.6] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-[#050507]" />
        )}

        {/* Cinematic gradient overlays: complete center clarity transitioning to deep #050507 bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#050507] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-transparent pointer-events-none" />

        {/* Top bar with PWA install & Owner link */}
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          {onInstallClick && (
            <button
              type="button"
              onClick={onInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-black border border-white/20 transition-all hover:bg-neutral-200 cursor-pointer shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
              title="Добавить иконку студии на рабочий стол"
            >
              <DeviceMobile size={13} weight="bold" />
              <span>📱 На экран</span>
            </button>
          )}
          <Link
            to={`/s/${tenant.slug}/owner/login`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white border border-white/15 transition-all hover:border-white/30"
          >
            <ShieldCheck size={14} className="text-white" />
            <span>Кабинет студии</span>
          </Link>
        </div>

        {/* Wide Monochrome Glass Capsule Booking Button Moving With The Photo */}
        <div className="absolute bottom-18 sm:bottom-22 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 max-w-sm sm:w-80 mx-auto">
          <button
            type="button"
            onClick={handleHeroBookClick}
            className="glass-btn w-full py-3.5 px-6 rounded-full flex items-center justify-center gap-2.5 text-white font-medium text-sm sm:text-base border border-white/25 shadow-2xl cursor-pointer group active:scale-95 transition-all bg-black/40 backdrop-blur-xl"
          >
            <CalendarPlus
              size={19}
              weight="bold"
              className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:scale-110 transition-transform"
            />
            <span className="relative z-10 text-white font-semibold tracking-wider text-xs sm:text-sm uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
              Записаться онлайн
            </span>
          </button>
        </div>
      </div>

      {/* Studio Header Card */}
      <div className="relative px-4 pb-6 pt-2 max-w-lg mx-auto text-center">
        {tenant.assets.logo && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto -mt-12 sm:-mt-14 mb-3 rounded-full overflow-hidden border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.8)] bg-[#0D0D11] relative z-20">
            <img
              src={getAssetUrl(tenant.assets.logo)}
              alt={tenant.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight text-center">
          {tenant.name}
        </h1>

        {tenant.tagline && (
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mt-2 max-w-md mx-auto text-center font-light">
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
            <span>
              {tenant.businessHours?.[1]?.openTime || '09:00'} – {tenant.businessHours?.[1]?.closeTime || '20:00'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
