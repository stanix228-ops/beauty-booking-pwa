import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Check, Clock } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';

interface ServiceOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  availableOptions: ServiceOption[];
  selectedOptions: ServiceOption[];
  onToggleOption: (option: ServiceOption) => void;
}

export function ServiceOptionsModal({
  open,
  onOpenChange,
  service,
  availableOptions,
  selectedOptions,
  onToggleOption,
}: ServiceOptionsModalProps) {
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
              style={{
                borderColor: isSelected ? 'var(--tenant-accent)' : undefined,
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-sm font-medium text-neutral-100 mb-0.5">
                  {opt.name}
                </div>
                {opt.description && (
                  <div className="text-xs text-neutral-400 leading-tight mb-1">
                    {opt.description}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-200">
                    +{opt.price.toLocaleString('ru-RU')} ₽
                  </span>
                  {opt.durationMin > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3" />
                      +{opt.durationMin} мин
                    </span>
                  )}
                </div>
              </div>

              {/* Checkbox indicator */}
              <div
                style={{
                  backgroundColor: isSelected ? 'var(--tenant-accent)' : 'transparent',
                  borderColor: isSelected ? 'var(--tenant-accent)' : 'rgba(255, 255, 255, 0.2)',
                }}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors flex-shrink-0`}
              >
                {isSelected && <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Готово
        </Button>
      </div>
    </BottomSheet>
  );
}
