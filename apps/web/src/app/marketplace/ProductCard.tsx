import { Button, Card } from '@supercampus/shared';
import { useAuth, type MarketplaceProduct } from '@supercampus/supabase';
import { useMarketplace } from './MarketplaceContext';

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

export function ProductCard({ product }: { product: MarketplaceProduct }): React.ReactElement {
  const { user } = useAuth();
  const { toggleFavorite, deleteProduct, pendingFavoriteIds } = useMarketplace();
  const isOwner = user?.id === product.sellerId;
  const isPending = pendingFavoriteIds.has(product.id);

  return (
    <Card padding="md" className="sc-product-card">
      <div className="sc-product-card-header">
        <h3>{product.title}</h3>
        <span className="sc-product-price">{formatPrice(product.price, product.currency)}</span>
      </div>
      <p className="sc-product-condition">{product.condition.replace('_', ' ')}</p>
      <p className="sc-product-description">{product.description}</p>
      <footer className="sc-product-card-footer">
        <span className="sc-product-seller">{product.seller.displayName}</span>
        <div className="sc-product-actions">
          <Button
            variant={product.favoritedByMe ? 'primary' : 'outline'}
            size="sm"
            disabled={isPending}
            onClick={() => void toggleFavorite(product.id)}
          >
            {product.favoritedByMe ? 'Saved' : 'Save'} ({product.favoriteCount})
          </Button>
          {isOwner && (
            <Button variant="ghost" size="sm" onClick={() => void deleteProduct(product.id)}>
              Remove
            </Button>
          )}
        </div>
      </footer>
    </Card>
  );
}
