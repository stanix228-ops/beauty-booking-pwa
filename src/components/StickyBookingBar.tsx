import { ArrowRight } from 'lucide-react';
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
    return null;
  }

  const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const totalPrice = selectedService.price + optionsTotal;
  const optionsDuration = selectedOptions.reduce((sum, opt) => sum + opt.durationMin, 0);
  const totalDuration = selectedService.durationMin + optionsDuration;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#0D0D11]/95 backdrop-blur-2xl border-t border-white/10 safe-bottom shadow-[0_-10px_35px_rgba(0,0,0,0.8)]"
    >
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#8E8E93] truncate">
            {selectedService.name}
            {selectedOptions.length > 0 && ` (+${selectedOptions.length} опц.)`}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              {totalPrice.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-xs text-[#8E8E93] font-medium">
              ~{totalDuration} мин
            </span>
          </div>
        </div>

        {/* Action CTA */}
        <button
          onClick={onOpenSlotPicker}
          className="h-12 px-6 rounded-2xl font-bold text-sm flex items-center gap-2 bg-white text-black shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer flex-shrink-0"
        >
          <span>Выбрать время</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
