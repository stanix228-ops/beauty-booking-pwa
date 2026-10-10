import React from 'react';
import { useTenant } from '../context/TenantContext';
import { Clock, ShieldCheck, Diamond } from '@phosphor-icons/react';

export const InfoCards: React.FC = () => {
  const { tenant } = useTenant();
  if (!tenant || !tenant.infoCards || tenant.infoCards.length === 0) return null;

  const [firstCard, secondCard, thirdCard] = tenant.infoCards;

  // Calculate live studio status in tenant's timezone (e.g. Asia/Almaty)
  const liveStatus = (() => {
    try {
      const timeZone = tenant.timezone || 'Asia/Almaty';
      const now = new Date();
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short',
      });

      const parts = dtf.formatToParts(now);
      const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';
      const minuteStr = parts.find((p) => p.type === 'minute')?.value || '0';
      const weekdayStr = parts.find((p) => p.type === 'weekday')?.value || 'Sun';

      const weekdayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
      };
      const currentDayOfWeek = weekdayMap[weekdayStr] ?? 0;
      const currentMinutes = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);

      const todaySchedule = tenant.businessHours?.find((bh) => bh.dayOfWeek === currentDayOfWeek);

      if (!todaySchedule || todaySchedule.isClosed) {
        return {
          isOpen: false,
          statusLabel: 'Сейчас закрыто',
          headline: 'Сегодня выходной',
        };
      }

      const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
      const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return {
          isOpen: true,
          statusLabel: 'Открыто сейчас',
          headline: `Сегодня открыто до ${todaySchedule.closeTime}`,
        };
      } else if (currentMinutes < openMinutes) {
        return {
          isOpen: false,
          statusLabel: 'Сейчас закрыто',
          headline: `Откроется сегодня в ${todaySchedule.openTime}`,
        };
      } else {
        const nextDay = (currentDayOfWeek + 1) % 7;
        const tomorrowSchedule = tenant.businessHours?.find((bh) => bh.dayOfWeek === nextDay);
        const tomorrowOpen = tomorrowSchedule && !tomorrowSchedule.isClosed ? tomorrowSchedule.openTime : '09:00';
        return {
          isOpen: false,
          statusLabel: 'Сейчас закрыто',
          headline: `Откроется завтра в ${tomorrowOpen}`,
        };
      }
    } catch {
      return {
        isOpen: true,
        statusLabel: 'Открыто сейчас',
        headline: firstCard?.title || 'Работаем ежедневно',
      };
    }
  })();

  return (
    <div className="reveal-section px-4 py-3 max-w-lg mx-auto">
      <div className="space-y-2.5">
        {/* Bento Card 1: Wide primary card with live pulsing status */}
        {firstCard && (
          <div className="p-4 rounded-2xl border border-white/12 bg-[#0D0D11] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(0,0,0,0.8)] hover:border-white/20 transition-all flex items-start justify-between gap-3 group">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {liveStatus.isOpen ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500" />
                  )}
                </span>
                <span
                  className={`text-[11px] font-medium tracking-wider uppercase ${
                    liveStatus.isOpen ? 'text-emerald-400' : 'text-neutral-400'
                  }`}
                >
                  {liveStatus.statusLabel}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight pt-0.5">
                {liveStatus.headline}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                {firstCard.description}
                {!liveStatus.isOpen && ' · Онлайн-запись открыта 24/7'}
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
