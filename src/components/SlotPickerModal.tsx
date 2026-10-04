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

const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const SlotPickerModal: React.FC<SlotPickerModalProps> = ({
  open,
  onOpenChange,
  service,
  options,
  masterId,
  onSelectSlot,
}) => {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<string>(() => formatLocalDate(new Date()));
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 calendar days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = formatLocalDate(d);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayLabel, dayNumber, monthName, isToday: i === 0, isTomorrow: i === 1 };
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
  const [year, month, day] = selectedDate.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day, 0, 0, 0);
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

  const morningSlots = allDaySlots.filter((t) => {
    const h = parseInt(t.split(':')[0], 10);
    return h < 12;
  });
  const afternoonSlots = allDaySlots.filter((t) => {
    const h = parseInt(t.split(':')[0], 10);
    return h >= 12 && h < 17;
  });
  const eveningSlots = allDaySlots.filter((t) => {
    const h = parseInt(t.split(':')[0], 10);
    return h >= 17;
  });

  const slotGroups = [
    { id: 'morning', label: 'Morning (10:00 AM – 12:00 PM)', icon: '🌅', slots: morningSlots },
    { id: 'afternoon', label: 'Afternoon (12:00 PM – 5:00 PM)', icon: '☀️', slots: afternoonSlots },
    { id: 'evening', label: 'Evening (5:00 PM – 9:00 PM)', icon: '🌙', slots: eveningSlots },
  ].filter((g) => g.slots.length > 0);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Select Date & Time"
      description={`Service: ${service.name} (${service.durationMin} min)`}
    >
      <div className="space-y-6 pt-2 pb-6">
        {/* Date Selector */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Calendar size={16} weight="duotone" className="text-white" />
              Appointment Date
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
                  className={`flex flex-col items-center justify-center min-w-[70px] h-[76px] rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-white text-black font-bold border-white shadow-[0_4px_16px_rgba(255,255,255,0.25)] scale-[1.02]'
                      : 'bg-[#0D0D11] text-[#8E8E93] hover:text-white border-white/10 hover:border-white/25'
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                    isSelected
                      ? 'text-black font-bold'
                      : item.isToday
                      ? 'text-white font-bold'
                      : item.isTomorrow
                      ? 'text-neutral-200'
                      : 'text-neutral-400'
                  }`}>
                    {item.dayLabel}
                  </span>
                  <span className="text-lg font-bold leading-tight my-0.5">
                    {item.dayNumber}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-neutral-500'}`}>
                    {item.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots Grouped By Period */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Clock size={16} weight="duotone" className="text-white" />
              Daily Schedule
            </span>
            <span className="text-[11px] text-neutral-400">
              30-min intervals · Occupied slots locked
            </span>
          </div>

          {/* Quick Notice if Today has no remaining slots */}
          {selectedDate === dateOptions[0]?.dateStr && availableSlots.length === 0 && !isLoading && (
            <div className="p-3 mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs animate-in fade-in">
              <span className="text-neutral-300">
                All slots for today are fully booked.
              </span>
              <button
                type="button"
                onClick={() => setSelectedDate(dateOptions[1].dateStr)}
                className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors cursor-pointer shrink-0 ml-2"
              >
                Book for Tomorrow →
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 py-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-11 bg-neutral-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 text-center">
              {error}
            </div>
          ) : allDaySlots.length === 0 ? (
            <div className="py-8 text-center px-4 rounded-2xl border border-white/10 bg-[#0D0D11]">
              <div className="text-sm font-medium text-neutral-300 mb-1">
                Studio is closed on this day
              </div>
              <p className="text-xs text-neutral-500">
                Please select another date.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {slotGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>{group.icon}</span>
                    <span>{group.label}</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {group.slots.map((timeStr) => {
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
                            className="h-11 rounded-xl border border-white/15 bg-[#0D0D11] text-white hover:bg-white hover:text-black hover:border-white font-semibold text-sm transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                          >
                            {timeStr}
                          </button>
                        );
                      }

                      // Explicitly marked occupied / unavailable slot
                      return (
                        <button
                          key={timeStr}
                          disabled
                          aria-disabled="true"
                          title="This slot is occupied or unavailable"
                          className="h-11 rounded-xl border border-white/5 bg-[#08080A] text-[#52525B] font-normal text-xs transition-none flex items-center justify-center gap-1 cursor-not-allowed line-through opacity-40"
                        >
                          <LockKey size={12} weight="fill" />
                          <span>{timeStr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
