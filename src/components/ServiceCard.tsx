import { Clock, Plus, Check } from 'lucide-react';
import type { Service, ServiceOption } from '../../scripts/schema';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  selectedOptions: ServiceOption[];
  onSelectService: (service: Service) => void;
  onOpenOptions: (service: Service) => void;
  hasOptions: boolean;
}

export function ServiceCard({
  service,
  isSelected,
  selectedOptions,
  onSelectService,
  onOpenOptions,
  hasOptions,
}: ServiceCardProps) {
  const optionsSum = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
  const optionsDuration = selectedOptions.reduce((sum, opt) => sum + opt.durationMin, 0);

  const displayPrice = isSelected ? service.price + optionsSum : service.price;
  const displayDuration = isSelected ? service.durationMin + optionsDuration : service.durationMin;

  return (
    <div
      onClick={() => onSelectService(service)}
      style={{
        backgroundColor: 'var(--tenant-card)',
        borderColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
      }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'ring-2 shadow-lg shadow-black/40'
          : 'hover:border-amber-400/40'
      }`}
    >
      <div className="flex p-4 gap-4">
        {/* Service Image */}
        {service.imageUrl && (
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700/50">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {isSelected && (
              <div
                style={{ backgroundColor: 'var(--tenant-accent)' }}
                className="absolute top-1.5 right-1.5 p-1 rounded-full text-neutral-950 shadow-md"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold group-hover:text-white transition-colors leading-snug" style={{ color: 'var(--tenant-text)' }}>
                {service.name}
              </h3>
            </div>

            {service.description && (
              <p className="text-xs line-clamp-2 leading-relaxed mb-2" style={{ color: 'var(--tenant-muted)' }}>
                {service.description}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t mt-auto" style={{ borderColor: 'var(--tenant-card-border)' }}>
            {/* Price & Duration */}
            <div>
              <div className="text-base font-bold tracking-tight" style={{ color: 'var(--tenant-text)' }}>
                {displayPrice.toLocaleString('ru-RU')} ₽
              </div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--tenant-muted)' }}>
                <Clock className="w-3 h-3" />
                <span>{displayDuration} мин</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {hasOptions && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenOptions(service);
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'var(--tenant-card-border)',
                    color: 'var(--tenant-text)',
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:border-amber-400/30 border transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Опции {selectedOptions.length > 0 && `(${selectedOptions.length})`}</span>
                </button>
              )}

              <button
                type="button"
                style={{
                  backgroundColor: isSelected ? 'var(--tenant-accent)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
                  color: isSelected ? '#0D0D11' : 'var(--tenant-text)',
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'shadow-md shadow-amber-500/20'
                    : 'hover:border-amber-400/30'
                }`}
              >
                {isSelected ? 'Выбрано' : 'Выбрать'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
