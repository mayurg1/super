import { cn } from '../utils/cn.js';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClass = {
  sm: 'sc-card-sm',
  md: 'sc-card-md',
  lg: 'sc-card-lg',
};

export function Card({ children, className, padding = 'md' }: CardProps): React.ReactElement {
  return <div className={cn('sc-card', paddingClass[padding], className)}>{children}</div>;
}
