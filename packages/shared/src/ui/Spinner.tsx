export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = { sm: 16, md: 24, lg: 32 };

export function Spinner({ size = 'md', label = 'Loading' }: SpinnerProps): React.ReactElement {
  const px = sizeMap[size];
  return (
    <div className="sc-spinner-wrap" role="status" aria-label={label}>
      <svg
        className="sc-spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
