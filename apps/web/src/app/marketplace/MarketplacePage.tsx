import { MarketplaceProvider } from './MarketplaceProvider';
import { CreateProductCard } from './CreateProductCard';
import { CategoryFilter } from './CategoryFilter';
import { ProductList } from './ProductList';

function MarketplaceContent(): React.ReactElement {
  console.log('MarketplaceContent rendered'); // TEMP TASK2
  return (
    <section className="sc-marketplace" aria-labelledby="marketplace-title">
      <header className="sc-marketplace-heading">
        <div>
          <h1 id="marketplace-title">Marketplace</h1>
          <p>Buy and sell with your campus community.</p>
        </div>
      </header>
      <CreateProductCard />
      <CategoryFilter />
      <ProductList />
    </section>
  );
}

export function MarketplacePage(): React.ReactElement {
  console.log('MarketplacePage rendered'); // TEMP TASK2
  return (
    <MarketplaceProvider>
      <MarketplaceContent />
    </MarketplaceProvider>
  );
}
