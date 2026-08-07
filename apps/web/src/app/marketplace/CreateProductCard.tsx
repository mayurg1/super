import { useState } from 'react';
import { useHasPermission } from '@supercampus/supabase';
import { Button, Card, Input } from '@supercampus/shared';
import { useMarketplace } from './MarketplaceContext';

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export function CreateProductCard(): React.ReactElement | null {
  const canSell = useHasPermission('marketplace.create');
  const { categories, createProduct } = useMarketplace();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('good');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!canSell) return null;

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!title.trim() || !Number.isFinite(parsedPrice)) return;
    setSubmitting(true);
    const ok = await createProduct({
      title,
      description,
      condition,
      price: parsedPrice,
      categoryId: categoryId || null,
    });
    setSubmitting(false);
    if (ok) {
      setTitle('');
      setDescription('');
      setCondition('good');
      setPrice('');
      setCategoryId('');
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <Card padding="md" className="sc-marketplace-composer-trigger">
        <Button variant="primary" onClick={() => setOpen(true)}>
          List an item
        </Button>
      </Card>
    );
  }

  return (
    <Card padding="md" className="sc-marketplace-composer">
      <form onSubmit={handleSubmit} className="sc-marketplace-form">
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <label className="sc-field">
          <span>Description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
        </label>
        <div className="sc-marketplace-form-row">
          <label className="sc-field">
            <span>Condition</span>
            <select value={condition} onChange={(event) => setCondition(event.target.value)}>
              {CONDITIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </div>
        {categories.length > 0 && (
          <label className="sc-field">
            <span>Category</span>
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="sc-marketplace-form-actions">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish listing'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
