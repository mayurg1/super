import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Spinner } from '@supercampus/shared';
import { useTheme, type Theme } from '@supercampus/shared';
import {
  createProfileService,
  useAuth,
  useSupabase,
} from '@supercampus/supabase';
import type { UserSettings, UserSettingsUpdate } from '@supercampus/supabase';

export type ThemePreference = 'system' | 'light' | 'dark';

function systemThemePreference(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function Toggle({ checked, onChange, label, hint }: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}): React.ReactElement {
  return (
    <label className="sc-settings-row">
      <span>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </span>
      <input
        type="checkbox"
        className="sc-settings-toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export function SettingsPage(): React.ReactElement {
  const { user } = useAuth();
  const client = useSupabase();
  const { theme, setTheme } = useTheme();
  const service = useMemo(() => createProfileService(client), [client]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    if (!user) { setLoading(false); return; }
    const result = await service.getSettings(user.id);
    setLoading(false);
    if (result.error || !result.data) { setError(result.error ?? 'Settings could not be loaded.'); return; }
    setSettings(result.data);
    // Mirror the stored preference into the ThemeProvider on first load.
    const stored = result.data.theme;
    const desired: Theme = stored === 'light' || stored === 'dark' ? stored : systemThemePreference();
    setTheme(desired);
  }, [user, service, setTheme]);

  useEffect(() => { void load(); }, [load]);

  const persist = useCallback(async (changes: UserSettingsUpdate): Promise<boolean> => {
    if (!user) return false;
    setSaving(true);
    setError(null);
    const result = await service.updateSettings(user.id, changes);
    setSaving(false);
    if (result.error) { setError(result.error); return false; }
    if (result.data) setSettings(result.data);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2_000);
    return true;
  }, [user, service]);

  const changeTheme = useCallback((next: ThemePreference): void => {
    setTheme(next === 'system' ? systemThemePreference() : next);
    void persist({ theme: next });
  }, [setTheme, persist]);

  if (loading) return <Spinner label="Loading settings" />;
return (
    <div className="sc-settings">
      <h2 className="sc-settings-title">⚙️ Settings</h2>
      {error ? <p className="sc-profile-toast sc-profile-toast-error" role="alert">{error}</p> : null}
      {savedNotice ? <p className="sc-profile-toast sc-profile-toast-ok" role="status">Saved.</p> : null}

      <Card className="sc-settings-card">
        <div className="sc-settings-head">
          <h3>🌙 Appearance</h3>
          <p className="sc-settings-hint">Choose how SuperCampus looks for you.</p>
        </div>
        <div className="sc-settings-segmented" role="radiogroup" aria-label="Theme">
          {(['system', 'light', 'dark'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={settings?.theme === option}
              className={`sc-settings-segment${settings?.theme === option ? ' is-active' : ''}`}
              onClick={() => changeTheme(option)}
              disabled={saving}
            >
              {option === 'system' ? '🖥️ System' : option === 'light' ? '☀️ Light' : '🌙 Dark'}
            </button>
          ))}
        </div>
        <p className="sc-settings-hint">
          Current theme: {theme} {settings?.theme === 'system' ? '(follows system settings)' : ''}
        </p>
      </Card>

      <Card className="sc-settings-card">
        <div className="sc-settings-head">
          <h3>🔔 Notifications</h3>
          <span className="sc-settings-hint">Choose what you want to be notified about.</span>
        </div>
        <Toggle
          label="Email notifications"
          hint="Get important updates in your inbox"
          checked={settings?.email_notifications ?? true}
          onChange={(next) => void persist({ email_notifications: next })}
        />
        <Toggle
          label="Push notifications"
          hint="Get real-time alerts on this device"
          checked={settings?.push_notifications ?? true}
          onChange={(next) => void persist({ push_notifications: next })}
        />
      </Card>

      <Card className="sc-settings-card">
        <div className="sc-settings-head">
          <h3>🌐 Language & Regional</h3>
          <span className="sc-settings-hint">Preferred language for the platform.</span>
        </div>
        <div className="sc-settings-field">
          <label className="sc-field">
            <span className="sc-field-label">Language</span>
            <select
              className="sc-input"
              value={settings?.locale ?? 'en'}
              onChange={(e) => void persist({ locale: e.target.value })}
              disabled={saving}
            >
              {LOCALES.map((locale) => (
                <option key={locale.code} value={locale.code}>{locale.label}</option>
              ))}
            </select>
          </label>
        </div>
      </Card>
    </div>
  );
}