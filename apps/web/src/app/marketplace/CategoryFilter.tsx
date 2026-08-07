import { useMarketplace } from './MarketplaceContext';

export function CategoryFilter(): React.ReactElement | null {
  const { categories, activeCategoryId, setCategory } = useMarketplace();
  if (categories.length === 0) return null;

  return (
    <div className="sc-marketplace-categories" role="tablist" aria-label="Filter by category">
      <button
        type="button"
        className={activeCategoryId === null ? 'sc-chip sc-chip-active' : 'sc-chip'}
        aria-pressed={activeCategoryId === null}
        onClick={() => setCategory(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={activeCategoryId === category.id ? 'sc-chip sc-chip-active' : 'sc-chip'}
          aria-pressed={activeCategoryId === category.id}
          onClick={() => setCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
