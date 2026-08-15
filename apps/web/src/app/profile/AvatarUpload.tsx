import { useRef, useState } from 'react';

function initials(name: string): string {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export interface AvatarUploadProps {
  src: string | null;
  name: string;
  onFile: (file: File) => void;
  busy?: boolean;
}

/** Avatar preview with an upload trigger; the parent performs the actual upload. */
export function AvatarUpload({ src, name, onFile, busy = false }: AvatarUploadProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);

  return (
    <div className="sc-profile-avatar-wrap">
      {src ? (
        <img className="sc-profile-avatar" src={src} alt={`${name} avatar`} />
      ) : (
        <div className="sc-profile-avatar sc-profile-avatar-fallback" aria-hidden="true">
          {initials(name)}
        </div>
      )}
      <label
        className="sc-profile-avatar-edit"
        htmlFor="sc-avatar-input"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {busy ? 'Uploading…' : hovering ? '📷 Change' : '📷'}
      </label>
      <input
        ref={inputRef}
        id="sc-avatar-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sc-sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}