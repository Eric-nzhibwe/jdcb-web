import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick, style, ...rest }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border shadow-card p-5',
        onClick && 'cursor-pointer hover:shadow-card-hover transition-shadow',
        className
      )}
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
