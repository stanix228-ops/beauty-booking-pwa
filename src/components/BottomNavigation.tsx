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
      <div className="glass-surface pointer-events-auto rounded-full px-3 py-1.5 flex items-center gap-1 sm:gap-3 shadow-2xl max-w-sm w-full justify-around border border-white/10 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => handleTabClick('home')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === 'home'
              ? 'text-white bg-white/10 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          style={activeTab === 'home' ? { color: 'var(--tenant-accent, #4690FF)' } : {}}
        >
          <House size={18} weight={activeTab === 'home' ? 'fill' : 'regular'} />
          <span>Главная</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('services')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === 'services'
              ? 'text-white bg-white/10 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          style={activeTab === 'services' ? { color: 'var(--tenant-accent, #4690FF)' } : {}}
        >
          <Sparkle size={18} weight={activeTab === 'services' ? 'fill' : 'regular'} />
          <span>Услуги</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('my-booking')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
            activeTab === 'my-booking'
              ? 'text-white bg-white/10 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
          style={activeTab === 'my-booking' ? { color: 'var(--tenant-accent, #4690FF)' } : {}}
        >
          <CalendarCheck size={18} weight={activeTab === 'my-booking' ? 'fill' : 'regular'} />
          <span>Моя запись</span>
        </button>
      </div>
    </nav>
  );
};
