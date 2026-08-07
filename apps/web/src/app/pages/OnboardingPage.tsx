import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DEFAULT_CAMPUS_CODE, ROUTES } from '@supercampus/core';
import { useProfile, useRoleRequests, useAuth, useSupabase } from '@supercampus/supabase';
import { Button, Card, Input, Spinner } from '@supercampus/shared';
import { useUserApplicationState } from '../providers/useUserApplicationState';

type StepId = 'welcome' | 'profile' | 'academic' | 'role' | 'verification' | 'review';

const STEPS: { id: StepId; title: string; icon: string }[] = [
  { id: 'welcome', title: 'Welcome', icon: '👋' },
  { id: 'profile', title: 'Profile', icon: '👤' },
  { id: 'academic', title: 'Academic', icon: '🎓' },
  { id: 'role', title: 'Role', icon: '🛡️' },
  { id: 'verification', title: 'Verification', icon: '✅' },
  { id: 'review', title: 'Review', icon: '📋' },
];

const ROLE_OPTIONS: { key: string; label: string; icon: string; desc: string }[] = [
  { key: 'student', label: 'Student', icon: '🎓', desc: 'Enrolled campus student' },
  { key: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Teaching faculty member' },
  { key: 'alumni', label: 'Alumni', icon: '🎓', desc: 'Graduate or alumni' },
  { key: 'hostel_staff', label: 'Hostel Staff', icon: '🏛️', desc: 'Hostel operations staff' },
  { key: 'vendor', label: 'Vendor', icon: '🛍️', desc: 'Campus vendor' },
];

interface Option { id: string; code: string; name: string }

function StepSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Option[];
}): React.ReactElement {
  return (
    <label className="sc-field">
      <span className="sc-field-label">{label}</span>
      <select
        className="sc-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </label>
  );
}

