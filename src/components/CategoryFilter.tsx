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
    <div className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 py-3 px-4">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-lg mx-auto">
        <button
          onClick={() => onSelectCategory(null)}
          style={{
            backgroundColor: selectedCategoryId === null ? 'var(--tenant-accent)' : undefined,
            color: selectedCategoryId === null ? '#0D0D11' : undefined,
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
            selectedCategoryId === null
              ? 'font-semibold shadow-md'
              : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
          }`}
        >
          Все услуги
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                backgroundColor: isSelected ? 'var(--tenant-accent)' : undefined,
                color: isSelected ? '#0D0D11' : undefined,
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'font-semibold shadow-md'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
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
