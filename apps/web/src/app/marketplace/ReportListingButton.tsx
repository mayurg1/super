import { useEffect, useState } from 'react';
import { Button, Card } from '@supercampus/shared';
import { useMarketplace } from './MarketplaceContext';

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'prohibited', label: 'Prohibited item' },
  { value: 'scam', label: 'Suspected scam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'other', label: 'Other' },
];

export interface ReportListingButtonProps {
  productId: string;
  isOwner: boolean;
}

/** Report a listing (non-owners only). Reuses the existing reportProduct service via the provider. */
export function ReportListingButton({ productId, isOwner }: ReportListingButtonProps): React.ReactElement | null {
  const { reportProduct, hasReported } = useMarketplace();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (isOwner) return;
    void hasReported(productId).then((already) => {
      if (active) setReported(already);
    });
    return () => {
      active = false;
    };
  }, [hasReported, isOwner, productId]);

  if (isOwner) return null;

  if (reported) {
    return (
      <p className="sc-product-muted" role="status">
        ✓ You reported this listing. We will review it shortly.
      </p>
    );
  }

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!reason) {
      setError('Please select a reason for reporting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    // The schema stores a single `reason` text; include the optional description for full context.
    const description = details.trim();
    const finalReason = description ? `${reason} — ${description}` : reason;
    const ok = await reportProduct(productId, finalReason);
    setSubmitting(false);
    if (!ok) {
      setError(
        'Your report could not be submitted. If you already reported this listing, thank you for your input.',
      );
      return;
    }
    setReported(true);
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        ⚠️ Report
      </Button>
    );
  }

  return (
    <Card padding="md" className="sc-product-report">
      <h3>Report listing</h3>
      <form onSubmit={submit}>
        <label className="sc-field">
          <span className="sc-field-label">Reason</span>
          <select value={reason} onChange={(event) => setReason(event.target.value)} required>
            <option value="">Select a reason…</option>
            {REPORT_REASONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="sc-field">
          <span className="sc-field-label">Additional details (optional)</span>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} rows={3} />
        </label>
        {error ? (
          <p className="sc-product-muted" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sc-product-actions">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
