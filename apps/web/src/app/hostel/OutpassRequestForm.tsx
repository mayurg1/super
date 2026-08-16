import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import { useHostel } from './HostelContext';

export function OutpassRequestForm(): React.ReactElement {
  const { createOutpass } = useHostel();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [departAt, setDepartAt] = useState('');
  const [returnAt, setReturnAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        🚪 Request an outpass
      </Button>
    );
  }

  function reset(): void {
    setDestination('');
    setReason('');
    setDepartAt('');
    setReturnAt('');
    setError(null);
  }

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (submitting) return;
    if (!destination.trim() || !reason.trim()) {
      setError('Please fill in the destination and reason.');
      return;
    }
    if (!departAt || !returnAt) {
      setError('Please pick both departure and return times.');
      return;
    }
    if (new Date(returnAt).getTime() <= new Date(departAt).getTime()) {
      setError('Return time must be after the departure time.');
      return;
    }
    setSubmitting(true);
    const ok = await createOutpass({ destination, reason, departAt, returnAt });
    setSubmitting(false);
    if (ok) reset();
    else setError('The request could not be submitted. Please try again.');
  }

  return (
    <Card padding="md">
      <h3>Request an outpass</h3>
      <p className="sc-muted">Approval is handled by hostel staff. You will see the status here.</p>
      <form className="sc-hostel-form" onSubmit={submit}>
        <Input
          label="Destination"
          placeholder="Where are you heading?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <Input
          label="Reason"
          placeholder="Short reason for the leave"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <Input
          label="Departure time"
          type="datetime-local"
          value={departAt}
          onChange={(e) => setDepartAt(e.target.value)}
          required
        />
        <Input
          label="Return time"
          type="datetime-local"
          value={returnAt}
          onChange={(e) => setReturnAt(e.target.value)}
          required
        />
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
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </form>
    </Card>
  );
}