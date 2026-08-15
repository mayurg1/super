import { useState } from 'react';
import { Button, Card, Input } from '@supercampus/shared';
import type { Skill } from '@supercampus/supabase';

export interface OwnedSkill {
  skillId: string;
  name: string;
}

export interface SkillsSectionProps {
  catalog: Skill[];
  owned: OwnedSkill[];
  onAdd: (name: string) => Promise<boolean>;
  onRemove: (skillId: string) => Promise<boolean>;
}

export function SkillsSection({ catalog, owned, onAdd, onRemove }: SkillsSectionProps): React.ReactElement {
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const ownedIds = new Set(owned.map((skill) => skill.skillId));
  const query = name.trim().toLowerCase();
  const suggestions = catalog
    .filter(
      (skill) =>
        !ownedIds.has(skill.id) &&
        (query === '' || skill.name.toLowerCase().includes(query)),
    )
    .slice(0, 8);

  const submit = async (): Promise<void> => {
    const value = name.trim();
    if (!value) return;
    setAdding(true);
    setError(null);
    const ok = await onAdd(value);
    setAdding(false);
    if (ok) setName('');
    else setError('Could not add this skill. Please try again.');
  };

  return (
    <Card className="sc-profile-section">
      <div className="sc-profile-section-head">
        <h3>🧠 Skills</h3>
      </div>

      {owned.length === 0 ? <p className="sc-profile-empty">No skills tagged yet. Add the skills you know.</p> : null}

      {owned.length > 0 ? (
        <div className="sc-profile-skills">
          {owned.map((skill) => (
            <span key={skill.skillId} className="sc-profile-skill">
              {skill.name}
              <button
                type="button"
                className="sc-profile-skill-remove"
                aria-label={`Remove ${skill.name}`}
                disabled={busyId === skill.skillId}
                onClick={() => {
                  setBusyId(skill.skillId);
                  void onRemove(skill.skillId).finally(() => setBusyId(null));
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="sc-profile-skill-suggestions">
          {suggestions.map((skill) => (
            <button
              key={skill.id}
              type="button"
              className="sc-profile-skill-add"
              onClick={() => void onAdd(skill.name)}
            >
              + {skill.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="sc-profile-skill-input">
        <Input
          label="Add a skill"
          placeholder="e.g. React, Python, Design"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <Button type="button" size="sm" onClick={() => void submit()} disabled={adding || name.trim() === ''}>
          {adding ? 'Adding…' : 'Add'}
        </Button>
      </div>
      {error ? <p className="sc-field-error" role="alert">{error}</p> : null}
    </Card>
  );
}