import { Star, Sparkles } from 'lucide-react';
import type { Master, Service } from '../../scripts/schema';

interface MasterPickerProps {
  masters: Master[];
  selectedService: Service | null;
  selectedMasterId: string | null;
  onSelectMaster: (masterId: string | null) => void;
}

export function MasterPicker({
  masters,
  selectedService,
  selectedMasterId,
  onSelectMaster,
}: MasterPickerProps) {
  // Filter eligible masters for selected service
  const eligibleMasters = selectedService
    ? masters.filter((m) => m.isActive && m.serviceIds.includes(selectedService.id))
    : masters.filter((m) => m.isActive);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">
          Специалист
        </h3>
        {selectedMasterId && (
          <button
            onClick={() => onSelectMaster(null)}
            className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
          >
            Выбрать любого
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* "Any master" card */}
        <div
          onClick={() => onSelectMaster(null)}
          style={{
            backgroundColor: 'var(--tenant-card)',
            borderColor: selectedMasterId === null ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
            selectedMasterId === null
              ? 'ring-1 ring-inset shadow-md shadow-amber-500/10'
              : 'hover:border-amber-400/40'
          }`}
        >
          <div
            style={{
              backgroundColor: 'rgba(212, 175, 55, 0.08)',
              borderColor: 'var(--tenant-card-border)',
            }}
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
          >
            <Sparkles className="w-6 h-6" style={{ color: 'var(--tenant-accent)' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--tenant-text)' }}>
              Любой мастер
            </div>
            <div className="text-xs" style={{ color: 'var(--tenant-muted)' }}>
              Сервер выберет ближайшее свободное окно
            </div>
          </div>
        </div>

        {/* Master cards */}
        {eligibleMasters.map((master) => {
          const isSelected = selectedMasterId === master.id;

          return (
            <div
              key={master.id}
              onClick={() => onSelectMaster(master.id)}
              style={{
                backgroundColor: 'var(--tenant-card)',
                borderColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                isSelected
                  ? 'ring-1 ring-inset shadow-md shadow-amber-500/10'
                  : 'hover:border-amber-400/40'
              }`}
            >
              {/* Avatar */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-800 border border-neutral-700/60">
                {master.avatarUrl ? (
                  <img
                    src={master.avatarUrl}
                    alt={master.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-neutral-300">
                    {master.name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-semibold text-neutral-100 truncate">
                    {master.name}
                  </h4>
                  <div className="flex items-center text-[11px] font-semibold text-amber-400 flex-shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    <span>{master.rating}</span>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 truncate">
                  {master.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
