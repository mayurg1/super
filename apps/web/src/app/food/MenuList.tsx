import { Spinner } from '@supercampus/shared';
import { useFood } from './FoodContext';
import { MenuItemCard } from './MenuItemCard';

export function MenuList(): React.ReactElement {
  const { menu, menuLoading, menuRefreshing, menuError, refreshMenu, retryMenu } = useFood();

    if (menuLoading) {
    return (
      <div className="sc-food-menu">
        <Spinner label="Loading menu" />
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="sc-food-error" role="alert">
        <p className="sc-food-subtle">{menuError}</p>
        <button className="sc-link" type="button" onClick={() => void retryMenu()}>
          Try again
        </button>
      </div>
    );
  }

  if (!menu) return <p className="sc-food-subtle">Select a vendor to see their menu.</p>;

  return (
    <section className="sc-food-menu" aria-labelledby="food-menu-title">
      <header className="sc-food-menu-head">
        <h2 id="food-menu-title">Menu</h2>
        <button
          type="button"
          className="sc-link"
          disabled={menuRefreshing}
          aria-busy={menuRefreshing}
          onClick={() => void refreshMenu()}
        >
          {menuRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>
      {menu.categories.map((category) => {
        const items = menu.items.filter((item) => item.categoryId === category.id);
        if (!category.isActive || items.length === 0) return null;
        return (
          <div key={category.id} className="sc-food-category">
            <h3 className="sc-food-category-title">{category.name}</h3>
            <div className="sc-food-grid">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
      {menu.items.filter((item) => !item.categoryId).length > 0 && (
        <div className="sc-food-category">
          <h3 className="sc-food-category-title">Other</h3>
          <div className="sc-food-grid">
            {menu.items
              .filter((item) => !item.categoryId)
              .map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
          </div>
        </div>
      )}
      {menu.items.length === 0 && <p className="sc-food-subtle">This menu has no items right now.</p>}
    </section>
  );
}
