import { useState } from 'react';
import { Button, Card } from '@supercampus/shared';
import { useHostel } from './HostelContext';

const CATEGORIES = [
  'plumbing',
  'electrical',
  'cleaning',
  'internet',
  'noise',
  'maintenance',
  'security',
  'other',
] as const;

export function ComplaintForm(): React.ReactElement {
  const { createComplaint } = useHostel();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        📢 Lodge a complaint
      </Button>
    );
  }

  function reset(): void {
    setCategory(CATEGORIES[0]);
    setDescription('');
    setError(null);
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    if (!description.trim()) {
      setError('Please describe the issue you are facing.');
      return;
    }
    setSubmitting(true);
    const ok = await createComplaint({ category, description });
    setSubmitting(false);
    if (ok) reset();
    else setError('The complaint could not be submitted. Please try again.');
  }

  return (
    <Card padding="md">
      <h3>Lodge a complaint</h3>
      <p className="sc-muted">Hostel staff will review it. Room selection is not available yet — add the room number in the description.</p>
      <form className="sc-hostel-form" onSubmit={submit}>
        <label className="sc-field">
          <span className="sc-field-label">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="sc-field">
          <span className="sc-field-label">Description</span>
          <textarea
            className="sc-input sc-hostel-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. Fan in room 204 is not working since yesterday."
            required
          />
        </label>
        {error ? (
          <p className="sc-field-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="sc-marketplace-form-actions">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit complaint'}
          </Button>
        </div>
      </form>
    </Card>
  );
}