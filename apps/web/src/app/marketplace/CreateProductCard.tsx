import { useRef, useState } from 'react';
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

const MAX_IMAGES = 4;

export function CreateProductCard(): React.ReactElement | null {
  const canSell = useHasPermission('marketplace.create');
  const { categories, createProduct, uploadProductImages } = useMarketplace();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('good');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!canSell) return null;

  function addFiles(selected: FileList | null): void {
    if (!selected) return;
    const next = [...files];
    const nextPreviews = [...previews];
    const allowed = Array.from(selected).slice(0, MAX_IMAGES - files.length);
    allowed.forEach((file) => {
      next.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    });
    setFiles(next);
    setPreviews(nextPreviews);
    setUploadError(files.length + allowed.length >= MAX_IMAGES ? `You can add up to ${MAX_IMAGES} images.` : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number): void {
    URL.revokeObjectURL(previews[index] ?? '');
    setFiles((current) => current.filter((_, i) => i !== index));
    setPreviews((current) => current.filter((_, i) => i !== index));
    setUploadError(null);
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    const parsedPrice = Number(price);
    if (!title.trim() || !Number.isFinite(parsedPrice)) return;
    setSubmitting(true);
    setUploadError(null);
    let media: { assetId: string }[] | undefined;
    if (files.length > 0) {
      const assetIds = await uploadProductImages(files);
      if (assetIds === null) {
        setSubmitting(false);
        setUploadError('Your images could not be uploaded. Please try again.');
        return;
      }
      media = assetIds.map((assetId) => ({ assetId }));
    }
    const ok = await createProduct({
      title,
      description,
      condition,
      price: parsedPrice,
      categoryId: categoryId || null,
      media,
    });
    setSubmitting(false);
    if (ok) {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
      setTitle('');
      setDescription('');
      setCondition('good');
      setPrice('');
      setCategoryId('');
      setFiles([]);
      setPreviews([]);
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
        <label className="sc-field">
          <span>Photos (optional, up to {MAX_IMAGES})</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={submitting || files.length >= MAX_IMAGES}
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>
        {previews.length > 0 ? (
          <div className="sc-product-media">
            {previews.map((preview, index) => (
              <div key={preview} className="sc-product-thumb-wrap">
                <img src={preview} alt={`Preview ${index + 1}`} className="sc-product-thumb" />
                <button
                  type="button"
                  className="sc-product-thumb-remove"
                  aria-label="Remove image"
                  onClick={() => removeImage(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {uploadError ? (
          <p className="sc-product-muted" role="alert">
            {uploadError}
          </p>
        ) : null}
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
