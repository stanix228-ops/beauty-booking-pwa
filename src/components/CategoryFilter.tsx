import { useTenant } from '../context/TenantContext';

interface CategoryFilterProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryFilter({ selectedCategoryId, onSelectCategory }: CategoryFilterProps) {
  const { tenant } = useTenant();
  if (!tenant) return null;

  const categories = [...tenant.categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div
      className="sticky top-0 z-20 backdrop-blur-2xl border-b border-white/10 py-3 px-4 bg-[#050507]/85"
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
            selectedCategoryId === null
              ? 'bg-white text-black font-semibold border-white shadow-[0_2px_14px_rgba(255,255,255,0.25)] scale-[1.02]'
              : 'bg-[#0D0D11] text-[#8E8E93] hover:text-white border-white/10 hover:border-white/25 font-medium'
          }`}
        >
          All Services
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-white text-black font-semibold border-white shadow-[0_2px_14px_rgba(255,255,255,0.25)] scale-[1.02]'
                  : 'bg-[#0D0D11] text-[#8E8E93] hover:text-white border-white/10 hover:border-white/25 font-medium'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
