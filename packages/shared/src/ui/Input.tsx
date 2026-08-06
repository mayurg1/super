import type { InputHTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps): React.ReactElement {
  const inputId = id ?? props.name;
  return (
    <label className="sc-field" htmlFor={inputId}>
      {label ? <span className="sc-field-label">{label}</span> : null}
      <input id={inputId} className={cn('sc-input', error && 'sc-input-error', className)} {...props} />
      {error ? <span className="sc-field-error">{error}</span> : null}
    </label>
  );
}
