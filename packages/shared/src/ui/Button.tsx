import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'sc-btn-primary',
  secondary: 'sc-btn-secondary',
  ghost: 'sc-btn-ghost',
  outline: 'sc-btn-outline',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'sc-btn-sm',
  md: 'sc-btn-md',
  lg: 'sc-btn-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      type={type}
      className={cn('sc-btn', variantClass[variant], sizeClass[size], fullWidth && 'sc-btn-full', className)}
      {...props}
    />
  );
}
