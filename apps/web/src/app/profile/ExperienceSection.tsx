import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import type { ProfileExperience, ProfileExperienceInput } from '@supercampus/supabase';
import { formatDateRange } from './profileUtils';

export interface ExperienceSectionProps {
  items: ProfileExperience[];
  onAdd: (input: ProfileExperienceInput) => Promise<boolean>;
  onUpdate: (id: string, input: ProfileExperienceInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function ExperienceForm({
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  initial?: ProfileExperience;
  onSubmit: (input: ProfileExperienceInput) => Promise<boolean>;
  onCancel: () => void;
  saving: boolean;
}): React.ReactElement {
  const [employer, setEmployer] = useState(initial?.employer ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [startedOn, setStartedOn] = useState(initial?.started_on ?? '');
  const [endedOn, setEndedOn] = useState(initial?.ended_on ?? '');
  const [isCurrent, setIsCurrent] = useState(initial?.is_current ?? false);
  const [visibility, setVisibility] = useState(initial?.visibility ?? 'public');
  const valid = employer.trim() !== '' && title.trim() !== '';
  return (
    <form
      className="sc-profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) void onSubmit({
          employer: employer.trim(),
          title: title.trim(),
          started_on: startedOn || null,
          ended_on: isCurrent ? null : (endedOn || null),
          is_current: isCurrent,
          visibility,
        });
      }}
    >
      <div className="sc-profile-form-grid">
        <Input label="Employer" value={employer} onChange={(e) => setEmployer(e.target.value)} placeholder="e.g. Google" />
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Software Engineer Intern" />
        <Input label="Start year" type="date" value={startedOn} onChange={(e) => setStartedOn(e.target.value)} />
        <Input label="End year" type="date" value={endedOn} onChange={(e) => setEndedOn(e.target.value)} disabled={isCurrent} />
        <label className="sc-field">
          <span className="sc-field-label">I currently work here</span>
          <input type="checkbox" className="sc-input-check" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
        </label>
        <label className="sc-field">
          <span className="sc-field-label">Visibility</span>
          <select className="sc-input" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="public">Public</option>
            <option value="campus">Campus only</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>
      <div className="sc-profile-form-actions">
        <Button type="submit" size="sm" disabled={!valid || saving}>{saving ? 'Saving…' : initial ? 'Save' : 'Add'}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function ExperienceSection({ items, onAdd, onUpdate, onDelete }: ExperienceSectionProps): React.ReactElement {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (id: string | null, input: ProfileExperienceInput): Promise<boolean> => {
    setSaving(true);
    const ok = id ? await onUpdate(id, input) : await onAdd(input);
    setSaving(false);
    if (ok) { setEditingId(null); setShowAdd(false); }
    return ok;
  };

  return (
    <Card className="sc-profile-section">
      <div className="sc-profile-section-head">
        <h3>💼 Experience</h3>
        <Button type="button" size="sm" variant="outline" onClick={() => { setShowAdd((v) => !v); setEditingId(null); }}>+ Add</Button>
      </div>
      {showAdd ? (
        <ExperienceForm key="new" onCancel={() => setShowAdd(false)} onSubmit={(input) => submit(null, input)} saving={saving} />
      ) : null}
      {items.length === 0 && !showAdd ? (
        <p className="sc-profile-empty">No work experience added yet.</p>
      ) : (
        <ul className="sc-profile-timeline">
          {items.map((exp) => (
            <li key={exp.id} className="sc-profile-timeline-item">
              {editingId === exp.id ? (
                <ExperienceForm
                  key={exp.id}
                  initial={exp}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(input) => submit(exp.id, input)}
                  saving={saving}
                />
              ) : (
                <div className="sc-profile-timeline-row">
                  <div>
                    <strong>{exp.title}</strong>
                    <div className="sc-profile-timeline-meta">{exp.employer} · {formatDateRange(exp.started_on, exp.ended_on, exp.is_current)}</div>
                  </div>
                  <div className="sc-profile-timeline-actions">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingId(exp.id); setShowAdd(false); }}>Edit</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void onDelete(exp.id)}>Remove</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}