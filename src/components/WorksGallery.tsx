import React from 'react';
import { useTenant } from '../context/TenantContext';
import { getAssetUrl } from '../lib/assets';
import { Camera } from '@phosphor-icons/react';

export const WorksGallery: React.FC = () => {
  const { tenant } = useTenant();
  if (!tenant) return null;

  const items = tenant.assets?.galleryItems && tenant.assets.galleryItems.length > 0
    ? tenant.assets.galleryItems
    : (tenant.assets?.gallery || []).map((url, idx) => ({
        id: `legacy-${idx}`,
        imageUrl: url,
        caption: `Работа студии #${idx + 1}`,
        displayOrder: idx,
      }));

  if (items.length === 0) return null;

  return (
    <section className="reveal-section px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Camera size={20} weight="bold" className="text-white" />
          <h3 className="text-lg font-serif font-bold text-white tracking-tight">
            Примеры работ студии
          </h3>
        </div>
        <span className="text-xs text-[#8E8E93]">
          {items.length} фото
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0D11] shadow-lg transition-all hover:border-white/25"
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={getAssetUrl(item.imageUrl)}
                alt={item.caption}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-2.5 bg-black/70 backdrop-blur-md border-t border-white/10">
              <p className="text-xs font-medium text-white truncate">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
