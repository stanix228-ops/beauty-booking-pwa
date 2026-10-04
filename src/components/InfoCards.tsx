import React from 'react';
import { useTenant } from '../context/TenantContext';
import { Clock, ShieldCheck, Diamond } from '@phosphor-icons/react';

export const InfoCards: React.FC = () => {
  const { tenant } = useTenant();
  if (!tenant || !tenant.infoCards || tenant.infoCards.length === 0) return null;

  const [firstCard, secondCard, thirdCard] = tenant.infoCards;

  return (
    <div className="reveal-section px-4 py-3 max-w-lg mx-auto">
      <div className="space-y-2.5">
        {/* Bento Card 1: Wide primary card with live pulsing status */}
        {firstCard && (
          <div className="p-4 rounded-2xl border border-white/12 bg-[#0D0D11] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(0,0,0,0.8)] hover:border-white/20 transition-all flex items-start justify-between gap-3 group">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-emerald-400">
                  Open Now
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight pt-0.5">
                {firstCard.title}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                {firstCard.description}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white flex-shrink-0 group-hover:bg-white/10 transition-colors">
              <Clock size={20} weight="duotone" className="text-white" />
            </div>
          </div>
        )}

        {/* Bento Cards 2 & 3: Two balanced luxury cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {secondCard && (
            <div className="p-3.5 rounded-2xl border border-white/12 bg-[#0D0D11] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-white/20 transition-all flex flex-col justify-between group">
              <div className="mb-2 p-2 w-fit rounded-xl bg-white/5 border border-white/10 text-white group-hover:bg-white/10 transition-colors">
                <ShieldCheck size={18} weight="duotone" className="text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {secondCard.title}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug line-clamp-2">
                  {secondCard.description}
                </p>
              </div>
            </div>
          )}

          {thirdCard && (
            <div className="p-3.5 rounded-2xl border border-white/12 bg-[#0D0D11] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:border-white/20 transition-all flex flex-col justify-between group">
              <div className="mb-2 p-2 w-fit rounded-xl bg-white/5 border border-white/10 text-white group-hover:bg-white/10 transition-colors">
                <Diamond size={18} weight="duotone" className="text-white" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  {thirdCard.title}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug line-clamp-2">
                  {thirdCard.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
