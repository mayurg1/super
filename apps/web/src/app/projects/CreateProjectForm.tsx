import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import { useProjects } from './ProjectsContext';

const CATEGORIES = ['team', 'solo', 'research', 'hackathon', 'other'];

export function CreateProjectForm(): React.ReactElement | null {
  const { createProject } = useProjects();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('team');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return <Button variant="primary" onClick={() => setOpen(true)}>Start a project</Button>;

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const result = await createProject({ ownerId: '', title, summary, body, category }); // ownerId filled by provider
    setSubmitting(false);
    if (result) { setTitle(''); setSummary(''); setBody(''); setCategory('team'); setOpen(false); }
  }

  return (
    <Card padding="md" className="sc-project-create">
      <h3>Start a project</h3>
      <form onSubmit={submit}>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        <label className="sc-field"><span>Description</span><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} /></label>
        <label className="sc-field"><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
        <div className="sc-marketplace-form-actions">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
        </div>
      </form>
    </Card>
  );
}