import { useState, useEffect } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { BookingEngine, type AvailableSlot } from '../lib/booking-store';
import { useTenant } from '../context/TenantContext';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';

interface SlotPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  options: ServiceOption[];
  masterId: string | null;
  onSelectSlot: (slot: AvailableSlot, dateStr: string) => void;
}

export function SlotPickerModal({
  open,
  onOpenChange,
  service,
  options,
  masterId,
  onSelectSlot,
}: SlotPickerModalProps) {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate next 14 days
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
          setSlots(res);
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

  if (!service) return null;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Выбор даты и времени"
      description={`Услуга: ${service.name}`}
    >
      <div className="space-y-5">
        {/* Date Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
              Дата записи
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {dateOptions.map((item) => {
              const isSelected = selectedDate === item.dateStr;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  style={{
                    backgroundColor: isSelected ? 'var(--tenant-accent)' : undefined,
                    color: isSelected ? '#0D0D11' : undefined,
                  }}
                  className={`flex flex-col items-center justify-center min-w-[62px] h-[72px] rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'font-bold shadow-lg'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
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
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
              Доступное время
            </span>
            <span className="text-[11px] text-neutral-500">
              Шаг 30 минут
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
          ) : slots.length === 0 ? (
            <div className="py-8 text-center px-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/60">
              <div className="text-sm font-medium text-neutral-300 mb-1">
                Нет свободных окон на этот день
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                Попробуйте выбрать другую дату или выберите опцию «Любой мастер».
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {slots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => {
                    onSelectSlot(slot, selectedDate);
                    onOpenChange(false);
                  }}
                  className="h-11 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-neutral-200 hover:text-white font-medium text-sm transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}
