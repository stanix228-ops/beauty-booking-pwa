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
      style={{
        backgroundColor: 'rgba(13, 13, 17, 0.94)',
        borderColor: 'var(--tenant-card-border)',
      }}
      className="sticky top-0 z-20 backdrop-blur-md border-b py-3 px-4"
    >
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-lg mx-auto">
        <button
          onClick={() => onSelectCategory(null)}
          style={{
            backgroundColor: selectedCategoryId === null ? 'var(--tenant-accent)' : 'var(--tenant-card)',
            borderColor: selectedCategoryId === null ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
            color: selectedCategoryId === null ? '#0D0D11' : 'var(--tenant-text)',
          }}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer border ${
            selectedCategoryId === null
              ? 'font-bold shadow-md shadow-amber-500/20'
              : 'hover:border-amber-400/40'
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
                backgroundColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card)',
                borderColor: isSelected ? 'var(--tenant-accent)' : 'var(--tenant-card-border)',
                color: isSelected ? '#0D0D11' : 'var(--tenant-text)',
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer border ${
                isSelected
                  ? 'font-bold shadow-md shadow-amber-500/20'
                  : 'hover:border-amber-400/40'
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
