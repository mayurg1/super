import { useState } from 'react';
import { Button, Card } from '@supercampus/shared';
import type { MarketplaceStatus } from '@supercampus/supabase';

const STATUS_OPTIONS: { value: MarketplaceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
];

export interface ProductStatusControlProps {
  currentStatus: MarketplaceStatus;
  onStatusChange: (next: MarketplaceStatus) => Promise<boolean>;
}

/** Owner-only listing status controls (active → reserved → sold). */
export function ProductStatusControl({
  currentStatus,
  onStatusChange,
}: ProductStatusControlProps): React.ReactElement {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply(next: MarketplaceStatus): Promise<void> {
    if (next === currentStatus || pending) return;
    setPending(true);
    setError(null);
    const ok = await onStatusChange(next);
    setPending(false);
    if (!ok) setError('Could not update the listing status. Please try again.');
  }

  return (
    <Card padding="md" className="sc-product-status">
      <h3>Listing status</h3>
      <p className="sc-product-muted">Set whether this item is active, reserved, or sold.</p>
      <div className="sc-product-actions">
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={currentStatus === option.value ? 'primary' : 'outline'}
            size="sm"
            disabled={pending}
            onClick={() => void apply(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {error ? (
        <p className="sc-product-muted" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
