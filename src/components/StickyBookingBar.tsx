import { ArrowRight, Sparkles } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';

interface StickyBookingBarProps {
  selectedService: Service | null;
  selectedOptions: ServiceOption[];
  onOpenSlotPicker: () => void;
}

export function StickyBookingBar({
  selectedService,
  selectedOptions,
  onOpenSlotPicker,
}: StickyBookingBarProps) {
  if (!selectedService) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-xs text-neutral-400 py-1">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--tenant-accent)' }} />
          <span>Выберите услугу для онлайн-записи</span>
        </div>
      </div>
    );
  }

  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = selectedService.price + optionsTotal;
  const optionsDuration = selectedOptions.reduce((sum, opt) => sum + opt.durationMin, 0);
  const totalDuration = selectedService.durationMin + optionsDuration;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/90 safe-bottom shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-neutral-400 truncate">
            {selectedService.name}
            {selectedOptions.length > 0 && ` (+${selectedOptions.length} опц.)`}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-100 tracking-tight">
              {totalPrice.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              ~{totalDuration} мин
            </span>
          </div>
        </div>

        {/* Action CTA */}
        <button
          onClick={onOpenSlotPicker}
          style={{
            backgroundColor: 'var(--tenant-accent)',
            color: '#0D0D11',
          }}
          className="h-12 px-5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/30 hover:brightness-105 active:scale-95 transition-all cursor-pointer flex-shrink-0"
        >
          <span>Выбрать время</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
