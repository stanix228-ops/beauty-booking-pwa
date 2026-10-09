import { BottomSheet } from './ui/BottomSheet';
import { Check, Clock } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';
import { useTenant } from '../context/TenantContext';
import { formatPrice } from '../lib/currency';

interface ServiceOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  availableOptions: ServiceOption[];
  selectedOptions: ServiceOption[];
  onToggleOption: (option: ServiceOption) => void;
  onConfirm?: () => void;
  currency?: string;
}

export function ServiceOptionsModal({
  open,
  onOpenChange,
  service,
  availableOptions,
  selectedOptions,
  onToggleOption,
  onConfirm,
  currency,
}: ServiceOptionsModalProps) {
  const { tenant } = useTenant();
  const currentCurrency = currency || tenant?.currency || 'KZT';
  if (!service) return null;

  const selectedIds = new Set(selectedOptions.map((o) => o.id));

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Дополнительные опции"
      description={`Настройте услугу «${service.name}»`}
    >
      <div className="space-y-3 mt-1">
        {availableOptions.map((opt) => {
          const isSelected = selectedIds.has(opt.id);

          return (
            <div
              key={opt.id}
              onClick={() => onToggleOption(opt)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer bg-[#0D0D11] ${
                isSelected
                  ? 'border-white ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-sm font-medium mb-0.5 text-white">
                  {opt.name}
                </div>
                {opt.description && (
                  <div className="text-xs leading-tight mb-1 text-[#8E8E93]">
                    {opt.description}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-[#8E8E93]">
                  <span className="font-semibold text-white">
                    +{formatPrice(opt.price, currentCurrency)}
                  </span>
                  {opt.durationMin > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[#8E8E93]">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      +{opt.durationMin} мин
                    </span>
                  )}
                </div>
              </div>

              {/* Checkbox indicator */}
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${
                  isSelected
                    ? 'bg-white border-white text-black'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="w-full h-12 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-100 shadow-[0_4px_25px_rgba(255,255,255,0.25)] transition-all cursor-pointer"
          onClick={() => {
            if (onConfirm) onConfirm();
            else onOpenChange(false);
          }}
        >
          Готово ({selectedOptions.length})
        </button>
      </div>
    </BottomSheet>
  );
}
