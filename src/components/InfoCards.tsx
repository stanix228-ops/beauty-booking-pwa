import React from 'react';
import { useTenant } from '../context/TenantContext';
import { Clock, Star, ShieldCheck, Sparkle, Heart, Diamond } from '@phosphor-icons/react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Clock: <Clock size={22} weight="duotone" />,
  Star: <Star size={22} weight="duotone" />,
  ShieldCheck: <ShieldCheck size={22} weight="duotone" />,
  Sparkle: <Sparkle size={22} weight="duotone" />,
  Heart: <Heart size={22} weight="duotone" />,
  Diamond: <Diamond size={22} weight="duotone" />,
  Gem: <Diamond size={22} weight="duotone" />,
};

export const InfoCards: React.FC = () => {
  const { tenant } = useTenant();
  if (!tenant || !tenant.infoCards || tenant.infoCards.length === 0) return null;

  return (
    <div className="reveal-section px-4 py-3 max-w-lg mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {tenant.infoCards.map((card) => {
          const icon = ICON_MAP[card.icon] || <Sparkle size={22} weight="duotone" />;
          return (
            <div
              key={card.id}
              className="p-3.5 rounded-2xl border border-white/10 bg-neutral-900/60 backdrop-blur-md flex flex-col justify-between hover:border-white/20 transition-colors"
            >
              <div className="mb-2" style={{ color: 'var(--tenant-accent, #4690FF)' }}>
                {icon}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {card.title}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
