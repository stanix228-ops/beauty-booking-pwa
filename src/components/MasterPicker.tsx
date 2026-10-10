import { Star, Sparkles } from 'lucide-react';
import type { Master, Service } from '../../scripts/schema';
import { getAssetUrl } from '../lib/assets';

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
        <div>
          <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Специалист
          </h3>
          <p className="text-xs text-[#8E8E93]">Выберите мастера или доверьте подбор студии</p>
        </div>
        {selectedMasterId && (
          <button
            onClick={() => onSelectMaster(null)}
            className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
          >
            Сбросить выбор
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* "Any master" card */}
        <div
          onClick={() => onSelectMaster(null)}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 bg-[#0D0D11] ${
            selectedMasterId === null
              ? 'border-white ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]'
              : 'border-white/10 hover:border-white/25'
          }`}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 bg-white/5">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Любой мастер
            </div>
            <div className="text-xs text-[#8E8E93]">
              Сервер выберет ближайшее свободное окно
            </div>
          </div>
        </div>

        {/* Master cards */}
        {eligibleMasters.map((master) => {
          const isSelected = selectedMasterId === master.id;
          const isTopMaster = (master.rating || 0) >= 4.9;

          return (
            <div
              key={master.id}
              onClick={() => onSelectMaster(master.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 bg-[#0D0D11] ${
                isSelected
                  ? 'border-white ring-1 ring-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Avatar */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10">
                {master.avatarUrl ? (
                  <img
                    src={getAssetUrl(master.avatarUrl)}
                    alt={master.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                    {master.name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {master.name}
                  </h4>
                  {isTopMaster && (
                    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white text-black flex-shrink-0">
                      TOP MASTER
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#8E8E93] truncate">
                    {master.title}
                  </span>
                  <div className="flex items-center text-[11px] font-semibold text-white flex-shrink-0">
                    <Star className="w-3 h-3 fill-white text-white mr-1" />
                    <span>{master.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
