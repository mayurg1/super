import { Button, Card } from '@supercampus/shared';
import { Link } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
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
        <div className="sc-product-card-header-right">
          <span className="sc-product-status">{product.status}</span>
          <span className="sc-product-price">{formatPrice(product.price, product.currency)}</span>
        </div>
      </div>
      <p className="sc-product-condition">{product.condition.replace('_', ' ')}</p>
      <p className="sc-product-description">{product.description}</p>
      <footer className="sc-product-card-footer">
        <Link
          to={ROUTES.profile}
          className="sc-product-seller sc-product-seller-link"
          aria-label={`View ${product.seller.displayName}'s profile`}
        >
          {product.seller.displayName}
        </Link>
        <div className="sc-product-actions">
          <Link to={`${ROUTES.market}/shop/${product.id}`}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
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
