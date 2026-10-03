import React, { useState, useEffect } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { BookingEngine, type AvailableSlot } from '../lib/booking-store';
import { useTenant } from '../context/TenantContext';
import { Calendar, Clock, LockKey } from '@phosphor-icons/react';
import type { Service, ServiceOption } from '../../scripts/schema';

interface SlotPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  options: ServiceOption[];
  masterId: string | null;
  onSelectSlot: (slot: AvailableSlot, dateStr: string) => void;
}

export const SlotPickerModal: React.FC<SlotPickerModalProps> = ({
  open,
  onOpenChange,
  service,
  options,
  masterId,
  onSelectSlot,
}) => {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 calendar days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('ru-RU', { month: 'short' });
    return { dateStr, dayName, dayNumber, monthName };
  });

  useEffect(() => {
    if (!open || !tenant || !service) return;

    let isSubscribed = true;
    setIsLoading(true);
    setError(null);

    const optionIds = options.map((o) => o.id);

    BookingEngine.getAvailableSlots(tenant.slug, service.id, optionIds, masterId, selectedDate)
      .then((res) => {
        if (isSubscribed) {
          setAvailableSlots(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setError((err as Error).message);
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [open, tenant, service, options, masterId, selectedDate]);

  if (!service || !tenant) return null;

  // Generate full daily schedule slots from open to close
  const targetDate = new Date(`${selectedDate}T00:00:00`);
  const dayOfWeek = targetDate.getDay();
  const dayHours = tenant.businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);

  const allDaySlots: string[] = [];
  if (dayHours && !dayHours.isClosed) {
    const [openH, openM] = dayHours.openTime.split(':').map(Number);
    const [closeH, closeM] = dayHours.closeTime.split(':').map(Number);
    let curH = openH;
    let curM = openM;
    while (curH < closeH || (curH === closeH && curM + 30 <= closeM)) {
      const timeStr = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;
      allDaySlots.push(timeStr);
      curM += 30;
      if (curM >= 60) {
        curH += Math.floor(curM / 60);
        curM %= 60;
      }
    }
  }

  const availableMap = new Map<string, AvailableSlot>();
  for (const s of availableSlots) {
    availableMap.set(s.time, s);
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Выбор даты и времени"
      description={`Услуга: ${service.name} (${service.durationMin} мин)`}
    >
      <div className="space-y-5">
        {/* Date Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Calendar size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              Дата записи
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {dateOptions.map((item) => {
              const isSelected = selectedDate === item.dateStr;

              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(item.dateStr)}
                  style={{
                    backgroundColor: isSelected ? 'var(--tenant-accent, #4690FF)' : 'var(--tenant-card, #121216)',
                    borderColor: isSelected ? 'var(--tenant-accent, #4690FF)' : 'rgba(255, 255, 255, 0.1)',
                    color: isSelected ? '#FFFFFF' : 'var(--tenant-text, #FFFFFF)',
                  }}
                  className={`flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'font-bold shadow-lg shadow-blue-500/20'
                      : 'hover:border-white/30'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider opacity-80">
                    {item.dayName}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {item.dayNumber}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {item.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Clock size={16} weight="duotone" style={{ color: 'var(--tenant-accent, #4690FF)' }} />
              Расписание на день
            </span>
            <span className="text-[11px] text-neutral-400">
              Шаг 30 минут · Занятое время заблокировано
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 py-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-11 bg-neutral-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 text-center">
              {error}
            </div>
          ) : allDaySlots.length === 0 ? (
            <div className="py-8 text-center px-4 rounded-2xl border border-white/10 bg-neutral-900/40">
              <div className="text-sm font-medium text-neutral-300 mb-1">
                Студия закрыта в этот день
              </div>
              <p className="text-xs text-neutral-500">
                Пожалуйста, выберите другую дату.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
              {allDaySlots.map((timeStr) => {
                const availableSlot = availableMap.get(timeStr);
                const isAvailable = Boolean(availableSlot);

                if (isAvailable && availableSlot) {
                  return (
                    <button
                      key={timeStr}
                      type="button"
                      onClick={() => {
                        onSelectSlot(availableSlot, selectedDate);
                        onOpenChange(false);
                      }}
                      className="h-11 rounded-xl border border-white/15 bg-neutral-900/90 text-white hover:border-blue-400 hover:bg-white/10 font-semibold text-sm transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {timeStr}
                    </button>
                  );
                }

                // Explicitly marked occupied / unavailable slot
                return (
                  <button
                    key={timeStr}
                    type="button"
                    disabled
                    aria-disabled="true"
                    title="Это время уже занято или недоступно"
                    className="h-11 rounded-xl border border-white/5 bg-neutral-950/60 text-neutral-600 font-normal text-xs transition-none flex items-center justify-center gap-1 cursor-not-allowed line-through opacity-45"
                  >
                    <LockKey size={12} weight="fill" />
                    <span>{timeStr}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
