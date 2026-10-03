import React, { useEffect, useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { House, Sparkle, CalendarCheck } from '@phosphor-icons/react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavProps {
  onOpenMyBooking?: () => void;
  onSelectTab?: (tab: 'home' | 'services') => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({
  onOpenMyBooking,
  onSelectTab,
}) => {
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'home' | 'services' | 'my-booking'>('home');

  useEffect(() => {
    if (location.pathname.includes('/b/')) {
      setActiveTab('my-booking');
    } else {
      setActiveTab('home');
    }
  }, [location.pathname]);

  if (!tenant) return null;

  const handleTabClick = (tab: 'home' | 'services' | 'my-booking') => {
    setActiveTab(tab);
    if (tab === 'home') {
      if (location.pathname !== `/s/${tenant.slug}/` && location.pathname !== `/s/${tenant.slug}`) {
        navigate(`/s/${tenant.slug}/`);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      onSelectTab?.('home');
    } else if (tab === 'services') {
      if (location.pathname !== `/s/${tenant.slug}/` && location.pathname !== `/s/${tenant.slug}`) {
        navigate(`/s/${tenant.slug}/#services`);
      } else {
        const el = document.getElementById('services-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      onSelectTab?.('services');
    } else if (tab === 'my-booking') {
      // Check if user has a recent booking token
      const lastToken = localStorage.getItem(`beauty_last_booking_token_${tenant.slug}`);
      if (lastToken) {
        navigate(`/s/${tenant.slug}/b/${lastToken}`);
      } else {
        onOpenMyBooking?.();
      }
    }
  };

  return (
    <nav
      aria-label="Нижняя навигация"
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom,16px)] pt-2 pointer-events-none"
    >
      <div className="relative pointer-events-auto rounded-full p-1.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.85)] border border-white/15 bg-[#0D0D11]/90 backdrop-blur-2xl max-w-xs sm:max-w-sm w-full overflow-hidden">
        {/* Top subtle specular highlight shimmer */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        <button
          type="button"
          onClick={() => handleTabClick('home')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-white text-black font-semibold shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
              : 'text-[#8E8E93] hover:text-white hover:bg-white/5 font-medium'
          }`}
        >
          <House size={17} weight={activeTab === 'home' ? 'fill' : 'regular'} className={activeTab === 'home' ? 'text-black' : 'text-neutral-300'} />
          <span>Главная</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('services')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-white text-black font-semibold shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
              : 'text-[#8E8E93] hover:text-white hover:bg-white/5 font-medium'
          }`}
        >
          <Sparkle size={17} weight={activeTab === 'services' ? 'fill' : 'regular'} className={activeTab === 'services' ? 'text-black' : 'text-neutral-300'} />
          <span>Услуги</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('my-booking')}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
            activeTab === 'my-booking'
              ? 'bg-white text-black font-semibold shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
              : 'text-[#8E8E93] hover:text-white hover:bg-white/5 font-medium'
          }`}
        >
          <CalendarCheck size={17} weight={activeTab === 'my-booking' ? 'fill' : 'regular'} className={activeTab === 'my-booking' ? 'text-black' : 'text-neutral-300'} />
          <span>Моя запись</span>
        </button>
      </div>
    </nav>
  );
};
