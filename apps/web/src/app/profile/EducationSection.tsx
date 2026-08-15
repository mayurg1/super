import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import type { ProfileEducation, ProfileEducationInput } from '@supercampus/supabase';
import { formatDateRange } from './profileUtils';

export interface EducationSectionProps {
  items: ProfileEducation[];
  onAdd: (input: ProfileEducationInput) => Promise<boolean>;
  onUpdate: (id: string, input: ProfileEducationInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function EducationForm({
  initial,
  onSubmit,
  onCancel,
  saving,
}: {
  initial?: ProfileEducation;
  onSubmit: (input: ProfileEducationInput) => Promise<boolean>;
  onCancel: () => void;
  saving: boolean;
}): React.ReactElement {
  const [institution, setInstitution] = useState(initial?.institution ?? '');
  const [program, setProgram] = useState(initial?.program ?? '');
  const [startedOn, setStartedOn] = useState(initial?.started_on ?? '');
  const [endedOn, setEndedOn] = useState(initial?.ended_on ?? '');
  const valid = institution.trim() !== '' && program.trim() !== '';
  return (
    <form
      className="sc-profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) void onSubmit({
          institution: institution.trim(),
          program: program.trim(),
          started_on: startedOn || null,
          ended_on: endedOn || null,
        });
      }}
    >
      <div className="sc-profile-form-grid">
        <Input label="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. NIT Warangal" />
        <Input label="Program / degree" value={program} onChange={(e) => setProgram(e.target.value)} placeholder="e.g. B.Tech Computer Science" />
        <Input label="Start year" type="date" value={startedOn} onChange={(e) => setStartedOn(e.target.value)} />
        <Input label="End year" type="date" value={endedOn} onChange={(e) => setEndedOn(e.target.value)} />
      </div>
      <div className="sc-profile-form-actions">
        <Button type="submit" size="sm" disabled={!valid || saving}>{saving ? 'Saving…' : initial ? 'Save' : 'Add'}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function EducationSection({ items, onAdd, onUpdate, onDelete }: EducationSectionProps): React.ReactElement {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (id: string | null, input: ProfileEducationInput): Promise<boolean> => {
    setSaving(true);
    const ok = id ? await onUpdate(id, input) : await onAdd(input);
    setSaving(false);
    if (ok) { setEditingId(null); setShowAdd(false); }
    return ok;
  };

  return (
    <Card className="sc-profile-section">
      <div className="sc-profile-section-head">
        <h3>🎓 Education</h3>
        <Button type="button" size="sm" variant="outline" onClick={() => { setShowAdd((v) => !v); setEditingId(null); }}>+ Add</Button>
      </div>
      {showAdd ? (
        <EducationForm key="new" onCancel={() => setShowAdd(false)} onSubmit={(input) => submit(null, input)} saving={saving} />
      ) : null}
      {items.length === 0 && !showAdd ? (
        <p className="sc-profile-empty">No education added yet. Add your school or university to stand out.</p>
      ) : (
        <ul className="sc-profile-timeline">
          {items.map((edu) => (
            <li key={edu.id} className="sc-profile-timeline-item">
              {editingId === edu.id ? (
                <EducationForm
                  key={edu.id}
                  initial={edu}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(input) => submit(edu.id, input)}
                  saving={saving}
                />
              ) : (
                <div className="sc-profile-timeline-row">
                  <div>
                    <strong>{edu.institution}</strong>
                    <div className="sc-profile-timeline-meta">{edu.program} · {formatDateRange(edu.started_on, edu.ended_on)}</div>
                  </div>
                  <div className="sc-profile-timeline-actions">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingId(edu.id); setShowAdd(false); }}>Edit</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void onDelete(edu.id)}>Remove</Button>
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