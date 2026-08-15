import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROUTES } from '@supercampus/core';
import { Button, Card, EmptyState, Spinner } from '@supercampus/shared';
import { useAuth, type MarketplaceProduct, type MarketplaceStatus } from '@supercampus/supabase';
import { MarketplaceProvider } from './MarketplaceProvider';
import { useMarketplace } from './MarketplaceContext';
import { ProductStatusControl } from './ProductStatusControl';
import { ReportListingButton } from './ReportListingButton';

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

function ProductDetailContent(): React.ReactElement {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const { getProduct, toggleFavorite, updateProduct, getMediaUrls, pendingFavoriteIds } = useMarketplace();
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    if (!productId) {
      setError('No listing was specified.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    void getProduct(productId).then((result) => {
      if (!active) return;
      setLoading(false);
      if (!result) setError('This listing could not be loaded or is no longer available.');
      else setProduct(result);
    });
    return () => {
      active = false;
    };
  }, [getProduct, productId]);

  useEffect(() => {
    if (!product) return;
    let active = true;
    void getMediaUrls(product.media.map((media) => media.assetId)).then((urls) => {
      if (active) setMediaUrls(urls);
    });
    return () => {
      active = false;
    };
  }, [getMediaUrls, product]);

  const changeStatus = useCallback(
    async (next: MarketplaceStatus): Promise<boolean> => {
      if (!product || product.status === next) return true;
      const previous = product.status;
      // Optimistic update: reflect the change immediately, reconcile with the server after.
      setProduct({ ...product, status: next });
      const ok = await updateProduct(product.id, { status: next });
      if (!ok) {
        setProduct((current) => (current ? { ...current, status: previous } : current));
        return false;
      }
      void getProduct(product.id).then((fresh) => {
        if (fresh) setProduct(fresh);
      });
      return true;
    },
    [getProduct, product, updateProduct],
  );

  if (loading) return <Spinner label="Loading listing" />;

  if (error || !product) {
    return (
      <EmptyState
        icon="🛍️"
        title="Listing unavailable"
        description={error ?? 'This listing could not be found.'}
        action={
          <Link to={{ pathname: ROUTES.market, search: '?tab=buysell' }}>
            <Button variant="outline">Back to Market</Button>
          </Link>
        }
      />
    );
  }

  const isOwner = user?.id === product.sellerId;
  const isPending = pendingFavoriteIds.has(product.id);

  return (
    <section className="sc-marketplace" aria-labelledby="product-detail-title">
      <p className="sc-product-back">
        <Link to={{ pathname: ROUTES.market, search: '?tab=buysell' }}>← Back to Market</Link>
      </p>
      <header className="sc-marketplace-heading">
        <h1 id="product-detail-title">{product.title}</h1>
        <span className="sc-product-status">{product.status}</span>
      </header>
      <Card padding="lg" className="sc-product-detail-card">
        <div className="sc-product-price">{formatPrice(product.price, product.currency)}</div>
        <p className="sc-product-condition">{product.condition.replace('_', ' ')}</p>
        <p className="sc-product-description">{product.description}</p>
        {product.media.length > 0 ? (
          <div className="sc-product-media">
            {product.media.map((media) => {
              const url = mediaUrls[media.assetId];
              return url ? (
                <img key={media.id} src={url} alt={product.title} className="sc-product-thumb" />
              ) : null;
            })}
          </div>
        ) : null}
        <footer className="sc-product-card-footer">
          <Link
            to={ROUTES.profile}
            className="sc-product-seller sc-product-seller-link"
            aria-label={`View ${product.seller.displayName}'s profile`}
          >
            {product.seller.displayName} (@{product.seller.handle})
          </Link>
          <div className="sc-product-actions">
            {isOwner ? (
              <span className="sc-product-muted">You listed this item</span>
            ) : (
              <Button
                variant={product.favoritedByMe ? 'primary' : 'outline'}
                size="sm"
                disabled={isPending}
                onClick={() => void toggleFavorite(product.id)}
              >
                {product.favoritedByMe ? 'Saved' : 'Save'} ({product.favoriteCount})
              </Button>
            )}
          </div>
        </footer>
      </Card>
      {isOwner ? (
        <ProductStatusControl currentStatus={product.status} onStatusChange={changeStatus} />
      ) : null}
      {!isOwner ? <ReportListingButton productId={product.id} isOwner={isOwner} /> : null}
      {!isOwner && !product.media.length && product.status === 'sold' ? (
        <p className="sc-product-muted">This item has been sold.</p>
      ) : null}
    </section>
  );
}

export function ProductDetailPage(): React.ReactElement {
  return (
    <MarketplaceProvider>
      <ProductDetailContent />
    </MarketplaceProvider>
  );
}
