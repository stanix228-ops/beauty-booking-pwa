import { Clock, Plus, Check } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';
import { useTenant } from '../context/TenantContext';
import { formatPrice } from '../lib/currency';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  selectedOptions: ServiceOption[];
  onSelectService: (service: Service) => void;
  onOpenOptions: (service: Service) => void;
  hasOptions: boolean;
  currency?: string;
}

export function ServiceCard({
  service,
  isSelected,
  selectedOptions,
  onSelectService,
  onOpenOptions,
  hasOptions,
  currency,
}: ServiceCardProps) {
  const { tenant } = useTenant();
  const currentCurrency = currency || tenant?.currency || 'KZT';
  const optionsSum = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const optionsDuration = selectedOptions.reduce((sum, opt) => sum + opt.durationMin, 0);

  const displayPrice = isSelected ? service.price + optionsSum : service.price;
  const displayDuration = isSelected ? service.durationMin + optionsDuration : service.durationMin;

  return (
    <div
      onClick={() => onSelectService(service)}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer bg-[#0D0D11] ${
        isSelected
          ? 'border-white ring-1 ring-white/40 shadow-[0_0_24px_rgba(255,255,255,0.12)]'
          : 'border-white/12 hover:border-white/25 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.5)]'
      }`}
    >
      <div className="flex p-3.5 sm:p-4 gap-3.5 sm:gap-4">
        {/* Service Image (1:1 aspect ratio with rounded-2xl) */}
        {service.imageUrl && (
          <div className="relative aspect-square w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {isSelected && (
              <div className="absolute top-2 right-2 p-1 rounded-full bg-white text-black shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-white transition-colors leading-snug">
                {service.name}
              </h3>
            </div>

            {service.description && (
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-2 font-light">
                {service.description}
              </p>
            )}

            {/* Duration badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-white/5 text-neutral-300 border border-white/10">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{displayDuration} мин</span>
            </div>
          </div>

          <div className="pt-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-t border-white/10 mt-2">
            {/* Price Typography */}
            <div className="shrink-0 whitespace-nowrap">
              <span className="text-base sm:text-lg font-bold font-mono tracking-tight text-white whitespace-nowrap">
                {formatPrice(displayPrice, currentCurrency)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              {hasOptions && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenOptions(service);
                  }}
                  className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/15 transition-all flex items-center gap-1 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3 text-white" />
                  <span>Опции {selectedOptions.length > 0 && `(${selectedOptions.length})`}</span>
                </button>
              )}

              <button
                type="button"
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-[0_2px_14px_rgba(255,255,255,0.25)] scale-[1.02]'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 active:scale-95'
                }`}
              >
                {isSelected ? '✓ Выбрано' : 'Выбрать'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