export function OnboardingPage(): React.ReactElement {
  const navigate = useNavigate();
  const { status } = useUserApplicationState();
  const client = useSupabase();
  const { updateProfile, refreshProfile } = useProfile();
  const { createRequest } = useRoleRequests();
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    setLoggingOut(true);
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  const [step, setStep] = useState<StepId>('welcome');

  // Lookups
  const [campusId, setCampusId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [programs, setPrograms] = useState<Option[]>([]);
  const [programId, setProgramId] = useState('');
  const [metaError, setMetaError] = useState<string | null>(null);

  // Profile fields
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Role
  const [roleKey, setRoleKey] = useState('student');

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'onboarding') return;
    let alive = true;
    (async () => {
      const { data: campus } = await client
        .from('campuses')
        .select('id')
        .eq('code', DEFAULT_CAMPUS_CODE)
        .maybeSingle();
      if (!alive) return;
      if (!campus) { setMetaError('The default campus could not be found.'); return; }
      setCampusId(campus.id);
      const { data: deps } = await client
        .from('departments')
        .select('id,code,name')
        .eq('campus_id', campus.id)
        .order('name');
      if (!alive) return;
      setDepartments((deps ?? []).map((d) => ({ id: d.id, code: d.code, name: d.name })));
    })();
    return () => { alive = false; };
  }, [client, status]);

  useEffect(() => {
    setProgramId('');
    setPrograms([]);
    if (!departmentId) return;
    let alive = true;
    (async () => {
      const { data: progs } = await client
        .from('programs')
        .select('id,code,name')
        .eq('department_id', departmentId)
        .order('name');
      if (!alive) return;
      setPrograms((progs ?? []).map((p) => ({ id: p.id, code: p.code, name: p.name })));
    })();
    return () => { alive = false; };
  }, [client, departmentId]);

  if (status === 'loading') return <Spinner label="Preparing onboarding" />;
  if (status === 'anonymous') return <Navigate to={ROUTES.login} replace />;
  if (status === 'pending') return <Navigate to={ROUTES.pendingApproval} replace />;
  if (status === 'ready') return <Navigate to={ROUTES.home} replace />;

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const current = STEPS[stepIndex];

  const next = (): void => { setError(null); const id = STEPS[stepIndex + 1]; if (id) setStep(id.id); };
  const back = (): void => { setError(null); if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id); };

  async function submit(): Promise<void> {
    if (!campusId) { setError('Campus information is still loading. Please try again.'); return; }
    setSubmitting(true); setError(null);
    const year = graduationYear ? Number(graduationYear) : null;
    const display = displayName.trim() || `${givenName.trim()} ${familyName.trim()}`.trim();
    const profileOk = await updateProfile({
      campus_id: campusId,
      department_id: departmentId || null,
      program_id: programId || null,
      given_name: givenName.trim() || null,
      family_name: familyName.trim() || null,
      display_name: display,
      bio,
      graduation_year: year && year >= 1950 && year <= 2200 ? year : null,
    });
    if (!profileOk) { setSubmitting(false); setError('Your profile could not be saved. Please try again.'); return; }
    await refreshProfile();
    const { data: role } = await client.from('roles').select('id,key').eq('key', roleKey).maybeSingle();
    if (!role) { setSubmitting(false); setError('The selected role could not be resolved.'); return; }
    const created = await createRequest({ roleId: role.id, roleKey: role.key, campusId });
    setSubmitting(false);
    if (!created) { setError('Your role request could not be submitted.'); return; }
    navigate(ROUTES.pendingApproval, { replace: true });
  }

  const profileComplete = Boolean(givenName.trim() && familyName.trim());

  const page = (children: ReactNode): React.ReactNode => (
    <div className="sc-auth-page sc-onboarding-page">
      <div className="sc-onboarding-topbar">
        <Button variant="ghost" size="sm" onClick={() => void handleLogout()} disabled={loggingOut}>
          {loggingOut ? 'Signing out…' : 'Logout'}
        </Button>
      </div>
      <Card padding="lg" className="sc-auth-card">
        <div className="sc-onboarding-steps">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`sc-step${i === stepIndex ? ' is-current' : ''}${i < stepIndex ? ' is-done' : ''}`} title={s.title}>{s.icon}</span>
          ))}
        </div>
        <h1 className="sc-auth-title">{current.icon} {current.title}</h1>
        <div className="sc-onboarding-body">{children}</div>
        {error ? <p className="sc-field-error" role="alert">{error}</p> : null}
        <div className="sc-onboarding-actions">
          {stepIndex > 0 && step !== 'verification' ? (
            <Button variant="outline" onClick={back} disabled={submitting}>Back</Button>
          ) : null}
          {step === 'profile' ? (
            <Button fullWidth onClick={() => (profileComplete ? next() : setError('Enter at least a given and family name.'))} disabled={submitting}>Continue</Button>
          ) : step === 'academic' ? (
            <Button fullWidth onClick={() => (departmentId && programId ? next() : setError('Select both a department and a program.'))} disabled={submitting}>Continue</Button>
          ) : step === 'review' ? (
            <Button fullWidth onClick={() => void submit()} disabled={submitting || !campusId}>{submitting ? 'Submitting…' : 'Submit request'}</Button>
          ) : (
            <Button fullWidth onClick={next} disabled={submitting}>Continue</Button>
          )}
        </div>
      </Card>
    </div>
  );

  switch (step) {
    case 'welcome':
      return <>{page(<p className="sc-auth-sub">Welcome to SUPERCAMPUS. Let’s set up your account so you can explore your campus. This only takes a minute.</p>)}</>;
    case 'profile':
      return <>{page(<>
        <p className="sc-auth-sub">Tell us a little about yourself.</p>
        <Input label="Given name" value={givenName} onChange={(e) => setGivenName(e.target.value)} autoComplete="given-name" />
        <Input label="Family name" value={familyName} onChange={(e) => setFamilyName(e.target.value)} autoComplete="family-name" />
        <Input label="Display name (optional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="nickname" />
        <Input label="Bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />
      </>)}</>;
    case 'academic':
      return <>{page(<>
        <p className="sc-auth-sub">Add your academic details.</p>
        {metaError ? <p className="sc-field-error" role="alert">{metaError}</p> : null}
        <StepSelect label="Department" value={departmentId} onChange={setDepartmentId} options={departments} />
        <StepSelect label="Program" value={programId} onChange={setProgramId} placeholder="Select a department first" options={programs} />
        <Input label="Graduation year (optional)" type="number" min={1950} max={2200} value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
      </>)}</>;
    case 'role':
      return <>{page(<>
        <p className="sc-auth-sub">Choose the role that best describes you.</p>
        <div className="sc-role-grid">
          {ROLE_OPTIONS.map((r) => (
            <button key={r.key} type="button" className={`sc-role-option${roleKey === r.key ? ' is-selected' : ''}`} onClick={() => setRoleKey(r.key)}>
              <span className="sc-role-icon" aria-hidden="true">{r.icon}</span>
              <strong>{r.label}</strong>
              <small>{r.desc}</small>
            </button>
          ))}
        </div>
      </>)}</>;
    case 'verification':
      return <>{page(<>
        <p className="sc-auth-sub">Confirm your details so an administrator can approve your request.</p>
        <div className="sc-review-list">
          <div><span>Name</span><strong>{displayName.trim() || `${givenName} ${familyName}`.trim()}</strong></div>
          <div><span>Department</span><strong>{departments.find((d) => d.id === departmentId)?.name ?? '—'}</strong></div>
          <div><span>Program</span><strong>{programs.find((p) => p.id === programId)?.name ?? '—'}</strong></div>
          <div><span>Requested role</span><strong>{ROLE_OPTIONS.find((r) => r.key === roleKey)?.label ?? roleKey}</strong></div>
        </div>
      </>)}</>;
    case 'review':
      return <>{page(<>
        <p className="sc-auth-sub">Review everything, then submit. An administrator will approve your role before you can continue.</p>
        <div className="sc-review-list">
          <div><span>Name</span><strong>{displayName.trim() || `${givenName} ${familyName}`.trim()}</strong></div>
          <div><span>Department</span><strong>{departments.find((d) => d.id === departmentId)?.name ?? '—'}</strong></div>
          <div><span>Program</span><strong>{programs.find((p) => p.id === programId)?.name ?? '—'}</strong></div>
          <div><span>Graduation year</span><strong>{graduationYear || '—'}</strong></div>
          <div><span>Requested role</span><strong>{ROLE_OPTIONS.find((r) => r.key === roleKey)?.label ?? roleKey}</strong></div>
          <div><span>Campus</span><strong>{DEFAULT_CAMPUS_CODE}</strong></div>
        </div>
      </>)}</>;
    default:
      return <>{page(null)}</>;
  }
}