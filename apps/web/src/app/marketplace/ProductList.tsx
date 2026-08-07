import { Button, EmptyState, Spinner } from '@supercampus/shared';
import { useMarketplace } from './MarketplaceContext';
import { ProductCard } from './ProductCard';

export function ProductList(): React.ReactElement {
  const { products, loading, loadingMore, error, hasMore, loadMore, refresh } = useMarketplace();

  if (loading) return <Spinner label="Loading marketplace" />;

  if (error && products.length === 0) {
    return (
      <EmptyState
        title="Couldn't load the marketplace"
        description={error}
        action={
          <Button variant="primary" onClick={() => void refresh()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (products.length === 0) {
    return <EmptyState title="Nothing listed yet" description="Be the first to list an item for your campus." />;
  }

  return (
    <div className="sc-marketplace-content">
      {error && <p className="sc-marketplace-inline-error">{error}</p>}
      <div className="sc-product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <Button variant="secondary" disabled={loadingMore} onClick={() => void loadMore()}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
