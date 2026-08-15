export function BatchFilterChips({ options, active, onChange, className }: {
  options: readonly { value: string; label: string }[];
  active: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}): React.ReactElement {
  return (
    <div className={`sc-connect-filter-row${className ? ' ' + className : ''}`}>
      {options.map((opt) => (
        <button key={opt.value} type="button"
          className={'sc-connect-chip' + (active === opt.value ? ' active' : '')}
          onClick={() => onChange(active === opt.value ? null : opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}