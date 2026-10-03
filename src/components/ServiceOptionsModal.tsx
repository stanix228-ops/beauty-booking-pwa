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
  onConfirm?: () => void;
}

export function ServiceOptionsModal({
  open,
  onOpenChange,
  service,
  availableOptions,
  selectedOptions,
  onToggleOption,
  onConfirm,
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
                backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.08)' : 'var(--tenant-card)',
                borderColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
              }}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'shadow-sm ring-1 ring-amber-500/20'
                  : 'hover:border-amber-400/40'
              }`}
            >
              <div className="flex-1 min-w-0 pr-3">
                <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--tenant-text)' }}>
                  {opt.name}
                </div>
                {opt.description && (
                  <div className="text-xs leading-tight mb-1" style={{ color: 'var(--tenant-muted)' }}>
                    {opt.description}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--tenant-muted)' }}>
                  <span className="font-semibold" style={{ color: 'var(--tenant-accent-secondary, #F5EBE0)' }}>
                    +{opt.price.toLocaleString('ru-RU')} ₽
                  </span>
                  {opt.durationMin > 0 && (
                    <span className="flex items-center gap-1 text-[11px]">
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
                  borderColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
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
          className="w-full font-bold shadow-lg shadow-amber-500/20"
          style={{
            backgroundColor: 'var(--tenant-accent)',
            color: '#0D0D11',
          }}
          onClick={() => {
            if (onConfirm) onConfirm();
            else onOpenChange(false);
          }}
        >
          Готово ({selectedOptions.length})
        </Button>
      </div>
    </BottomSheet>
  );
}
